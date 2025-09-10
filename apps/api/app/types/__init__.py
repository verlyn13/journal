"""Type utilities and guards for the Journal API.

This module provides reusable type patterns that ensure type safety
while maintaining code clarity and performance.
"""

from app.types.guards import (
    exists_guard,
    get_or_404,
    is_valid_user,
    is_valid_entry,
)
from app.types.utilities import (
    Timestamped,
    update_timestamp,
    JSONDict,
    ID,
)

__all__ = [
    # Guards
    "exists_guard",
    "get_or_404", 
    "is_valid_user",
    "is_valid_entry",
    # Utilities
    "Timestamped",
    "update_timestamp",
    "JSONDict",
    "ID",
]