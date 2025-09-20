from __future__ import annotations

# Standard library imports
from uuid import UUID

# Third-party imports
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.conversion import markdown_to_html

# Local imports
from app.infra.sa_models import Entry, Event


async def create_entry(
    s: AsyncSession,
    author_id: UUID,
    title: str,
    content: str,
    markdown_content: str | None = None,
    content_version: int = 1,
) -> Entry:
    """Create a new entry and enqueue an 'entry.created' event.

    The event will be picked by the outbox relay and published via NATS.
    """
    if content_version >= 2 and markdown_content:
        html = markdown_to_html(markdown_content)
        e = Entry(
            author_id=author_id,
            title=title,
            content=html,
            markdown_content=markdown_content,
            content_version=content_version,
            word_count=len(html.split()),
        )
    else:
        e = Entry(
            author_id=author_id,
            title=title,
            content=content,
            word_count=len(content.split()),
        )
    s.add(e)
    await s.flush()

    # Store event with minimal payload; include entry_id for downstream consumers
    ev = Event(
        aggregate_id=e.id,
        aggregate_type="Entry",
        event_type="entry.created",
        event_data={"entry_id": str(e.id), "title": title},
    )
    s.add(ev)

    await s.commit()
    await s.refresh(e)
    return e


async def get_entry_by_id(
    s: AsyncSession, entry_id: UUID, author_id: UUID | None = None
) -> Entry | None:
    """Get entry by ID, excluding soft-deleted entries.

    Args:
        s: Database session
        entry_id: Entry ID to retrieve
        author_id: If provided, only return entry if it belongs to this author
    """
    conditions = [Entry.id == entry_id, Entry.is_deleted == False]  # noqa: E712
    if author_id is not None:
        conditions.append(Entry.author_id == author_id)
    result = await s.execute(select(Entry).where(*conditions))
    return result.scalar_one_or_none()


async def list_entries(
    s: AsyncSession,
    author_id: UUID | None = None,
    limit: int | None = None,
    offset: int = 0,
) -> list[Entry]:
    """List entries, optionally filtered by author.

    Args:
        s: Database session
        author_id: If provided, only return entries for this author
        limit: Maximum number of entries to return
        offset: Number of entries to skip
    """
    conditions = [Entry.is_deleted == False]  # noqa: E712
    if author_id is not None:
        conditions.append(Entry.author_id == author_id)

    query = select(Entry).where(*conditions).order_by(Entry.created_at.desc())
    if limit is not None:
        query = query.limit(limit)
    if offset > 0:
        query = query.offset(offset)
    return list((await s.execute(query)).scalars().all())
