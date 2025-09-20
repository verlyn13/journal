#!/usr/bin/env python3
"""Documentation Frontmatter Validator.

This script validates the frontmatter of all markdown files in the docs directory,
ensuring they have the required fields and follow a consistent format.
"""

import os
from pathlib import Path
import re
import sys


# Required frontmatter fields for different document types
REQUIRED_FIELDS = {
    "default": ["title", "description"],
    "guides": ["title", "description", "category", "version", "status"],
    "proposals": ["title", "description", "category", "related_topics", "status"],
}

# Valid status values
VALID_STATUS = ["draft", "review", "active", "deprecated"]


def extract_frontmatter(content):
    """Extract frontmatter from markdown content."""
    frontmatter_pattern = r"^---\s*\n(.*?)\n---\s*\n"
    match = re.search(frontmatter_pattern, content, re.DOTALL)
    if not match:
        return None

    frontmatter_text = match.group(1)
    frontmatter = {}

    for line in frontmatter_text.strip().split("\n"):
        if ":" in line:
            key, value = line.split(":", 1)
            frontmatter[key.strip()] = value.strip()

    return frontmatter


def validate_frontmatter(file_path, frontmatter):
    """Validate frontmatter for required fields and valid values."""
    # Determine document type based on path
    path_parts = str(file_path).split(os.sep)
    doc_type = "default"
    for part in path_parts:
        if part in REQUIRED_FIELDS:
            doc_type = part
            break

    # Check required fields
    errors = [
        f"Missing required field: {field}"
        for field in REQUIRED_FIELDS[doc_type]
        if field not in frontmatter
    ]

    # Validate status if present
    if (
        "status" in frontmatter
        and frontmatter["status"].strip("\"'") not in VALID_STATUS
    ):
        errors.append(
            f"Invalid status: {frontmatter['status']}. Must be one of: {', '.join(VALID_STATUS)}"
        )

    return errors


def main():
    """Main function to validate all markdown files."""
    docs_dir = Path("docs")
    error_count = 0

    for md_file in docs_dir.glob("**/*.md"):
        try:
            with open(md_file, encoding="utf-8") as f:
                content = f.read()

            frontmatter = extract_frontmatter(content)
            if not frontmatter:
                print(f"WARNING: No frontmatter found in {md_file}")
                continue

            errors = validate_frontmatter(md_file, frontmatter)
            if errors:
                error_count += 1
                print(f"ERROR in {md_file}:")
                for error in errors:
                    print(f"  - {error}")
        except Exception as e:
            error_count += 1
            print(f"ERROR processing {md_file}: {e!s}")

    if error_count > 0:
        print(f"\nFound {error_count} files with frontmatter issues.")
        sys.exit(1)
    else:
        print("\nAll frontmatter validated successfully!")
        sys.exit(0)


if __name__ == "__main__":
    main()
