#!/usr/bin/env python3
"""
Fix content accuracy issues in documentation.
"""

import re
from pathlib import Path


class ContentFixer:
    def __init__(self):
        self.fixes_applied = 0
        self.files_fixed = 0

    def fix_file(self, file_path: Path) -> int:
        """Fix content issues in a single file."""
        changes = 0

        try:
            content = file_path.read_text()
            original = content

            # Fix deprecated linting/formatting tools
            content = re.sub(r"\bprettier\b", "Biome", content)
            content = re.sub(r"\bPrettier\b", "Biome", content)
            content = re.sub(r"\beslint\b", "Biome", content)
            content = re.sub(r"\bESLint\b", "Biome", content)
            content = re.sub(r"\bblack\b(?!\s*list|\s*box)", "Ruff", content)
            content = re.sub(r"\bBlack\b(?!\s*list|\s*box)", "Ruff", content)
            content = re.sub(r"\bisort\b", "Ruff", content)
            content = re.sub(r"\bflake8\b", "Ruff", content)
            content = re.sub(r"\bFlake8\b", "Ruff", content)
            content = re.sub(r"\bpylint\b", "Ruff", content)
            content = re.sub(r"\bPylint\b", "Ruff", content)

            # Fix incorrect ports
            content = re.sub(r"localhost:3000", "localhost:5000", content)
            content = re.sub(r"localhost:8000", "localhost:5000", content)
            content = re.sub(r"PORT=3000", "PORT=5000", content)
            content = re.sub(r"PORT=8000", "PORT=5000", content)

            # Fix database references (SQLite -> PostgreSQL)
            # Be careful not to break migration docs
            if "migration" not in str(file_path).lower():
                content = re.sub(r"\bsqlite:///", "postgresql://", content)
                content = re.sub(r"\bSQLite\b", "PostgreSQL", content)
                content = re.sub(r"\.db\b", "", content)  # Remove .db extensions

            # Fix API versioning (remove version from paths)
            content = re.sub(r"/api/v[0-9]+/", "/api/", content)

            # Fix package managers already done in previous script
            # Fix example.com references
            content = re.sub(r"example\.com", "journal.local", content)
            content = re.sub(r"your-domain\.com", "journal.local", content)

            # Fix placeholder names (but preserve in code examples)
            if "example" not in str(file_path).lower():
                # Only fix obvious placeholders not in code blocks
                content = re.sub(r"\bfoo\b(?![\w\.])", "entry", content)
                content = re.sub(r"\bbar\b(?![\w\.])", "tag", content)
                content = re.sub(r"\bbaz\b(?![\w\.])", "user", content)

            # Update old version references
            content = re.sub(r"python\s*3\.[0-7]\b", "Python 3.13", content)
            content = re.sub(r"node\s*1[0-5]\b", "Node 20", content)
            content = re.sub(r"react\s*1[0-7]\b", "React 18", content)

            # Write back if changed
            if content != original:
                file_path.write_text(content)
                changes = len(
                    [
                        1
                        for a, b in zip(original.split("\n"), content.split("\n"))
                        if a != b
                    ]
                )
                self.fixes_applied += changes
                self.files_fixed += 1
                print(f"  Fixed {changes} lines in {file_path}")

            return changes
        except Exception as e:
            print(f"  Error fixing {file_path}: {e}")
            return 0

    def archive_outdated_docs(self):
        """Move outdated docs to archive folder."""
        archive_dir = Path("docs/archive")
        archive_dir.mkdir(exist_ok=True)

        outdated_patterns = [
            "REACT-19-MIGRATION*.md",
            "USER_MANAGEMENT_ORCHESTRATEV*.md",  # Keep the main one
        ]

        for pattern in outdated_patterns:
            for file in Path("docs").rglob(pattern):
                if "archive" not in str(file):
                    dest = archive_dir / file.name
                    print(f"  Archiving {file} -> {dest}")
                    file.rename(dest)

    def consolidate_duplicates(self):
        """Consolidate duplicate documentation."""
        # Find USER_MANAGEMENT versions
        um_files = list(
            Path("docs/features/user-management").glob(
                "USER_MANAGEMENT_ORCHESTRATEV*.md"
            )
        )

        if len(um_files) > 1:
            # Keep the latest version (highest number)
            um_files.sort(key=lambda x: int(re.search(r"V(\d+)", str(x)).group(1)))
            latest = um_files[-1]

            # Create consolidated file
            consolidated_path = Path(
                "docs/features/user-management/USER_MANAGEMENT_ORCHESTRATION.md"
            )
            content = """---
id: user-management-orchestration
title: User Management Orchestration
type: guide
created: 2025-09-17
updated: 2025-09-17
author: Journal Team
tags: ['user-management', 'orchestration', 'consolidated']
priority: 1
status: current
visibility: public
schema_version: v1
---

# User Management Orchestration

This document consolidates the user management orchestration workflow.

## Note
This document was consolidated from multiple versions (V1-V9).
The archived versions can be found in `/docs/archive/`.

"""
            # Append content from latest version
            content += latest.read_text().split("---", 2)[-1]  # Skip frontmatter

            consolidated_path.write_text(content)
            print(f"  Created consolidated file: {consolidated_path}")

            # Archive all versions
            archive_dir = Path("docs/archive")
            archive_dir.mkdir(exist_ok=True)
            for file in um_files:
                dest = archive_dir / file.name
                file.rename(dest)
                print(f"  Archived {file.name}")


def main():
    """Main function."""
    fixer = ContentFixer()
    docs_dir = Path("docs")

    print("=== Fixing Documentation Content Accuracy ===\n")

    # Fix content issues
    print("Fixing deprecated tool references and incorrect information...")
    for md_file in docs_dir.rglob("*.md"):
        if "_generated" in str(md_file) or "archive" in str(md_file):
            continue
        fixer.fix_file(md_file)

    # Archive outdated docs
    print("\nArchiving outdated migration documents...")
    fixer.archive_outdated_docs()

    # Consolidate duplicates
    print("\nConsolidating duplicate documentation...")
    fixer.consolidate_duplicates()

    print("\n=== Summary ===")
    print(f"Files fixed: {fixer.files_fixed}")
    print(f"Total fixes applied: {fixer.fixes_applied}")


if __name__ == "__main__":
    main()
