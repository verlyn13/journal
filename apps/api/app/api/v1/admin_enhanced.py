"""Enhanced admin endpoints protected by scope-based authorization (v2)."""

from __future__ import annotations

import json

from typing import Any

from fastapi import APIRouter, Depends, Request
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.db import get_session
from app.infra.nats_bus import nats_conn
from app.middleware.enhanced_jwt_middleware import require_scopes


router = APIRouter(prefix="/admin", tags=["admin-v2"])


@router.get("/ping")
async def admin_ping_v2(request: Request) -> dict[str, str]:
    """Admin ping with scope enforcement (requires admin.read)."""
    await require_scopes(["admin.read"], request)
    return {"status": "pong"}


@router.get("/health")
async def admin_health_v2(
    request: Request,
    db: AsyncSession = Depends(get_session),
) -> dict[str, str]:
    """Health check with scope enforcement (requires admin.read)."""
    await require_scopes(["admin.read"], request)
    try:
        result = await db.execute(text("SELECT 1"))
        db_status = "healthy" if result.scalar() == 1 else "unhealthy"
    except SQLAlchemyError:
        db_status = "unhealthy"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
    }


@router.post("/reindex-embeddings")
async def reindex_embeddings_v2(
    request: Request,
    body: dict[str, Any] | None = None,
) -> dict[str, str]:
    """Trigger bulk reindex (requires admin.write)."""
    await require_scopes(["admin.write"], request)
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
