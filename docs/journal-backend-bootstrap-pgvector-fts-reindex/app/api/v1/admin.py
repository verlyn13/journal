from __future__ import annotations

import json

from fastapi import APIRouter

from app.infra.nats_bus import nats_conn

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/reindex-embeddings")
async def reindex_embeddings(body: dict | None = None):
    payload = json.dumps(body or {}).encode("utf-8")
    async with nats_conn() as nc:
        await nc.publish("journal.reindex", payload)
    return {"status": "queued"}
