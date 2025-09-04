"""Repository pattern for Entry operations with optimistic locking."""

from __future__ import annotations

from typing import Any, Dict, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.exc import StaleDataError

from app.infra.models import Entry


class RepositoryError(Exception):
    """Base exception for repository operations."""
    pass


class NotFound(RepositoryError):
    """Entity not found."""
    def __init__(self, entity_type: str, entity_id: str | UUID | None = None):
        self.entity_type = entity_type
        self.entity_id = entity_id
        super().__init__(f"{entity_type} not found" + (f": {entity_id}" if entity_id else ""))


class Conflict(RepositoryError):
    """Optimistic lock conflict."""
    def __init__(self, message: str, expected: int | None = None, actual: int | None = None):
        self.expected = expected
        self.actual = actual
        super().__init__(message)


class EntryRepository:
    """Repository for Entry operations with optimistic locking support."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, entry_id: UUID) -> Entry | None:
        """Get entry by ID."""
        return await self.session.get(Entry, entry_id)

    async def create(self, data: dict[str, Any]) -> Entry:
        """Create a new entry."""
        entry = Entry(**data)
        self.session.add(entry)
        await self.session.flush()
        return entry

    async def update_entry(self, entry_id: UUID, data: dict[str, Any], expected_version: int) -> Entry:
        """Update entry with optimistic locking.
        
        Args:
            entry_id: ID of entry to update
            data: Fields to update (excluding version)
            expected_version: Expected current version
            
        Returns:
            Updated entry
            
        Raises:
            NotFound: Entry doesn't exist
            Conflict: Version mismatch (concurrent modification)
        """
        # Get entry with row lock
        stmt = select(Entry).where(Entry.id == entry_id).with_for_update()
        result = await self.session.execute(stmt)
        entry = result.scalar_one_or_none()

        if not entry:
            raise NotFound("entry", entry_id)

        # Check version for optimistic locking
        if entry.version != expected_version:
            raise Conflict(
                "Entry was modified by another user",
                expected=expected_version,
                actual=entry.version
            )

        # Apply updates
        for key, value in data.items():
            if key != 'version':  # Don't allow manual version setting
                setattr(entry, key, value)

        # Increment version
        entry.version += 1

        await self.session.flush()
        return entry

    async def soft_delete(self, entry_id: UUID, expected_version: int) -> Entry:
        """Soft delete entry with optimistic locking.

        Treat already-deleted entries as not found to keep delete idempotent
        from the client's perspective (second delete returns 404).
        """
        # Lock the row to avoid races
        result = await self.session.execute(
            select(Entry).where(Entry.id == entry_id).with_for_update()
        )
        entry = result.scalar_one_or_none()

        if not entry or entry.is_deleted:
            # Either missing or already deleted -> behave as not found
            raise NotFound("entry", entry_id)

        if entry.version != expected_version:
            raise Conflict(
                "Entry was modified by another user",
                expected=expected_version,
                actual=entry.version,
            )

        entry.is_deleted = True
        entry.version += 1
        await self.session.flush()
        return entry
