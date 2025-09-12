from __future__ import annotations

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.embeddings import get_embedding


# Hybrid search: alpha weights vector similarity; (1-alpha) weights FTS rank.
# Returns list of dicts with entry fields + score breakdown.
async def hybrid_search(s: AsyncSession, q: str, k: int = 10, alpha: float = 0.6):
    q_emb = get_embedding(q)
    sql = text("""
        SELECT e.*, 
               ts_rank_cd(e.fts, plainto_tsquery('english', :q)) AS fts_rank,
               (1 - (ee.embedding <=> :q_embedding)) AS vec_sim,
               ((:alpha) * (1 - (ee.embedding <=> :q_embedding)) + (1-:alpha) * ts_rank_cd(e.fts, plainto_tsquery('english', :q))) AS score
        FROM entries e
        LEFT JOIN entry_embeddings ee ON ee.entry_id = e.id
        WHERE e.is_deleted = FALSE
        ORDER BY score DESC NULLS LAST
        LIMIT :k
    """)
    res = await s.execute(sql, {"q": q, "q_embedding": q_emb, "k": k, "alpha": alpha})
    rows = res.mappings().all()
    # Convert to JSON-able dicts
    out = []
    for r in rows:
        d = dict(r)
        # Remove PG 'fts' from result if present
        d.pop("fts", None)
        out.append(d)
    return out


async def semantic_search(s: AsyncSession, q: str, k: int = 10):
    q_emb = get_embedding(q)
    sql = text("""
        SELECT e.*, (1 - (ee.embedding <=> :q_embedding)) AS score
        FROM entries e
        JOIN entry_embeddings ee ON ee.entry_id = e.id
        WHERE e.is_deleted = FALSE
        ORDER BY score DESC NULLS LAST
        LIMIT :k
    """)
    res = await s.execute(sql, {"q_embedding": q_emb, "k": k})
    rows = res.mappings().all()
    out = []
    for r in rows:
        d = dict(r)
        d.pop("fts", None)
        out.append(d)
    return out


async def upsert_entry_embedding(s: AsyncSession, entry_id, text_source: str):
    emb = get_embedding(text_source)
    sql = text("""
        INSERT INTO entry_embeddings (entry_id, embedding)
        VALUES (:entry_id, :embedding)
        ON CONFLICT (entry_id) DO UPDATE SET embedding = EXCLUDED.embedding
    """)
    await s.execute(sql, {"entry_id": str(entry_id), "embedding": emb})
    await s.commit()
