"""Embedding consumer worker that processes entry events and updates embeddings."""

import asyncio
import json
import logging
import os
import random

from typing import Any

import nats
from nats.aio.client import Client as NatsClient
from nats.aio.msg import Msg as NatsMessage
from nats.js import JetStreamContext
from nats.js.api import ConsumerConfig

from sqlalchemy import select, text

from app.infra.db import get_session
from app.infra.embeddings import RateLimitedError
from app.infra.sa_models import Entry
from app.infra.search_pgvector import upsert_entry_embedding
from app.settings import settings
from app.telemetry.metrics_runtime import inc as metrics_inc


logger = logging.getLogger(__name__)


class EmbeddingConsumer:
    """Consumer that processes entry events and updates embeddings."""

    def __init__(self) -> None:
        self.nc: NatsClient | None = None
        self.js: JetStreamContext | None = None
        self.running = False
        self._stop = asyncio.Event()

    async def connect(self) -> None:
        """Connect to NATS and JetStream with bounded retry and jitter."""
        base = float(os.getenv("RETRY_NATS_BASE_SECS", "0.25"))
        factor = float(os.getenv("RETRY_NATS_FACTOR", "2.0"))
        cap = float(os.getenv("RETRY_NATS_MAX_BACKOFF_SECS", "15"))
        max_attempts = int(os.getenv("RETRY_NATS_MAX_ATTEMPTS", "6"))

        attempt = 0
        last_err = None
        while attempt < max_attempts:
            try:
                self.nc = await nats.connect(settings.nats_url)
                # JetStream may be mocked as coroutine in tests
                js = self.nc.jetstream()
                if asyncio.iscoroutine(js):  # support mocked async jetstream in tests
                    js = await js
                self.js = js
                logger.info("Connected to NATS")
                break
            except Exception as e:  # noqa: BLE001 - keep retrying on any connection error
                last_err = e
                attempt += 1
                # Exponential backoff with full jitter
                delay = min(cap, base * (factor ** (attempt - 1)))
                jitter = random.random() * delay  # noqa: S311 - jitter, not crypto
                logger.warning(
                    "NATS connect failed (attempt %s/%s): %s; retrying in %.2fs",
                    attempt,
                    max_attempts,
                    e,
                    jitter,
                )
                await asyncio.sleep(jitter)
        if not self.js or not self.nc:
            logger.error("Failed to connect to NATS after %s attempts: %s", max_attempts, last_err)
            if last_err is not None:
                raise last_err
            raise RuntimeError("Failed to connect to NATS")

    async def disconnect(self) -> None:
        """Disconnect from NATS."""
        if self.nc:
            try:
                await self.nc.close()
            except Exception:  # noqa: BLE001 - ignore non-critical close errors
                logger.debug("NC close failed (mock or already closed)")
            logger.info("Disconnected from NATS")

    async def process_entry_event(self, msg: NatsMessage) -> None:
        """Process an entry event and update embeddings."""
        try:
            # Parse the event data
            data = json.loads(msg.data.decode())
            event_type = data.get("event_type")
            event_data = data.get("event_data", {})
            event_id = data.get("id")

            logger.info("Processing %s event for entry %s", event_type, event_data.get("entry_id"))

            # Idempotency: skip if already processed
            if event_id:
                async for session in get_session():
                    exists = (
                        await session.execute(
                            text("SELECT 1 FROM processed_events WHERE event_id = :e"),
                            {"e": event_id},
                        )
                    ).first()
                    if exists:
                        if hasattr(msg, 'ack'):
                            await msg.ack()
                        return

            # Handle different event types
            if event_type in {"entry.created", "entry.updated"}:
                await self._handle_entry_upsert(event_data)
            elif event_type == "entry.deleted":
                await self._handle_entry_deletion(event_data)
            elif event_type == "embedding.reindex":
                await self._handle_reindex_request(event_data)
            else:
                logger.warning("Unknown event type: %s", event_type)

            # Acknowledge the message
            if hasattr(msg, 'ack'):
                await msg.ack()
            # Record processed outcome
            if event_id:
                async for session in get_session():
                    try:
                        await session.execute(
                            text(
                                "INSERT INTO processed_events(event_id, outcome) VALUES (:e, :o) ON CONFLICT (event_id) DO NOTHING"
                            ),
                            {"e": event_id, "o": event_type},
                        )
                        await session.commit()
                    except Exception:  # noqa: BLE001 - best-effort insert for idempotency
                        await session.rollback()
            logger.debug("Processed and acked %s event", event_type)
            metrics_inc("worker_process_total", {"result": "ok", "type": event_type})

        except json.JSONDecodeError as e:
            logger.exception("JSON decode error")
            # Poison message: DLQ + TERM if enabled
            if os.getenv("OUTBOX_DLQ_ENABLED", "0") == "1":
                await self._publish_dlq(
                    {"error": "json_decode", "raw": msg.data.decode(errors="ignore")}, reason=str(e)
                )
                if hasattr(msg, "term"):
                    await msg.term()
                    metrics_inc("worker_process_total", {"result": "term", "reason": "poison"})
                    return
            # Default: NAK for redelivery
            if hasattr(msg, 'nak'):
                await msg.nak()
            metrics_inc("worker_process_total", {"result": "retry", "reason": "json"})
        except RateLimitedError:
            logger.warning("Embedding provider rate-limited or circuit open; NAK for redelivery")
            if hasattr(msg, 'nak'):
                await msg.nak()
            metrics_inc("worker_process_total", {"result": "retry", "reason": "ratelimited"})
        except Exception:
            logger.exception("Error processing message")
            # Don't ack on error - let NATS retry
            try:
                if hasattr(msg, 'nak'):
                    await msg.nak()
            except Exception:
                # If NAK fails (non-JS), swallow to avoid crash
                logger.exception("Failed to NAK message")
            metrics_inc("worker_process_total", {"result": "retry", "reason": "error"})

    @staticmethod
    async def _handle_entry_upsert(event_data: dict[str, Any]) -> None:
        """Handle entry creation/update by generating and storing embedding."""
        entry_id = event_data.get("entry_id")
        if not entry_id:
            logger.error("No entry_id in event data")
            return

        async for session in get_session():
            try:
                row = (
                    (await session.execute(select(Entry).where(Entry.id == entry_id)))
                    .scalars()
                    .first()
                )
                if not row:
                    logger.error("Entry not found for embedding: %s", entry_id)
                    return
                text_source = (row.title or "") + " " + (row.content or "")
                await upsert_entry_embedding(session, entry_id, text_source)
                await session.commit()
                logger.info("Updated embedding for entry %s", entry_id)
            except Exception:
                logger.exception("Failed to update embedding for entry %s", entry_id)
                await session.rollback()
                raise

    @staticmethod
    async def _handle_entry_deletion(event_data: dict[str, Any]) -> None:
        """Handle entry deletion by removing embedding."""
        entry_id = event_data.get("entry_id")
        if not entry_id:
            logger.error("No entry_id in event data")
            return

        async for session in get_session():
            try:
                # Delete embedding record
                await session.execute(
                    text("DELETE FROM entry_embeddings WHERE entry_id = :entry_id"),
                    {"entry_id": entry_id},
                )
                await session.commit()
                logger.info("Deleted embedding for entry %s", entry_id)
            except Exception:
                logger.exception("Failed to delete embedding for entry %s", entry_id)
                await session.rollback()
                raise

    @staticmethod
    async def _handle_reindex_request(_event_data: dict[str, Any]) -> None:
        """Handle bulk reindexing request."""
        logger.info("Starting bulk reindex of embeddings")

        async for session in get_session():
            try:
                # Get all entries that need reindexing
                result = await session.execute(
                    select(Entry.id, Entry.title, Entry.content).where(Entry.is_deleted == False)  # noqa: E712 - SQLAlchemy requires ==
                )
                rows = result.fetchall()

                logger.info("Reindexing %s entries", len(rows))

                # Process each entry
                for i, (entry_id, title, content) in enumerate(rows, 1):
                    try:
                        text_source = (title or "") + " " + (content or "")
                        await upsert_entry_embedding(session, entry_id, text_source)
                        if i % 100 == 0:
                            logger.info("Processed %s/%s entries", i, len(rows))
                    except Exception:
                        logger.exception("Failed to reindex entry %s", entry_id)
                        # Continue with next entry

                await session.commit()
                logger.info("Completed bulk reindex of %s entries", len(rows))

            except Exception:
                logger.exception("Bulk reindex failed")
                await session.rollback()
                raise

    async def start_consuming(self) -> None:
        """Start consuming messages from NATS."""
        if not self.nc or not self.js:
            await self.connect()

        self.running = True
        self._stop.clear()

        try:
            # Subscribe to entry events
            if self.js is None:
                raise RuntimeError("JetStream not initialized")
            await self.js.subscribe(
                subject="journal.entry.*",
                queue="embedding_workers",
                cb=self.process_entry_event,
                manual_ack=True,
                config=ConsumerConfig(max_deliver=int(os.getenv("JS_MAX_DELIVER", "3"))),
            )

            # Subscribe to reindex events
            await self.js.subscribe(
                subject="journal.reindex.*",
                queue="embedding_workers",
                cb=self.process_entry_event,
                manual_ack=True,
                config=ConsumerConfig(max_deliver=1),  # Don't retry reindex requests
            )

            logger.info("Started consuming messages")

            # Keep running until stopped without polling
            await self._stop.wait()

        except Exception:
            logger.exception("Error in message consumption")
            raise
        finally:
            await self.disconnect()

    async def stop(self) -> None:
        """Stop consuming messages."""
        self.running = False
        self._stop.set()
        logger.info("Stopping message consumption")

    async def _publish_dlq(self, envelope: dict[str, Any], reason: str = "") -> None:
        """Publish DLQ message with fallback to nats_conn if needed."""
        try:
            payload = json.dumps({**envelope, "reason": reason}).encode("utf-8")
            if self.nc:
                js = None
                try:
                    js = self.nc.jetstream()
                except Exception:  # noqa: BLE001 - no JetStream
                    js = None
                if js:
                    try:
                        await js.publish("journal.dlq", payload)
                    except Exception:  # noqa: BLE001 - JetStream publish failed, fallback to core
                        # Fallback to core publish if JetStream not available
                        await self.nc.publish("journal.dlq", payload)
                else:
                    await self.nc.publish("journal.dlq", payload)
            else:
                # Import within function to honor monkeypatching in tests
                from app.infra.nats_bus import nats_conn as _nats_conn  # noqa: PLC0415

                async with _nats_conn() as nc:
                    js = None
                    try:
                        js = nc.jetstream()
                    except Exception:  # noqa: BLE001 - no JetStream
                        js = None
                    if js:
                        await js.publish("journal.dlq", payload)
                    else:
                        await nc.publish("journal.dlq", payload)
        except Exception:
            logger.exception("Failed to publish to DLQ")


async def main() -> None:
    """Main entry point for the embedding consumer worker."""
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    consumer = EmbeddingConsumer()

    try:
        await consumer.start_consuming()
    except KeyboardInterrupt:
        logger.info("Received interrupt signal")
        await consumer.stop()
    except Exception:
        logger.exception("Worker failed")
        raise


if __name__ == "__main__":
    asyncio.run(main())
