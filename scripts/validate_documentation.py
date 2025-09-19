#!/usr/bin/env python3
"""
Documentation validation script to verify documentation is in good shape.
Run this anytime to check documentation health.
"""

import re
import yaml
import json
from pathlib import Path
from typing import Dict, Tuple
from collections import defaultdict
import contextlib
import io


class DocumentationValidator:
    def __init__(self, docs_dir: Path = None):
        self.docs_dir = docs_dir or Path("docs")
        self.issues = defaultdict(list)
        self.stats = {}
        self.score = 100  # Start with perfect score
        self._skip_tokens = ["_generated", "archive", ".backups"]
        # Load optional validator config
        self._config = self._load_config()
        self._skip_tokens.extend(self._config.get("skip_tokens", []))
        self._duplicate_whitelist = set(
            self._config.get("duplicate_name_whitelist", [])
        )

    def _load_config(self) -> Dict:
        cfg = self.docs_dir / ".validator_config.yaml"
        if cfg.exists():
            try:
                return yaml.safe_load(cfg.read_text()) or {}
            except Exception:
                return {}
        return {}

    def _skip(self, p: Path) -> bool:
        s = str(p)
        return any(tok in s for tok in self._skip_tokens)

    def validate_all(self) -> Tuple[bool, Dict, Dict]:
        """Run all validation checks."""
        print("🔍 Documentation Validation Starting...\n")

        # Run all checks
        self.check_structure()
        self.check_frontmatter()
        self.check_tool_alignment()
        self.check_broken_links()
        self.check_duplicates()
        self.check_content_quality()
        self.check_outdated_content()

        # Calculate final score
        total_issues = sum(len(v) for v in self.issues.values())
        self.score = max(0, 100 - (total_issues * 2))  # -2 points per issue

        return self.score >= 80, self.stats, dict(self.issues)

    def check_structure(self):
        """Check documentation structure and organization."""
        print("📁 Checking structure...")

        # Count files in different locations (excluding generated, archives, backups)
        all_md_files = [p for p in self.docs_dir.rglob("*.md") if not self._skip(p)]
        root_files = [p for p in self.docs_dir.glob("*.md") if not self._skip(p)]
        organized_files = len(all_md_files) - len(root_files)

        self.stats["total_files"] = len(all_md_files)
        self.stats["root_files"] = len(root_files)
        self.stats["organized_files"] = organized_files

        # Check for loose files in root (should be minimal)
        if len(root_files) > 2:  # Allow README.md and INDEX.md
            for f in root_files:
                if f.name not in ["README.md", "INDEX.md"]:
                    self.issues["structure"].append(
                        f"Loose file in docs root: {f.name}"
                    )

        # Check for empty directories
        for dir_path in self.docs_dir.rglob("*"):
            if dir_path.is_dir():
                if self._skip(dir_path):
                    continue
                if not any(p for p in dir_path.rglob("*.md") if not self._skip(p)):
                    self.issues["structure"].append(
                        f"Empty directory: {dir_path.relative_to(self.docs_dir)}"
                    )

        print(f"  ✓ {organized_files}/{len(all_md_files)} files organized")

    def check_frontmatter(self):
        """Check that all files have valid frontmatter."""
        print("📝 Checking frontmatter...")

        files_with_fm = 0
        files_without_fm = 0
        invalid_fm = 0

        required_fields = ["id", "title", "type", "created", "updated", "author"]

        for md_file in self.docs_dir.rglob("*.md"):
            if self._skip(md_file):
                continue

            try:
                content = md_file.read_text()
                lines = content.split("\n")

                # Check for frontmatter
                if lines and lines[0].strip() == "---":
                    # Find closing ---
                    end_idx = None
                    for i, line in enumerate(lines[1:], 1):
                        if line.strip() == "---":
                            end_idx = i
                            break

                    if end_idx:
                        # Parse frontmatter
                        fm_text = "\n".join(lines[1:end_idx])
                        try:
                            fm = yaml.safe_load(fm_text)
                            files_with_fm += 1

                            # Validate required fields
                            for field in required_fields:
                                if field not in fm:
                                    self.issues["frontmatter"].append(
                                        f"{md_file.relative_to(self.docs_dir)}: Missing field '{field}'"
                                    )
                                    invalid_fm += 1
                                    break
                        except yaml.YAMLError as e:
                            self.issues["frontmatter"].append(
                                f"{md_file.relative_to(self.docs_dir)}: Invalid YAML - {e}"
                            )
                            invalid_fm += 1
                    else:
                        files_without_fm += 1
                        self.issues["frontmatter"].append(
                            f"{md_file.relative_to(self.docs_dir)}: Unclosed frontmatter"
                        )
                else:
                    files_without_fm += 1
                    self.issues["frontmatter"].append(
                        f"{md_file.relative_to(self.docs_dir)}: No frontmatter"
                    )
            except Exception as e:
                self.issues["frontmatter"].append(
                    f"{md_file.relative_to(self.docs_dir)}: Error reading file - {e}"
                )

        self.stats["frontmatter_coverage"] = (
            f"{files_with_fm}/{files_with_fm + files_without_fm}"
        )
        self.stats["invalid_frontmatter"] = invalid_fm

        print(f"  ✓ {files_with_fm} files with valid frontmatter")
        if files_without_fm > 0:
            print(f"  ⚠ {files_without_fm} files missing frontmatter")

    def check_tool_alignment(self):
        """Check for correct tool usage (uv, bun, ruff, biome)."""
        print("🔧 Checking tool alignment...")

        incorrect_tools = 0
        patterns = {
            # Old tools that should not be used
            r"\bnpm install\b": 'Use "bun install" instead of "npm install"',
            r"\bnpm run\b": 'Use "bun run" instead of "npm run"',
            r"\byarn\b": 'Use "bun" instead of "yarn"',
            # Only flag "pip install" when not immediately preceded by "uv "
            r"(?<!uv )\bpip install\b": 'Use "uv pip install" instead of "pip install"',
            # Allow mentions of Prettier/ESLint in migration lines that also mention Biome
            r"(?<!migrate-eslint-)\bprettier\b": 'Use "Biome" instead of "prettier"',
            r"(?<!migrate-)\beslint\b": 'Use "Biome" instead of "eslint"',
            r"\bblack\b(?!\s*list|\s*box)": 'Use "Ruff" instead of "black"',
            r"\bisort\b": 'Use "Ruff" instead of "isort"',
            r"\bflake8\b": 'Use "Ruff" instead of "flake8"',
            r"\bpylint\b": 'Use "Ruff" instead of "pylint"',
            r"\bpoetry\b": 'Use "uv" instead of "poetry"',
        }

        for md_file in self.docs_dir.rglob("*.md"):
            if self._skip(md_file):
                continue

            try:
                content = md_file.read_text()

                for pattern, message in patterns.items():
                    if re.search(pattern, content, re.IGNORECASE | re.MULTILINE):
                        self.issues["tools"].append(
                            f"{md_file.relative_to(self.docs_dir)}: {message}"
                        )
                        incorrect_tools += 1
                        break  # Only report first issue per file
            except Exception:
                pass

        self.stats["incorrect_tools"] = incorrect_tools

        if incorrect_tools == 0:
            print("  ✓ All tools correctly referenced")
        else:
            print(f"  ⚠ {incorrect_tools} files with incorrect tool references")

    def check_broken_links(self):
        """Check for broken internal links."""
        print("🔗 Checking internal links...")

        broken_links = 0
        {
            str(f.relative_to(self.docs_dir)): f
            for f in self.docs_dir.rglob("*.md")
            if not self._skip(f)
        }

        # Pattern to match markdown links
        link_pattern = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")

        for md_file in self.docs_dir.rglob("*.md"):
            if self._skip(md_file):
                continue

            try:
                content = md_file.read_text()

                # Find all links
                for match in link_pattern.finditer(content):
                    match.group(1)
                    link_target = match.group(2)

                    # Skip external links and anchors
                    if link_target.startswith(("http://", "https://", "#", "mailto:")):
                        continue

                    # Check if internal link exists
                    if link_target.endswith(".md"):
                        # Resolve relative path
                        if link_target.startswith("/"):
                            target_path = self.docs_dir / link_target[1:]
                        else:
                            target_path = (md_file.parent / link_target).resolve()

                        # Check if target exists
                        if not target_path.exists():
                            self.issues["links"].append(
                                f"{md_file.relative_to(self.docs_dir)}: Broken link to '{link_target}'"
                            )
                            broken_links += 1
            except Exception:
                pass

        self.stats["broken_links"] = broken_links

        if broken_links == 0:
            print("  ✓ No broken internal links found")
        else:
            print(f"  ⚠ {broken_links} broken links found")

    def check_duplicates(self):
        """Check for duplicate content."""
        print("🔍 Checking for duplicates...")

        # Look for files with similar names
        file_names = defaultdict(list)
        for md_file in self.docs_dir.rglob("*.md"):
            if self._skip(md_file):
                continue
            base_name = md_file.stem.lower().replace("-", "_").replace(" ", "_")
            file_names[base_name].append(md_file)

        duplicates = 0
        for base_name, files in file_names.items():
            # Allow-list common basenames like README.md, overview.md, etc.
            if f"{base_name}.md" in self._duplicate_whitelist:
                continue
            if len(files) > 1:
                self.issues["duplicates"].append(
                    f"Similar filenames: {', '.join(str(f.relative_to(self.docs_dir)) for f in files)}"
                )
                duplicates += 1

        self.stats["potential_duplicates"] = duplicates

        if duplicates == 0:
            print("  ✓ No duplicate files detected")
        else:
            print(f"  ⚠ {duplicates} potential duplicate files")

    def check_content_quality(self):
        """Check content quality indicators."""
        print("📊 Checking content quality...")

        quality_issues = 0

        for md_file in self.docs_dir.rglob("*.md"):
            if self._skip(md_file):
                continue

            try:
                content = md_file.read_text()

                # Check for TODO/FIXME markers
                if re.search(r"\b(TODO|FIXME|XXX|HACK)\b", content):
                    self.issues["quality"].append(
                        f"{md_file.relative_to(self.docs_dir)}: Contains TODO/FIXME markers"
                    )
                    quality_issues += 1

                # Check for placeholder content
                if re.search(
                    r"\b(foo|bar|baz|lorem\s+ipsum)\b", content, re.IGNORECASE
                ):
                    self.issues["quality"].append(
                        f"{md_file.relative_to(self.docs_dir)}: Contains placeholder content"
                    )
                    quality_issues += 1

                # Check for very short files (likely incomplete)
                if len(content.strip()) < 100:
                    self.issues["quality"].append(
                        f"{md_file.relative_to(self.docs_dir)}: Very short file ({len(content.strip())} chars)"
                    )
                    quality_issues += 1
            except Exception:
                pass

        self.stats["quality_issues"] = quality_issues

        if quality_issues == 0:
            print("  ✓ No quality issues detected")
        else:
            print(f"  ⚠ {quality_issues} quality issues found")

    def check_outdated_content(self):
        """Check for potentially outdated content."""
        print("📅 Checking for outdated content...")

        outdated = 0

        # Patterns that suggest outdated content
        outdated_patterns = [
            (r"python\s*3\.[0-7]\b", "Old Python version"),
            (r"node\s*1[0-5]\b", "Old Node version"),
            (r"react\s*1[0-7]\b", "Old React version"),
            (r"sqlite", "SQLite reference (project uses PostgreSQL)"),
            (r"localhost:3000|localhost:8000", "Wrong port (should be 5000)"),
            (r"/api/v[0-9]/", "Versioned API path"),
        ]

        for md_file in self.docs_dir.rglob("*.md"):
            if self._skip(md_file):
                continue

            try:
                content = md_file.read_text()

                for pattern, description in outdated_patterns:
                    m = re.search(pattern, content, re.IGNORECASE)
                    if m:
                        # Skip migration docs for version references
                        if "migration" in str(md_file).lower():
                            continue
                        # Special-case: ignore '/api/vN/' if it's part of a docs file path (markdown link)
                        if pattern == r"/api/v[0-9]/":
                            # Look around the match to see if it's within a .md link
                            start = max(0, m.start() - 50)
                            end = min(len(content), m.end() + 100)
                            window = content[start:end]
                            # Skip if part of a markdown link to a .md file
                            if re.search(r"\[[^\]]*\]\([^)]*\.md\)", window):
                                continue
                            # Skip if part of inline code referencing a .md file
                            if ".md" in window and "`" in window:
                                continue
                        self.issues["outdated"].append(
                            f"{md_file.relative_to(self.docs_dir)}: {description}"
                        )
                        outdated += 1
                        break
            except Exception:
                pass

        self.stats["outdated_content"] = outdated

        if outdated == 0:
            print("  ✓ No outdated content detected")
        else:
            print(f"  ⚠ {outdated} files with potentially outdated content")

    def print_report(self, stats: Dict, issues: Dict):
        """Print a formatted validation report."""
        print("\n" + "=" * 60)
        print("📋 DOCUMENTATION VALIDATION REPORT")
        print("=" * 60)

        # Statistics
        print("\n📊 Statistics:")
        for key, value in stats.items():
            key_formatted = key.replace("_", " ").title()
            print(f"  • {key_formatted}: {value}")

        # Issues by category
        if issues:
            print("\n⚠️  Issues Found:")
            for category, issue_list in issues.items():
                if issue_list:
                    print(f"\n  {category.upper()} ({len(issue_list)} issues):")
                    for issue in issue_list[:5]:  # Show first 5
                        print(f"    - {issue}")
                    if len(issue_list) > 5:
                        print(f"    ... and {len(issue_list) - 5} more")

        # Overall score
        print("\n" + "=" * 60)
        score_emoji = "🟢" if self.score >= 80 else "🟡" if self.score >= 60 else "🔴"
        print(f"{score_emoji} Documentation Health Score: {self.score}/100")

        if self.score >= 80:
            print("✅ Documentation is in GOOD shape!")
        elif self.score >= 60:
            print("⚠️  Documentation needs SOME improvements")
        else:
            print("❌ Documentation needs SIGNIFICANT improvements")

        print("=" * 60)


def main():
    """Main function to run validation."""
    import sys
    import argparse

    parser = argparse.ArgumentParser(description="Validate documentation health")
    parser.add_argument(
        "--docs-dir",
        type=Path,
        default=Path("docs"),
        help="Documentation directory path",
    )
    parser.add_argument("--json", action="store_true", help="Output results as JSON")
    parser.add_argument(
        "--strict", action="store_true", help="Exit with error code if validation fails"
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Suppress progress output (implied when --json)",
    )

    args = parser.parse_args()

    validator = DocumentationValidator(args.docs_dir)

    # Suppress progress output when emitting JSON or when --quiet is set
    if args.json or args.quiet:
        with contextlib.redirect_stdout(io.StringIO()):
            passed, stats, issues = validator.validate_all()
    else:
        passed, stats, issues = validator.validate_all()

    if args.json:
        result = {
            "passed": passed,
            "score": validator.score,
            "stats": stats,
            "issues": issues,
        }
        print(json.dumps(result, indent=2))
    else:
        validator.print_report(stats, issues)

    if args.strict and not passed:
        sys.exit(1)

    return 0 if passed else 1


if __name__ == "__main__":
    exit(main())
