"""
Integration tests for embedding worker functionality.
"""

import asyncio
import contextlib
import json

from unittest.mock import AsyncMock

import pytest

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.models import Entry
from app.workers.embedding_consumer import EmbeddingConsumer


@pytest.mark.integration()
@pytest.mark.asyncio()
async def test_worker_connection_retry(monkeypatch):
    """Test worker connection retry logic."""
    # Mock NATS connection to fail initially then succeed
    connect_attempts = []

    class MockNC:
        def __init__(self):
            self.subscriptions = []

        async def connect(self, servers):
            connect_attempts.append(servers)
            if len(connect_attempts) < 2:
                raise Exception("Connection failed")
            return self

        async def jetstream(self):
            js = AsyncMock()
            js.subscribe = AsyncMock(return_value=AsyncMock())
            return js

    # Mock the nats.connect function to return a MockNC instance
    async def mock_connect(servers):
        nc = MockNC()
        await nc.connect(servers)
        return nc

    monkeypatch.setattr("app.workers.embedding_consumer.nats.connect", mock_connect)

    consumer = EmbeddingConsumer()

    # Mock the process_entry_event to stop after connection
    consumer.process_entry_event = AsyncMock()

    # Run briefly to test connection retry
    task = asyncio.create_task(consumer.start_consuming())
    # Wait longer to allow retry attempts
    await asyncio.sleep(2.0)  # Allow time for retry
    task.cancel()

    with contextlib.suppress(asyncio.CancelledError):
        await task

    # Should have attempted connection at least twice (initial + retry)
    assert len(connect_attempts) >= 2


@pytest.mark.integration()
@pytest.mark.asyncio()
async def test_worker_handles_malformed_message(monkeypatch, db_session: AsyncSession):
    """Test worker handles malformed messages gracefully."""

    # Patch get_session
    async def _yield_session():
        yield db_session

    monkeypatch.setattr("app.workers.embedding_consumer.get_session", _yield_session)
    monkeypatch.setattr("app.infra.search_pgvector.get_embedding", lambda txt: [0.0] * 1536)

    consumer = EmbeddingConsumer()

    # Test with invalid JSON
    class BadMsg:
        data = b"not valid json"
        acked = False
        naked = False

        async def ack(self):
            self.acked = True

        async def nak(self):
            self.naked = True

    msg = BadMsg()
    await consumer.process_entry_event(msg)

    # Should NAK the bad message
    assert msg.naked
    assert not msg.acked


@pytest.mark.integration()
@pytest.mark.asyncio()
async def test_worker_handles_missing_entry(monkeypatch, db_session: AsyncSession):
    """Test worker handles missing entry gracefully."""

    async def _yield_session():
        yield db_session

    monkeypatch.setattr("app.workers.embedding_consumer.get_session", _yield_session)

    consumer = EmbeddingConsumer()

    # Message for non-existent entry
    class MissingMsg:
        data = json.dumps({
            "event_type": "entry.created",
            "event_data": {"entry_id": "99999999-9999-9999-9999-999999999999"},
        }).encode("utf-8")
        acked = False
        naked = False

        async def ack(self):
            self.acked = True

        async def nak(self):
            self.naked = True

    msg = MissingMsg()
    await consumer.process_entry_event(msg)

    # Should ACK (not retry) for missing entry
    assert msg.acked
    assert not msg.naked


@pytest.mark.integration()
@pytest.mark.asyncio()
async def test_worker_handles_entry_deleted_event(monkeypatch, db_session: AsyncSession):
    """Test worker handles entry.deleted event."""
    # Create an entry with embedding
    entry = Entry(
        title="To Delete", content="Content", author_id="11111111-1111-1111-1111-111111111111"
    )
    db_session.add(entry)
    await db_session.commit()

    # Add embedding (must be 1536 dimensions)
    embedding = [0.1] * 1536  # Create 1536-dimensional vector
    embedding_str = "[" + ",".join(str(x) for x in embedding) + "]"
    await db_session.execute(
        text(f"""
            INSERT INTO entry_embeddings(entry_id, embedding)
            VALUES (:id, '{embedding_str}'::vector)
        """),
        {"id": str(entry.id)},
    )
    await db_session.commit()

    # Verify embedding exists
    result = await db_session.execute(
        text("SELECT COUNT(*) FROM entry_embeddings WHERE entry_id = :id"), {"id": str(entry.id)}
    )
    assert result.scalar() == 1

    async def _yield_session():
        yield db_session

    monkeypatch.setattr("app.workers.embedding_consumer.get_session", _yield_session)

    consumer = EmbeddingConsumer()

    # Send deleted event
    class DeleteMsg:
        data = json.dumps({
            "event_type": "entry.deleted",
            "event_data": {"entry_id": str(entry.id)},
        }).encode("utf-8")
        acked = False

        async def ack(self):
            self.acked = True

    msg = DeleteMsg()
    await consumer.process_entry_event(msg)
    assert msg.acked

    # Embedding should be removed
    result = await db_session.execute(
        text("SELECT COUNT(*) FROM entry_embeddings WHERE entry_id = :id"), {"id": str(entry.id)}
    )
    assert result.scalar() == 0


@pytest.mark.integration()
@pytest.mark.asyncio()
async def test_worker_rate_limit_nak(monkeypatch, db_session: AsyncSession):
    """Test worker NAKs on rate limit (circuit open) scenario."""
    # Provide a real entry
    entry = Entry(title="RL", content="Content", author_id="11111111-1111-1111-1111-111111111111")
    db_session.add(entry)
    await db_session.commit()

    async def _yield_session():
        yield db_session

    # Monkeypatch embedding call to simulate RateLimited by raising a
    # generic error. The worker treats RateLimited explicitly; this simulates
    # via raising RuntimeError and checking the NAK path.
    def _raise_rl(_txt):
        raise RuntimeError("RateLimited")

    monkeypatch.setattr("app.workers.embedding_consumer.get_session", _yield_session)
    monkeypatch.setattr("app.infra.search_pgvector.get_embedding", _raise_rl)

    consumer = EmbeddingConsumer()

    class Msg:
        data = json.dumps({
            "event_type": "entry.updated",
            "event_data": {"entry_id": str(entry.id)},
        }).encode("utf-8")
        naks = 0

        async def nak(self):
            self.naks += 1

    msg = Msg()
    await consumer.process_entry_event(msg)
    assert msg.naks >= 1


@pytest.mark.integration()
@pytest.mark.asyncio()
async def test_worker_poison_to_dlq(monkeypatch):
    import os

    """When DLQ enabled, poison messages go to DLQ and are TERMed if possible."""
    os.environ["OUTBOX_DLQ_ENABLED"] = "1"

    dlq = []

    class JS:
        async def publish(self, subject, payload, msg_id=None):
            if subject == "journal.dlq":
                dlq.append(json.loads(payload.decode()))

    class NC:
        def jetstream(self):
            return JS()

    def _ctx():
        class _C:
            async def __aenter__(self):
                return NC()

            async def __aexit__(self, *exc):
                return False

        return _C()

    monkeypatch.setattr("app.infra.nats_bus.nats_conn", _ctx)
    consumer = EmbeddingConsumer()

    class BadMsg:
        data = b"{not json"  # malformed
        termed = 0

        async def term(self):
            self.termed += 1

        async def nak(self):
            # Should not be called when DLQ is enabled and term available
            pass

    msg = BadMsg()
    await consumer.process_entry_event(msg)
    assert msg.termed == 1
    assert dlq, "Expected DLQ publish"


@pytest.mark.integration()
@pytest.mark.asyncio()
async def test_worker_handles_entry_updated_event(monkeypatch, db_session: AsyncSession):
    """Test worker handles entry.updated event."""
    # Create an entry
    entry = Entry(
        title="Original",
        content="Original content",
        author_id="11111111-1111-1111-1111-111111111111",
    )
    db_session.add(entry)
    await db_session.commit()

    async def _yield_session():
        yield db_session

    monkeypatch.setattr("app.workers.embedding_consumer.get_session", _yield_session)
    monkeypatch.setattr("app.infra.search_pgvector.get_embedding", lambda txt: [0.5] * 1536)

    consumer = EmbeddingConsumer()

    # Send updated event
    class UpdateMsg:
        data = json.dumps({
            "event_type": "entry.updated",
            "event_data": {"entry_id": str(entry.id)},
        }).encode("utf-8")
        acked = False

        async def ack(self):
            self.acked = True

    msg = UpdateMsg()
    await consumer.process_entry_event(msg)
    assert msg.acked

    # Embedding should exist
    result = await db_session.execute(
        text("SELECT COUNT(*) FROM entry_embeddings WHERE entry_id = :id"), {"id": str(entry.id)}
    )
    assert result.scalar() == 1


@pytest.mark.integration()
@pytest.mark.asyncio()
async def test_worker_batch_processing(monkeypatch, db_session: AsyncSession):
    """Test worker can process multiple messages in sequence."""
    # Create multiple entries
    entries = []
    for i in range(3):
        entry = Entry(
            title=f"Entry {i}",
            content=f"Content {i}",
            author_id="11111111-1111-1111-1111-111111111111",
        )
        db_session.add(entry)
        entries.append(entry)
    await db_session.commit()

    async def _yield_session():
        yield db_session

    monkeypatch.setattr("app.workers.embedding_consumer.get_session", _yield_session)
    monkeypatch.setattr("app.infra.search_pgvector.get_embedding", lambda txt: [0.0] * 1536)

    consumer = EmbeddingConsumer()

    # Process events for all entries
    for entry in entries:

        class Msg:
            data = json.dumps({
                "event_type": "entry.created",
                "event_data": {"entry_id": str(entry.id)},
            }).encode("utf-8")
            acked = False

            async def ack(self):
                self.acked = True

        msg = Msg()
        await consumer.process_entry_event(msg)
        assert msg.acked

    # All entries should have embeddings
    result = await db_session.execute(text("SELECT COUNT(*) FROM entry_embeddings"))
    assert result.scalar() >= 3
