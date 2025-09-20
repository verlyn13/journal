#!/usr/bin/env python3
"""
Fix misaligned information in documentation files.
"""

from pathlib import Path
import re


def fix_file(file_path: Path) -> int:
    """Fix misaligned content in a file. Returns number of changes made."""
    changes = 0

    try:
        content = file_path.read_text()
        original = content

        # Fix package manager references
        content = re.sub(r"\bnpm install\b", "bun install", content)
        content = re.sub(r"\bnpm run\b", "bun run", content)
        content = re.sub(r"\byarn install\b", "bun install", content)
        content = re.sub(r"\byarn\b(?! install)", "bun", content)

        # Fix Python package manager
        content = re.sub(r"\bpip install\b(?! uv)", "uv pip install", content)
        content = re.sub(r"python -m pip install", "uv pip install", content)

        # Fix Python commands (preserve uv run)
        if "uv run python" not in content:
            content = re.sub(r"python3?\s+(\S+\.py)", r"uv run python \1", content)

        # Fix pytest commands
        content = re.sub(r"\bpytest\b(?! )", "uv run pytest", content)

        # Fix project-specific issues
        content = re.sub(r"\bmy-app\b", "journal", content)
        content = re.sub(r"\bexample-app\b", "journal", content)

        # Write back if changed
        if content != original:
            file_path.write_text(content)
            changes = len(
                [1 for a, b in zip(original.split("\n"), content.split("\n")) if a != b]
            )
            print(f"  Fixed {changes} lines in {file_path}")

        return changes
    except Exception as e:
        print(f"  Error fixing {file_path}: {e}")
        return 0


def main():
    """Main function."""
    docs_dir = Path("docs")

    total_files = 0
    total_changes = 0

    for md_file in docs_dir.rglob("*.md"):
        if "_generated" in str(md_file):
            continue

        changes = fix_file(md_file)
        if changes > 0:
            total_files += 1
            total_changes += changes

    print(f"\nFixed {total_changes} lines across {total_files} files")


if __name__ == "__main__":
    main()
