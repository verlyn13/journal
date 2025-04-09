#!/usr/bin/env python3
"""
Documentation Structure Checker

This script validates the structure of the documentation directory,
ensuring that the expected directories exist and contain required files.
"""

import os
import sys
from pathlib import Path

# Define the expected structure of the docs directory
EXPECTED_STRUCTURE = {
    "docs": {
        "required_files": ["README.md"],
        "subdirs": {
            "guides": {
                "required_files": ["architecture-overview.md"],
                "min_files": 3,
            },
            "implementation": {
                "required_files": ["README.md"],
                "min_files": 5,
            },
            "status": {
                "min_files": 1,
            },
            "proposals": {
                "min_files": 1,
            },
            "templates": {
                "min_files": 1,
            },
        },
    }
}


def check_structure(base_path, structure_spec):
    """
    Check if a directory structure matches the expected specification.

    Args:
        base_path: Path object pointing to the base directory
        structure_spec: Dictionary specifying expected structure

    Returns:
        List of error messages
    """
    errors = []

    # Check if base path exists
    if not base_path.exists() or not base_path.is_dir():
        errors.append(f"Directory {base_path} does not exist or is not a directory")
        return errors

    # Check required files
    if "required_files" in structure_spec:
        for required_file in structure_spec["required_files"]:
            file_path = base_path / required_file
            if not file_path.exists() or not file_path.is_file():
                errors.append(f"Required file {file_path} does not exist")

    # Check minimum files requirement
    if "min_files" in structure_spec:
        md_files = list(base_path.glob("*.md"))
        if len(md_files) < structure_spec["min_files"]:
            errors.append(
                f"Directory {base_path} should contain at least {structure_spec['min_files']} markdown files, but has {len(md_files)}"
            )

    # Check subdirectories
    if "subdirs" in structure_spec:
        for subdir_name, subdir_spec in structure_spec["subdirs"].items():
            subdir_path = base_path / subdir_name
            if not subdir_path.exists() or not subdir_path.is_dir():
                errors.append(f"Required subdirectory {subdir_path} does not exist")
            else:
                # Recursively check the subdirectory
                errors.extend(check_structure(subdir_path, subdir_spec))

    return errors


def main():
    """Main function to check documentation structure."""
    docs_path = Path("docs")

    errors = check_structure(docs_path, EXPECTED_STRUCTURE["docs"])

    if errors:
        print("Documentation structure validation failed:")
        for error in errors:
            print(f"  - {error}")
        sys.exit(1)
    else:
        print("Documentation structure validation passed!")
        sys.exit(0)


if __name__ == "__main__":
    main()
