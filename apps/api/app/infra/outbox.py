from __future__ import annotations

# Standard library imports
import asyncio
import json

# Local imports
import logging
import os
import random

from datetime import datetime, timedelta
from typing import Any, AsyncIterator, Callable

# Third-party imports
from sqlalchemy import select, text, text as _text, update

from app.infra.models import Event
from app.infra.nats_bus import nats_conn
from app.telemetry.metrics_runtime import inc as metrics_inc


SUBJECT_MAP = {
    "Entry": "journal.entry",
}


SessionFactory = Callable[[], AsyncIterator[Any]]


async def relay_outbox(session_factory: SessionFactory, poll_seconds: float = 1.0) -> None:
    """Continuously publish unpublished events to NATS and mark them as published.

    Selects events where `published_at IS NULL`, publishes, then sets `published_at`.
    """
    while True:
        try:
            async with session_factory() as s:  # type: AsyncSession
                # Flag-gated retry pipeline
                retry_enabled = os.getenv("OUTBOX_RETRY_ENABLED", "0") == "1"
                if retry_enabled:
                    # Pending and due; use SKIP LOCKED to avoid double-claim
                    stmt = (
                        select(Event)
                        .where(
                            Event.published_at.is_(None),
                            # text filters allow columns even if model doesn't expose them
                            text("state = 'pending'"),
                            text("COALESCE(next_attempt_at, now()) <= now()"),
                        )
                        .order_by(Event.id)
                        .limit(50)
                        .with_for_update(skip_locked=True)
                    )
                else:
                    # Legacy behavior: any unpublished
                    stmt = select(Event).where(Event.published_at.is_(None)).limit(50)
                rows = (await s.execute(stmt)).scalars().all()
                if not rows:
                    await asyncio.sleep(poll_seconds)
                    continue

                # Support monkeypatched nats_conn that returns a coroutine yielding a context manager
                _ctx = nats_conn()
                if asyncio.iscoroutine(_ctx):  # type: ignore[arg-type]
                    _ctx = await _ctx  # type: ignore[assignment]
                async with _ctx as nc:  # type: ignore[attr-defined]
                    # Prefer JetStream publish with de-dupe if available
                    js = None
                    try:
                        js = nc.jetstream()
                    except Exception:
                        js = None
                    for ev in rows:
                        subject = SUBJECT_MAP.get(ev.aggregate_type, "journal.events")
                        payload = json.dumps({
                            "id": str(ev.id),
                            "event_type": ev.event_type,
                            "event_data": ev.event_data,
                            "ts": ev.occurred_at.isoformat(),
                        }).encode("utf-8")
                        try:
                            metrics_inc("outbox_publish_attempts_total", {"stage": "attempt"})
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
                            metrics_inc("outbox_publish_attempts_total", {"result": "ok"})
                        except Exception as e:
                            # Compute backoff and schedule retry if enabled; otherwise, best-effort log
                            if retry_enabled:
                                await _schedule_retry_or_dead(s, ev, e, nc)
                            else:
                                _log_only(e)
                            metrics_inc("outbox_publish_attempts_total", {"result": "error"})
                await s.commit()
        except Exception:
            # Back off briefly and try again; non-fatal in dev
            await asyncio.sleep(poll_seconds)


async def process_outbox_batch(session_factory: SessionFactory) -> int:
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

        _ctx = nats_conn()
        if asyncio.iscoroutine(_ctx):  # type: ignore[arg-type]
            _ctx = await _ctx  # type: ignore[assignment]
        async with _ctx as nc:  # type: ignore[attr-defined]
            js = None
            try:
                js = nc.jetstream()
            except Exception:
                js = None
            for ev in rows:
                subject = SUBJECT_MAP.get(ev.aggregate_type, "journal.events")
                payload = json.dumps({
                    "id": str(ev.id),
                    "event_type": ev.event_type,
                    "event_data": ev.event_data,
                    "ts": ev.occurred_at.isoformat(),
                }).encode("utf-8")
                try:
                    metrics_inc("outbox_publish_attempts_total", {"stage": "attempt"})
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
                    metrics_inc("outbox_publish_attempts_total", {"result": "ok"})
                except Exception as e:
                    if os.getenv("OUTBOX_RETRY_ENABLED", "0") == "1":
                        await _schedule_retry_or_dead(s, ev, e, nc)
                    else:
                        _log_only(e)
                    metrics_inc("outbox_publish_attempts_total", {"result": "error"})
        await s.commit()
    return published


# ------------------------------
# Internal helpers
# ------------------------------


def _pub_state_fields() -> dict[str, str]:
    # When columns are present, set state to published; tolerate missing columns
    return {"state": "published"}


def _log_only(error: Exception) -> None:
    try:
        logging.getLogger(__name__).warning("outbox publish failed: %r", error)
    except Exception:
        pass


async def _schedule_retry_or_dead(session: Any, ev: Event, error: Exception, nc: Any) -> None:
    """Best-effort update of retry bookkeeping; tolerant if columns are missing.

    Columns: attempts (int), next_attempt_at (timestamptz), last_error (text), state (text)
    """
    try:
        # Ensure retry bookkeeping columns exist (best-effort, tolerant if DDL fails)
        try:
            await session.execute(
                _text("ALTER TABLE events ADD COLUMN IF NOT EXISTS attempts integer")
            )
            await session.execute(
                _text("ALTER TABLE events ADD COLUMN IF NOT EXISTS next_attempt_at timestamptz")
            )
            await session.execute(
                _text("ALTER TABLE events ADD COLUMN IF NOT EXISTS last_error text")
            )
            await session.execute(
                _text("ALTER TABLE events ADD COLUMN IF NOT EXISTS state text")
            )
        except Exception:
            pass
        # Read current attempts; if column missing this will fail and we fall back silently
        now = datetime.utcnow()
        base = float(os.getenv("OUTBOX_RETRY_BASE_SECS", "0.25"))
        factor = float(os.getenv("OUTBOX_RETRY_FACTOR", "2.0"))
        cap = float(os.getenv("OUTBOX_RETRY_MAX_BACKOFF_SECS", "15"))
        max_attempts = int(os.getenv("OUTBOX_RETRY_MAX_ATTEMPTS", "6"))

        # single UPDATE with computed next_attempt from attempts+1
        # We approximate backoff by using attempts stored; if missing, first failure uses base.
        # Note: use COALESCE for missing attempts.
        # Fetch attempts if column exists
        attempts = 0
        try:
            row = (
                await session.execute(
                    _text("SELECT attempts FROM events WHERE id = :id"), {"id": ev.id}
                )
            ).scalar_one()
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
        await session.execute(
            _text(
                "UPDATE events SET attempts = COALESCE(attempts, 0) + 1, next_attempt_at = :next_at, last_error = :err, state = COALESCE(state, 'pending') WHERE id = :id"
            ),
            {"id": ev.id, "next_at": next_at, "err": err_str},
        )

        # If exceeded threshold, best-effort mark dead and publish to DLQ via separate process
        if attempts + 1 >= max_attempts:
            try:
                await session.execute(
                    _text("UPDATE events SET state = 'dead' WHERE id = :id"), {"id": ev.id}
                )
            except Exception:
                pass
            # DLQ if enabled
            if os.getenv("OUTBOX_DLQ_ENABLED", "0") == "1":
                try:
                    js = None
                    try:
                        js = nc.jetstream()
                    except Exception:
                        js = None
                    envelope = {
                        "original_subject": SUBJECT_MAP.get(ev.aggregate_type, "journal.events"),
                        "payload": ev.event_data,
                        "reason": err_str,
                        "attempts": attempts + 1,
                        "event_id": str(ev.id),
                    }
                    data = json.dumps(envelope).encode("utf-8")
                    if js:
                        await js.publish("journal.dlq", data, msg_id=str(ev.id))
                    else:
                        await nc.publish("journal.dlq", data)
                    metrics_inc("outbox_dlq_total")
                except Exception:
                    pass
    except Exception:
        # swallow to avoid crashing outbox relay
        pass
