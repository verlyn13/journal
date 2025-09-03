from __future__ import annotations

# Standard library imports
import asyncio
import json

from datetime import datetime

# Third-party imports
from sqlalchemy import select, update

# Local imports
from app.infra.models import Event
from app.infra.nats_bus import nats_conn


SUBJECT_MAP = {
    "Entry": "journal.entry",
}


async def relay_outbox(session_factory, poll_seconds: float = 1.0):
    """Continuously publish unpublished events to NATS and mark them as published.

    Selects events where `published_at IS NULL`, publishes, then sets `published_at`.
    """
    while True:
        try:
            async with session_factory() as s:  # type: AsyncSession
                stmt = select(Event).where(Event.published_at.is_(None)).limit(50)
                rows = (await s.execute(stmt)).scalars().all()
                if not rows:
                    await asyncio.sleep(poll_seconds)
                    continue

                async with nats_conn() as nc:
                    for ev in rows:
                        subject = SUBJECT_MAP.get(ev.aggregate_type, "journal.events")
                        payload = json.dumps(
                            {
                                "id": str(ev.id),
                                "event_type": ev.event_type,
                                "event_data": ev.event_data,
                                "ts": ev.occurred_at.isoformat(),
                            }
                        ).encode("utf-8")
                        await nc.publish(subject, payload)

                        # Mark as published
                        await s.execute(
                            update(Event)
                            .where(Event.id == ev.id)
                            .values(published_at=datetime.utcnow())
                        )
                await s.commit()
        except Exception:
            # Back off briefly and try again; non-fatal in dev
            await asyncio.sleep(poll_seconds)


async def process_outbox_batch(session_factory) -> int:
    """Process a single batch of unpublished events.

    Publishes each event to NATS and marks it as published.
    Returns the number of events published.
    """
    published = 0
    async with session_factory() as s:  # type: ignore[name-defined]
        stmt = select(Event).where(Event.published_at.is_(None)).limit(100)
        rows = (await s.execute(stmt)).scalars().all()
        if not rows:
            return 0

        async with nats_conn() as nc:
            for ev in rows:
                subject = SUBJECT_MAP.get(ev.aggregate_type, "journal.events")
                payload = json.dumps(
                    {
                        "id": str(ev.id),
                        "event_type": ev.event_type,
                        "event_data": ev.event_data,
                        "ts": ev.occurred_at.isoformat(),
                    }
                ).encode("utf-8")
                await nc.publish(subject, payload)
                await s.execute(
                    update(Event)
                    .where(Event.id == ev.id)
                    .values(published_at=datetime.utcnow())
                )
                published += 1
        await s.commit()
    return published
