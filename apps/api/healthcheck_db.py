#!/usr/bin/env python3
"""
Database health check for Supabase connection.
Run from apps/api directory: uv run python healthcheck_db.py
"""

import asyncio
import os
from pathlib import Path
import sys


# Try to import asyncpg
try:
    import asyncpg
except ImportError:
    print("❌ asyncpg not installed. Run: uv sync")
    sys.exit(1)


def _read_env_vars(env_file: Path) -> dict[str, str]:
    env_vars: dict[str, str] = {}
    if env_file.exists():
        with env_file.open() as f:
            for line_raw in f:
                line = line_raw.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    env_vars[key] = value
    return env_vars


async def test_connection():
    """Test database connection to Supabase using pooler URLs."""

    # Read env file
    env_file = Path(__file__).parent.parent.parent / ".env.production.minimal"
    env_vars = _read_env_vars(env_file)

    # Try session mode first (port 5432) for local dev
    session_url = env_vars.get("DATABASE_URL_SESSION")
    tx_url = env_vars.get("DATABASE_URL_TX")

    if not session_url and not tx_url:
        print("❌ No DATABASE_URL_SESSION or DATABASE_URL_TX found")
        print("   Check .env.production.minimal")
        return False

    # Test session mode (recommended for local dev)
    if session_url:
        print("📊 Testing Supabase connection (Session Mode - Port 5432)")
        print("   Using IPv4-compatible pooler URL")

        try:
            # Add SSL mode if not present
            if "sslmode=" not in session_url:
                session_url += "?sslmode=require"

            conn = await asyncpg.connect(session_url)

            # Test basic query
            version = await conn.fetchval("SELECT version()")
            print("✅ Connected successfully!")
            print(f"📦 {version.split(',')[0].strip()}")

            # Check pgvector
            pgvector = await conn.fetchval("""
                SELECT COUNT(*)
                FROM pg_extension
                WHERE extname = 'vector'
            """)

            if pgvector:
                vector_info = await conn.fetchrow("""
                    SELECT extversion, extnamespace::regnamespace as schema
                    FROM pg_extension
                    WHERE extname = 'vector'
                """)
                print(
                    f"✅ pgvector enabled (v{vector_info['extversion']}) in"
                    " schema: {vector_info['schema']}"
                )
            else:
                print("⚠️  pgvector not enabled")
                print("   Enable via Dashboard → Database → Extensions")

            # Check database info
            db_info = await conn.fetchrow("""
                SELECT
                    current_database() as db_name,
                    pg_size_pretty(pg_database_size(current_database())) as db_size,
                    current_user as user_name
            """)

            print(f"📊 Database: {db_info['db_name']}")
            print(f"💾 Size: {db_info['db_size']}")
            print(f"👤 User: {db_info['user_name']}")

            await conn.close()
            print("\n✅ Session mode connection test passed!")
            return True

        except (asyncpg.PostgresError, OSError, ValueError) as e:
            print(f"❌ Session mode connection failed: {e}")
            print("\nTroubleshooting:")
            print("1. Check connection string format:")
            print(
                "   postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"
            )
            print("2. Verify password is correct")
            print("3. Check project reference ID matches")

    # Test transaction mode if session failed
    if tx_url and not session_url:
        print("\n📊 Testing Transaction Mode (Port 6543)")
        try:
            if "sslmode=" not in tx_url:
                tx_url += "?sslmode=require"

            conn = await asyncpg.connect(tx_url)
            version = await conn.fetchval("SELECT version()")
            print(f"✅ Transaction mode connected: {version.split(',')[0]}")
            await conn.close()
            return True
        except (asyncpg.PostgresError, OSError, ValueError) as e:
            print(f"❌ Transaction mode failed: {e}")

    return False


async def test_with_env_override():
    """Test with manual connection string if env vars not working."""

    print("\n📝 Manual connection test")
    print("Get your connection string from Supabase Dashboard:")
    print("1. Go to: https://supabase.com/dashboard/project/ecmnzrtsuajatmuahooa/settings/database")
    print("2. Copy 'Connection string' → 'Session Mode'")
    print("3. It should look like:")
    print(
        "   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
    )
    print("\nOr set environment variable:")
    print("   export DATABASE_URL_SESSION='<connection-string>'")

    # Check if set as env var
    manual_url = os.getenv("DATABASE_URL_SESSION")
    if manual_url:
        try:
            if "sslmode=" not in manual_url:
                manual_url += "?sslmode=require"

            conn = await asyncpg.connect(manual_url)
            version = await conn.fetchval("SELECT version()")
            print(f"✅ Connected with manual URL: {version}")
            await conn.close()
            return True
        except (asyncpg.PostgresError, OSError, ValueError) as e:
            print(f"❌ Manual connection failed: {e}")

    return False


if __name__ == "__main__":
    print("🚀 Supabase Database Health Check\n")

    # Run tests
    success = asyncio.run(test_connection())

    if not success:
        # Try manual override
        success = asyncio.run(test_with_env_override())

    if success:
        print("\n✅ Database connectivity verified!")
        print("Next steps:")
        print("1. Enable pgvector via Dashboard if not done")
        print("2. Run migrations: uv run alembic upgrade head")
        print("3. Update Vercel env vars with these connection strings")
    else:
        print("\n❌ Could not connect to database")
        print("Please check your connection strings in .env.production.minimal")

    sys.exit(0 if success else 1)
