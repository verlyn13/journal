#!/usr/bin/env python3
"""Test Supabase database connection."""

import asyncio
import asyncpg
from pathlib import Path


async def test_connection():
    """Test database connection to Supabase."""

    # Read connection string from .env.production.minimal
    env_file = Path(__file__).parent / ".env.production.minimal"
    conn_string = None

    with open(env_file) as f:
        for line in f:
            if line.startswith("DATABASE_URL="):
                conn_string = line.split("=", 1)[1].strip()
                break

    if not conn_string:
        print("❌ DATABASE_URL not found in .env.production.minimal")
        return False

    print("📊 Testing Supabase database connection...")
    print("🔗 Host: db.ecmnzrtsuajatmuahooa.supabase.co")

    try:
        # Connect to database
        conn = await asyncpg.connect(conn_string)

        # Get PostgreSQL version
        version = await conn.fetchval("SELECT version()")
        print("✅ Connected successfully!")
        print(f"📦 PostgreSQL version: {version.split(',')[0]}")

        # Check if pgvector is available
        extensions = await conn.fetch(
            "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector'"
        )

        if extensions:
            print(f"✅ pgvector extension enabled (v{extensions[0]['extversion']})")
        else:
            print("⚠️  pgvector extension not enabled yet")
            print("   Run the SQL in enable_pgvector.sql via Supabase Dashboard")

        # Get database size
        db_size = await conn.fetchval(
            "SELECT pg_size_pretty(pg_database_size(current_database()))"
        )
        print(f"💾 Database size: {db_size}")

        # Check tables
        tables = await conn.fetch("""
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY tablename
        """)

        if tables:
            print(f"📋 Found {len(tables)} table(s):")
            for table in tables[:5]:  # Show first 5 tables
                print(f"   - {table['tablename']}")
            if len(tables) > 5:
                print(f"   ... and {len(tables) - 5} more")
        else:
            print("📋 No tables found (database is empty)")

        await conn.close()
        print("\n✅ Database connection test successful!")
        return True

    except asyncpg.exceptions.InvalidPasswordError:
        print("❌ Invalid password - check your database password")
        return False
    except asyncpg.exceptions.ConnectionDoesNotExistError:
        print("❌ Database does not exist")
        return False
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False


if __name__ == "__main__":
    success = asyncio.run(test_connection())
    exit(0 if success else 1)
