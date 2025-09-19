#!/usr/bin/env python3
"""
Anonymization script for Journal documentation.
Removes or replaces sensitive information from documentation.
"""

import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))


class DocumentAnonymizer:
    """Anonymizes sensitive information in documentation."""

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.docs_dir = project_root / "docs"

        # Patterns for sensitive information
        self.patterns = {
            # API Keys and Tokens
            "api_key": r'(?i)(api[_-]?key|apikey|api_token)[\s:=]+[\'"]?([a-zA-Z0-9_\-]{20,})[\'"]?',
            "bearer_token": r"(?i)bearer\s+([a-zA-Z0-9_\-\.]{20,})",
            "auth_token": r'(?i)(auth[_-]?token|access[_-]?token)[\s:=]+[\'"]?([a-zA-Z0-9_\-\.]{20,})[\'"]?',
            # JWT Tokens
            "jwt": r"eyJ[a-zA-Z0-9_\-]+\.eyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+",
            # Database URLs
            "postgres_url": r"postgres(?:ql)?://[^:]+:([^@]+)@[^/]+/[^\s]+",
            "mongodb_url": r"mongodb(?:\+srv)?://[^:]+:([^@]+)@[^/]+/[^\s]+",
            "redis_url": r"redis://(?::[^@]+@)?[^/]+(?:/\d+)?",
            # AWS
            "aws_access_key": r"(?i)AWS[A-Z0-9]{16,}",
            "aws_secret": r'(?i)aws[_-]?secret[_-]?access[_-]?key[\s:=]+[\'"]?([a-zA-Z0-9/+=]{40})[\'"]?',
            # SSH Keys
            "ssh_private": r"-----BEGIN (?:RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]+?-----END (?:RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----",
            # Email addresses (be careful not to remove documentation emails)
            "email": r"\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b",
            # IP Addresses
            "ipv4": r"\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b",
            "ipv6": r"(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}",
            # Credit Card Numbers
            "credit_card": r"\b(?:\d[ -]*?){13,19}\b",
            # Social Security Numbers
            "ssn": r"\b\d{3}-\d{2}-\d{4}\b",
            # Generic Secrets
            "secret": r'(?i)(secret|password|passwd|pwd)[\s:=]+[\'"]?([^\s\'"]+)[\'"]?',
            "private_key": r'(?i)(private[_-]?key)[\s:=]+[\'"]?([a-zA-Z0-9_\-]+)[\'"]?',
            # Environment Variables with values
            "env_var": r"^([A-Z_]+)=([^\n]+)$",
            # Infisical/Vault paths
            "infisical_path": r"(?i)/auth/[^\s]+",
        }

        # Whitelist patterns (don't anonymize these)
        self.whitelist = [
            r"example\.com",
            r"localhost",
            r"127\.0\.0\.1",
            r"0\.0\.0\.0",
            r"placeholder",
            r"your[_-]?api[_-]?key",
            r"<[^>]+>",  # Template variables
            r"\$\{[^}]+\}",  # Template variables
            r"XXX+",
            r"abc123",
            r"test@example\.com",
            r"user@domain\.com",
        ]

        # Replacement mappings
        self.replacements = {
            "api_key": "API_KEY_REDACTED",
            "bearer_token": "Bearer TOKEN_REDACTED",
            "auth_token": "AUTH_TOKEN_REDACTED",
            "jwt": "JWT_TOKEN_REDACTED",
            "postgres_url": "postgresql://user:REDACTED@host/database",
            "mongodb_url": "mongodb://user:REDACTED@host/database",
            "redis_url": "redis://REDACTED@host:6379",
            "aws_access_key": "AWS_ACCESS_KEY_REDACTED",
            "aws_secret": "AWS_SECRET_REDACTED",
            "ssh_private": "-----BEGIN PRIVATE KEY-----\nREDACTED\n-----END PRIVATE KEY-----",
            "email": "user@REDACTED.com",
            "ipv4": "XXX.XXX.XXX.XXX",
            "ipv6": "XXXX:XXXX:XXXX:XXXX:XXXX:XXXX:XXXX:XXXX",
            "credit_card": "XXXX-XXXX-XXXX-XXXX",
            "ssn": "XXX-XX-XXXX",
            "secret": "SECRET_REDACTED",
            "private_key": "PRIVATE_KEY_REDACTED",
            "infisical_path": "/auth/REDACTED",
        }

    def anonymize_file(
        self, file_path: Path, dry_run: bool = True
    ) -> Tuple[str, List[Dict]]:
        """Anonymize a single file."""
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        findings = []
        anonymized = content

        # Check each pattern
        for pattern_name, pattern in self.patterns.items():
            matches = list(re.finditer(pattern, content, re.MULTILINE))

            for match in matches:
                # Check if whitelisted
                if self._is_whitelisted(match.group(0)):
                    continue

                # Record finding
                line_num = content[: match.start()].count("\n") + 1
                findings.append(
                    {
                        "type": pattern_name,
                        "line": line_num,
                        "match": self._mask_sensitive(match.group(0)),
                        "position": match.start(),
                    }
                )

                # Replace in content
                replacement = self.replacements.get(pattern_name, "REDACTED")
                if pattern_name in ["secret", "env_var"]:
                    # Keep the key, replace the value
                    if match.lastindex and match.lastindex > 1:
                        key = match.group(1)
                        anonymized = (
                            anonymized[: match.start()]
                            + f"{key}={replacement}"
                            + anonymized[match.end() :]
                        )
                else:
                    anonymized = (
                        anonymized[: match.start()]
                        + replacement
                        + anonymized[match.end() :]
                    )

        # Sort findings by position (reverse order for replacement)
        findings.sort(key=lambda x: x["position"], reverse=True)

        # Apply replacements
        for finding in findings:
            # Already replaced above
            pass

        return anonymized, findings

    def _is_whitelisted(self, text: str) -> bool:
        """Check if text matches whitelist patterns."""
        for pattern in self.whitelist:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        return False

    def _mask_sensitive(self, text: str) -> str:
        """Mask sensitive parts of text for reporting."""
        if len(text) > 20:
            return text[:10] + "..." + text[-5:]
        elif len(text) > 10:
            return text[:5] + "..." + text[-3:]
        else:
            return "***"

    def scan_directory(
        self, directory: Path = None, file_pattern: str = "*.md"
    ) -> Dict[str, List[Dict]]:
        """Scan directory for sensitive information."""
        if directory is None:
            directory = self.docs_dir

        all_findings = {}

        for file_path in directory.rglob(file_pattern):
            # Skip generated files
            if "_generated" in str(file_path) or ".git" in str(file_path):
                continue

            _, findings = self.anonymize_file(file_path)
            if findings:
                all_findings[str(file_path.relative_to(self.project_root))] = findings

        return all_findings

    def anonymize_directory(
        self, directory: Path = None, output_dir: Path = None, dry_run: bool = True
    ):
        """Anonymize all files in directory."""
        if directory is None:
            directory = self.docs_dir

        if output_dir is None:
            output_dir = self.docs_dir / "_generated" / "anonymized"

        if not dry_run:
            output_dir.mkdir(parents=True, exist_ok=True)

        results = {"anonymized_files": [], "total_findings": 0, "findings_by_type": {}}

        for file_path in directory.rglob("*.md"):
            # Skip generated files
            if "_generated" in str(file_path):
                continue

            anonymized_content, findings = self.anonymize_file(file_path)

            if findings:
                relative_path = file_path.relative_to(directory)

                if dry_run:
                    print(
                        f"  Would anonymize: {relative_path} ({len(findings)} findings)"
                    )
                else:
                    # Save anonymized version
                    output_path = output_dir / relative_path
                    output_path.parent.mkdir(parents=True, exist_ok=True)

                    with open(output_path, "w", encoding="utf-8") as f:
                        f.write(anonymized_content)

                    print(
                        f"  Anonymized: {relative_path} -> {output_path.relative_to(self.project_root)}"
                    )

                results["anonymized_files"].append(str(relative_path))
                results["total_findings"] += len(findings)

                # Count by type
                for finding in findings:
                    finding_type = finding["type"]
                    if finding_type not in results["findings_by_type"]:
                        results["findings_by_type"][finding_type] = 0
                    results["findings_by_type"][finding_type] += 1

        return results

    def check_env_files(self) -> Dict[str, List]:
        """Check .env files for proper schema usage."""
        findings = {}

        # Check for .env files
        for env_file in self.project_root.glob("**/.env*"):
            if ".env.schema" in str(env_file) or ".env.example" in str(env_file):
                continue  # These are safe

            if ".git" in str(env_file.parts):
                continue

            # Check if it contains real values
            try:
                with open(env_file, "r") as f:
                    content = f.read()

                real_values = []
                for line in content.split("\n"):
                    if "=" in line and not line.startswith("#"):
                        key, value = line.split("=", 1)
                        if value and not self._is_whitelisted(value):
                            real_values.append(key)

                if real_values:
                    findings[str(env_file.relative_to(self.project_root))] = real_values

            except Exception:
                pass

        return findings


def main():
    """Main function."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Anonymize sensitive information in documentation"
    )
    parser.add_argument(
        "--scan",
        action="store_true",
        help="Scan for sensitive information without anonymizing",
    )
    parser.add_argument(
        "--anonymize", action="store_true", help="Anonymize files (dry run by default)"
    )
    parser.add_argument(
        "--execute", action="store_true", help="Execute anonymization (not dry run)"
    )
    parser.add_argument(
        "--check-env", action="store_true", help="Check .env files for real values"
    )
    parser.add_argument(
        "--output-dir", type=Path, help="Output directory for anonymized files"
    )

    args = parser.parse_args()

    project_root = Path(__file__).parent.parent
    anonymizer = DocumentAnonymizer(project_root)

    if args.scan:
        print("Scanning for sensitive information...")
        findings = anonymizer.scan_directory()

        if findings:
            print(f"\n⚠️ Found sensitive information in {len(findings)} files:")
            for file_path, file_findings in findings.items():
                print(f"\n  {file_path}:")
                for finding in file_findings[:3]:  # Show first 3
                    print(
                        f"    Line {finding['line']}: {finding['type']} - {finding['match']}"
                    )
                if len(file_findings) > 3:
                    print(f"    ... and {len(file_findings) - 3} more")
        else:
            print("\n✅ No sensitive information found!")

    elif args.anonymize:
        dry_run = not args.execute
        print(f"{'DRY RUN: ' if dry_run else ''}Anonymizing documentation...")

        results = anonymizer.anonymize_directory(
            output_dir=args.output_dir, dry_run=dry_run
        )

        print(
            f"\n{'Would anonymize' if dry_run else 'Anonymized'} {len(results['anonymized_files'])} files"
        )
        print(f"Total findings: {results['total_findings']}")

        if results["findings_by_type"]:
            print("\nFindings by type:")
            for finding_type, count in sorted(results["findings_by_type"].items()):
                print(f"  {finding_type}: {count}")

        if dry_run:
            print("\nTo execute anonymization, run with --execute flag")

    elif args.check_env:
        print("Checking .env files...")
        findings = anonymizer.check_env_files()

        if findings:
            print("\n⚠️ Found .env files with real values:")
            for file_path, keys in findings.items():
                print(f"  {file_path}:")
                for key in keys[:5]:
                    print(f"    - {key}")
                if len(keys) > 5:
                    print(f"    ... and {len(keys) - 5} more")
            print("\n💡 Use .env.schema or .env.example for documentation")
        else:
            print("\n✅ No .env files with real values found!")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
