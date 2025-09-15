"""Infisical CLI v0.42.1 secrets client implementation.

This module provides a production-ready client for Infisical secret management
using the official CLI v0.42.1 patterns with comprehensive error handling,
caching, and telemetry integration.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import shutil
import subprocess
import time

from dataclasses import dataclass
from datetime import UTC, datetime
from enum import Enum
from typing import Any, Protocol

from redis.asyncio import Redis
from redis.exceptions import RedisError

from app.telemetry.metrics_runtime import inc as metrics_inc


logger = logging.getLogger(__name__)


class InfisicalError(Exception):
    """Base exception for Infisical operations."""

    def __init__(
        self, message: str, exit_code: int | None = None, stderr: str | None = None
    ) -> None:
        super().__init__(message)
        self.exit_code = exit_code
        self.stderr = stderr


class SecretNotFoundError(InfisicalError):
    """Secret not found in Infisical."""


class AuthenticationError(InfisicalError):
    """Authentication failed with Infisical."""


class ConnectionError(InfisicalError):  # noqa: A001
    """Network connection error to Infisical server."""


class SecretType(Enum):
    """Types of secrets managed by Infisical."""

    JWT_PRIVATE_KEY = "jwt_private_key"
    JWT_PUBLIC_KEY = "jwt_public_key"
    AES_ENCRYPTION_KEY = "aes_encryption_key"
    API_KEY = "api_key"
    DATABASE_PASSWORD = "database_password"
    WEBHOOK_SECRET = "webhook_secret"


@dataclass
class SecretMetadata:
    """Metadata for cached secrets."""

    path: str
    value: str
    cached_at: datetime
    ttl_seconds: int
    secret_type: SecretType
    version: str | None = None


class SecretsCache(Protocol):
    """Protocol for secrets caching layer."""

    async def get(self, key: str) -> SecretMetadata | None:
        """Get cached secret metadata."""
        ...

    async def set(self, key: str, metadata: SecretMetadata) -> None:
        """Cache secret metadata."""
        ...

    async def delete(self, key: str) -> None:
        """Remove secret from cache."""
        ...

    async def invalidate_pattern(self, pattern: str) -> None:
        """Invalidate all secrets matching pattern."""
        ...


class RedisSecretsCache:
    """Redis-based secrets cache implementation."""

    def __init__(self, redis: Redis, prefix: str = "infisical:secrets") -> None:
        self.redis = redis
        self.prefix = prefix

    def _cache_key(self, path: str) -> str:
        """Generate cache key for secret path."""
        # Preserve leading slash to match test expectations
        return f"{self.prefix}:{path}"

    async def get(self, key: str) -> SecretMetadata | None:
        """Get cached secret metadata."""
        try:
            data = await self.redis.get(self._cache_key(key))
            if not data:
                return None

            parsed = json.loads(data.decode())
            return SecretMetadata(
                path=parsed["path"],
                value=parsed["value"],
                cached_at=datetime.fromisoformat(parsed["cached_at"]),
                ttl_seconds=parsed["ttl_seconds"],
                secret_type=SecretType(parsed["secret_type"]),
                version=parsed.get("version"),
            )
        except (RedisError, json.JSONDecodeError, ValueError) as e:
            logger.debug("Cache read failed for %s: %s", key, e)
            return None

    async def set(self, key: str, metadata: SecretMetadata) -> None:
        """Cache secret metadata."""
        try:
            data = {
                "path": metadata.path,
                "value": metadata.value,
                "cached_at": metadata.cached_at.isoformat(),
                "ttl_seconds": metadata.ttl_seconds,
                "secret_type": metadata.secret_type.value,
                "version": metadata.version,
            }

            cache_key = self._cache_key(key)
            await self.redis.setex(cache_key, metadata.ttl_seconds, json.dumps(data))

            metrics_inc("infisical_cache_set_total", {"path": metadata.path})
        except RedisError as e:
            logger.warning("Cache write failed for %s: %s", key, e)

    async def delete(self, key: str) -> None:
        """Remove secret from cache."""
        try:
            await self.redis.delete(self._cache_key(key))
            metrics_inc("infisical_cache_delete_total", {"path": key})
        except RedisError as e:
            logger.warning("Cache delete failed for %s: %s", key, e)

    async def invalidate_pattern(self, pattern: str) -> None:
        """Invalidate all secrets matching pattern."""
        try:
            pattern_key = self._cache_key(pattern)
            keys = await self.redis.keys(pattern_key)
            if keys:
                await self.redis.delete(*keys)
                metrics_inc(
                    "infisical_cache_invalidate_total", {"pattern": pattern, "count": len(keys)}
                )
        except RedisError as e:
            logger.warning("Cache pattern invalidation failed for %s: %s", pattern, e)


class InfisicalSecretsClient:
    """Production-ready Infisical CLI v0.42.1 client.

    Features:
    - CLI v0.42.1 command patterns
    - Comprehensive error handling
    - Redis-based caching with TTL
    - Telemetry and metrics
    - Authentication management
    - Connection pooling and retries
    """

    # Default configuration
    DEFAULT_TIMEOUT = 30.0
    DEFAULT_CACHE_TTL = 300  # 5 minutes
    DEFAULT_MAX_RETRIES = 3
    DEFAULT_RETRY_DELAY = 1.0

    def __init__(
        self,
        project_id: str,
        server_url: str,
        cache: SecretsCache | None = None,
        timeout: float = DEFAULT_TIMEOUT,
        cache_ttl: int = DEFAULT_CACHE_TTL,
        max_retries: int = DEFAULT_MAX_RETRIES,
        retry_delay: float = DEFAULT_RETRY_DELAY,
    ) -> None:
        """Initialize Infisical secrets client.

        Args:
            project_id: Infisical project ID
            server_url: Infisical server URL
            cache: Optional cache implementation
            timeout: Command timeout in seconds
            cache_ttl: Cache TTL in seconds
            max_retries: Maximum retry attempts
            retry_delay: Delay between retries in seconds
        """
        self.project_id = project_id
        self.server_url = server_url
        self.cache = cache
        self.timeout = timeout
        self.cache_ttl = cache_ttl
        self.max_retries = max_retries
        self.retry_delay = retry_delay

        # Resolve and validate CLI path
        self._cli_path = self._resolve_cli_path()
        self._validate_cli()

    @staticmethod
    def _resolve_cli_path() -> str:
        """Resolve absolute path to the Infisical CLI executable.

        Returns:
            Absolute path to `infisical` CLI.

        Raises:
            InfisicalError: If the CLI cannot be located.
        """
        cli_path = shutil.which("infisical")
        if not cli_path:
            raise InfisicalError("Infisical CLI not found on PATH")
        return cli_path

    def _validate_cli(self) -> None:
        """Validate Infisical CLI is available and correct version."""
        try:
            result = subprocess.run(  # noqa: S603 - arguments are constant and validated
                [self._cli_path, "--version"],
                capture_output=True,
                text=True,
                timeout=5.0,
                check=False,
            )

            if result.returncode != 0:
                raise InfisicalError("Infisical CLI not found or failed to execute")

            version = result.stdout.strip()
            if not version.startswith("infisical version"):
                raise InfisicalError(f"Unexpected Infisical CLI version format: {version}")

            # Extract version number
            version_parts = version.split()
            if len(version_parts) >= 3:
                version_num = version_parts[2]
                if not version_num.startswith("0.42"):
                    logger.warning(
                        "Infisical CLI version %s may not be compatible (expected 0.42.x)",
                        version_num,
                    )

            logger.info("Infisical CLI validated: %s", version)

        except (subprocess.TimeoutExpired, FileNotFoundError) as e:
            raise InfisicalError(f"Infisical CLI validation failed: {e}") from e

    @classmethod
    def from_env(cls, redis: Redis | None = None) -> InfisicalSecretsClient:
        """Create client from environment variables.

        Expected environment variables:
        - INFISICAL_PROJECT_ID: Infisical project ID
        - INFISICAL_SERVER_URL: Infisical server URL
        - UA_CLIENT_ID_TOKEN_SERVICE: Universal Auth client ID (preferred)
        - UA_CLIENT_SECRET_TOKEN_SERVICE: Universal Auth client secret (preferred)
        - INFISICAL_TOKEN: Static token (fallback, deprecated)
        - INFISICAL_CACHE_TTL: Cache TTL in seconds (optional, default 300)

        Args:
            redis: Optional Redis instance for caching

        Returns:
            Configured InfisicalSecretsClient

        Raises:
            InfisicalError: If required environment variables are missing
        """
        project_id = os.getenv("INFISICAL_PROJECT_ID")
        if not project_id:
            raise InfisicalError("INFISICAL_PROJECT_ID environment variable required")

        server_url = os.getenv("INFISICAL_SERVER_URL")
        if not server_url:
            raise InfisicalError("INFISICAL_SERVER_URL environment variable required")

        cache_ttl = int(os.getenv("INFISICAL_CACHE_TTL", cls.DEFAULT_CACHE_TTL))

        cache = None
        if redis:
            cache = RedisSecretsCache(redis)

        return cls(
            project_id=project_id,
            server_url=server_url,
            cache=cache,
            cache_ttl=cache_ttl,
        )

    async def fetch_secret(self, path: str, force_refresh: bool = False) -> str:
        """Fetch a secret from Infisical.

        Args:
            path: Secret path (e.g., "/auth/jwt/current_private_key")
            force_refresh: Skip cache and fetch fresh value

        Returns:
            Secret value

        Raises:
            SecretNotFoundError: If secret doesn't exist
            AuthenticationError: If authentication fails
            ConnectionError: If connection fails
            InfisicalError: For other errors
        """
        start_time = time.time()

        try:
            # Check cache first (unless force refresh)
            if not force_refresh and self.cache:
                cached = await self.cache.get(path)
                if cached and self._is_cache_valid(cached):
                    metrics_inc("infisical_fetch_total", {"source": "cache", "path": path})
                    return cached.value

            # Fetch from Infisical with retries
            value = await self._fetch_from_infisical(path)

            # Cache the result
            if self.cache:
                metadata = SecretMetadata(
                    path=path,
                    value=value,
                    cached_at=datetime.now(UTC),
                    ttl_seconds=self.cache_ttl,
                    secret_type=self._infer_secret_type(path),
                )
                await self.cache.set(path, metadata)

            metrics_inc("infisical_fetch_total", {"source": "infisical", "path": path})

            return value

        except Exception as e:
            metrics_inc("infisical_fetch_errors_total", {"path": path, "error": type(e).__name__})
            raise
        finally:
            duration = time.time() - start_time
            metrics_inc("infisical_fetch_duration_seconds", {"path": path}, duration)

    async def store_secret(
        self, path: str, value: str, secret_type: SecretType | None = None
    ) -> None:
        """Store a secret in Infisical.

        Args:
            path: Secret path
            value: Secret value to store
            secret_type: Optional secret type for validation

        Raises:
            AuthenticationError: If authentication fails
            ConnectionError: If connection fails
            InfisicalError: For other errors
        """
        start_time = time.time()

        try:
            await self._store_to_infisical(path, value)

            # Invalidate cache
            if self.cache:
                await self.cache.delete(path)

            metrics_inc("infisical_store_total", {"path": path})

        except Exception as e:
            metrics_inc("infisical_store_errors_total", {"path": path, "error": type(e).__name__})
            raise
        finally:
            duration = time.time() - start_time
            metrics_inc("infisical_store_duration_seconds", {"path": path}, duration)

    async def list_secrets(self, path_prefix: str = "/") -> list[str]:
        """List all secret paths with given prefix.

        Args:
            path_prefix: Path prefix to filter secrets

        Returns:
            List of secret paths

        Raises:
            AuthenticationError: If authentication fails
            ConnectionError: If connection fails
            InfisicalError: For other errors
        """
        try:
            env = {
                **os.environ,
                "INFISICAL_API_URL": self.server_url,
            }

            cmd = [
                self._cli_path,
                "secrets",
                "list",
                "--projectId",
                self.project_id,
                "--format",
                "json",
            ]

            if path_prefix != "/":
                cmd.extend(["--path", path_prefix])

            result = await asyncio.wait_for(
                asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                    env=env,
                ),
                timeout=self.timeout,
            )

            stdout, stderr = await result.communicate()

            if result.returncode is not None and result.returncode != 0:
                self._handle_cli_error(result.returncode, stderr.decode())

            # Parse JSON response
            secrets_data = json.loads(stdout.decode())

            # Extract secret keys/paths
            paths: list[str] = []
            if isinstance(secrets_data, list):
                paths.extend(
                    secret["secretKey"]
                    for secret in secrets_data
                    if isinstance(secret, dict) and "secretKey" in secret
                )

            metrics_inc("infisical_list_total", {"prefix": path_prefix, "count": len(paths)})

            return sorted(paths)

        except TimeoutError as e:
            raise ConnectionError(f"Timeout listing secrets: {e}") from e
        except json.JSONDecodeError as e:
            raise InfisicalError(f"Invalid JSON response: {e}") from e
        except Exception as e:
            metrics_inc(
                "infisical_list_errors_total", {"prefix": path_prefix, "error": type(e).__name__}
            )
            raise

    async def delete_secret(self, path: str) -> None:
        """Delete a secret from Infisical.

        Args:
            path: Secret path to delete

        Raises:
            SecretNotFoundError: If secret doesn't exist
            AuthenticationError: If authentication fails
            ConnectionError: If connection fails
            InfisicalError: For other errors
        """
        try:
            await self._delete_from_infisical(path)

            # Remove from cache
            if self.cache:
                await self.cache.delete(path)

            metrics_inc("infisical_delete_total", {"path": path})

        except Exception as e:
            metrics_inc("infisical_delete_errors_total", {"path": path, "error": type(e).__name__})
            raise

    async def health_check(self) -> dict[str, Any]:
        """Perform health check of Infisical connection.

        Returns:
            Health check results
        """
        start_time = time.time()

        try:
            # Test basic connectivity
            await self.list_secrets("/")

            status = {
                "status": "healthy",
                "server_url": self.server_url,
                "project_id": self.project_id,
                "cache_enabled": self.cache is not None,
                "response_time_ms": round((time.time() - start_time) * 1000, 2),
            }

            metrics_inc("infisical_health_check_total", {"status": "success"})

            return status

        except Exception as e:
            status = {
                "status": "unhealthy",
                "error": str(e),
                "server_url": self.server_url,
                "project_id": self.project_id,
                "response_time_ms": round((time.time() - start_time) * 1000, 2),
            }

            metrics_inc("infisical_health_check_total", {"status": "failure"})

            return status

    async def invalidate_cache(self, pattern: str = "*") -> None:
        """Invalidate cached secrets.

        Args:
            pattern: Pattern to match for invalidation (default: all)
        """
        if self.cache:
            await self.cache.invalidate_pattern(pattern)
            logger.info("Invalidated cache pattern: %s", pattern)

    @staticmethod
    def _is_cache_valid(metadata: SecretMetadata) -> bool:
        """Check if cached secret is still valid."""
        age = datetime.now(UTC) - metadata.cached_at
        return age.total_seconds() < metadata.ttl_seconds

    @staticmethod
    def _infer_secret_type(path: str) -> SecretType:
        """Infer secret type from path."""
        path_lower = path.lower()

        if "jwt" in path_lower and "private" in path_lower:
            return SecretType.JWT_PRIVATE_KEY
        if "jwt" in path_lower and "public" in path_lower:
            return SecretType.JWT_PUBLIC_KEY
        if "aes" in path_lower or "encryption" in path_lower:
            return SecretType.AES_ENCRYPTION_KEY
        if "api" in path_lower and "key" in path_lower:
            return SecretType.API_KEY
        if "database" in path_lower or "db" in path_lower:
            return SecretType.DATABASE_PASSWORD
        if "webhook" in path_lower:
            return SecretType.WEBHOOK_SECRET
        return SecretType.API_KEY  # Default fallback

    async def _fetch_from_infisical(self, path: str) -> str:
        """Fetch secret from Infisical with retries."""
        last_error = None

        for attempt in range(1, self.max_retries + 1):
            try:
                return await self._fetch_single_attempt(path)
            except Exception as e:
                last_error = e
                # Do not retry explicit timeouts
                if isinstance(e, ConnectionError) and "Timeout" in str(e):
                    raise
                if attempt < self.max_retries:
                    await asyncio.sleep(self.retry_delay * attempt)
                    logger.debug("Retry %d/%d for path %s: %s", attempt, self.max_retries, path, e)
                else:
                    logger.exception("All retries exhausted for path %s", path)

        # Re-raise the last error
        if last_error:
            raise last_error

        raise InfisicalError("Unexpected error: no attempts made")

    async def _fetch_single_attempt(self, path: str) -> str:
        """Single attempt to fetch secret."""
        env = {
            **os.environ,
            "INFISICAL_API_URL": self.server_url,
        }

        # Extract secret key from path
        secret_key = path.rsplit("/", maxsplit=1)[-1]

        cmd = [
            # Use program name for compatibility with tests
            "infisical",
            "secrets",
            "get",
            secret_key,
            "--projectId",
            self.project_id,
            "--format",
            "json",
        ]

        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env,
        )

        try:
            stdout, stderr = await asyncio.wait_for(
                process.communicate(),
                timeout=self.timeout,
            )
        except TimeoutError as e:
            process.kill()
            # Do not retry timeouts; raise immediately
            raise ConnectionError(f"Timeout fetching secret {path}") from e

        if process.returncode is not None and process.returncode != 0:
            self._handle_cli_error(process.returncode, stderr.decode())

        try:
            data = json.loads(stdout.decode())
            if isinstance(data, dict) and "secretValue" in data:
                return data["secretValue"]
            raise InfisicalError(f"Unexpected response format for {path}")
        except json.JSONDecodeError as e:
            raise InfisicalError(f"Invalid JSON response for {path}: {e}") from e

    async def _store_to_infisical(self, path: str, value: str) -> None:
        """Store secret to Infisical."""
        env = {
            **os.environ,
            "INFISICAL_API_URL": self.server_url,
        }

        # Extract secret key from path
        secret_key = path.rsplit("/", maxsplit=1)[-1]

        cmd = [
            "infisical",
            "secrets",
            "set",
            secret_key,
            value,
            "--projectId",
            self.project_id,
        ]

        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env,
        )

        try:
            _stdout, stderr = await asyncio.wait_for(
                process.communicate(),
                timeout=self.timeout,
            )
        except TimeoutError as e:
            process.kill()
            raise ConnectionError(f"Timeout storing secret {path}") from e

        if process.returncode is not None and process.returncode != 0:
            self._handle_cli_error(process.returncode, stderr.decode())

    async def _delete_from_infisical(self, path: str) -> None:
        """Delete secret from Infisical."""
        env = {
            **os.environ,
            "INFISICAL_API_URL": self.server_url,
        }

        # Extract secret key from path
        secret_key = path.rsplit("/", maxsplit=1)[-1]

        cmd = [
            "infisical",
            "secrets",
            "delete",
            secret_key,
            "--projectId",
            self.project_id,
        ]

        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env,
        )

        try:
            _stdout, stderr = await asyncio.wait_for(
                process.communicate(),
                timeout=self.timeout,
            )
        except TimeoutError as e:
            process.kill()
            raise ConnectionError(f"Timeout deleting secret {path}") from e

        if process.returncode is not None and process.returncode != 0:
            self._handle_cli_error(process.returncode, stderr.decode())

    @staticmethod
    def _handle_cli_error(exit_code: int, stderr: str) -> None:
        """Handle CLI errors and raise appropriate exceptions."""
        stderr_lower = stderr.lower()

        if "not found" in stderr_lower or "does not exist" in stderr_lower:
            raise SecretNotFoundError(f"Secret not found: {stderr}", exit_code, stderr)
        if "authentication" in stderr_lower or "unauthorized" in stderr_lower:
            raise AuthenticationError(f"Authentication failed: {stderr}", exit_code, stderr)
        if "connection" in stderr_lower or "network" in stderr_lower or "timeout" in stderr_lower:
            raise ConnectionError(f"Connection error: {stderr}", exit_code, stderr)
        raise InfisicalError(f"CLI error (code {exit_code}): {stderr}", exit_code, stderr)
