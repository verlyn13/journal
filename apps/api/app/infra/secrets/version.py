"""Centralized Infisical CLI version management.

This module provides centralized version parsing and validation for the Infisical CLI,
supporting multiple version formats including shim versions for testing.
"""

from __future__ import annotations

import re
from typing import NamedTuple


class VersionInfo(NamedTuple):
    """Parsed version information."""

    major: int
    minor: int
    patch: int
    suffix: str | None = None
    raw: str = ""


# Expected major.minor version for compatibility checks
EXPECTED_VERSION = "0.42"
EXPECTED_MAJOR = 0
EXPECTED_MINOR = 42


def parse_cli_version(output: str) -> VersionInfo:
    """Parse Infisical CLI version from command output.

    Supports multiple formats:
    - "infisical version X.Y.Z" (standard CLI)
    - "Infisical CLI vX.Y.Z" (alternative format)
    - "Infisical CLI vX.Y.Z-suffix" (with suffix like -shim)
    - Multi-line output (takes first line containing version)

    Args:
        output: Raw output from infisical --version command

    Returns:
        VersionInfo with parsed version components

    Raises:
        ValueError: If version format is not recognized
    """
    # Clean the output - handle multi-line output by taking first line
    lines = output.strip().split("\n")
    version_str = lines[0].strip() if lines else ""

    if not version_str:
        raise ValueError("Empty version output")

    # Support multiple version formats with optional suffix
    # Pattern matches:
    # - "infisical version X.Y.Z"
    # - "Infisical CLI vX.Y.Z"
    # - "Infisical CLI vX.Y.Z-suffix"
    pattern = r"(?:infisical version |Infisical CLI v)(\d+)\.(\d+)\.(\d+)(?:-(.+))?"
    match = re.match(pattern, version_str, re.IGNORECASE)

    if not match:
        # Try to extract just version numbers if format is unexpected
        fallback_pattern = r"(\d+)\.(\d+)\.(\d+)(?:-(.+))?"
        fallback_match = re.search(fallback_pattern, version_str)
        if not fallback_match:
            raise ValueError(f"Unexpected Infisical CLI version format: {version_str}")
        match = fallback_match

    major = int(match.group(1))
    minor = int(match.group(2))
    patch = int(match.group(3))
    suffix = match.group(4) if len(match.groups()) >= 4 else None

    return VersionInfo(
        major=major,
        minor=minor,
        patch=patch,
        suffix=suffix,
        raw=version_str,
    )


def is_compatible_version(version: VersionInfo) -> bool:
    """Check if version is compatible with expected version.

    Args:
        version: Parsed version info

    Returns:
        True if version is compatible, False otherwise
    """
    return version.major == EXPECTED_MAJOR and version.minor == EXPECTED_MINOR


def format_version(version: VersionInfo) -> str:
    """Format version info as string.

    Args:
        version: Parsed version info

    Returns:
        Formatted version string like "0.42.1" or "0.42.1-shim"
    """
    base = f"{version.major}.{version.minor}.{version.patch}"
    if version.suffix:
        return f"{base}-{version.suffix}"
    return base
