from __future__ import annotations
from typing import Any
from uuid import UUID, uuid4
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.infra.db import get_session, AsyncSessionLocal
from app.infra.models import Entry
from app.infra.auth import require_user
from app.services.entry_service import create_entry, list_entries

router = APIRouter(prefix="/entries", tags=["entries"])

@router.get("")
async def get_entries(s: AsyncSession = Depends(get_session)):
    return await list_entries(s)

@router.post("", status_code=201)
async def post_entry(payload: dict[str, Any], user_id: str = Depends(require_user), s: AsyncSession = Depends(get_session)):
    title = payload.get("title", "")
    content = payload.get("content", {})
    return await create_entry(s, UUID(user_id), title, content)
