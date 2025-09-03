from __future__ import annotations
from typing import Any
from uuid import UUID, uuid4
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.infra.models import Entry, Event

async def create_entry(s: AsyncSession, author_id: UUID, title: str, content: dict[str, Any]) -> Entry:
    e = Entry(author_id=author_id, title=title, content=content)
    s.add(e)
    await s.flush()
    ev = Event(
        aggregate_id=e.id, aggregate_type="Entry", event_type="entry.created",
        event_data={"title": title}, metadata={}, published=False
    )
    s.add(ev)
    await s.commit()
    await s.refresh(e)
    return e

async def list_entries(s: AsyncSession) -> list[Entry]:
    rows = (await s.execute(select(Entry).where(Entry.is_deleted == False))).scalars().all()
    return rows
