"""Type utilities for complex scenarios.

This module provides reusable type definitions, protocols, and utilities
that enhance type safety across the codebase.
"""

from datetime import datetime
from typing import Any, Literal, NewType, Protocol, TypeAlias, runtime_checkable, cast

# Type Aliases for common patterns
# ---------------------------------

# JSON-compatible dictionary (what goes into JSON columns)
JSONDict: TypeAlias = dict[str, Any]

# Configuration for cookies that matches FastAPI's expectations
CookieSameSite = Literal["lax", "strict", "none"]

# GraphQL ID type (distinct from regular strings)
ID = NewType("ID", str)

# JWT token types for clarity
AccessToken = NewType("AccessToken", str)
RefreshToken = NewType("RefreshToken", str)

# User and Entry IDs to prevent mixing
UserId = NewType("UserId", str)
EntryId = NewType("EntryId", str)


# Protocols for structural typing
# --------------------------------

@runtime_checkable
class Timestamped(Protocol):
    """Protocol for models with timestamp fields.
    
    Any object with created_at and updated_at can be used with
    functions that expect Timestamped objects.
    
    Example:
        ```python
        def touch(obj: Timestamped) -> None:
            obj.updated_at = datetime.utcnow()
            
        # Works with any model that has timestamps
        touch(user)
        touch(entry)
        touch(session)
        ```
    """
    created_at: datetime
    updated_at: datetime


@runtime_checkable
class Identifiable(Protocol):
    """Protocol for models with an ID field."""
    id: Any  # Usually UUID but can vary


@runtime_checkable
class SoftDeletable(Protocol):
    """Protocol for models that support soft deletion."""
    is_deleted: bool
    

@runtime_checkable
class Versionable(Protocol):
    """Protocol for models with optimistic locking."""
    version: int


# Utility functions using protocols
# ----------------------------------

def update_timestamp(obj: Timestamped) -> None:
    """Update the updated_at timestamp on any timestamped object.
    
    This is type-safe and works with any object implementing the
    Timestamped protocol.
    
    Args:
        obj: Any object with created_at and updated_at fields
        
    Example:
        ```python
        update_timestamp(user)  # Updates user.updated_at
        update_timestamp(entry) # Updates entry.updated_at
        ```
        
    Performance: < 0.1μs (single attribute assignment)
    """
    obj.updated_at = datetime.utcnow()


class SoftDeletableTimestamped(SoftDeletable, Timestamped, Protocol):
    """Combined protocol for soft-deletable timestamped objects."""
    pass


def soft_delete(obj: SoftDeletableTimestamped) -> None:
    """Soft delete an object by marking it as deleted and updating timestamp.
    
    Args:
        obj: Object that supports soft deletion and has timestamps
        
    Example:
        ```python
        soft_delete(entry)  # Sets is_deleted=True and updates timestamp
        ```
    """
    obj.is_deleted = True
    update_timestamp(obj)


def is_recent(obj: Timestamped, hours: int = 24) -> bool:
    """Check if an object was recently updated.
    
    Args:
        obj: Timestamped object
        hours: How many hours to consider "recent"
        
    Returns:
        True if updated within the specified hours
    """
    from datetime import timedelta
    
    now = datetime.utcnow()
    cutoff = now - timedelta(hours=hours)
    return obj.updated_at > cutoff


# Type validation utilities
# --------------------------

def validate_cookie_samesite(value: str) -> CookieSameSite:
    """Validate and cast a string to CookieSameSite literal type.
    
    Args:
        value: String that should be 'lax', 'strict', or 'none'
        
    Returns:
        Valid CookieSameSite literal
        
    Raises:
        ValueError: If value is not a valid option
        
    Example:
        ```python
        samesite = validate_cookie_samesite(os.getenv("COOKIE_SAMESITE", "lax"))
        response.set_cookie(..., samesite=samesite)  # Type-safe
        ```
    """
    if value not in ("lax", "strict", "none"):
        raise ValueError(
            f"Invalid cookie samesite value: {value}. "
            f"Must be 'lax', 'strict', or 'none'"
        )
    # This cast is safe because we validated above
    return value  # type: ignore[return-value]


def to_graphql_id(value: Any) -> ID:
    """Convert any value to a GraphQL ID type.
    
    GraphQL IDs are strings but semantically different from regular strings.
    This helper ensures proper typing.
    
    Args:
        value: Any value that can be stringified
        
    Returns:
        GraphQL ID type
        
    Example:
        ```python
        entry_id = to_graphql_id(entry.id)  # UUID -> ID
        user_id = to_graphql_id(user.id)    # UUID -> ID
        ```
    """
    return ID(str(value))


# Complex type helpers
# --------------------

class TypedJWT:
    """Type-safe JWT claims extraction.
    
    Provides typed access to JWT claims without Any contamination.
    
    Example:
        ```python
        jwt = TypedJWT(decoded_token)
        user_id = jwt.subject  # Type: str
        scopes = jwt.scopes    # Type: list[str]
        ```
    """
    
    def __init__(self, claims: dict[str, Any]) -> None:
        self._claims = claims
    
    @property
    def subject(self) -> str:
        """Get the subject (user ID) from JWT."""
        sub = self._claims.get("sub")
        if not isinstance(sub, str):
            raise ValueError("Invalid JWT: missing or invalid subject")
        return sub
    
    @property
    def scopes(self) -> list[str]:
        """Get scopes from JWT."""
        scopes = self._claims.get("scopes", [])
        if not isinstance(scopes, list):
            return []
        return [s for s in scopes if isinstance(s, str)]
    
    @property
    def token_type(self) -> Literal["access", "refresh", "verify"]:
        """Get token type from JWT."""
        typ = self._claims.get("typ", "access")
        if typ not in ("access", "refresh", "verify"):
            raise ValueError(f"Invalid token type: {typ}")
        return cast(Literal["access", "refresh", "verify"], typ)
    
    @property
    def refresh_id(self) -> str | None:
        """Get refresh ID for refresh tokens."""
        rid = self._claims.get("rid")
        return rid if isinstance(rid, str) else None
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get arbitrary claim with default."""
        return self._claims.get(key, default)