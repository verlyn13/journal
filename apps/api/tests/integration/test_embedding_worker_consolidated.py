"""
Consolidated test cases for embedding worker functionality.
Combines tests from test_embedding_worker.py and test_embedding_worker_extended.py
"""

import asyncio
import json

from contextlib import asynccontextmanager, suppress
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.models import Entry
from app.workers.embedding_consumer import EmbeddingConsumer


class FakeMsg:
    """Mock message for testing."""

    def __init__(self, payload: dict):
        self.data = json.dumps(payload).encode("utf-8")
        self.acked = False
        self.naked = False

    async def ack(self):
        self.acked = True

    async def nak(self):
        self.naked = True


@pytest.mark.integration()
class TestEmbeddingWorker:
    """Test cases for embedding worker functionality."""

    @pytest.mark.asyncio()
    async def test_embedding_written_on_entry_event(self, monkeypatch, db_session: AsyncSession):
        """Test that embedding is created when entry.created event is received."""
        # Create an entry without embeddings
        e = Entry(
            title="Embed Me", content="Some text", author_id="11111111-1111-1111-1111-111111111111"
        )
        db_session.add(e)
        await db_session.commit()

        # Patch get_session to yield our test db_session
        async def _yield_session():
            yield db_session

        monkeypatch.setattr("app.infra.search_pgvector.get_embedding", lambda txt: [0.0] * 1536)
        monkeypatch.setattr("app.workers.embedding_consumer.get_session", _yield_session)

        consumer = EmbeddingConsumer()

        # Simulate entry.created event message
        msg = FakeMsg({
            "event_type": "entry.created",
            "event_data": {"entry_id": str(e.id)},
        })

        await consumer.process_entry_event(msg)
        assert msg.acked and not msg.naked

        # Verify embedding upsert occurred
        res = await db_session.execute(
            text("SELECT COUNT(*) FROM entry_embeddings WHERE entry_id = :id"), {"id": str(e.id)}
        )
        assert (res.scalar() or 0) == 1

        # Send again: idempotent upsert keeps single row
        msg2 = FakeMsg({
            "event_type": "entry.created",
            "event_data": {"entry_id": str(e.id)},
        })
        await consumer.process_entry_event(msg2)
        res2 = await db_session.execute(
            text("SELECT COUNT(*) FROM entry_embeddings WHERE entry_id = :id"), {"id": str(e.id)}
        )
        assert (res2.scalar() or 0) == 1

    @pytest.mark.asyncio()
    async def test_reindex_job_is_idempotent(self, monkeypatch, db_session: AsyncSession):
        """Test that reindex operation is idempotent."""
        # Seed multiple entries without embeddings
        e1 = Entry(title="alpha", content="a", author_id="11111111-1111-1111-1111-111111111111")
        e2 = Entry(title="beta", content="b", author_id="11111111-1111-1111-1111-111111111111")
        db_session.add_all([e1, e2])
        await db_session.commit()

        async def _yield_session():
            yield db_session

        monkeypatch.setattr("app.infra.search_pgvector.get_embedding", lambda txt: [0.0] * 1536)
        monkeypatch.setattr("app.workers.embedding_consumer.get_session", _yield_session)

        consumer = EmbeddingConsumer()

        # Reindex event
        reindex = FakeMsg({
            "event_type": "embedding.reindex",
            "event_data": {},
        })
        await consumer.process_entry_event(reindex)
        assert reindex.acked

        # Check embeddings exist
        cnt = (
            await db_session.execute(text("SELECT COUNT(*) FROM entry_embeddings"))
        ).scalar() or 0
        assert cnt >= 2

        # Run reindex again: state should be the same, no error
        reindex2 = FakeMsg({"event_type": "embedding.reindex", "event_data": {}})
        await consumer.process_entry_event(reindex2)
        cnt2 = (
            await db_session.execute(text("SELECT COUNT(*) FROM entry_embeddings"))
        ).scalar() or 0
        assert cnt2 == cnt

    @pytest.mark.asyncio()
    async def test_worker_connect_disconnect(self, monkeypatch):
        """Test worker connection and disconnection lifecycle."""
        # Mock NATS connection
        mock_nc = AsyncMock()
        mock_js = MagicMock()
        mock_nc.jetstream = MagicMock(return_value=mock_js)
        mock_nc.is_closed = False

        async def mock_connect(servers):
            return mock_nc

        monkeypatch.setattr("app.workers.embedding_consumer.nats.connect", mock_connect)

        consumer = EmbeddingConsumer()

        # Test connection
        await consumer.connect()
        assert consumer.nc is not None
        assert consumer.js is not None
        mock_nc.jetstream.assert_called_once()

        # Test disconnection
        await consumer.disconnect()
        mock_nc.close.assert_called_once()

    @pytest.mark.asyncio()
    async def test_worker_connection_failure_handling(self, monkeypatch):
        """Test worker handles connection failures gracefully."""

        # Mock NATS to fail connection
        async def mock_connect_fail(servers):
            raise Exception("Connection refused")

        monkeypatch.setattr("app.workers.embedding_consumer.nats.connect", mock_connect_fail)

        consumer = EmbeddingConsumer()

        # Should raise the connection error
        with pytest.raises(Exception, match="Connection refused"):
            await consumer.connect()

    @pytest.mark.asyncio()
    async def test_worker_handles_unknown_event_type(self, monkeypatch):
        """Test worker handles unknown event types gracefully."""
        consumer = EmbeddingConsumer()

        # Create message with unknown event type
        msg = FakeMsg({"event_type": "unknown.event", "event_data": {"some": "data"}})

        await consumer.process_entry_event(msg)

        # Should still ACK unknown events (not retry them)
        assert msg.acked

    @pytest.mark.asyncio()
    async def test_worker_subscription_configuration(self, monkeypatch):
        """Test worker subscribes with correct configuration."""
        subscriptions = []

        mock_nc = AsyncMock()
        mock_js = MagicMock()

        async def mock_subscribe(subject, queue, cb, manual_ack, max_deliver):
            subscriptions.append({
                "subject": subject,
                "queue": queue,
                "manual_ack": manual_ack,
                "max_deliver": max_deliver,
            })
            return AsyncMock()

        mock_js.subscribe = mock_subscribe
        mock_nc.jetstream = MagicMock(return_value=mock_js)

        async def mock_connect(servers):
            return mock_nc

        monkeypatch.setattr("app.workers.embedding_consumer.nats.connect", mock_connect)

        consumer = EmbeddingConsumer()

        # Start consuming (briefly)
        task = asyncio.create_task(consumer.start_consuming())
        await asyncio.sleep(0.1)
        consumer.running = False
        await asyncio.sleep(0.1)
        task.cancel()

        with suppress(asyncio.CancelledError):
            await task

        # Check subscriptions
        assert len(subscriptions) == 2

        # Entry events subscription
        entry_sub = next(s for s in subscriptions if "entry" in s["subject"])
        assert entry_sub["subject"] == "journal.entry.*"
        assert entry_sub["queue"] == "embedding_workers"
        assert entry_sub["manual_ack"] is True
        assert entry_sub["max_deliver"] == 3

        # Reindex events subscription
        reindex_sub = next(s for s in subscriptions if "reindex" in s["subject"])
        assert reindex_sub["subject"] == "journal.reindex.*"
        assert reindex_sub["queue"] == "embedding_workers"
        assert reindex_sub["manual_ack"] is True
        assert reindex_sub["max_deliver"] == 1

    @pytest.mark.asyncio()
    async def test_worker_handles_entry_with_no_content(
        self, monkeypatch, db_session: AsyncSession
    ):
        """Test worker handles entries with empty content."""
        # Create entry with no content
        entry = Entry(title="", content="", author_id="11111111-1111-1111-1111-111111111111")
        db_session.add(entry)
        await db_session.commit()

        async def _yield_session():
            yield db_session

        embeddings_created = []

        async def mock_upsert_embedding(session, entry_id, text):
            embeddings_created.append((entry_id, text))

        monkeypatch.setattr("app.workers.embedding_consumer.get_session", _yield_session)
        monkeypatch.setattr(
            "app.workers.embedding_consumer.upsert_entry_embedding", mock_upsert_embedding
        )

        consumer = EmbeddingConsumer()

        # Send created event
        msg = FakeMsg({"event_type": "entry.created", "event_data": {"entry_id": str(entry.id)}})

        await consumer.process_entry_event(msg)

        assert msg.acked
        assert len(embeddings_created) == 1
        # Should create embedding even for empty content
        assert embeddings_created[0][1] == " "  # title + " " + content

    @pytest.mark.asyncio()
    async def test_worker_handles_database_error_during_upsert(
        self, monkeypatch, db_session: AsyncSession
    ):
        """Test worker handles database errors during embedding upsert."""
        # Create entry
        entry = Entry(
            title="Test", content="Content", author_id="11111111-1111-1111-1111-111111111111"
        )
        db_session.add(entry)
        await db_session.commit()

        async def _yield_session():
            yield db_session

        async def mock_upsert_error(session, entry_id, text):
            raise Exception("Database error")

        monkeypatch.setattr("app.workers.embedding_consumer.get_session", _yield_session)
        monkeypatch.setattr(
            "app.workers.embedding_consumer.upsert_entry_embedding", mock_upsert_error
        )

        consumer = EmbeddingConsumer()

        # Send created event
        msg = FakeMsg({"event_type": "entry.created", "event_data": {"entry_id": str(entry.id)}})

        await consumer.process_entry_event(msg)

        # Should NAK on database error (for retry)
        assert msg.naked
        assert not msg.acked

    @pytest.mark.asyncio()
    async def test_worker_stop_method(self):
        """Test worker stop method sets running flag."""
        consumer = EmbeddingConsumer()
        consumer.running = True

        await consumer.stop()

        assert consumer.running is False

    @pytest.mark.asyncio()
    async def test_worker_handles_partial_reindex_failure(
        self, monkeypatch, db_session: AsyncSession
    ):
        """Test worker continues reindexing even if some entries fail."""
        # Create test entries
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

        embeddings_created = []
        fail_on_second = True
        call_count = 0

        async def mock_upsert_embedding(session, entry_id, text):
            nonlocal call_count
            call_count += 1
            if call_count == 2 and fail_on_second:
                raise Exception("Embedding creation failed")
            embeddings_created.append((entry_id, text))

        monkeypatch.setattr("app.workers.embedding_consumer.get_session", _yield_session)
        monkeypatch.setattr(
            "app.workers.embedding_consumer.upsert_entry_embedding", mock_upsert_embedding
        )

        consumer = EmbeddingConsumer()

        # Send reindex event
        msg = FakeMsg({"event_type": "embedding.reindex", "event_data": {}})

        await consumer.process_entry_event(msg)

        # Should still ACK and process other entries
        assert msg.acked
        assert len(embeddings_created) == 2  # 2 succeeded, 1 failed
