"""Migration script for moving from static secrets to Infisical.

This script provides a comprehensive migration path from environment-based
secrets to Infisical secret management with rollback capabilities.
"""

import asyncio
import json
import logging
import os
import shutil
import sys

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import typer

from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.table import Table


# Add the app directory to the path so we can import modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.db import build_engine, sessionmaker_for
from app.infra.redis import get_redis
from app.infra.secrets import InfisicalSecretsClient, SecretNotFoundError, SecretType
from app.infra.secrets.enhanced_key_manager import InfisicalKeyManager
from app.security.token_cipher import KeyConfigError, TokenCipher
from app.settings import settings


@asynccontextmanager
async def get_migration_session() -> AsyncGenerator[AsyncSession, None]:
    """Get a database session for migration operations."""
    sm = sessionmaker_for(build_engine())
    async with sm() as session:
        yield session


app = typer.Typer(name="infisical-migration", help="Migrate secrets from environment to Infisical")
console = Console()
logger = logging.getLogger(__name__)


class MigrationResult:
    """Container for migration results."""

    def __init__(self):
        self.jwt_keys_migrated = False
        self.aes_keys_migrated = False
        self.database_secrets_migrated = False
        self.api_keys_migrated = False
        self.webhook_secrets_migrated = False
        self.errors: list[str] = []
        self.warnings: list[str] = []
        self.backup_path: str | None = None
        self.migration_timestamp = datetime.now(UTC)

    def add_error(self, error: str) -> None:
        """Add an error to the results."""
        self.errors.append(error)
        logger.error(error)

    def add_warning(self, warning: str) -> None:
        """Add a warning to the results."""
        self.warnings.append(warning)
        logger.warning(warning)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "jwt_keys_migrated": self.jwt_keys_migrated,
            "aes_keys_migrated": self.aes_keys_migrated,
            "database_secrets_migrated": self.database_secrets_migrated,
            "api_keys_migrated": self.api_keys_migrated,
            "webhook_secrets_migrated": self.webhook_secrets_migrated,
            "errors": self.errors,
            "warnings": self.warnings,
            "backup_path": self.backup_path,
            "migration_timestamp": self.migration_timestamp.isoformat(),
        }


def create_backup(result: MigrationResult) -> None:
    """Create backup of current environment secrets."""
    backup_dir = Path.home() / ".journal" / "infisical_migration_backups"
    backup_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now(UTC).strftime("%Y%m%d_%H%M%S")
    backup_file = backup_dir / f"secrets_backup_{timestamp}.json"

    backup_data = {
        "timestamp": datetime.now(UTC).isoformat(),
        "environment_variables": {},
        "jwt_keys": {},
        "aes_keys": {},
    }

    # Backup environment variables
    env_vars_to_backup = [
        "JOURNAL_JWT_SECRET",
        "JOURNAL_DB_URL",
        "JOURNAL_DB_URL_ASYNC",
        "JOURNAL_DB_URL_SYNC",
        "JOURNAL_REDIS_URL",
        "JOURNAL_NATS_URL",
        "AUTH_ENC_KEYS",
        "AUTH_ENC_ACTIVE_KID",
        "JOURNAL_INFISICAL_WEBHOOK_SECRET",
    ]

    for var in env_vars_to_backup:
        value = os.getenv(var)
        if value:
            # Don't store actual secret values in backup for security
            backup_data["environment_variables"][var] = {
                "exists": True,
                "length": len(value),
                "prefix": value[:4] if len(value) > 4 else "***",
            }

    # Backup JWT secret (just metadata)
    jwt_secret = os.getenv("JOURNAL_JWT_SECRET")
    if jwt_secret:
        backup_data["jwt_keys"]["secret_exists"] = True
        backup_data["jwt_keys"]["secret_length"] = len(jwt_secret)

    # Backup AES keys (just metadata)
    try:
        aes_keys_raw = os.getenv("AUTH_ENC_KEYS")
        aes_active_kid = os.getenv("AUTH_ENC_ACTIVE_KID")

        if aes_keys_raw and aes_active_kid:
            aes_keys = json.loads(aes_keys_raw)
            backup_data["aes_keys"] = {
                "active_kid": aes_active_kid,
                "key_count": len(aes_keys),
                "key_ids": list(aes_keys.keys()),
            }
    except (json.JSONDecodeError, KeyError) as e:
        result.add_warning(f"Could not parse AES keys for backup: {e}")

    # Write backup file
    backup_file.write_text(json.dumps(backup_data, indent=2), encoding="utf-8")

    result.backup_path = str(backup_file)
    console.print(f"✅ Backup created: {backup_file}")


async def migrate_jwt_keys(
    key_manager: InfisicalKeyManager,
    infisical_client: InfisicalSecretsClient,
    result: MigrationResult,
) -> None:
    """Migrate JWT keys to Infisical."""
    console.print("🔑 Migrating JWT keys...")

    try:
        # Check if JWT secret exists in environment
        jwt_secret = os.getenv("JOURNAL_JWT_SECRET")
        if not jwt_secret:
            result.add_warning("No JWT secret found in environment")
            return

        # Check if keys already exist in Infisical
        try:
            await infisical_client.fetch_secret("/auth/jwt/current_private_key")
            result.add_warning("JWT keys already exist in Infisical, skipping migration")
            return
        except SecretNotFoundError:
            # Good, no existing keys to conflict with
            pass

        # Use the key manager's migration function
        migration_result = await key_manager.migrate_keys_to_infisical()

        if migration_result.get("jwt_keys_migrated", False):
            result.jwt_keys_migrated = True
            console.print("✅ JWT keys migrated successfully")
        else:
            result.add_warning("JWT keys were not migrated (may not exist)")

    except Exception as e:
        result.add_error(f"JWT key migration failed: {e}")


async def migrate_aes_keys(
    key_manager: InfisicalKeyManager,
    infisical_client: InfisicalSecretsClient,
    result: MigrationResult,
) -> None:
    """Migrate AES encryption keys to Infisical."""
    console.print("🔐 Migrating AES encryption keys...")

    try:
        # Check if AES keys exist in environment
        aes_keys_raw = os.getenv("AUTH_ENC_KEYS")
        aes_active_kid = os.getenv("AUTH_ENC_ACTIVE_KID")

        if not aes_keys_raw or not aes_active_kid:
            result.add_warning("No AES keys found in environment")
            return

        # Check if keys already exist in Infisical
        try:
            await infisical_client.fetch_secret("/auth/aes/active_kid")
            result.add_warning("AES keys already exist in Infisical, skipping migration")
            return
        except SecretNotFoundError:
            # Good, no existing keys to conflict with
            pass

        # Validate current AES keys
        try:
            cipher = TokenCipher.from_env()
            # Test encryption/decryption
            test_plaintext = "migration_test"
            encrypted = cipher.encrypt(test_plaintext)
            decrypted = cipher.decrypt(encrypted)

            if decrypted != test_plaintext:
                raise ValueError("AES key validation failed")

        except (KeyConfigError, ValueError) as e:
            result.add_error(f"AES keys validation failed: {e}")
            return

        # Use the key manager's migration function
        migration_result = await key_manager.migrate_keys_to_infisical()

        if migration_result.get("aes_keys_migrated", False):
            result.aes_keys_migrated = True
            console.print("✅ AES keys migrated successfully")
        else:
            result.add_warning("AES keys were not migrated (may not exist)")

    except Exception as e:
        result.add_error(f"AES key migration failed: {e}")


async def migrate_database_secrets(
    infisical_client: InfisicalSecretsClient,
    result: MigrationResult,
) -> None:
    """Migrate database connection secrets to Infisical."""
    console.print("🗃️ Migrating database secrets...")

    try:
        # Database URLs
        db_urls = {
            "db_url_async": os.getenv("JOURNAL_DB_URL_ASYNC"),
            "db_url_sync": os.getenv("JOURNAL_DB_URL_SYNC"),
        }

        for key, value in db_urls.items():
            if value:
                try:
                    await infisical_client.store_secret(
                        f"/database/{key}", value, SecretType.DATABASE_PASSWORD
                    )
                    console.print(f"  ✅ Migrated {key}")
                except Exception as e:
                    result.add_error(f"Failed to migrate {key}: {e}")
            else:
                result.add_warning(f"No value found for {key}")

        result.database_secrets_migrated = True

    except Exception as e:
        result.add_error(f"Database secrets migration failed: {e}")


async def migrate_infrastructure_secrets(
    infisical_client: InfisicalSecretsClient,
    result: MigrationResult,
) -> None:
    """Migrate infrastructure secrets (Redis, NATS, etc.) to Infisical."""
    console.print("🏗️ Migrating infrastructure secrets...")

    try:
        infra_secrets = {
            "redis_url": os.getenv("JOURNAL_REDIS_URL"),
            "nats_url": os.getenv("JOURNAL_NATS_URL"),
            "otlp_endpoint": os.getenv("JOURNAL_OTLP_ENDPOINT"),
        }

        for key, value in infra_secrets.items():
            if value:
                try:
                    await infisical_client.store_secret(
                        f"/infrastructure/{key}", value, SecretType.API_KEY
                    )
                    console.print(f"  ✅ Migrated {key}")
                except Exception as e:
                    result.add_error(f"Failed to migrate {key}: {e}")

    except Exception as e:
        result.add_error(f"Infrastructure secrets migration failed: {e}")


async def migrate_webhook_secrets(
    infisical_client: InfisicalSecretsClient,
    result: MigrationResult,
) -> None:
    """Migrate webhook secrets to Infisical."""
    console.print("🪝 Migrating webhook secrets...")

    try:
        webhook_secret = os.getenv("JOURNAL_INFISICAL_WEBHOOK_SECRET")

        if webhook_secret:
            await infisical_client.store_secret(
                "/auth/webhooks/infisical_secret", webhook_secret, SecretType.WEBHOOK_SECRET
            )
            result.webhook_secrets_migrated = True
            console.print("✅ Webhook secrets migrated")
        else:
            result.add_warning("No webhook secret found in environment")

    except Exception as e:
        result.add_error(f"Webhook secrets migration failed: {e}")


async def verify_migration(
    key_manager: InfisicalKeyManager,
    infisical_client: InfisicalSecretsClient,
    result: MigrationResult,
) -> None:
    """Verify that migration was successful."""
    console.print("🔍 Verifying migration...")

    try:
        # Test health check
        health = await key_manager.health_check()

        if health["overall_status"] != "healthy":
            result.add_error(f"Post-migration health check failed: {health}")
            return

        # Test JWT keys if migrated
        if result.jwt_keys_migrated:
            try:
                signing_key = await key_manager.get_current_signing_key()
                console.print(f"  ✅ JWT signing key available (kid: {signing_key.kid})")
            except Exception as e:
                result.add_error(f"JWT key verification failed: {e}")

        # Test AES keys if migrated
        if result.aes_keys_migrated:
            try:
                cipher = await key_manager.get_token_cipher()
                # Test encryption/decryption
                test_plaintext = "verification_test"
                encrypted = cipher.encrypt(test_plaintext)
                decrypted = cipher.decrypt(encrypted)

                if decrypted == test_plaintext:
                    console.print(f"  ✅ AES encryption working (active_kid: {cipher.active_kid})")
                else:
                    result.add_error("AES encryption verification failed")
            except Exception as e:
                result.add_error(f"AES key verification failed: {e}")

        # Test Infisical connection
        infisical_health = await infisical_client.health_check()
        if infisical_health["status"] == "healthy":
            console.print("  ✅ Infisical connection verified")
        else:
            result.add_error(f"Infisical connection verification failed: {infisical_health}")

        console.print("✅ Migration verification completed")

    except Exception as e:
        result.add_error(f"Migration verification failed: {e}")


def generate_migration_report(result: MigrationResult) -> None:
    """Generate a comprehensive migration report."""
    console.print("\n" + "=" * 60)
    console.print("📊 INFISICAL MIGRATION REPORT")
    console.print("=" * 60)

    # Summary table
    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("Component", style="cyan")
    table.add_column("Status", style="green")
    table.add_column("Details")

    table.add_row(
        "JWT Keys",
        "✅ Migrated" if result.jwt_keys_migrated else "⚠️ Skipped",
        "Signing keys for JWT authentication",
    )

    table.add_row(
        "AES Keys",
        "✅ Migrated" if result.aes_keys_migrated else "⚠️ Skipped",
        "Encryption keys for token cipher",
    )

    table.add_row(
        "Database Secrets",
        "✅ Migrated" if result.database_secrets_migrated else "⚠️ Skipped",
        "Database connection strings",
    )

    table.add_row(
        "Webhook Secrets",
        "✅ Migrated" if result.webhook_secrets_migrated else "⚠️ Skipped",
        "Webhook HMAC secrets",
    )

    console.print(table)

    # Errors and warnings
    if result.errors:
        console.print("\n❌ ERRORS:")
        for error in result.errors:
            console.print(f"  • {error}")

    if result.warnings:
        console.print("\n⚠️ WARNINGS:")
        for warning in result.warnings:
            console.print(f"  • {warning}")

    # Backup info
    if result.backup_path:
        console.print(f"\n💾 Backup created: {result.backup_path}")

    # Next steps
    console.print("\n🚀 NEXT STEPS:")
    console.print("1. Update your deployment configuration to use Infisical")
    console.print("2. Remove environment variables from old configuration")
    console.print("3. Test the application thoroughly")
    console.print("4. Monitor the system health dashboard")

    console.print(f"\n⏰ Migration completed at: {result.migration_timestamp}")


@app.command()
def validate_env(
    dry_run: bool = typer.Option(
        False, "--dry-run", help="Perform a dry run without making changes"
    ),
) -> None:
    """Validate environment configuration for Infisical migration."""
    console.print("🔍 Validating environment configuration...")

    # Check required environment variables
    required_vars = [
        "INFISICAL_TOKEN",
        "INFISICAL_PROJECT_ID",
        "INFISICAL_ENVIRONMENT",
    ]

    # Use list comprehension for better performance (PERF401)
    missing_vars = [var for var in required_vars if not os.getenv(var)]

    if missing_vars:
        console.print("\n❌ Missing required environment variables:")
        for var in missing_vars:
            console.print(f"  • {var}")

        if not dry_run:
            raise typer.Exit(1)
        console.print("\n⚠️ [yellow]Dry run mode - would exit with error[/yellow]")

    # Check optional but recommended variables
    optional_vars = {
        "INFISICAL_SERVER_URL": "https://app.infisical.com/api",
        "JOURNAL_DB_URL": None,
        "JOURNAL_REDIS_URL": None,
    }

    console.print("\n📋 Environment configuration:")
    for var, default in optional_vars.items():
        value = os.getenv(var, default)
        if value:
            # Mask sensitive values
            display_value = value[:10] + "..." if len(value) > 15 else value
            console.print(f"  • {var}: {display_value}")
        else:
            console.print(f"  • {var}: [yellow]Not set[/yellow]")

    if not missing_vars:
        console.print("\n✅ Environment validation passed!")

    # Verify Infisical CLI is available
    async def check_cli_version():
        # Use full path for security and validate executable exists
        infisical_path = shutil.which("infisical")
        if not infisical_path:
            console.print("⚠️ [yellow]Infisical CLI not found in PATH[/yellow]")
            return

        try:
            process = await asyncio.create_subprocess_exec(
                infisical_path, "--version",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await asyncio.wait_for(
                process.communicate(),
                timeout=5.0,
            )
            if process.returncode == 0:
                console.print(f"✅ Infisical CLI found: {stdout.decode().strip()}")
            else:
                console.print("⚠️ [yellow]Infisical CLI not found or not working properly[/yellow]")
        except (TimeoutError, OSError):
            console.print("⚠️ [yellow]Infisical CLI not installed or not responding[/yellow]")

    # Run the async check
    asyncio.run(check_cli_version())

    if dry_run:
        console.print("\n🧪 [cyan]Dry run completed - no changes made[/cyan]")


@app.command()
def check_prerequisites() -> None:
    """Check prerequisites for Infisical migration."""
    console.print("🔍 Checking migration prerequisites...")

    issues = []

    # Check Infisical CLI availability via PATH
    try:
        import shutil

        cli_path = shutil.which("infisical")
        if cli_path:
            console.print(f"✅ Infisical CLI is available at {cli_path}")
        else:
            issues.append("Infisical CLI not found on PATH")
    except Exception:
        issues.append("Infisical CLI not available")

    # Check environment configuration
    required_env_vars = [
        "INFISICAL_PROJECT_ID",
        "INFISICAL_SERVER_URL",
    ]

    for var in required_env_vars:
        if os.getenv(var):
            console.print(f"✅ {var} is configured")
        else:
            issues.append(f"{var} environment variable is required")

    # Check current secrets
    env_secrets = {
        "JWT Secret": os.getenv("JOURNAL_JWT_SECRET"),
        "AES Keys": os.getenv("AUTH_ENC_KEYS") and os.getenv("AUTH_ENC_ACTIVE_KID"),
        "Database URL": os.getenv("JOURNAL_DB_URL_ASYNC"),
    }

    for name, exists in env_secrets.items():
        if exists:
            console.print(f"✅ {name} found in environment")
        else:
            console.print(f"⚠️ {name} not found in environment")

    if issues:
        console.print("\n❌ Issues found:")
        for issue in issues:
            console.print(f"  • {issue}")
        raise typer.Exit(1)
    console.print("\n✅ All prerequisites met!")


@app.command()
def migrate(
    dry_run: bool = typer.Option(
        False, "--dry-run", help="Perform a dry run without making changes"
    ),
    backup: bool = typer.Option(
        True, "--backup/--no-backup", help="Create backup before migration"
    ),
    force: bool = typer.Option(False, "--force", help="Force migration even if secrets exist"),
) -> None:
    """Migrate secrets from environment to Infisical."""

    async def run_migration():
        result = MigrationResult()

        try:
            if dry_run:
                console.print("🧪 DRY RUN MODE - No changes will be made")

            console.print("🚀 Starting Infisical migration...")

            # Create backup
            if backup and not dry_run:
                await create_backup(result)

            # Initialize clients
            redis = get_redis()  # get_redis() returns a Redis client, not an awaitable
            infisical_client = InfisicalSecretsClient.from_env(redis)

            # Use the proper async context manager for session
            async with get_migration_session() as session:
                key_manager = InfisicalKeyManager(session, redis, infisical_client)

                if not dry_run:
                    # Initialize Infisical key system
                    await key_manager.initialize_key_system()

                # Run migrations
                with Progress(
                    SpinnerColumn(),
                    TextColumn("[progress.description]{task.description}"),
                    console=console,
                ) as progress:
                    if not dry_run:
                        # JWT keys
                        task = progress.add_task("Migrating JWT keys...", total=None)
                        await migrate_jwt_keys(key_manager, infisical_client, result)
                        progress.remove_task(task)

                        # AES keys
                        task = progress.add_task("Migrating AES keys...", total=None)
                        await migrate_aes_keys(key_manager, infisical_client, result)
                        progress.remove_task(task)

                        # Database secrets
                        task = progress.add_task("Migrating database secrets...", total=None)
                        await migrate_database_secrets(infisical_client, result)
                        progress.remove_task(task)

                        # Infrastructure secrets
                        task = progress.add_task("Migrating infrastructure secrets...", total=None)
                        await migrate_infrastructure_secrets(infisical_client, result)
                        progress.remove_task(task)

                        # Webhook secrets
                        task = progress.add_task("Migrating webhook secrets...", total=None)
                        await migrate_webhook_secrets(infisical_client, result)
                        progress.remove_task(task)

                        # Verification
                        task = progress.add_task("Verifying migration...", total=None)
                        await verify_migration(key_manager, infisical_client, result)
                        progress.remove_task(task)
                    else:
                        console.print("Dry run - would migrate:")
                        console.print("  • JWT keys")
                        console.print("  • AES keys")
                        console.print("  • Database secrets")
                        console.print("  • Infrastructure secrets")
                        console.print("  • Webhook secrets")

            await redis.aclose()

            # Generate report
            generate_migration_report(result)  # Not async, don't await

            # Save migration log
            if not dry_run:
                log_file = (
                    Path.home()
                    / ".journal"
                    / "infisical_migration_backups"
                    / f"migration_log_{datetime.now(UTC).strftime('%Y%m%d_%H%M%S')}.json"
                )
                log_file.parent.mkdir(parents=True, exist_ok=True)

                # Write log asynchronously to avoid blocking in async context
                data = json.dumps(result.to_dict(), indent=2)
                await asyncio.to_thread(log_file.write_text, data, "utf-8")

                console.print(f"\n📝 Migration log saved: {log_file}")

            if result.errors:
                console.print("\n❌ Migration completed with errors")
                raise typer.Exit(1)
            console.print("\n✅ Migration completed successfully!")

        except Exception as e:
            console.print(f"\n💥 Migration failed: {e}")
            raise typer.Exit(1)

    asyncio.run(run_migration())


@app.command()
def rollback(
    backup_file: str = typer.Argument(..., help="Path to backup file"),
) -> None:
    """Rollback migration using backup file."""
    console.print("⏮️ Rolling back Infisical migration...")

    backup_path = Path(backup_file)
    if not backup_path.exists():
        console.print(f"❌ Backup file not found: {backup_file}")
        raise typer.Exit(1)

    try:
        backup_data = json.loads(backup_path.read_text(encoding="utf-8"))

        console.print("📄 Backup file loaded successfully")
        console.print(f"Backup timestamp: {backup_data.get('timestamp', 'Unknown')}")

        # Display what would be restored
        if backup_data.get("environment_variables"):
            console.print("\n🔄 Environment variables in backup:")
            for var, info in backup_data["environment_variables"].items():
                if info.get("exists"):
                    console.print(f"  • {var} (length: {info['length']})")

        # Note: This is a simplified rollback example
        # In a real scenario, you'd need to carefully restore secrets
        console.print("\n⚠️ Rollback functionality requires manual intervention:")
        console.print("1. Restore environment variables from your deployment system")
        console.print("2. Remove secrets from Infisical if needed")
        console.print("3. Disable Infisical integration in settings")
        console.print("4. Restart the application")

    except Exception as e:
        console.print(f"❌ Rollback failed: {e}")
        raise typer.Exit(1)


@app.command()
def status() -> None:
    """Check current migration status."""
    console.print("📊 Checking Infisical migration status...")

    async def check_status():
        try:
            redis = get_redis()  # get_redis() returns a Redis client, not an awaitable
            infisical_client = InfisicalSecretsClient.from_env(redis)

            async with get_migration_session() as session:
                key_manager = InfisicalKeyManager(session, redis, infisical_client)

                # Check health
                health = await key_manager.health_check()

                # Display status
                table = Table(show_header=True, header_style="bold magenta")
                table.add_column("Component", style="cyan")
                table.add_column("Status", style="green")
                table.add_column("Details")

                # Overall status
                overall_color = "green" if health["overall_status"] == "healthy" else "red"
                table.add_row(
                    "Overall",
                    f"[{overall_color}]{health['overall_status'].upper()}[/{overall_color}]",
                    f"Checked at {health.get('timestamp', 'Unknown')}",
                )

                # JWT system
                jwt_status = health.get("jwt_system", {})
                jwt_color = "green" if jwt_status.get("status") == "healthy" else "red"
                table.add_row(
                    "JWT System",
                    f"[{jwt_color}]{jwt_status.get('status', 'unknown').upper()}[/{jwt_color}]",
                    jwt_status.get("error", "Operating normally"),
                )

                # AES system
                aes_status = health.get("aes_system", {})
                aes_color = "green" if aes_status.get("status") == "healthy" else "red"
                table.add_row(
                    "AES System",
                    f"[{aes_color}]{aes_status.get('status', 'unknown').upper()}[/{aes_color}]",
                    f"Active KID: {aes_status.get('active_kid', 'Unknown')}",
                )

                # Infisical connection
                infisical_status = health.get("infisical_connection", {})
                infisical_color = "green" if infisical_status.get("status") == "healthy" else "red"
                table.add_row(
                    "Infisical",
                    f"[{infisical_color}]{infisical_status.get('status', 'unknown').upper()}[/{infisical_color}]",
                    infisical_status.get("error", f"Connected to {settings.infisical_server_url}"),
                )

                console.print(table)

            await redis.aclose()

        except Exception as e:
            console.print(f"❌ Status check failed: {e}")
            raise typer.Exit(1)

    asyncio.run(check_status())


if __name__ == "__main__":
    # Set up logging
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    app()
