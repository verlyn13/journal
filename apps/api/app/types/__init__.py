"""Type utilities and guards for the Journal API.

This module provides reusable type patterns that ensure type safety
while maintaining code clarity and performance.
"""

from app.types.guards import exists_guard, get_or_404, is_valid_entry, is_valid_user
from app.types.utilities import ID, JSONDict, Timestamped, update_timestamp


__all__ = [
    "ID",
    "JSONDict",
    # Utilities
    "Timestamped",
    # Guards
    "exists_guard",
    "get_or_404",
    "is_valid_entry",
    "is_valid_user",
    "update_timestamp",
]
