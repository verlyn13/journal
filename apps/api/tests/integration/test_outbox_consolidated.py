"""
Extended test cases for outbox pattern implementation.
"""

import asyncio
import json
import pytest
from uuid import uuid4
from datetime import datetime
from contextlib import asynccontextmanager
from unittest.mock import AsyncMock, MagicMock
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.infra.outbox import process_outbox_batch, relay_outbox, SUBJECT_MAP
from app.infra.models import Event


@pytest.mark.integration()
class TestOutboxPatternExtended:
    """Extended test coverage for outbox pattern."""

    @pytest.mark.asyncio()
    async def test_process_outbox_batch_publishes_events(
        self, db_session: AsyncSession, monkeypatch
    ):
        """Test that process_outbox_batch publishes unpublished events."""
        # Create unpublished events
        events = []
        for i in range(3):
            event = Event(
                aggregate_id=uuid4(),
                aggregate_type="Entry",
                event_type=f"entry.created.{i}",
                event_data={"index": i},
                occurred_at=datetime.utcnow(),
                published_at=None,
            )
            db_session.add(event)
            events.append(event)
        await db_session.commit()

        # Mock NATS connection
        published_messages = []

        class MockNC:
            async def __aenter__(self):
                return self

            async def __aexit__(self, *args):
                pass

            async def publish(self, subject, payload):
                published_messages.append((subject, json.loads(payload)))

        def mock_nats_conn():
            return MockNC()

        monkeypatch.setattr("app.infra.outbox.nats_conn", mock_nats_conn)

        # Mock session factory
        @asynccontextmanager
        async def mock_session_factory():
            yield db_session

        # Process batch
        count = await process_outbox_batch(mock_session_factory)

        # Verify all events were published
        assert count == 3
        assert len(published_messages) == 3

        # Check messages have correct subjects
        for msg in published_messages:
            assert msg[0] == "journal.entry"  # From SUBJECT_MAP
            assert "event_type" in msg[1]
            assert "event_data" in msg[1]
            assert "ts" in msg[1]

        # Verify events are marked as published
        result = await db_session.execute(select(Event).where(Event.published_at.is_not(None)))
        published_events = result.scalars().all()
        assert len(published_events) == 3

    @pytest.mark.asyncio()
    async def test_process_outbox_batch_with_no_events(self, db_session: AsyncSession, monkeypatch):
        """Test process_outbox_batch when there are no unpublished events."""
        # Mock NATS connection
        published_messages = []

        class MockNC:
            async def __aenter__(self):
                return self

            async def __aexit__(self, *args):
                pass

            async def publish(self, subject, payload):
                published_messages.append((subject, payload))

        def mock_nats_conn():
            return MockNC()

        monkeypatch.setattr("app.infra.outbox.nats_conn", mock_nats_conn)

        # Mock session factory
        @asynccontextmanager
        async def mock_session_factory():
            yield db_session

        # Process batch (no events to process)
        count = await process_outbox_batch(mock_session_factory)

        assert count == 0
        assert len(published_messages) == 0

    @pytest.mark.asyncio()
    async def test_process_outbox_batch_respects_limit(self, db_session: AsyncSession, monkeypatch):
        """Test that process_outbox_batch respects the batch limit."""
        # Create more events than the limit (100)
        for i in range(105):
            event = Event(
                aggregate_id=uuid4(),
                aggregate_type="Entry",
                event_type="entry.created",
                event_data={"index": i},
                occurred_at=datetime.utcnow(),
                published_at=None,
            )
            db_session.add(event)
        await db_session.commit()

        # Mock NATS connection
        published_messages = []

        class MockNC:
            async def __aenter__(self):
                return self

            async def __aexit__(self, *args):
                pass

            async def publish(self, subject, payload):
                published_messages.append((subject, payload))

        def mock_nats_conn():
            return MockNC()

        monkeypatch.setattr("app.infra.outbox.nats_conn", mock_nats_conn)

        # Mock session factory
        @asynccontextmanager
        async def mock_session_factory():
            yield db_session

        # Process batch
        count = await process_outbox_batch(mock_session_factory)

        # Should only process 100 events (the limit)
        assert count == 100
        assert len(published_messages) == 100

    @pytest.mark.asyncio()
    async def test_subject_mapping_for_different_aggregates(
        self, db_session: AsyncSession, monkeypatch
    ):
        """Test that different aggregate types get mapped to correct subjects."""
        # Create events with different aggregate types
        event1 = Event(
            aggregate_id=uuid4(),
            aggregate_type="Entry",  # In SUBJECT_MAP
            event_type="entry.created",
            event_data={},
            occurred_at=datetime.utcnow(),
        )
        event2 = Event(
            aggregate_id=uuid4(),
            aggregate_type="UnknownType",  # Not in SUBJECT_MAP
            event_type="unknown.event",
            event_data={},
            occurred_at=datetime.utcnow(),
        )
        db_session.add_all([event1, event2])
        await db_session.commit()

        # Mock NATS connection
        published_messages = []

        class MockNC:
            async def __aenter__(self):
                return self

            async def __aexit__(self, *args):
                pass

            async def publish(self, subject, payload):
                published_messages.append((subject, json.loads(payload)))

        def mock_nats_conn():
            return MockNC()

        monkeypatch.setattr("app.infra.outbox.nats_conn", mock_nats_conn)

        # Mock session factory
        @asynccontextmanager
        async def mock_session_factory():
            yield db_session

        # Process batch
        await process_outbox_batch(mock_session_factory)

        # Check subjects
        subjects = [msg[0] for msg in published_messages]
        assert "journal.entry" in subjects  # Entry type
        assert "journal.events" in subjects  # Default for unknown type

    @pytest.mark.asyncio()
    async def test_event_payload_structure(self, db_session: AsyncSession, monkeypatch):
        """Test that published event payloads have correct structure."""
        event_data = {
            "title": "Test Entry",
            "content": "Test content",
            "metadata": {"key": "value"},
        }

        event = Event(
            aggregate_id=uuid4(),
            aggregate_type="Entry",
            event_type="entry.created",
            event_data=event_data,
            occurred_at=datetime(2024, 6, 15, 14, 30, 0),
        )
        db_session.add(event)
        await db_session.commit()

        # Mock NATS connection
        published_messages = []

        class MockNC:
            async def __aenter__(self):
                return self

            async def __aexit__(self, *args):
                pass

            async def publish(self, subject, payload):
                published_messages.append((subject, json.loads(payload)))

        def mock_nats_conn():
            return MockNC()

        monkeypatch.setattr("app.infra.outbox.nats_conn", mock_nats_conn)

        # Mock session factory
        @asynccontextmanager
        async def mock_session_factory():
            yield db_session

        # Process batch
        await process_outbox_batch(mock_session_factory)

        # Verify payload structure
        assert len(published_messages) == 1
        payload = published_messages[0][1]

        assert "id" in payload
        assert payload["id"] == str(event.id)
        assert payload["event_type"] == "entry.created"
        assert payload["event_data"] == event_data
        assert payload["ts"] == "2024-06-15T14:30:00"

    @pytest.mark.asyncio()
    async def test_relay_outbox_continuous_processing(self, db_session: AsyncSession, monkeypatch):
        """Test that relay_outbox continuously processes events."""
        # Create initial event
        event1 = Event(
            aggregate_id=uuid4(),
            aggregate_type="Entry",
            event_type="entry.created",
            event_data={},
            occurred_at=datetime.utcnow(),
        )
        db_session.add(event1)
        await db_session.commit()

        # Mock NATS connection
        published_messages = []

        class MockNC:
            async def __aenter__(self):
                return self

            async def __aexit__(self, *args):
                pass

            async def publish(self, subject, payload):
                published_messages.append((subject, payload))

        def mock_nats_conn():
            return MockNC()

        monkeypatch.setattr("app.infra.outbox.nats_conn", mock_nats_conn)

        # Mock session factory
        @asynccontextmanager
        async def mock_session_factory():
            yield db_session

        # Run relay in a task and cancel it after processing
        task = asyncio.create_task(relay_outbox(mock_session_factory, poll_seconds=0.01))

        # Wait for event to be processed
        await asyncio.sleep(0.1)

        # Cancel the task
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass

        # Verify event was published
        assert len(published_messages) == 1

    @pytest.mark.asyncio()
    async def test_process_outbox_batch_idempotency(self, db_session: AsyncSession, monkeypatch):
        """Test that already published events are not re-published."""
        # Create mix of published and unpublished events
        published_event = Event(
            aggregate_id=uuid4(),
            aggregate_type="Entry",
            event_type="entry.published",
            event_data={},
            occurred_at=datetime.utcnow(),
            published_at=datetime.utcnow(),  # Already published
        )
        unpublished_event = Event(
            aggregate_id=uuid4(),
            aggregate_type="Entry",
            event_type="entry.unpublished",
            event_data={},
            occurred_at=datetime.utcnow(),
            published_at=None,  # Not published
        )
        db_session.add_all([published_event, unpublished_event])
        await db_session.commit()

        # Mock NATS connection
        published_messages = []

        class MockNC:
            async def __aenter__(self):
                return self

            async def __aexit__(self, *args):
                pass

            async def publish(self, subject, payload):
                published_messages.append(json.loads(payload))

        def mock_nats_conn():
            return MockNC()

        monkeypatch.setattr("app.infra.outbox.nats_conn", mock_nats_conn)

        # Mock session factory
        @asynccontextmanager
        async def mock_session_factory():
            yield db_session

        # Process batch
        count = await process_outbox_batch(mock_session_factory)

        # Should only publish the unpublished event
        assert count == 1
        assert len(published_messages) == 1
        assert published_messages[0]["event_type"] == "entry.unpublished"

    @pytest.mark.asyncio()
    async def test_process_outbox_batch_transaction_commit(
        self, db_session: AsyncSession, monkeypatch
    ):
        """Test that published_at updates are committed in transaction."""
        # Create event
        event = Event(
            aggregate_id=uuid4(),
            aggregate_type="Entry",
            event_type="entry.created",
            event_data={},
            occurred_at=datetime.utcnow(),
        )
        db_session.add(event)
        await db_session.commit()
        event_id = event.id

        # Mock NATS connection
        class MockNC:
            async def __aenter__(self):
                return self

            async def __aexit__(self, *args):
                pass

            async def publish(self, subject, payload):
                pass

        def mock_nats_conn():
            return MockNC()

        monkeypatch.setattr("app.infra.outbox.nats_conn", mock_nats_conn)

        # Mock session factory
        @asynccontextmanager
        async def mock_session_factory():
            yield db_session

        # Process batch
        await process_outbox_batch(mock_session_factory)

        # Verify event is marked as published in database
        result = await db_session.execute(select(Event).where(Event.id == event_id))
        updated_event = result.scalar_one()
        assert updated_event.published_at is not None

    @pytest.mark.asyncio()
    async def test_relay_outbox_error_handling(self, db_session: AsyncSession, monkeypatch):
        """Test that relay_outbox handles errors gracefully."""
        # Create event
        event = Event(
            aggregate_id=uuid4(),
            aggregate_type="Entry",
            event_type="entry.created",
            event_data={},
            occurred_at=datetime.utcnow(),
        )
        db_session.add(event)
        await db_session.commit()

        # Mock NATS to fail then succeed
        call_count = 0

        class MockNC:
            async def __aenter__(self):
                return self

            async def __aexit__(self, *args):
                pass

            async def publish(self, subject, payload):
                nonlocal call_count
                call_count += 1
                if call_count == 1:
                    raise Exception("NATS connection failed")
                # Second attempt succeeds

        def mock_nats_conn():
            return MockNC()

        monkeypatch.setattr("app.infra.outbox.nats_conn", mock_nats_conn)

        # Mock session factory
        @asynccontextmanager
        async def mock_session_factory():
            yield db_session

        # Run relay in a task
        task = asyncio.create_task(relay_outbox(mock_session_factory, poll_seconds=0.01))

        # Wait for retries
        await asyncio.sleep(0.2)

        # Cancel the task
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass

        # Should have attempted twice (error then retry)
        assert call_count >= 2
