from __future__ import annotations

from uuid import UUID
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.db import get_session
from app.infra.models import Entry
from app.infra.search_pgvector import hybrid_search, semantic_search, upsert_entry_embedding


router = APIRouter(prefix="", tags=["search"])


@router.get("/search")
async def search_hybrid(q: str, k: int = 10, alpha: float = 0.6, s: AsyncSession = Depends(get_session)) -> List[Dict[str, Any]]:
    """Perform hybrid search combining keyword and semantic search.
    
    Args:
        q: Query string.
        k: Number of results to return.
        alpha: Weight for semantic search (0-1).
        s: Database session.
        
    Returns:
        List of search results with scores.
        
    Raises:
        HTTPException: If alpha is out of range.
    """
    if not (0.0 <= alpha <= 1.0):
        raise HTTPException(400, "alpha must be in [0,1]")
    return await hybrid_search(s, q=q, k=k, alpha=alpha)


@router.post("/search/semantic")
async def search_semantic(body: dict, s: AsyncSession = Depends(get_session)) -> List[Dict[str, Any]]:
    """Perform semantic search using embeddings.
    
    Args:
        body: Request body with 'q' or 'query' and optional 'k'.
        s: Database session.
        
    Returns:
        List of semantically similar entries.
        
    Raises:
        HTTPException: If query is missing.
    """
    q = body.get("q") or body.get("query")
    k = int(body.get("k", 10))
    if not q:
        raise HTTPException(400, "Missing 'q'")
    return await semantic_search(s, q=q, k=k)


@router.post("/search/entries/{entry_id}/embed")
async def embed_entry(entry_id: str, s: AsyncSession = Depends(get_session)) -> Dict[str, str]:
    """Generate and store embedding for an entry.
    
    Args:
        entry_id: ID of the entry to embed.
        s: Database session.
        
    Returns:
        Status and entry ID confirmation.
        
    Raises:
        HTTPException: If entry not found or invalid ID.
    """
    try:
        eid = UUID(entry_id)
    except ValueError as e:
        raise HTTPException(404, "Entry not found") from e
    row = (await s.execute(select(Entry).where(Entry.id == eid))).scalars().first()
    if not row:
        raise HTTPException(404, "Entry not found")
    text_source = (row.title or "") + " " + (row.content or "")
    await upsert_entry_embedding(s, entry_id=row.id, text_source=text_source)
    return {"status": "ok", "entry_id": str(row.id)}
