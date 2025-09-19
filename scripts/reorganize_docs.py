#!/usr/bin/env python3
"""
Documentation directory reorganization script for Journal application.
Reorganizes docs into the new hierarchical structure while preserving links.
"""

import shutil
import sys
from pathlib import Path
import re
import json

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))


class DocumentationReorganizer:
    """Reorganizes documentation into new hierarchical structure."""

    def __init__(self, project_root: Path, dry_run: bool = True):
        self.project_root = project_root
        self.docs_dir = project_root / "docs"
        self.dry_run = dry_run
        self.moves = []
        self.link_updates = []

    def reorganize(self):
        """Perform documentation reorganization."""
        print(f"{'DRY RUN: ' if self.dry_run else ''}Reorganizing documentation...")

        # Create target directory structure
        self._create_directory_structure()

        # Plan file moves based on content type
        self._plan_file_moves()

        # Execute moves (or print plan)
        self._execute_moves()

        # Update internal links
        self._update_links()

        # Generate index files
        self._generate_indexes()

        # Create redirects file
        self._create_redirects()

        print(
            f"\n{'Would reorganize' if self.dry_run else 'Reorganized'} {len(self.moves)} files"
        )

    def _create_directory_structure(self):
        """Create the new directory hierarchy."""
        directories = [
            "architecture",
            "architecture/components",
            "architecture/integrations",
            "architecture/security",
            "api",
            "api/v1",
            "api/v1/auth",
            "api/v1/entries",
            "api/v1/admin",
            "api/schemas",
            "guides",
            "guides/getting-started",
            "guides/development",
            "guides/deployment",
            "guides/troubleshooting",
            "reference",
            "reference/configuration",
            "reference/database",
            "reference/cli",
            "reference/errors",
            "decisions",
            "deployment",
            "deployment/environments",
            "deployment/ci-cd",
            "deployment/monitoring",
            "testing",
            "testing/strategies",
            "testing/coverage",
            "testing/data",
            "_generated",
            "_generated/changelog",
            "_generated/coverage",
            "_generated/metrics",
            "_generated/reports",
        ]

        for dir_path in directories:
            full_path = self.docs_dir / dir_path
            if not full_path.exists():
                if self.dry_run:
                    print(f"  Would create: {dir_path}/")
                else:
                    full_path.mkdir(parents=True, exist_ok=True)
                    print(f"  Created: {dir_path}/")

    def _plan_file_moves(self):
        """Plan file moves based on content analysis."""
        # Mapping rules for reorganization
        move_rules = {
            # Architecture files
            r"INFISICAL_ARCHITECTURE\.md": "architecture/infisical.md",
            r"ADVANCED_AUTH\.md": "architecture/security/advanced-auth.md",
            r"DEPLOYMENT_AWARE_AUTH\.md": "architecture/security/deployment-aware-auth.md",
            r"architecture.*overview": "architecture/overview.md",
            r"editor.*architecture": "architecture/components/editor.md",
            # API documentation
            r"api.*contract.*guide": "api/contract-guide.md",
            r"api.*reference": "api/reference.md",
            r"guides/api.*": "api/",
            # Deployment files
            r"CI_.*\.md": "deployment/ci-cd/",
            r"ci-cd\.md": "deployment/ci-cd/pipeline.md",
            r"deployment.*": "deployment/",
            r"hosting.*secure": "deployment/environments/hosting-secure.md",
            r"dev-setup\.md": "deployment/environments/development.md",
            # Guides
            r"guides/getting-started": "guides/getting-started/",
            r"guides/authentication": "guides/development/authentication.md",
            r"guides/codemirror": "guides/development/codemirror-integration.md",
            r"guides/documentation.*": "guides/development/documentation/",
            r"guides/.*": "guides/",
            # Testing
            r"testing.*": "testing/",
            r"vitest.*": "testing/strategies/vitest.md",
            # Decisions (ADRs)
            r"adr/.*": "decisions/",
            # Reference
            r"error.*handling": "reference/errors/handling.md",
            r"configuration.*": "reference/configuration/",
            # Implementation phases (move to _generated/archive)
            r"implementation/\d+-phase-.*": "_generated/archive/phases/",
            r"status/.*": "_generated/archive/status/",
            # Editor upgrade docs
            r"editor-upgrade/.*": "guides/development/editor-upgrade/",
            # Documentation meta
            r"DOCUMENTATION_.*\.md": ".",  # Keep at root
            r"doc-upgrade\.md": ".",  # Keep at root
            r"README\.md": ".",  # Keep README at root
        }

        # Scan all markdown files
        for md_file in self.docs_dir.rglob("*.md"):
            if "_generated" in str(md_file):
                continue  # Skip already generated files

            relative_path = md_file.relative_to(self.docs_dir)
            target_path = None

            # Apply move rules
            for pattern, target in move_rules.items():
                if re.search(pattern, str(relative_path), re.IGNORECASE):
                    if target.endswith("/"):
                        # Move to directory, keep filename
                        target_path = Path(target) / md_file.name
                    elif target == ".":
                        # Keep at current location
                        target_path = relative_path
                    else:
                        # Specific target file
                        target_path = Path(target)
                    break

            # Default categorization if no rule matched
            if not target_path:
                target_path = self._categorize_by_content(md_file, relative_path)

            if target_path != relative_path:
                self.moves.append((relative_path, target_path))

    def _categorize_by_content(self, file_path: Path, relative_path: Path) -> Path:
        """Categorize file based on content analysis."""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read().lower()

            # Analyze content for categorization
            if "api" in content and ("endpoint" in content or "route" in content):
                return Path("api") / file_path.name
            elif "architecture" in content or "design" in content:
                return Path("architecture") / file_path.name
            elif "deploy" in content or "vercel" in content or "supabase" in content:
                return Path("deployment") / file_path.name
            elif "test" in content and ("pytest" in content or "vitest" in content):
                return Path("testing") / file_path.name
            elif "guide" in str(relative_path) or "tutorial" in content:
                return Path("guides") / file_path.name
            else:
                return Path("reference") / file_path.name

        except Exception:
            # If can't read, default to reference
            return Path("reference") / file_path.name

    def _execute_moves(self):
        """Execute the planned file moves."""
        for src, dst in self.moves:
            src_path = self.docs_dir / src
            dst_path = self.docs_dir / dst

            if self.dry_run:
                print(f"  Would move: {src} -> {dst}")
            else:
                # Create destination directory if needed
                dst_path.parent.mkdir(parents=True, exist_ok=True)

                # Move file
                shutil.move(str(src_path), str(dst_path))
                print(f"  Moved: {src} -> {dst}")

                # Track for link updates
                self.link_updates.append((src, dst))

    def _update_links(self):
        """Update internal links in all markdown files."""
        if self.dry_run:
            print("\nWould update links in markdown files...")
            return

        print("\nUpdating internal links...")

        # Build link mapping from moves
        link_map = {}
        for src, dst in self.link_updates:
            # Handle various link formats
            src_variations = [str(src), f"./{src}", f"../{src}", f"/{src}", src.name]
            for variant in src_variations:
                link_map[variant] = str(dst)

        # Update links in all markdown files
        for md_file in self.docs_dir.rglob("*.md"):
            updated = False
            with open(md_file, "r", encoding="utf-8") as f:
                content = f.read()

            # Update markdown links
            for old_path, new_path in link_map.items():
                # Match [text](path) pattern
                pattern = rf"\[([^\]]+)\]\({re.escape(old_path)}\)"
                replacement = rf"[\1]({new_path})"
                if re.search(pattern, content):
                    content = re.sub(pattern, replacement, content)
                    updated = True

            if updated:
                with open(md_file, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"  Updated links in: {md_file.relative_to(self.docs_dir)}")

    def _generate_indexes(self):
        """Generate index files for each major directory."""
        index_template = """# {title}

## Overview

This directory contains {description}.

## Contents

{contents}

## Navigation

- [Documentation Home](../README.md)
- [Architecture Overview](../architecture/overview.md)
- [Getting Started](../guides/getting-started/README.md)
"""

        directories = {
            "architecture": {
                "title": "Architecture Documentation",
                "description": "system architecture and design documentation",
            },
            "api": {
                "title": "API Documentation",
                "description": "API endpoint references and schemas",
            },
            "guides": {
                "title": "Guides and Tutorials",
                "description": "how-to guides and tutorials",
            },
            "deployment": {
                "title": "Deployment Documentation",
                "description": "deployment and infrastructure documentation",
            },
            "testing": {
                "title": "Testing Documentation",
                "description": "testing strategies and coverage reports",
            },
            "reference": {
                "title": "Reference Documentation",
                "description": "technical reference materials",
            },
        }

        for dir_name, meta in directories.items():
            dir_path = self.docs_dir / dir_name
            if not dir_path.exists():
                continue

            # List contents
            contents = []
            for item in sorted(dir_path.iterdir()):
                if item.is_dir() and not item.name.startswith("_"):
                    contents.append(f"- [{item.name}/](./{item.name}/)")
                elif item.suffix == ".md" and item.name != "README.md":
                    contents.append(f"- [{item.stem}](./{item.name})")

            if contents:
                index_content = index_template.format(
                    title=meta["title"],
                    description=meta["description"],
                    contents="\n".join(contents)
                    if contents
                    else "*(No documents yet)*",
                )

                index_file = dir_path / "README.md"
                if self.dry_run:
                    print(f"  Would create index: {dir_name}/README.md")
                else:
                    with open(index_file, "w") as f:
                        f.write(index_content)
                    print(f"  Created index: {dir_name}/README.md")

    def _create_redirects(self):
        """Create a redirects mapping file for moved documents."""
        redirects = {
            "moved_files": [
                {"old": str(src), "new": str(dst), "permanent": True}
                for src, dst in self.moves
            ],
            "generated_at": Path(__file__).stat().st_mtime,
        }

        redirects_file = self.docs_dir / "_generated" / "redirects.json"
        if self.dry_run:
            print(f"\nWould create redirects file with {len(self.moves)} entries")
        else:
            redirects_file.parent.mkdir(parents=True, exist_ok=True)
            with open(redirects_file, "w") as f:
                json.dump(redirects, f, indent=2)
            print(
                f"\nCreated redirects file: {redirects_file.relative_to(self.docs_dir)}"
            )


def main():
    """Main function."""
    import argparse

    parser = argparse.ArgumentParser(description="Reorganize documentation structure")
    parser.add_argument(
        "--execute",
        action="store_true",
        help="Execute the reorganization (default is dry run)",
    )
    parser.add_argument(
        "--project-root",
        type=Path,
        default=Path(__file__).parent.parent,
        help="Project root directory",
    )

    args = parser.parse_args()

    reorganizer = DocumentationReorganizer(
        project_root=args.project_root, dry_run=not args.execute
    )

    reorganizer.reorganize()

    if not args.execute:
        print("\n" + "=" * 60)
        print("This was a DRY RUN. No files were moved.")
        print("To execute the reorganization, run with --execute flag:")
        print("  uv run python scripts/reorganize_docs.py --execute")
        print("=" * 60)


if __name__ == "__main__":
    main()
