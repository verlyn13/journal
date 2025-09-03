from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.db import get_session
from app.infra.models import Entry
from app.infra.search_pgvector import hybrid_search, semantic_search, upsert_entry_embedding


router = APIRouter(prefix="", tags=["search"])


@router.get("/search")
async def search_hybrid(q: str, k: int = 10, alpha: float = 0.6, s: AsyncSession = Depends(get_session)):
    if not (0.0 <= alpha <= 1.0):
        raise HTTPException(400, "alpha must be in [0,1]")
    return await hybrid_search(s, q=q, k=k, alpha=alpha)


@router.post("/search/semantic")
async def search_semantic(body: dict, s: AsyncSession = Depends(get_session)):
    q = body.get("q") or body.get("query")
    k = int(body.get("k", 10))
    if not q:
        raise HTTPException(400, "Missing 'q'")
    return await semantic_search(s, q=q, k=k)


@router.post("/search/entries/{entry_id}/embed")
async def embed_entry(entry_id: str, s: AsyncSession = Depends(get_session)):
    try:
        eid = UUID(entry_id)
    except ValueError:
        raise HTTPException(404, "Entry not found")
    row = (await s.execute(select(Entry).where(Entry.id == eid))).scalars().first()
    if not row:
        raise HTTPException(404, "Entry not found")
    text_source = (row.title or "") + " " + (row.content or "")
    await upsert_entry_embedding(s, entry_id=row.id, text_source=text_source)
    return {"status": "ok", "entry_id": str(row.id)}
