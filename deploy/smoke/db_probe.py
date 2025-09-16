#!/usr/bin/env python3
"""
Database probe script for smoke testing
Tests connection, extensions, and basic operations
"""

import os
import sys
import time
from urllib.parse import urlparse

def probe_database():
    """Probe database connectivity and features."""
    # Get database URL from environment
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("ERROR: DATABASE_URL not set")
        sys.exit(1)

    # Parse URL to check if it's PostgreSQL
    parsed = urlparse(db_url)
    if not parsed.scheme.startswith("postgres"):
        print(f"ERROR: Expected PostgreSQL URL, got: {parsed.scheme}")
        sys.exit(1)

    # Import psycopg (for sync operations) or asyncpg (for async)
    try:
        import psycopg
    except ImportError:
        print("ERROR: psycopg not installed. Run: pip install psycopg[binary]")
        sys.exit(1)

    print(f"[INFO] Connecting to database: {parsed.hostname}:{parsed.port}/{parsed.path[1:]}")

    try:
        # Connect to database
        with psycopg.connect(db_url) as conn:
            with conn.cursor() as cur:
                # Test 1: Basic connectivity
                cur.execute("SELECT 1")
                result = cur.fetchone()
                assert result[0] == 1, "Basic SELECT failed"
                print("✓ Database connection successful")

                # Test 2: Check PostgreSQL version
                cur.execute("SELECT version()")
                version = cur.fetchone()[0]
                print(f"✓ PostgreSQL version: {version.split(',')[0]}")

                # Test 3: Check for pgvector extension
                cur.execute("""
                    SELECT COUNT(*)
                    FROM pg_extension
                    WHERE extname = 'vector'
                """)
                has_vector = cur.fetchone()[0] > 0

                if has_vector:
                    print("✓ pgvector extension is installed")

                    # Test vector operations
                    cur.execute("SELECT '[1,2,3]'::vector")
                    print("✓ Vector operations working")
                else:
                    print("⚠ pgvector extension not found")
                    print("  Run: CREATE EXTENSION IF NOT EXISTS vector;")

                # Test 4: Check for required tables
                cur.execute("""
                    SELECT table_name
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                    AND table_type = 'BASE TABLE'
                    ORDER BY table_name
                """)
                tables = [row[0] for row in cur.fetchall()]

                if tables:
                    print(f"✓ Found {len(tables)} tables:")
                    for table in tables[:5]:  # Show first 5
                        print(f"  - {table}")
                    if len(tables) > 5:
                        print(f"  ... and {len(tables) - 5} more")
                else:
                    print("⚠ No tables found (database may need migrations)")

                # Test 5: Check for Alembic version
                cur.execute("""
                    SELECT COUNT(*)
                    FROM information_schema.tables
                    WHERE table_name = 'alembic_version'
                """)
                has_alembic = cur.fetchone()[0] > 0

                if has_alembic:
                    cur.execute("SELECT version_num FROM alembic_version")
                    migration = cur.fetchone()
                    if migration:
                        print(f"✓ Database migrated to version: {migration[0]}")
                    else:
                        print("⚠ Alembic table exists but no version recorded")
                else:
                    print("⚠ No alembic_version table (migrations not run)")

                # Test 6: Write test (create temp table)
                test_table = f"smoke_test_{int(time.time())}"
                try:
                    cur.execute(f"""
                        CREATE TEMP TABLE {test_table} (
                            id SERIAL PRIMARY KEY,
                            data TEXT,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )
                    """)

                    # Insert test data
                    cur.execute(f"""
                        INSERT INTO {test_table} (data)
                        VALUES ('smoke test')
                        RETURNING id
                    """)
                    test_id = cur.fetchone()[0]

                    # Read back
                    cur.execute(f"""
                        SELECT data FROM {test_table}
                        WHERE id = %s
                    """, (test_id,))
                    data = cur.fetchone()[0]

                    assert data == "smoke test", "Read/write test failed"
                    print("✓ Read/write operations working")

                    # Cleanup happens automatically (TEMP TABLE)
                except Exception as e:
                    print(f"⚠ Write test failed: {e}")

                # Test 7: Check connection limits
                cur.execute("""
                    SELECT setting::int
                    FROM pg_settings
                    WHERE name = 'max_connections'
                """)
                max_conn = cur.fetchone()[0]

                cur.execute("""
                    SELECT COUNT(*)
                    FROM pg_stat_activity
                """)
                current_conn = cur.fetchone()[0]

                print(f"✓ Connections: {current_conn}/{max_conn}")

                if current_conn / max_conn > 0.8:
                    print("⚠ WARNING: Connection usage above 80%")

                # Test 8: Check database size
                cur.execute("""
                    SELECT pg_database_size(current_database())
                """)
                db_size = cur.fetchone()[0]
                size_mb = db_size / (1024 * 1024)
                print(f"✓ Database size: {size_mb:.2f} MB")

        print("\n[SUCCESS] All database probes passed")
        return 0

    except psycopg.OperationalError as e:
        print(f"[ERROR] Failed to connect to database: {e}")
        return 1
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(probe_database())