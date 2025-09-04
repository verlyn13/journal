"""Automatic embedding generation for entries."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.embeddings import get_embedding
from app.infra.models import Entry
from app.infra.search_pgvector import upsert_entry_embedding
from app.settings import settings


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
            embedding = get_embedding(text)
            await upsert_entry_embedding(session, entry.id, text)
        except Exception as e:
            # Log error but don't fail the request
            import logging
            logging.warning(f"Failed to generate embedding for entry {entry.id}: {e}")

    elif mode == "event":
        # Publish event for async processing (production)
        try:
            await publish_embedding_event(entry.id, text)
        except Exception as e:
            # Log error but don't fail the request
            import logging
            logging.warning(f"Failed to publish embedding event for entry {entry.id}: {e}")

    # mode == "off" - do nothing


async def publish_embedding_event(entry_id: UUID, text: str) -> None:
    """Publish event for async embedding generation.
    
    This is a placeholder - replace with your actual event bus/NATS publishing.
    """
    # TODO: Replace with actual event publishing
    # For now, just log that we would publish
    import logging
    logging.info(f"Would publish embedding event for entry {entry_id}")

    # Example of what this might look like:
    # await event_bus.publish("journal.entry.embedding_needed", {
    #     "entry_id": str(entry_id),
    #     "text": text,
    #     "timestamp": datetime.utcnow().isoformat()
    # })
