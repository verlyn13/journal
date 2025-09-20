"""Type guards for common narrowing patterns.

Type guards enable mypy to narrow union types safely, eliminating the need
for casts or type: ignore comments. They make type narrowing explicit,
reusable, and self-documenting.

Reference: PEP 647 - User-Defined Type Guards
https://www.python.org/dev/peps/pep-0647/
"""

from typing import TypeGuard
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.base import Base
from app.infra.sa_models import Entry, User


def exists_guard[T: Base](obj: T | None) -> TypeGuard[T]:
    """Type guard for SQLAlchemy model existence.

    This guard narrows Optional[Model] to Model, allowing safe attribute access
    after the check. It's the canonical pattern for handling database queries
    that might return None.

    Args:
        obj: A model instance or None from a database query

    Returns:
        TypeGuard that proves obj is not None

    Example:
        ```python
        user = await session.get(User, user_id)
        if not exists_guard(user):
            raise HTTPException(404)
        # mypy knows user is User here, not User | None
        print(user.email)  # Safe access
        ```

    Performance: < 0.1μs overhead (simple identity check)
    """
    return obj is not None


def is_valid_user(user: User | None) -> TypeGuard[User]:
    """Type guard for valid, active users.

    Narrows User | None to User while also validating business rules.
    This combines type narrowing with domain validation.

    Args:
        user: User instance or None

    Returns:
        TypeGuard proving user is valid User

    Example:
        ```python
        user = await get_user_by_email(email)
        if not is_valid_user(user):
            raise HTTPException(401, "Invalid credentials")
        # user is guaranteed to be active User
        access_token = create_token(user.id)
        ```
    """
    return user is not None and user.is_active and user.password_hash is not None


def is_valid_entry(entry: Entry | None) -> TypeGuard[Entry]:
    """Type guard for valid, non-deleted entries.

    Args:
        entry: Entry instance or None

    Returns:
        TypeGuard proving entry is valid Entry
    """
    return entry is not None and not entry.is_deleted and entry.author_id is not None


async def get_or_404[T: Base](
    session: AsyncSession,
    model: type[T],
    resource_id: UUID | str,
    error_message: str = "Resource not found",
) -> T:
    """Get model with proper typing or raise 404.

    This helper eliminates the Optional return type from database queries,
    guaranteeing a model instance or raising an HTTP exception.

    Args:
        session: Active database session
        model: SQLAlchemy model class
        resource_id: Primary key value
        error_message: Custom 404 message

    Returns:
        Model instance (never None)

    Raises:
        HTTPException: 404 if model not found

    Example:
        ```python
        # Without helper (requires narrowing)
        user = await session.get(User, user_id)
        if user is None:
            raise HTTPException(404)
        return user  # Still Optional[User] without guard

        # With helper (guaranteed User)
        user = await get_or_404(session, User, user_id)
        return user  # Type is User, not Optional[User]
        ```

    Performance: Same as session.get() + exception overhead on miss
    """
    if isinstance(resource_id, str):
        try:
            resource_id = UUID(resource_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=error_message
            )

    result = await session.get(model, resource_id)

    if not exists_guard(result):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error_message)

    return result  # mypy knows this is T, not T | None


# For backward compatibility and gradual migration
async def get_user_or_404(session: AsyncSession, user_id: UUID | str) -> User:
    """Get user or raise 404 - specialized helper."""
    return await get_or_404(session, User, user_id, "User not found")


async def get_entry_or_404(
    session: AsyncSession, entry_id: UUID | str, check_deleted: bool = True
) -> Entry:
    """Get entry or raise 404 - specialized helper with deletion check."""
    entry = await get_or_404(session, Entry, entry_id, "Entry not found")

    if check_deleted and entry.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found"
        )

    return entry
