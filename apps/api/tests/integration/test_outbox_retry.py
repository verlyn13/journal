"""Integration tests for outbox retry scheduling and DLQ (flag-gated)."""

import json
import os

import pytest

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.models import Event
from app.infra.outbox import process_outbox_batch


class MockJS:
    def __init__(self, fail_times=0):
        self.fail_times = fail_times
        self.calls = 0

    async def publish(self, subject, payload, msg_id=None):
        self.calls += 1
        if self.calls <= self.fail_times:
            raise RuntimeError("simulated publish failure")
        return


class MockNC:
    def __init__(self, js):
        self._js = js
        self.published = []

    def jetstream(self):
        return self._js

    async def publish(self, subject, payload):
        # Core publish fallback
        self.published.append((subject, payload))


@pytest.mark.integration()
@pytest.mark.asyncio()
async def test_outbox_retry_schedules_next_attempt(monkeypatch, db_session: AsyncSession):
    os.environ["OUTBOX_RETRY_ENABLED"] = "1"
    os.environ["OUTBOX_DLQ_ENABLED"] = "0"
    os.environ["OUTBOX_RETRY_BASE_SECS"] = "0.01"
    os.environ["OUTBOX_RETRY_MAX_BACKOFF_SECS"] = "0.02"
    os.environ["OUTBOX_RETRY_MAX_ATTEMPTS"] = "3"

    # Insert pending event
    ev = Event(
        aggregate_id=bytes(16),
        aggregate_type="Entry",
        event_type="entry.created",
        event_data={"entry_id": "11111111-1111-1111-1111-111111111111"},
    )
    db_session.add(ev)
    await db_session.commit()

    # Patch nats_conn to return failing JS once
    js = MockJS(fail_times=1)
    nc = MockNC(js)

    async def _ctx():
        class _C:
            async def __aenter__(self):
                return nc

            async def __aexit__(self, *exc):
                return False

        return _C()

    monkeypatch.setattr("app.infra.outbox.nats_conn", _ctx)

    # Run batch -> should fail first publish and schedule retry
    published = await process_outbox_batch(lambda: db_session)
    assert published == 0

    row = (
        await db_session.execute(
            text("SELECT attempts, next_attempt_at, state FROM events WHERE id=:id"),
            {"id": str(ev.id)},
        )
    ).first()
    assert row is not None
    attempts, next_attempt_at, state = row
    assert attempts >= 1
    assert next_attempt_at is not None
    assert state == "pending"


@pytest.mark.integration()
@pytest.mark.asyncio()
async def test_outbox_dead_letter_on_exhaustion(monkeypatch, db_session: AsyncSession):
    os.environ["OUTBOX_RETRY_ENABLED"] = "1"
    os.environ["OUTBOX_DLQ_ENABLED"] = "1"
    os.environ["OUTBOX_RETRY_BASE_SECS"] = "0.01"
    os.environ["OUTBOX_RETRY_MAX_BACKOFF_SECS"] = "0.02"
    os.environ["OUTBOX_RETRY_MAX_ATTEMPTS"] = "1"  # die immediately on first failure

    ev = Event(
        aggregate_id=bytes(16),
        aggregate_type="Entry",
        event_type="entry.created",
        event_data={"entry_id": "11111111-1111-1111-1111-111111111111"},
    )
    db_session.add(ev)
    await db_session.commit()

    dlq_messages = []
    js = MockJS(fail_times=10)
    nc = MockNC(js)

    async def _ctx():
        class _C:
            async def __aenter__(self):
                return nc

            async def __aexit__(self, *exc):
                return False

        return _C()

    # Capture dlq publish via js.publish/publish intercept by substituting jetstream
    orig_js_publish = js.publish

    async def _js_publish(subject, payload, msg_id=None):
        if subject == "journal.dlq":
            dlq_messages.append(json.loads(payload.decode()))
            return None
        return await orig_js_publish(subject, payload, msg_id=msg_id)

    js.publish = _js_publish
    monkeypatch.setattr("app.infra.outbox.nats_conn", _ctx)

    # Run batch -> should mark dead and publish to DLQ
    published = await process_outbox_batch(lambda: db_session)
    assert published == 0

    row = (
        await db_session.execute(
            text("SELECT attempts, state FROM events WHERE id=:id"), {"id": str(ev.id)}
        )
    ).first()
    assert row is not None
    attempts, state = row
    assert attempts >= 1
    assert state == "dead"
    assert dlq_messages, "expected DLQ message"
    assert dlq_messages[0]["event_id"] == str(ev.id)
