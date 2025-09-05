"""Automatic embedding generation for entries."""

from __future__ import annotations

import logging

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.models import Entry
from app.infra.search_pgvector import upsert_entry_embedding
from app.settings import settings


logger = logging.getLogger(__name__)


async def ensure_embedding_for_entry(entry: Entry, session: AsyncSession) -> None:
    """Ensure embedding exists for entry based on configuration.

    Args:
        entry: Entry to generate embedding for
        session: Database session
    """
    # Extract text for embedding
    text = entry.markdown_content or entry.content or ""
    if not text.strip():
        return  # Skip empty content

    mode = settings.auto_embed_mode.lower()

    if mode == "inline":
        # Generate embedding synchronously (good for tests)
        try:
            await upsert_entry_embedding(session, entry.id, text)
        except Exception as e:
            # Log error but don't fail the request
            logger.warning("Failed to generate embedding for entry %s: %s", entry.id, e)

    elif mode == "event":
        # Publish event for async processing (production)
        try:
            publish_embedding_event(entry.id, text)
        except Exception as e:
            # Log error but don't fail the request
            logger.warning("Failed to publish embedding event for entry %s: %s", entry.id, e)

    # mode == "off" - do nothing


def publish_embedding_event(entry_id: UUID, text: str) -> None:
    """Publish event for async embedding generation.

    This is a placeholder - replace with your actual event bus/NATS publishing.
    """
    # TODO: Replace with actual event publishing
    # For now, just log that we would publish
    logger.info("Would publish embedding event for entry %s", entry_id)

    # Example of what this might look like (removed commented code)
