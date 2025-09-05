from __future__ import annotations

import asyncio
import logging

from sqlmodel import select

from app.infra.conversion import html_to_markdown
from app.infra.db import AsyncSessionLocal
from app.infra.models import Entry


logger = logging.getLogger(__name__)


async def backfill_markdown_content(batch_size: int = 100, dry_run: bool = False):
    if dry_run:
        logger.info("DRY RUN MODE - No changes will be saved")
    async with AsyncSessionLocal() as s:
        while True:
            rows = (
                (
                    await s.execute(
                        select(Entry).where(Entry.markdown_content.is_(None)).limit(batch_size)
                    )
                )
                .scalars()
                .all()
            )
            if not rows:
                break
            for e in rows:
                try:
                    md = html_to_markdown(e.content or "")
                    if not md or not md.strip():
                        logger.warning(f"Empty conversion for entry {e.id}")
                        continue
                    e.markdown_content = md
                    e.content_version = 2
                except Exception as exc:
                    logger.exception("Failed to convert entry %s", e.id)
                    continue
            if not dry_run:
                await s.commit()


if __name__ == "__main__":
    asyncio.run(backfill_markdown_content())
