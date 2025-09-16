from __future__ import annotations

# Standard library imports
import asyncio
from contextlib import AbstractAsyncContextManager
from datetime import UTC, datetime, timedelta
import json

# Local imports
import logging
import os
import random
from typing import Protocol, runtime_checkable

# Third-party imports
from nats.aio.client import Client as NatsClient
from nats.js import JetStreamContext
from sqlalchemy import func, select, text, text as _text, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.nats_bus import nats_conn
from app.infra.sa_models import Event
from app.telemetry.metrics_runtime import inc as metrics_inc


SUBJECT_MAP = {
    "Entry": "journal.entry",
}


@runtime_checkable
class SessionFactory(Protocol):
    """Protocol for session factory that returns async context managers."""

    def __call__(self) -> AbstractAsyncContextManager[AsyncSession]:
        """Return an async context manager that yields a session."""
        ...


async def _publish_rows(s: AsyncSession, rows: list[Event], retry_enabled: bool) -> None:
    """Publish rows to NATS (JetStream if available) and mark as published."""
    # Support monkeypatched nats_conn that returns a coroutine yielding a context manager
    ctx = nats_conn()
    if asyncio.iscoroutine(ctx):
        ctx = await ctx
    async with ctx as nc:
        # Prefer JetStream publish with de-dupe if available
        js: JetStreamContext | None = None
        try:
            js = nc.jetstream()
        except Exception:  # noqa: BLE001 - tolerate missing JetStream
            js = None
        for ev in rows:
            subject = SUBJECT_MAP.get(ev.aggregate_type, "journal.events")
            # Normalize timestamp to naive ISO without offset for compatibility
            ts = ev.occurred_at.replace(tzinfo=None).isoformat(timespec="seconds")
            payload = json.dumps({
                "id": str(ev.id),
                "event_type": ev.event_type,
                "event_data": ev.event_data,
                "ts": ts,
            }).encode("utf-8")
            try:
                metrics_inc("outbox_publish_attempts_total", {"stage": "attempt"})
                if js:
                    # De-dupe via headers if supported (msg_id deprecated)
                    await js.publish(subject, payload, headers={"Nats-Msg-Id": str(ev.id)})
                else:
                    await nc.publish(subject, payload)

                # Mark as published in DB, then refresh instance for identity map
                await s.execute(
                    update(Event).where(Event.id == ev.id).values(published_at=func.now())
                )
                await s.refresh(ev)
                metrics_inc("outbox_publish_attempts_total", {"result": "ok"})
            except Exception as e:  # noqa: BLE001 - operational resilience
                # Compute backoff and schedule retry if enabled; otherwise, best-effort log
                if retry_enabled:
                    await _schedule_retry_or_dead(s, ev, e, nc)
                else:
                    _log_only(e)
                metrics_inc("outbox_publish_attempts_total", {"result": "error"})


async def relay_outbox(session_factory: SessionFactory, poll_seconds: float = 1.0) -> None:
    """Continuously publish unpublished events to NATS and mark them as published.

    Selects events where `published_at IS NULL`, publishes, then sets `published_at`.
    """
    while True:
        try:
            async with session_factory() as s:
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

                await _publish_rows(s, list(rows), retry_enabled)
                await s.commit()
        except Exception:  # noqa: BLE001 - keep relay running on unexpected errors
            # Back off briefly and try again; non-fatal in dev
            await asyncio.sleep(poll_seconds)


async def process_outbox_batch(session_factory: SessionFactory) -> int:
    """Process a single batch of unpublished events.

    Publishes each event to NATS and marks it as published.
    Returns the number of events published.
    """
    published = 0
    async with session_factory() as s:
        stmt = select(Event).where(Event.published_at.is_(None)).limit(100)
        rows = (await s.execute(stmt)).scalars().all()
        if not rows:
            return 0

        ctx = nats_conn()
        if asyncio.iscoroutine(ctx):
            ctx = await ctx
        async with ctx as nc:
            js: JetStreamContext | None = None
            try:
                js = nc.jetstream()
            except Exception:  # noqa: BLE001 - tolerate missing JetStream
                js = None
            for ev in rows:
                subject = SUBJECT_MAP.get(ev.aggregate_type, "journal.events")
                ts = ev.occurred_at.replace(tzinfo=None).isoformat(timespec="seconds")
                payload = json.dumps({
                    "id": str(ev.id),
                    "event_type": ev.event_type,
                    "event_data": ev.event_data,
                    "ts": ts,
                }).encode("utf-8")
                try:
                    metrics_inc("outbox_publish_attempts_total", {"stage": "attempt"})
                    if js:
                        # Use headers for message ID (msg_id deprecated)
                        await js.publish(subject, payload, headers={"Nats-Msg-Id": str(ev.id)})
                    else:
                        await nc.publish(subject, payload)
                    await s.execute(
                        update(Event).where(Event.id == ev.id).values(published_at=func.now())
                    )
                    await s.refresh(ev)
                    published += 1
                    metrics_inc("outbox_publish_attempts_total", {"result": "ok"})
                except Exception as e:  # noqa: BLE001 - operational resilience
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
    logger = logging.getLogger(__name__)
    try:
        logger.warning("outbox publish failed: %r", error)
    except Exception as exc:  # noqa: BLE001 - logging should not fail logic
        logger.debug("logging failed: %s", exc)


async def _schedule_retry_or_dead(
    session: AsyncSession, ev: Event, error: Exception, nc: NatsClient
) -> None:
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
            await session.execute(_text("ALTER TABLE events ADD COLUMN IF NOT EXISTS state text"))
        except Exception as exc:  # noqa: BLE001 - tolerate optional columns
            logging.getLogger(__name__).debug("DDL ensure columns failed or not needed: %s", exc)
        # Read current attempts; if column missing this will fail and we fall back silently
        now = datetime.now(UTC)
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
        except Exception as exc:  # noqa: BLE001 - attempts column may not exist yet
            logging.getLogger(__name__).debug("attempts fetch failed (assuming 0): %s", exc)
            attempts = 0

        next_delay = min(cap, base * (factor ** max(attempts, 0)))
        # Full jitter
        next_delay = random.random() * next_delay  # noqa: S311 - jitter backoff, non-crypto
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
            except Exception as exc:  # noqa: BLE001 - tolerate optional columns
                logging.getLogger(__name__).debug(
                    "mark dead state failed (optional column): %s", exc
                )
            # DLQ if enabled
            if os.getenv("OUTBOX_DLQ_ENABLED", "0") == "1":
                try:
                    js: JetStreamContext | None = None
                    try:
                        js = nc.jetstream()
                    except Exception:  # noqa: BLE001 - tolerate missing JetStream
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
                        await js.publish("journal.dlq", data, headers={"Nats-Msg-Id": str(ev.id)})
                    else:
                        await nc.publish("journal.dlq", data)
                    metrics_inc("outbox_dlq_total")
                except Exception as exc:  # noqa: BLE001 - DLQ best-effort
                    logging.getLogger(__name__).debug("DLQ publish best-effort failed: %s", exc)
    except Exception as exc:  # noqa: BLE001 - do not crash relay on bookkeeping failure
        # swallow to avoid crashing outbox relay
        logging.getLogger(__name__).debug("schedule retry failed: %s", exc)
