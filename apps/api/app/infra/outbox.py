from __future__ import annotations

# Standard library imports
import asyncio
import json

from datetime import datetime, timedelta
import os
import random

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
                # Basic scan; if retry columns exist, the batch update below will honor them.
                stmt = select(Event).where(Event.published_at.is_(None)).limit(50)
                rows = (await s.execute(stmt)).scalars().all()
                if not rows:
                    await asyncio.sleep(poll_seconds)
                    continue

                async with nats_conn() as nc:
                    # Prefer JetStream publish with de-dupe if available
                    js = None
                    try:
                        js = nc.jetstream()
                    except Exception:
                        js = None
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
                        try:
                            if js:
                                # De-dupe via message id if supported
                                await js.publish(subject, payload, msg_id=str(ev.id))
                            else:
                                await nc.publish(subject, payload)

                            # Mark as published
                            await s.execute(
                                update(Event)
                                .where(Event.id == ev.id)
                                .values(published_at=datetime.utcnow())
                            )
                        except Exception as e:
                            # Compute backoff and schedule retry if columns exist; otherwise, best-effort log
                            _schedule_retry_or_dead(s, ev.id, e)
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
            js = None
            try:
                js = nc.jetstream()
            except Exception:
                js = None
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
                try:
                    if js:
                        await js.publish(subject, payload, msg_id=str(ev.id))
                    else:
                        await nc.publish(subject, payload)
                    await s.execute(
                        update(Event)
                        .where(Event.id == ev.id)
                        .values(published_at=datetime.utcnow())
                    )
                    published += 1
                except Exception as e:
                    _schedule_retry_or_dead(s, ev.id, e)
        await s.commit()
    return published


# ------------------------------
# Internal helpers
# ------------------------------

def _schedule_retry_or_dead(session, event_id, error: Exception) -> None:
    """Best-effort update of retry bookkeeping; tolerant if columns are missing.

    Columns: attempts (int), next_attempt_at (timestamptz), last_error (text), state (text)
    """
    try:
        # Read current attempts; if column missing this will fail and we fall back silently
        now = datetime.utcnow()
        base = float(os.getenv("OUTBOX_RETRY_BASE_SECS", "0.25"))
        factor = float(os.getenv("OUTBOX_RETRY_FACTOR", "2.0"))
        cap = float(os.getenv("OUTBOX_RETRY_MAX_BACKOFF_SECS", "15"))
        max_attempts = int(os.getenv("OUTBOX_RETRY_MAX_ATTEMPTS", "6"))

        # single UPDATE with computed next_attempt from attempts+1
        # We approximate backoff by using attempts stored; if missing, first failure uses base.
        # Note: use COALESCE for missing attempts.
        from sqlalchemy import text as _text

        # Fetch attempts if column exists
        attempts = 0
        try:
            row = session.execute(_text("SELECT attempts FROM events WHERE id = :id"), {"id": event_id}).scalar_one()
            attempts = int(row or 0)
        except Exception:
            attempts = 0

        next_delay = min(cap, base * (factor ** max(attempts, 0)))
        # Full jitter
        next_delay = random.random() * next_delay
        next_at = now + timedelta(seconds=next_delay)
        # Truncate error message to reasonable length
        err_str = repr(error)
        if len(err_str) > 500:
            err_str = err_str[:500]

        # Attempt update; if columns missing, ignore
        session.execute(
            _text(
                "UPDATE events SET attempts = COALESCE(attempts, 0) + 1, next_attempt_at = :next_at, last_error = :err WHERE id = :id"
            ),
            {"id": event_id, "next_at": next_at, "err": err_str},
        )

        # If exceeded threshold, best-effort mark dead and publish to DLQ via separate process
        if attempts + 1 >= max_attempts:
            try:
                session.execute(
                    _text("UPDATE events SET state = 'dead' WHERE id = :id"), {"id": event_id}
                )
            except Exception:
                pass
    except Exception:
        # swallow to avoid crashing outbox relay
        pass
