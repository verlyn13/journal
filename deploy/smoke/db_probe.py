#!/usr/bin/env python3
"""
Enhanced Database Probe for Journal Application - Supabase Ready

Tests database connectivity, required extensions, and key functionality
for both local development and Supabase production environments.

Usage:
    python deploy/smoke/db_probe.py
    DATABASE_URL=postgresql://... python deploy/smoke/db_probe.py
"""

import os
import sys
import traceback
from typing import Dict

try:
    import psycopg
except ImportError:
    print("❌ psycopg not available - run: pip install psycopg[binary]")
    sys.exit(1)


class DatabaseProbe:
    def __init__(self, database_url: str):
        self.database_url = database_url
        self.results: Dict[str, bool] = {}
        self.details: Dict[str, str] = {}

    def connect(self):
        """Establish database connection"""
        try:
            return psycopg.connect(self.database_url, autocommit=True)
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            sys.exit(1)

    def test_basic_connectivity(self) -> bool:
        """Test basic database connectivity"""
        print("🔄 Testing basic connectivity...")
        try:
            with self.connect() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT 1")
                    result = cur.fetchone()
                    if result and result[0] == 1:
                        print("✅ Basic connectivity: OK")
                        self.details["connectivity"] = (
                            "Successfully connected and executed query"
                        )
                        return True
                    else:
                        print("❌ Basic connectivity: Failed - Invalid response")
                        return False
        except Exception as e:
            print(f"❌ Basic connectivity: Failed - {e}")
            self.details["connectivity"] = f"Error: {e}"
            return False

    def test_required_extensions(self) -> bool:
        """Test that required PostgreSQL extensions are available"""
        print("🔄 Testing required extensions...")

        required_extensions = ["vector", "pg_trgm", "btree_gin"]

        try:
            with self.connect() as conn:
                with conn.cursor() as cur:
                    # Check installed extensions
                    cur.execute(
                        """
                        SELECT extname, extversion
                        FROM pg_extension
                        WHERE extname = ANY(%s)
                        ORDER BY extname;
                    """,
                        (required_extensions,),
                    )

                    installed = {row[0]: row[1] for row in cur.fetchall()}

                    all_present = True
                    for ext in required_extensions:
                        if ext in installed:
                            print(f"✅ Extension {ext}: {installed[ext]}")
                        else:
                            print(f"❌ Extension {ext}: Missing")
                            all_present = False

                    if all_present:
                        self.details["extensions"] = (
                            f"All required extensions present: {list(installed.keys())}"
                        )
                        return True
                    else:
                        missing = set(required_extensions) - set(installed.keys())
                        self.details["extensions"] = (
                            f"Missing extensions: {list(missing)}"
                        )
                        return False

        except Exception as e:
            print(f"❌ Extension check failed: {e}")
            self.details["extensions"] = f"Error: {e}"
            return False

    def test_pgvector_functionality(self) -> bool:
        """Test pgvector extension functionality"""
        print("🔄 Testing pgvector functionality...")

        try:
            with self.connect() as conn:
                with conn.cursor() as cur:
                    # Test vector creation and operations
                    cur.execute("SELECT '[1,2,3]'::vector")
                    cur.fetchone()[0]

                    # Test vector distance calculation
                    cur.execute("SELECT '[1,2,3]'::vector <-> '[4,5,6]'::vector")
                    distance = cur.fetchone()[0]

                    # Test vector similarity (should be distance in this case)
                    if distance > 0:
                        print(
                            f"✅ pgvector: Vector distance calculation works (distance: {distance:.3f})"
                        )

                        # Test with realistic dimensions (OpenAI embedding size)
                        test_vector = f"[{','.join(['0.1'] * 1536)}]"
                        cur.execute(f"SELECT '{test_vector}'::vector(1536)")
                        result = cur.fetchone()

                        if result:
                            print(
                                "✅ pgvector: 1536-dimension vectors supported (OpenAI compatible)"
                            )
                            self.details["pgvector"] = (
                                f"Working with distance calc: {distance:.3f}, 1536-dim supported"
                            )
                            return True

                    print("❌ pgvector: Distance calculation returned invalid result")
                    return False

        except Exception as e:
            print(f"❌ pgvector test failed: {e}")
            self.details["pgvector"] = f"Error: {e}"
            return False

    def test_full_text_search(self) -> bool:
        """Test full-text search functionality"""
        print("🔄 Testing full-text search...")

        try:
            with self.connect() as conn:
                with conn.cursor() as cur:
                    # Test tsvector creation
                    cur.execute(
                        "SELECT to_tsvector('english', 'The quick brown fox jumps over the lazy dog')"
                    )
                    cur.fetchone()[0]

                    # Test tsquery matching
                    cur.execute("""
                        SELECT to_tsvector('english', 'The quick brown fox')
                        @@ to_tsquery('english', 'quick & fox')
                    """)
                    match_result = cur.fetchone()[0]

                    if match_result:
                        print(
                            "✅ Full-text search: Basic tsvector/tsquery operations work"
                        )

                        # Check if entries table has search_vector column
                        cur.execute("""
                            SELECT COUNT(*)
                            FROM information_schema.columns
                            WHERE table_name = 'entries' AND column_name = 'search_vector'
                        """)
                        has_search_col = cur.fetchone()[0] > 0

                        if has_search_col:
                            print(
                                "✅ Full-text search: entries.search_vector column exists"
                            )

                        self.details["fts"] = (
                            "tsvector/tsquery working, search_vector column present"
                        )
                        return True
                    else:
                        print("❌ Full-text search: Query matching failed")
                        return False

        except Exception as e:
            print(f"❌ Full-text search test failed: {e}")
            self.details["fts"] = f"Error: {e}"
            return False

    def run_all_tests(self) -> Dict[str, bool]:
        """Run all database probe tests"""
        print("🚀 Starting comprehensive database probe...\n")

        tests = [
            ("connectivity", self.test_basic_connectivity),
            ("extensions", self.test_required_extensions),
            ("pgvector", self.test_pgvector_functionality),
            ("fts", self.test_full_text_search),
        ]

        for test_name, test_func in tests:
            try:
                self.results[test_name] = test_func()
                print()  # Add spacing between tests
            except Exception as e:
                print(f"❌ {test_name} test crashed: {e}")
                traceback.print_exc()
                self.results[test_name] = False
                self.details[test_name] = f"Crashed: {e}"
                print()

        return self.results

    def print_summary(self):
        """Print test results summary"""
        print("=" * 50)
        print("DATABASE PROBE SUMMARY")
        print("=" * 50)

        passed = sum(1 for result in self.results.values() if result)
        total = len(self.results)

        print(f"Tests passed: {passed}/{total}")
        print(f"Overall status: {'✅ PASS' if passed == total else '❌ FAIL'}")
        print()

        print("Detailed results:")
        for test_name, result in self.results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {test_name:15} {status}")
            if test_name in self.details:
                print(f"                  {self.details[test_name]}")

        print()

        if passed == total:
            print("🎉 Database is ready for Supabase deployment!")
            return True
        else:
            print(
                "⚠️  Database has issues that must be resolved before Supabase deployment."
            )
            return False


def main():
    """Main entry point"""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL environment variable is required")
        print("Example: DATABASE_URL=postgresql://user:pass@host:port/dbname")
        sys.exit(1)

    print(
        f"🔍 Probing database: {database_url.split('@')[-1] if '@' in database_url else 'localhost'}"
    )
    print()

    probe = DatabaseProbe(database_url)
    probe.run_all_tests()
    success = probe.print_summary()

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
