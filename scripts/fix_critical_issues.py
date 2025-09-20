#!/usr/bin/env python3
"""
Fix critical documentation issues identified in evaluation.
Addresses security, localhost refs, and organizational problems.
"""

from collections import defaultdict
from datetime import datetime
from pathlib import Path
import re
import shutil


class CriticalIssuesFixer:
    def __init__(self, docs_dir: Path = None):
        self.docs_dir = docs_dir or Path("docs")
        self.fixes_applied = defaultdict(list)
        self.stats = defaultdict(int)

    def fix_all(self):
        """Run all critical fixes."""
        print("🔧 Fixing Critical Documentation Issues")
        print("=" * 60)

        # 1. Security - Remove potential secrets
        print("\n📍 Step 1: Fixing security issues...")
        self.fix_security_issues()

        # 2. Fix localhost references
        print("\n📍 Step 2: Fixing localhost references...")
        self.fix_localhost_refs()

        # 3. Consolidate implementation docs
        print("\n📍 Step 3: Consolidating implementation docs...")
        self.consolidate_implementation_docs()

        # 4. Consolidate status docs
        print("\n📍 Step 4: Consolidating status docs...")
        self.consolidate_status_docs()

        # 5. Create navigation structure
        print("\n📍 Step 5: Creating navigation structure...")
        self.create_navigation()

        # Print summary
        self.print_summary()

    def fix_security_issues(self):
        """Replace potential secrets with placeholders."""

        # Patterns that indicate example/placeholder vs real secrets
        safe_patterns = [
            r"YOUR[_-]?API[_-]?KEY",
            r"your[_-]?api[_-]?key",
            r"<[^>]+>",  # Already placeholder
            r"xxx+",
            r"PLACEHOLDER",
            r"EXAMPLE",
            r"SECRET_KEY",  # Django setting name
            r"JWT_SECRET",  # Config name
        ]

        files_fixed = 0

        for md_file in self.docs_dir.rglob("*.md"):
            if any(
                skip in str(md_file) for skip in ["_generated", "archive", ".backups"]
            ):
                continue

            try:
                content = md_file.read_text()
                original_content = content

                # Replace various secret patterns with safe placeholders
                replacements = [
                    # API Keys
                    (
                        r'api[_-]?key\s*[:=]\s*["\']([a-zA-Z0-9]{20,})["\']',
                        r'api_key: "YOUR_API_KEY_HERE"',
                    ),
                    (
                        r'API[_-]?KEY\s*[:=]\s*["\']([a-zA-Z0-9]{20,})["\']',
                        r'API_KEY: "YOUR_API_KEY_HERE"',
                    ),
                    # Secrets
                    (
                        r'secret\s*[:=]\s*["\']([a-zA-Z0-9]{20,})["\']',
                        r'secret: "YOUR_SECRET_HERE"',
                    ),
                    (
                        r'SECRET\s*[:=]\s*["\']([a-zA-Z0-9]{20,})["\']',
                        r'SECRET: "YOUR_SECRET_HERE"',
                    ),
                    # Passwords
                    (
                        r'password\s*[:=]\s*["\']([^"\']+)["\']',
                        r'password: "YOUR_PASSWORD_HERE"',
                    ),
                    (
                        r'PASSWORD\s*[:=]\s*["\']([^"\']+)["\']',
                        r'PASSWORD: "YOUR_PASSWORD_HERE"',
                    ),
                    # Tokens
                    (
                        r'token\s*[:=]\s*["\']([a-zA-Z0-9]{20,})["\']',
                        r'token: "YOUR_TOKEN_HERE"',
                    ),
                    (
                        r'TOKEN\s*[:=]\s*["\']([a-zA-Z0-9]{20,})["\']',
                        r'TOKEN: "YOUR_TOKEN_HERE"',
                    ),
                    # Database URLs with credentials
                    (r"postgresql://[^@]+@", r"postgresql://user:password@"),
                    (r"mysql://[^@]+@", r"mysql://user:password@"),
                    (r"mongodb://[^@]+@", r"mongodb://user:password@"),
                ]

                for pattern, replacement in replacements:
                    # Check if it's already a safe pattern
                    matches = re.finditer(pattern, content, re.IGNORECASE)
                    for match in matches:
                        matched_text = match.group(0)
                        is_safe = any(
                            re.search(safe, matched_text, re.IGNORECASE)
                            for safe in safe_patterns
                        )
                        if not is_safe:
                            content = content.replace(
                                matched_text, re.sub(pattern, replacement, matched_text)
                            )
                            self.stats["secrets_removed"] += 1

                if content != original_content:
                    md_file.write_text(content)
                    self.fixes_applied["security"].append(
                        str(md_file.relative_to(self.docs_dir))
                    )
                    files_fixed += 1

            except Exception as e:
                print(f"   ✗ Error fixing security in {md_file}: {e}")

        print(f"   ✓ Fixed security issues in {files_fixed} files")
        print(f"     - Secrets replaced: {self.stats['secrets_removed']}")

    def fix_localhost_refs(self):
        """Fix localhost references in non-development docs."""

        files_fixed = 0

        for md_file in self.docs_dir.rglob("*.md"):
            if any(
                skip in str(md_file) for skip in ["_generated", "archive", ".backups"]
            ):
                continue

            # Skip files that are clearly development-related
            if any(
                dev in str(md_file).lower()
                for dev in ["development", "dev-", "local-", "setup"]
            ):
                continue

            try:
                content = md_file.read_text()
                original_content = content

                # Replace localhost with proper placeholders
                replacements = [
                    (r"http://localhost:5000", "https://your-domain.com"),
                    (r"http://localhost:3000", "https://your-domain.com"),
                    (r"http://localhost:8000", "https://your-domain.com"),
                    (r"localhost:5000", "your-domain.com"),
                    (r"localhost:3000", "your-domain.com"),
                    (r"localhost:8000", "your-domain.com"),
                    (r"127\.0\.0\.1:5000", "your-domain.com"),
                    (r"127\.0\.0\.1:3000", "your-domain.com"),
                    (r"127\.0\.0\.1:8000", "your-domain.com"),
                ]

                for pattern, replacement in replacements:
                    if re.search(pattern, content):
                        content = re.sub(pattern, replacement, content)
                        self.stats["localhost_fixed"] += 1

                if content != original_content:
                    md_file.write_text(content)
                    self.fixes_applied["localhost"].append(
                        str(md_file.relative_to(self.docs_dir))
                    )
                    files_fixed += 1

            except Exception as e:
                print(f"   ✗ Error fixing localhost in {md_file}: {e}")

        print(f"   ✓ Fixed localhost references in {files_fixed} files")

    def consolidate_implementation_docs(self):
        """Consolidate implementation phase documents."""

        impl_dir = self.docs_dir / "implementation"
        if not impl_dir.exists():
            return

        # Create consolidated implementation guide
        consolidated_path = impl_dir / "IMPLEMENTATION_GUIDE.md"

        # Gather all phase docs
        phase_docs = sorted(impl_dir.glob("*-phase-*.md"))

        if phase_docs:
            content = [
                "---",
                "id: implementation-guide",
                "title: Implementation Guide (Consolidated)",
                "type: guide",
                f"created: {datetime.now().isoformat()}",
                f"updated: {datetime.now().isoformat()}",
                "author: documentation-system",
                "tags: [implementation, guide, phases]",
                "---",
                "",
                "# Implementation Guide",
                "",
                "This document consolidates all implementation phase documentation.",
                "",
                "## Table of Contents",
                "",
            ]

            # Add TOC
            for doc in phase_docs:
                phase_num = re.search(r"phase-(\w+)", doc.name)
                if phase_num:
                    content.append(
                        f"- [Phase {phase_num.group(1).title()}](#{phase_num.group(1)})"
                    )

            content.append("")

            # Add content from each phase
            for doc in phase_docs:
                phase_num = re.search(r"phase-(\w+)", doc.name)
                if phase_num:
                    content.append(f"## Phase {phase_num.group(1).title()}")
                    content.append("")

                    # Get content after frontmatter
                    doc_content = doc.read_text()
                    if "---" in doc_content:
                        parts = doc_content.split("---", 2)
                        if len(parts) >= 3:
                            content.append(parts[2].strip())
                    else:
                        content.append(doc_content)

                    content.append("")
                    content.append("---")
                    content.append("")

            # Write consolidated doc
            consolidated_path.write_text("\n".join(content))
            self.stats["impl_consolidated"] = len(phase_docs)

            # Archive originals
            archive_dir = self.docs_dir / "archive" / "implementation-phases"
            archive_dir.mkdir(parents=True, exist_ok=True)

            for doc in phase_docs:
                shutil.move(str(doc), str(archive_dir / doc.name))

            print(f"   ✓ Consolidated {len(phase_docs)} implementation docs")
            self.fixes_applied["consolidation"].append(
                "implementation/IMPLEMENTATION_GUIDE.md"
            )

    def consolidate_status_docs(self):
        """Consolidate status update documents into changelog."""

        status_dir = self.docs_dir / "status"
        if not status_dir.exists():
            return

        # Create changelog
        changelog_path = status_dir / "CHANGELOG.md"

        # Gather all status docs
        status_docs = sorted(status_dir.glob("*.md"), reverse=True)  # Newest first

        if status_docs:
            content = [
                "---",
                "id: changelog",
                "title: Project Changelog",
                "type: documentation",
                f"created: {datetime.now().isoformat()}",
                f"updated: {datetime.now().isoformat()}",
                "author: documentation-system",
                "tags: [changelog, status, updates]",
                "---",
                "",
                "# Project Changelog",
                "",
                "All project status updates and milestones.",
                "",
                "## Updates",
                "",
            ]

            # Add each status update
            for doc in status_docs:
                if doc.name == "CHANGELOG.md":
                    continue

                # Extract date from filename
                date_match = re.search(r"(\d{4}-\d{2}-\d{2})", doc.name)
                if date_match:
                    content.append(f"### {date_match.group(1)}")

                    # Get content after frontmatter
                    doc_content = doc.read_text()
                    if "---" in doc_content:
                        parts = doc_content.split("---", 2)
                        if len(parts) >= 3:
                            content.append(parts[2].strip())
                    else:
                        content.append(doc_content)

                    content.append("")

            # Write changelog
            changelog_path.write_text("\n".join(content))
            self.stats["status_consolidated"] = len(status_docs) - 1

            # Archive originals
            archive_dir = self.docs_dir / "archive" / "status-updates"
            archive_dir.mkdir(parents=True, exist_ok=True)

            for doc in status_docs:
                if doc.name != "CHANGELOG.md":
                    shutil.move(str(doc), str(archive_dir / doc.name))

            print(
                f"   ✓ Consolidated {len(status_docs) - 1} status docs into changelog"
            )
            self.fixes_applied["consolidation"].append("status/CHANGELOG.md")

    def create_navigation(self):
        """Create README files for major directories."""

        nav_structure = {
            "guides": {
                "title": "Guides",
                "description": "How-to guides and tutorials for the Journal project.",
                "sections": [
                    "Getting Started",
                    "Development",
                    "Deployment",
                    "API Reference",
                ],
            },
            "implementation": {
                "title": "Implementation",
                "description": "Implementation details and phase documentation.",
                "sections": ["Overview", "Architecture", "Phases"],
            },
            "ci-cd": {
                "title": "CI/CD",
                "description": "Continuous integration and deployment documentation.",
                "sections": ["Workflows", "Checks", "Deployment"],
            },
            "development": {
                "title": "Development",
                "description": "Development environment setup and guidelines.",
                "sections": ["Setup", "Backend", "Frontend", "Testing"],
            },
        }

        readmes_created = 0

        for dir_name, config in nav_structure.items():
            dir_path = self.docs_dir / dir_name
            if dir_path.exists():
                readme_path = dir_path / "README.md"
                if not readme_path.exists():
                    # Create README
                    content = [
                        "---",
                        f"id: {dir_name}-readme",
                        f"title: {config['title']} Documentation",
                        "type: documentation",
                        f"created: {datetime.now().isoformat()}",
                        f"updated: {datetime.now().isoformat()}",
                        "author: documentation-system",
                        f"tags: [{dir_name}, navigation, index]",
                        "---",
                        "",
                        f"# {config['title']}",
                        "",
                        config["description"],
                        "",
                        "## Contents",
                        "",
                    ]

                    # List all files in directory
                    files = sorted(dir_path.glob("*.md"))
                    for f in files:
                        if f.name != "README.md":
                            # Read title from frontmatter if available
                            try:
                                file_content = f.read_text()
                                if file_content.startswith("---"):
                                    lines = file_content.split("\n")
                                    for line in lines[1:]:
                                        if line.strip() == "---":
                                            break
                                        if line.startswith("title:"):
                                            title = line.split(":", 1)[1].strip()
                                            content.append(f"- [{title}]({f.name})")
                                            break
                                else:
                                    content.append(f"- [{f.stem}]({f.name})")
                            except:
                                content.append(f"- [{f.stem}]({f.name})")

                    readme_path.write_text("\n".join(content))
                    readmes_created += 1
                    self.fixes_applied["navigation"].append(
                        str(readme_path.relative_to(self.docs_dir))
                    )

        print(f"   ✓ Created {readmes_created} README navigation files")
        self.stats["readmes_created"] = readmes_created

    def print_summary(self):
        """Print summary of fixes."""
        print("\n" + "=" * 60)
        print("📊 Critical Issues Fix Summary")
        print("=" * 60)

        total_files = len({f for files in self.fixes_applied.values() for f in files})
        print(f"\nTotal files modified: {total_files}")

        for category, files in self.fixes_applied.items():
            if files:
                print(f"\n{category.title()}: {len(files)} files")
                for f in files[:3]:
                    print(f"  - {f}")
                if len(files) > 3:
                    print(f"  ... and {len(files) - 3} more")

        if self.stats:
            print("\nDetailed statistics:")
            for key, value in self.stats.items():
                if value > 0:
                    key_formatted = key.replace("_", " ").title()
                    print(f"  • {key_formatted}: {value}")

        print("\n✅ Critical issues addressed!")
        print("Next: Run validation to verify improvements")


def main():
    """Main entry point."""
    print("🚀 Starting Critical Issues Fix")
    print("Addressing security, organization, and navigation issues")
    print()

    fixer = CriticalIssuesFixer()
    fixer.fix_all()

    return 0


if __name__ == "__main__":
    exit(main())
