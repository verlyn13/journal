#!/usr/bin/env python3
"""
Simple documentation validation - checks basic quality without strict schemas.
"""

from pathlib import Path
import sys


def validate_docs(docs_dir: Path = None) -> bool:
    """Run basic documentation validation."""
    docs_dir = docs_dir or Path("docs")

    if not docs_dir.exists():
        print(f"❌ Documentation directory not found: {docs_dir}")
        return False

    # Count markdown files
    md_files = list(docs_dir.rglob("*.md"))
    if len(md_files) < 5:
        print(f"❌ Too few documentation files: {len(md_files)} (minimum: 5)")
        return False

    # Check for basic structure
    essential_files = ["README.md", "INDEX.md"]
    missing_files = []

    for essential in essential_files:
        if not (docs_dir / essential).exists():
            missing_files.append(essential)

    if missing_files:
        print(f"⚠️ Missing essential files: {', '.join(missing_files)}")

    # Check for completely empty files
    empty_files = []
    for md_file in md_files:
        if md_file.stat().st_size == 0:
            empty_files.append(md_file.relative_to(docs_dir))

    if empty_files:
        print(f"⚠️ Empty files found: {', '.join(str(f) for f in empty_files)}")

    print("✅ Documentation validation passed")
    print(f"📊 Found {len(md_files)} markdown files")
    return True


def main():
    """Main entry point."""
    import argparse
    parser = argparse.ArgumentParser(description="Simple documentation validation")
    parser.add_argument("--docs-dir", type=Path, default=Path("docs"),
                       help="Documentation directory (default: docs)")
    parser.add_argument("--strict", action="store_true",
                       help="Enable strict mode (currently no-op)")

    args = parser.parse_args()

    success = validate_docs(args.docs_dir)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()