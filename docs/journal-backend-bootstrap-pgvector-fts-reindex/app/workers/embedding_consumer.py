from __future__ import annotations
import asyncio, json, math
from typing import Any, AsyncIterator
from nats.aio.client import Client as NATS
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.settings import settings
from app.infra.db import AsyncSessionLocal
from app.infra.models import Entry
from app.infra.search_pgvector import upsert_entry_embedding

SUB_ENTRY = "journal.entry"
SUB_REINDEX = "journal.reindex"

async def _iter_entries(session: AsyncSession, batch_size: int = 200) -> AsyncIterator[list[Entry]]:
    # Simple batch scan
    offset = 0
    while True:
        rows = (await session.execute(
            select(Entry).where(Entry.is_deleted == False).order_by(Entry.created_at).offset(offset).limit(batch_size)
        )).scalars().all()
        if not rows:
            break
        yield rows
        offset += len(rows)

async def handle_event(msg_data: dict[str, Any], s: AsyncSession):
    etype = msg_data.get("type")
    if etype in ("entry.created", "entry.updated"):
        eid = msg_data.get("data", {}).get("id") or msg_data.get("aggregate_id") or msg_data.get("entry_id")
        if not eid:
            return
        row = (await s.execute(select(Entry).where(Entry.id == eid))).scalars().first()
        if not row: 
            return
        text_source = (row.title or "") + " " + (str(row.content) if row.content else "")
        await upsert_entry_embedding(s, entry_id=row.id, text_source=text_source)

async def main():
    nc = NATS()
    await nc.connect(servers=[settings.nats_url])
    js = nc.jetstream()

    # Durable consumers
    await js.subscribe(SUB_ENTRY, durable="embed-worker", cb=lambda m: asyncio.create_task(on_entry(nc, m)))
    await js.subscribe(SUB_REINDEX, durable="embed-reindexer", cb=lambda m: asyncio.create_task(on_reindex(nc, m)))

    print("Embedding consumer running. Subjects:", SUB_ENTRY, SUB_REINDEX)
    try:
        while True:
            await asyncio.sleep(3600)
    finally:
        await nc.drain()
        await nc.close()

async def on_entry(nc, msg):
    try:
        data = json.loads(msg.data.decode())
        async with AsyncSessionLocal() as s:
            await handle_event(data, s)
        await msg.ack()
    except Exception as e:
        # In production: log error with details; consider NAK for retry
        await msg.ack()

async def on_reindex(nc, msg):
    try:
        params = json.loads(msg.data.decode()) if msg.data else {}
    except Exception:
        params = {}
    batch = int(params.get("batch", 200))
    async with AsyncSessionLocal() as s:
        async for rows in _iter_entries(s, batch_size=batch):
            for row in rows:
                text_source = (row.title or "") + " " + (str(row.content) if row.content else "")
                await upsert_entry_embedding(s, entry_id=row.id, text_source=text_source)
    await msg.ack()

if __name__ == "__main__":
    asyncio.run(main())
