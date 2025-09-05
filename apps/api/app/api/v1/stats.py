from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.infra.auth import require_user
from app.infra.db import get_session
from app.infra.models import Entry


router = APIRouter(tags=["stats"])


def _utcnow() -> datetime:
    # Use timezone-aware UTC for consistency
    return datetime.now(timezone.utc)


class StatsResponse(BaseModel):
    total_entries: int
    entries_today: int
    entries_this_week: int
    entries_this_month: int
    recent_entries: int
    favorite_entries: int


@router.get("/stats")
async def get_stats(
    user_id: Annotated[str, Depends(require_user)],  # noqa: ARG001
    s: Annotated[AsyncSession, Depends(get_session)],
) -> StatsResponse:
    """Get statistics about user's journal entries.

    Returns:
        StatsResponse with entry counts and statistics.
    """

    # Deterministic tests can monkeypatch _utcnow()
    now = _utcnow()  # Use timezone-naive datetime
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = now - timedelta(days=now.weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    recent_cutoff = now - timedelta(days=7)

    # Total entries
    total_result = await s.execute(
        select(func.count(Entry.id)).where(Entry.is_deleted == False)  # noqa: E712
    )
    total_entries = total_result.scalar() or 0

    # Entries today
    today_result = await s.execute(
        select(func.count(Entry.id)).where(
            Entry.created_at >= today_start,
            Entry.is_deleted == False,  # noqa: E712
        )
    )
    entries_today = today_result.scalar() or 0

    # Entries this week
    week_result = await s.execute(
        select(func.count(Entry.id)).where(
            Entry.created_at >= week_start,
            Entry.is_deleted == False,  # noqa: E712
        )
    )
    entries_this_week = week_result.scalar() or 0

    # Entries this month
    month_result = await s.execute(
        select(func.count(Entry.id)).where(
            Entry.created_at >= month_start,
            Entry.is_deleted == False,  # noqa: E712
        )
    )
    entries_this_month = month_result.scalar() or 0

    # Recently edited entries (last 7 days)
    recent_result = await s.execute(
        select(func.count(Entry.id)).where(
            Entry.updated_at >= recent_cutoff,
            Entry.is_deleted == False,  # noqa: E712
        )
    )
    recent_entries = recent_result.scalar() or 0

    # TODO: Implement favorites when we have a favorites field
    favorite_entries = 0

    return StatsResponse(
        total_entries=total_entries,
        entries_today=entries_today,
        entries_this_week=entries_this_week,
        entries_this_month=entries_this_month,
        recent_entries=recent_entries,
        favorite_entries=favorite_entries,
    )
