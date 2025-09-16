from __future__ import annotations

import json
from typing import Annotated, Any

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.auth import require_user
from app.infra.db import get_session
from app.infra.nats_bus import nats_conn


router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/ping")
async def admin_ping(user_id: Annotated[str, Depends(require_user)]) -> dict[str, str]:
    """Simple ping endpoint for admin health check.

    Returns:
        Status response.
    """
    return {"status": "pong"}


@router.get("/health")
async def admin_health(
    user_id: Annotated[str, Depends(require_user)],
    db: Annotated[AsyncSession, Depends(get_session)],
) -> dict[str, str]:
    """Health check endpoint that verifies database connectivity.

    Returns:
        Health status including database connectivity state.
    """
    try:
        # Check database connection
        result = await db.execute(text("SELECT 1"))
        db_status = "healthy" if result.scalar() == 1 else "unhealthy"
    except SQLAlchemyError:
        db_status = "unhealthy"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
    }


@router.post("/reindex-embeddings")
async def reindex_embeddings(body: dict[str, Any] | None = None) -> dict[str, str]:
    """Trigger a bulk reindexing of all entry embeddings.

    Args:
        body: Optional configuration for reindexing.

    Returns:
        Status message indicating the reindex has been queued.
    """
    event_data = {
        "event_type": "embedding.reindex",
        "event_data": body or {},
        "aggregate_type": "embedding",
        "aggregate_id": "bulk_reindex",
    }
    payload = json.dumps(event_data).encode("utf-8")
    async with nats_conn() as nc:
        await nc.publish("journal.reindex.bulk", payload)
    return {"status": "queued", "message": "Bulk embedding reindex has been queued"}
