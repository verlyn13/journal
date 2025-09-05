"""
Backfill script for converting entries to Markdown format.

This script processes existing entries and ensures they have proper
Markdown formatting and metadata.
"""

import asyncio

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from sqlmodel import select

from app.infra.db import get_async_engine
from app.infra.models import Entry


async def backfill_markdown_content(
    session: AsyncSession = None, batch_size: int = 100, dry_run: bool = False
) -> int:
    """
    Convert legacy HTML entries to Markdown in batches.
    Returns the number of updated rows.
    """
    if session is None:
        engine = get_async_engine()
        sm = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
        async with sm() as session:
            return await backfill_markdown_content(session, batch_size, dry_run)

    # SELECT entries that need conversion (content_version = 1 and no markdown_content)
    query = (
        select(Entry)
        .where((Entry.content_version == 1) & (Entry.markdown_content.is_(None)))
        .limit(batch_size)
    )

    result = await session.execute(query)
    entries = result.scalars().all()

    if dry_run:
        return len(entries)

    updated = 0
    for entry in entries:
        # Simple conversion: treat existing content as markdown and update version
        entry.markdown_content = entry.content
        entry.content_version = 2
        session.add(entry)
        updated += 1

    await session.commit()
    return updated


import logging


async def main() -> None:
    """Main entry point for the backfill script."""
    engine = get_async_engine()

    async with AsyncSession(engine) as session:
        count = await backfill_markdown_content(session, dry_run=True)
        logging.getLogger(__name__).info("Would process %s entries", count)

        # For a real run, call without dry_run and report stats


if __name__ == "__main__":  # pragma: no cover
    asyncio.run(main())
