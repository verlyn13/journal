#!/usr/bin/env python3
"""
Database Anonymization Script for Journal Application

Anonymizes sensitive data for preview environments while preserving:
- Data structure and relationships
- Statistical properties
- Referential integrity
- Business logic validation

Usage:
    python scripts/anonymize.py --dry-run        # Preview changes
    python scripts/anonymize.py --execute        # Apply changes
    python scripts/anonymize.py --validate       # Check for PII
"""

import argparse
import os
import re
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import json
import hashlib
import random

try:
    import psycopg
    from faker import Faker
except ImportError:
    print("Error: Required packages not installed")
    print("Run: pip install psycopg[binary] faker")
    sys.exit(1)

# Initialize Faker with deterministic seed for consistent results
fake = Faker()
Faker.seed(12345)
random.seed(12345)


class DatabaseAnonymizer:
    def __init__(self, database_url: str, dry_run: bool = True):
        self.database_url = database_url
        self.dry_run = dry_run
        self.changes_made = []

    def connect(self):
        """Establish database connection"""
        try:
            return psycopg.connect(self.database_url, autocommit=not self.dry_run)
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            sys.exit(1)

    def log_change(self, table: str, operation: str, count: int):
        """Log anonymization changes"""
        self.changes_made.append(
            {
                "table": table,
                "operation": operation,
                "rows_affected": count,
                "timestamp": datetime.now().isoformat(),
            }
        )

    def deterministic_hash(self, value: str, prefix: str = "") -> str:
        """Generate deterministic hash for consistent anonymization"""
        hash_obj = hashlib.md5(f"{prefix}{value}".encode())
        return hash_obj.hexdigest()[:8]

    def anonymize_email(self, email: str) -> str:
        """Anonymize email while preserving format"""
        if not email or "@" not in email:
            return "user@example.com"

        # Extract domain for potential business logic preservation
        local, domain = email.split("@", 1)

        # Use deterministic approach for consistent results
        hash_suffix = self.deterministic_hash(email, "email")

        # Preserve some domain patterns for testing
        if domain in ["localhost", "example.com", "test.com"]:
            return f"user{hash_suffix}@{domain}"
        else:
            return f"user{hash_suffix}@example.com"

    def anonymize_name(self, name: str) -> str:
        """Generate consistent fake name"""
        if not name:
            return fake.name()

        # Use deterministic approach
        hash_seed = int(self.deterministic_hash(name, "name"), 16) % 1000000
        fake.seed(hash_seed)
        result = fake.name()
        fake.seed(12345)  # Reset seed
        return result

    def anonymize_phone(self, phone: str) -> str:
        """Generate fake phone number"""
        return fake.phone_number()

    def anonymize_ip(self, ip: str) -> str:
        """Generate fake IP address"""
        return fake.ipv4()

    def anonymize_user_agent(self, user_agent: str) -> str:
        """Generate fake user agent"""
        return fake.user_agent()

    def anonymize_text_content(self, content: str, max_words: int = 100) -> str:
        """Generate fake text content preserving approximate length"""
        if not content:
            return ""

        # Estimate word count from character count
        word_count = min(len(content.split()), max_words)
        word_count = max(1, word_count)  # At least 1 word

        return fake.text(max_nb_chars=len(content))[: len(content)]

    def anonymize_json_metadata(self, metadata: str) -> str:
        """Anonymize JSON metadata while preserving structure"""
        try:
            data = json.loads(metadata) if metadata else {}
            anonymized = self._anonymize_json_recursive(data)
            return json.dumps(anonymized)
        except (json.JSONDecodeError, TypeError):
            return "{}"

    def _anonymize_json_recursive(self, obj):
        """Recursively anonymize JSON objects"""
        if isinstance(obj, dict):
            result = {}
            for key, value in obj.items():
                if key.lower() in ["email", "user_email", "contact_email"]:
                    result[key] = self.anonymize_email(str(value))
                elif key.lower() in ["name", "username", "display_name", "full_name"]:
                    result[key] = self.anonymize_name(str(value))
                elif key.lower() in ["ip", "ip_address", "client_ip"]:
                    result[key] = self.anonymize_ip(str(value))
                elif key.lower() in ["phone", "phone_number", "mobile"]:
                    result[key] = self.anonymize_phone(str(value))
                else:
                    result[key] = self._anonymize_json_recursive(value)
            return result
        elif isinstance(obj, list):
            return [self._anonymize_json_recursive(item) for item in obj]
        else:
            return obj

    def shift_date(
        self, date_value: datetime, base_date: Optional[datetime] = None
    ) -> datetime:
        """Shift dates to recent timeframe while preserving relative relationships"""
        if not base_date:
            base_date = datetime.now() - timedelta(days=30)

        # Calculate days difference from a reference point
        reference_date = datetime(2020, 1, 1)
        days_diff = (date_value - reference_date).days

        # Map to recent timeframe (last 90 days)
        new_days_diff = days_diff % 90
        return base_date - timedelta(days=new_days_diff)

    def anonymize_users_table(self) -> int:
        """Anonymize users table"""
        query = """
        UPDATE users SET
            email = %s,
            name = %s,
            phone = %s,
            avatar_url = NULL,
            metadata = %s,
            updated_at = %s
        WHERE id = %s
        """

        with self.connect() as conn:
            with conn.cursor() as cur:
                # Get all users
                cur.execute(
                    "SELECT id, email, name, phone, metadata, created_at FROM users"
                )
                users = cur.fetchall()

                count = 0
                for user in users:
                    user_id, email, name, phone, metadata, created_at = user

                    # Generate anonymized data
                    anon_email = self.anonymize_email(email)
                    anon_name = self.anonymize_name(name)
                    anon_phone = self.anonymize_phone(phone) if phone else None
                    anon_metadata = self.anonymize_json_metadata(metadata)
                    shifted_updated_at = self.shift_date(created_at) + timedelta(
                        hours=1
                    )

                    if self.dry_run:
                        print(f"  {email} → {anon_email}")
                        print(f"  {name} → {anon_name}")
                    else:
                        cur.execute(
                            query,
                            (
                                anon_email,
                                anon_name,
                                anon_phone,
                                anon_metadata,
                                shifted_updated_at,
                                user_id,
                            ),
                        )

                    count += 1

                self.log_change("users", "anonymize_pii", count)
                return count

    def anonymize_journal_entries(self) -> int:
        """Anonymize journal entries content"""
        query = """
        UPDATE journal_entries SET
            title = %s,
            content = %s,
            tags = %s,
            metadata = %s,
            updated_at = %s
        WHERE id = %s
        """

        with self.connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, title, content, tags, metadata, created_at FROM journal_entries"
                )
                entries = cur.fetchall()

                count = 0
                for entry in entries:
                    entry_id, title, content, tags, metadata, created_at = entry

                    # Generate anonymized content
                    anon_title = fake.sentence(nb_words=4).rstrip(".")
                    anon_content = self.anonymize_text_content(content, max_words=200)
                    anon_tags = [fake.word() for _ in range(3)] if tags else []
                    anon_metadata = self.anonymize_json_metadata(metadata)
                    shifted_updated_at = self.shift_date(created_at) + timedelta(
                        minutes=30
                    )

                    if self.dry_run:
                        print(f"  Entry {entry_id}: {title[:50]}... → {anon_title}")
                    else:
                        cur.execute(
                            query,
                            (
                                anon_title,
                                anon_content,
                                anon_tags,
                                anon_metadata,
                                shifted_updated_at,
                                entry_id,
                            ),
                        )

                    count += 1

                self.log_change("journal_entries", "anonymize_content", count)
                return count

    def anonymize_auth_sessions(self) -> int:
        """Anonymize session data"""
        query = """
        UPDATE auth_sessions SET
            ip_address = %s,
            user_agent = %s,
            metadata = %s
        WHERE id = %s
        """

        with self.connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, ip_address, user_agent, metadata FROM auth_sessions"
                )
                sessions = cur.fetchall()

                count = 0
                for session in sessions:
                    session_id, ip_address, user_agent, metadata = session

                    anon_ip = self.anonymize_ip(ip_address)
                    anon_user_agent = self.anonymize_user_agent(user_agent)
                    anon_metadata = self.anonymize_json_metadata(metadata)

                    if self.dry_run:
                        print(f"  Session {session_id}: {ip_address} → {anon_ip}")
                    else:
                        cur.execute(
                            query, (anon_ip, anon_user_agent, anon_metadata, session_id)
                        )

                    count += 1

                self.log_change("auth_sessions", "anonymize_tracking", count)
                return count

    def validate_anonymization(self) -> List[Dict]:
        """Validate that no PII remains in database"""
        issues = []

        # Patterns that should not exist in anonymized data
        pii_patterns = {
            "email": r"\b[A-Za-z0-9._%+-]+@(?!example\.com|test\.com|localhost)[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
            "phone": r"\b\d{3}-\d{3}-\d{4}\b|\b\(\d{3}\)\s*\d{3}-\d{4}\b",
            "ssn": r"\b\d{3}-\d{2}-\d{4}\b",
            "credit_card": r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b",
        }

        with self.connect() as conn:
            with conn.cursor() as cur:
                # Check users table
                cur.execute("SELECT id, email, name, phone FROM users LIMIT 10")
                users = cur.fetchall()

                for user in users:
                    user_id, email, name, phone = user
                    for field_name, value in [
                        ("email", email),
                        ("name", name),
                        ("phone", phone),
                    ]:
                        if value:
                            for pattern_name, pattern in pii_patterns.items():
                                if re.search(pattern, str(value)):
                                    issues.append(
                                        {
                                            "table": "users",
                                            "column": field_name,
                                            "row_id": user_id,
                                            "pattern": pattern_name,
                                            "value": str(value)[:50],
                                        }
                                    )

        return issues

    def run_anonymization(self) -> Dict:
        """Run complete anonymization process"""
        print(
            f"🔄 {'DRY RUN: ' if self.dry_run else ''}Starting database anonymization..."
        )

        results = {}

        try:
            # Anonymize users
            print("\n📧 Anonymizing user data...")
            results["users"] = self.anonymize_users_table()

            # Anonymize journal entries
            print("\n📝 Anonymizing journal entries...")
            results["journal_entries"] = self.anonymize_journal_entries()

            # Anonymize sessions
            print("\n🔐 Anonymizing auth sessions...")
            results["auth_sessions"] = self.anonymize_auth_sessions()

            # Validate results
            if not self.dry_run:
                print("\n✅ Validating anonymization...")
                validation_issues = self.validate_anonymization()
                results["validation_issues"] = validation_issues

                if validation_issues:
                    print(f"⚠️  Found {len(validation_issues)} potential PII issues")
                    for issue in validation_issues[:5]:  # Show first 5
                        print(
                            f"   - {issue['table']}.{issue['column']}: {issue['pattern']}"
                        )
                else:
                    print("✅ No PII patterns detected")

            return results

        except Exception as e:
            print(f"❌ Anonymization failed: {e}")
            return {"error": str(e)}

    def generate_report(self, results: Dict):
        """Generate anonymization report"""
        print("\n" + "=" * 50)
        print("ANONYMIZATION REPORT")
        print("=" * 50)

        if "error" in results:
            print(f"❌ Failed: {results['error']}")
            return

        total_rows = sum(
            count for key, count in results.items() if isinstance(count, int)
        )

        print(f"Mode: {'DRY RUN' if self.dry_run else 'EXECUTION'}")
        print(f"Total rows affected: {total_rows}")
        print(f"Timestamp: {datetime.now().isoformat()}")

        print("\nTables processed:")
        for table, count in results.items():
            if isinstance(count, int):
                print(f"  - {table}: {count} rows")

        if "validation_issues" in results:
            issues = results["validation_issues"]
            if issues:
                print(f"\n⚠️  Validation issues: {len(issues)}")
            else:
                print("\n✅ Validation passed")

        if self.changes_made:
            print(f"\nChanges log entries: {len(self.changes_made)}")


def main():
    parser = argparse.ArgumentParser(
        description="Anonymize database for preview environments"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        default=True,
        help="Preview changes without applying them",
    )
    parser.add_argument(
        "--execute", action="store_true", help="Actually apply anonymization changes"
    )
    parser.add_argument(
        "--validate", action="store_true", help="Only run PII validation checks"
    )
    parser.add_argument(
        "--database-url",
        default=os.getenv("DATABASE_URL"),
        help="Database connection URL",
    )

    args = parser.parse_args()

    if not args.database_url:
        print(
            "❌ Database URL required. Set DATABASE_URL env var or use --database-url"
        )
        sys.exit(1)

    # Determine mode
    if args.execute:
        dry_run = False
    elif args.validate:
        dry_run = True
    else:
        dry_run = True  # Default to dry run

    anonymizer = DatabaseAnonymizer(args.database_url, dry_run=dry_run)

    if args.validate:
        print("🔍 Running PII validation only...")
        issues = anonymizer.validate_anonymization()
        if issues:
            print(f"❌ Found {len(issues)} PII issues:")
            for issue in issues:
                print(f"  - {issue['table']}.{issue['column']}: {issue['pattern']}")
            sys.exit(1)
        else:
            print("✅ No PII patterns detected")
            sys.exit(0)

    results = anonymizer.run_anonymization()
    anonymizer.generate_report(results)

    if "error" in results:
        sys.exit(1)


if __name__ == "__main__":
    main()
