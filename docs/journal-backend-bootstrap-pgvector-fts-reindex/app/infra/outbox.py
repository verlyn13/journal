from __future__ import annotations
import asyncio, json
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.infra.models import Event
from app.infra.nats_bus import publish

SUBJECT_MAP = {
    "Entry": "journal.entry",
}

async def relay_outbox(session_factory, poll_seconds: float = 1.0):
    while True:
        try:
            async with session_factory() as s:  # type: AsyncSession
                stmt = select(Event).where(Event.published == False).limit(50)
                rows = (await s.execute(stmt)).scalars().all()
                if not rows:
                    await asyncio.sleep(poll_seconds)
                    continue
                for ev in rows:
                    subject = SUBJECT_MAP.get(ev.aggregate_type, "journal.events")
                    await publish(subject, json.dumps({
                        "id": str(ev.id),
                        "type": ev.event_type,
                        "data": ev.event_data,
                        "metadata": ev.metadata,
                        "ts": ev.occurred_at.isoformat(),
                    }).encode("utf-8"))
                    await s.execute(update(Event).where(Event.id == ev.id).values(published=True))
                await s.commit()
        except Exception as e:
            # In production: log with structured logger
            await asyncio.sleep(poll_seconds)
