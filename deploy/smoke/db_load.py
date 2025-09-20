#!/usr/bin/env python3
"""
Database Load Test for Supabase Connection Pooling

Tests connection handling under load with conservative pool sizes
suitable for Supabase transaction pooling mode.

Usage:
    python deploy/smoke/db_load.py
    DB_LOAD_N=20 python deploy/smoke/db_load.py
    DATABASE_URL=postgresql://... python deploy/smoke/db_load.py
"""

import os
import sys
import time
import statistics
import concurrent.futures as cf
from typing import List, Tuple

try:
    import psycopg
except ImportError:
    print("❌ psycopg not available - run: pip install psycopg[binary]")
    sys.exit(1)


class DatabaseLoadTester:
    def __init__(self, database_url: str, num_connections: int = 20):
        self.database_url = database_url
        self.num_connections = num_connections
        self.results: List[float] = []
        self.errors: List[str] = []

    def single_connection_test(self, test_id: int) -> Tuple[int, float, str]:
        """Test a single database connection with timing"""
        start_time = time.time()
        error_msg = ""

        try:
            # Test with transaction pooling compatible settings
            # Note: prepared_statement_cache_size=0 for Supabase pooled connections
            conn_params = self.database_url
            if "pgbouncer=true" in conn_params:
                # This is a pooled connection string - good for Supabase
                pass

            with psycopg.connect(conn_params) as conn:
                with conn.cursor() as cur:
                    # Test 1: Basic query
                    cur.execute("SELECT 1")
                    result = cur.fetchone()
                    assert result[0] == 1

                    # Test 2: Slightly more complex query
                    cur.execute("SELECT current_database(), current_user")
                    db_info = cur.fetchone()
                    assert len(db_info) == 2

                    # Test 3: Small read operation (if entries table exists)
                    try:
                        cur.execute("SELECT COUNT(*) FROM entries")
                        cur.fetchone()[0]
                    except psycopg.errors.UndefinedTable:
                        # Table doesn't exist - skip this test
                        pass

                    # Test 4: Test vector operation if available
                    try:
                        cur.execute("SELECT '[1,2,3]'::vector <-> '[4,5,6]'::vector")
                        vector_dist = cur.fetchone()[0]
                        assert vector_dist > 0
                    except psycopg.errors.UndefinedFunction:
                        # pgvector not available
                        pass

        except Exception as e:
            error_msg = str(e)

        end_time = time.time()
        latency_ms = (end_time - start_time) * 1000

        return test_id, latency_ms, error_msg

    def run_load_test(self) -> dict:
        """Run concurrent load test"""
        print(
            f"🔄 Starting load test with {self.num_connections} concurrent connections..."
        )
        print(
            f"🔗 Database: {self.database_url.split('@')[-1] if '@' in self.database_url else 'localhost'}"
        )

        # Use ThreadPoolExecutor for concurrent connections
        with cf.ThreadPoolExecutor(max_workers=self.num_connections) as executor:
            # Submit all tasks
            futures = [
                executor.submit(self.single_connection_test, i)
                for i in range(self.num_connections)
            ]

            # Collect results as they complete
            for future in cf.as_completed(futures):
                test_id, latency_ms, error_msg = future.result()

                if error_msg:
                    self.errors.append(f"Connection {test_id}: {error_msg}")
                    print(f"❌ Connection {test_id}: {error_msg}")
                else:
                    self.results.append(latency_ms)
                    print(f"✅ Connection {test_id}: {latency_ms:.1f}ms")

        return self.calculate_stats()

    def calculate_stats(self) -> dict:
        """Calculate performance statistics"""
        if not self.results:
            return {
                "success_rate": 0.0,
                "total_tests": self.num_connections,
                "successful_tests": 0,
                "failed_tests": len(self.errors),
            }

        stats = {
            "success_rate": len(self.results) / self.num_connections * 100,
            "total_tests": self.num_connections,
            "successful_tests": len(self.results),
            "failed_tests": len(self.errors),
            "latency_min_ms": min(self.results),
            "latency_max_ms": max(self.results),
            "latency_mean_ms": statistics.mean(self.results),
            "latency_median_ms": statistics.median(self.results),
            "latency_p95_ms": statistics.quantiles(self.results, n=20)[18]
            if len(self.results) > 10
            else max(self.results),
            "latency_p99_ms": statistics.quantiles(self.results, n=100)[98]
            if len(self.results) > 50
            else max(self.results),
        }

        return stats

    def print_results(self, stats: dict):
        """Print detailed test results"""
        print("\n" + "=" * 60)
        print("DATABASE LOAD TEST RESULTS")
        print("=" * 60)

        # Connection success rate
        success_rate = stats["success_rate"]
        print(
            f"Success Rate: {success_rate:.1f}% ({stats['successful_tests']}/{stats['total_tests']})"
        )

        if stats["failed_tests"] > 0:
            print(f"Failed Tests: {stats['failed_tests']}")
            print("First few errors:")
            for error in self.errors[:3]:
                print(f"  - {error}")

        if stats["successful_tests"] == 0:
            print("❌ No successful connections - cannot calculate latency stats")
            return False

        # Latency statistics
        print("\nLatency Statistics:")
        print(f"  Minimum:  {stats['latency_min_ms']:.1f}ms")
        print(f"  Maximum:  {stats['latency_max_ms']:.1f}ms")
        print(f"  Mean:     {stats['latency_mean_ms']:.1f}ms")
        print(f"  Median:   {stats['latency_median_ms']:.1f}ms")
        print(f"  P95:      {stats['latency_p95_ms']:.1f}ms")
        print(f"  P99:      {stats['latency_p99_ms']:.1f}ms")

        # Performance assessment
        print("\nPerformance Assessment:")

        # Thresholds for different environments
        p95_threshold = float(os.getenv("DB_MAX_LATENCY_P95_MS", "120"))
        success_threshold = float(os.getenv("DB_MIN_SUCCESS_RATE", "95"))

        p95_pass = stats["latency_p95_ms"] <= p95_threshold
        success_pass = success_rate >= success_threshold

        print(
            f"  P95 Latency: {stats['latency_p95_ms']:.1f}ms {'✅' if p95_pass else '❌'} (target: <{p95_threshold}ms)"
        )
        print(
            f"  Success Rate: {success_rate:.1f}% {'✅' if success_pass else '❌'} (target: >{success_threshold}%)"
        )

        # Connection pooling recommendations
        if stats["latency_p95_ms"] > 200:
            print("\n⚠️  High latency detected. Consider:")
            print("   - Using Supabase pooled connection string")
            print("   - Reducing DATABASE_POOL_SIZE (try 3-5)")
            print("   - Enabling connection pooling in app config")

        if success_rate < 90:
            print("\n⚠️  Low success rate. Check:")
            print("   - Database connection limits")
            print("   - Network connectivity")
            print("   - Authentication credentials")

        overall_pass = p95_pass and success_pass

        if overall_pass:
            print("\n🎉 Load test PASSED - Ready for Supabase deployment!")
        else:
            print("\n❌ Load test FAILED - Issues must be resolved before deployment")

        return overall_pass

    def check_connection_string_type(self):
        """Analyze connection string for Supabase compatibility"""
        print("🔍 Analyzing connection string...")

        if "pgbouncer=true" in self.database_url:
            print("✅ Pooled connection detected (pgbouncer=true)")
            print("   - Good for serverless/lambda environments")
            print("   - Transaction pooling mode")
            print("   - Note: Prepared statements disabled automatically")
        elif "@db." in self.database_url and "supabase.co" in self.database_url:
            print("⚠️  Supabase direct connection detected")
            print("   - Good for persistent server environments")
            print("   - Higher connection limits")
            print("   - Consider pooled URL for serverless")
        else:
            print("ℹ️  Local/other database connection")
            print("   - Development environment")
            print("   - Configure for production pooling")

        print()


def main():
    """Main entry point"""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL environment variable is required")
        print("Example: DATABASE_URL=postgresql://user:pass@host:port/dbname")
        sys.exit(1)

    # Get number of concurrent connections to test
    num_connections = int(os.getenv("DB_LOAD_N", "20"))
    if num_connections > 50:
        print("⚠️  Warning: Testing with >50 connections may overwhelm database")
        print("   Recommended: 5-20 connections for Supabase")
        num_connections = 50

    print("🚀 Database Load Testing - Supabase Ready")
    print(f"📊 Testing {num_connections} concurrent connections\n")

    tester = DatabaseLoadTester(database_url, num_connections)
    tester.check_connection_string_type()

    stats = tester.run_load_test()
    success = tester.print_results(stats)

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
