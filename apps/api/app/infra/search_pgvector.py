from __future__ import annotations

import asyncio
import logging
import os
import random


# Standard library imports
from typing import Any

# Third-party imports
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

# Local imports
from app.infra.embeddings import get_embedding


def _vec_literal(vec: list[float]) -> str:
    """Render a pgvector literal string: '[v1, v2, ...]'."""
    return "[" + ", ".join(f"{v:.8f}" for v in vec) + "]"


async def hybrid_search(
    s: AsyncSession, q: str, k: int = 10, alpha: float = 0.6
) -> list[dict[str, Any]]:
    """Hybrid search with graceful degradation.

    Combines FTS and vector similarity. If embeddings don't exist, falls back to FTS only.
    Uses COALESCE to handle missing embeddings gracefully.
    """
    if not q.strip():
        return []

    # Get query embedding (with error handling)
    try:
        q_emb = get_embedding(q)
        q_vec = _vec_literal(q_emb)
    except Exception:  # noqa: BLE001 - fall back to keyword search
        # Fall back to keyword-only search if embedding fails
        return await keyword_search(s, q, k)

    sql = text(
        """
        SELECT e.*,
               ts_rank_cd(e.search_vector, plainto_tsquery('english', :q)) AS fts_rank,
               COALESCE(1 - (ee.embedding <=> CAST(:qvec AS vector(1536))), 0.0) AS vec_sim,
               ((:alpha) * COALESCE(1 - (ee.embedding <=> CAST(:qvec AS vector(1536))), 0.0)
                 + (1-:alpha) * ts_rank_cd(e.search_vector, plainto_tsquery('english', :q))) AS score
        FROM entries e
        LEFT JOIN entry_embeddings ee ON ee.entry_id = e.id
        WHERE e.is_deleted = FALSE
          AND e.search_vector @@ plainto_tsquery('english', :q)
        ORDER BY score DESC NULLS LAST
        LIMIT :k
        """
    )
    res = await s.execute(sql, {"q": q, "k": k, "alpha": alpha, "qvec": q_vec})
    rows = res.mappings().all()
    return [dict(r) for r in rows]


async def semantic_search(s: AsyncSession, q: str, k: int = 10) -> list[dict[str, Any]]:
    """Semantic search with graceful degradation.

    Returns empty list if no embeddings exist instead of failing.
    """
    if not q.strip():
        return []

    try:
        q_emb = get_embedding(q)
        q_vec = _vec_literal(q_emb)
    except Exception:  # noqa: BLE001 - embedding generation failed
        # Return empty if embedding generation fails
        return []

    sql = text(
        """
        SELECT e.*, (1 - (ee.embedding <=> CAST(:qvec AS vector(1536)))) AS vec_sim
        FROM entries e
        INNER JOIN entry_embeddings ee ON ee.entry_id = e.id
        WHERE e.is_deleted = FALSE
        ORDER BY vec_sim DESC
        LIMIT :k
        """
    )
    res = await s.execute(sql, {"k": k, "qvec": q_vec})
    return [dict(r) for r in res.mappings().all()]


async def keyword_search(s: AsyncSession, q: str, k: int = 10) -> list[dict[str, Any]]:
    """Keyword-only search fallback."""
    if not q.strip():
        return []

    sql = text(
        """
        SELECT e.*,
               ts_rank_cd(e.search_vector, plainto_tsquery('english', :q)) AS fts_rank
        FROM entries e
        WHERE e.is_deleted = FALSE
          AND e.search_vector @@ plainto_tsquery('english', :q)
        ORDER BY fts_rank DESC
        LIMIT :k
        """
    )
    res = await s.execute(sql, {"q": q, "k": k})
    return [dict(r) for r in res.mappings().all()]


async def upsert_entry_embedding(s: AsyncSession, entry_id: Any, text_source: str) -> None:
    """Generate embedding for text and upsert into entry_embeddings."""
    try:
        # Retry embedding fetch with bounded exponential backoff and full jitter
        attempts = int(os.getenv("RETRY_EMBED_ATTEMPTS", "4"))
        base = float(os.getenv("RETRY_EMBED_BASE_SECS", "0.25"))
        factor = float(os.getenv("RETRY_EMBED_FACTOR", "2.0"))
        cap = float(os.getenv("RETRY_EMBED_MAX_BACKOFF_SECS", "15"))

        # Retry loop with jittered backoff
        for i in range(attempts):
            try:
                emb = get_embedding(text_source)
                break
            except Exception:
                if i == attempts - 1:
                    raise
                delay = min(cap, base * (factor**i))
                delay = random.random() * delay  # noqa: S311 - jitter backoff
                await asyncio.sleep(delay)
        # Convert list to pgvector string format: '[0.1, 0.2, ...]'
        embedding_str = f"[{','.join(str(x) for x in emb)}]"

        sql = text(
            """
            INSERT INTO entry_embeddings(entry_id, embedding)
            VALUES (:entry_id, CAST(:embedding AS vector))
            ON CONFLICT (entry_id) DO UPDATE SET embedding = EXCLUDED.embedding
            """
        )
        await s.execute(sql, {"entry_id": entry_id, "embedding": embedding_str})
        await s.commit()
    except Exception as e:  # noqa: BLE001 - tolerate failures, log only
        # Log error but don't fail
        logging.getLogger(__name__).warning(
            "Failed to upsert embedding for entry %s: %s", entry_id, e
        )
