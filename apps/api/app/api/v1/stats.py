from __future__ import annotations

from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.auth import require_user
from app.infra.db import get_session
from app.infra.sa_models import Entry


router = APIRouter(tags=["stats"])


def _utcnow() -> datetime:
    """UTC now; returns naive UTC for DB comparisons while avoiding utcnow()."""
    # Use aware UTC then drop tzinfo to keep DB comparisons consistent and satisfy linter
    return datetime.now(UTC).replace(tzinfo=None)


class StatsResponse(BaseModel):
    total_entries: int
    entries_today: int
    entries_this_week: int
    entries_this_month: int
    recent_entries: int
    favorite_entries: int


@router.get("/stats")
async def get_stats(
    user_id: str = Depends(require_user),
    s: AsyncSession = Depends(get_session),
) -> StatsResponse:
    """Get statistics about user's journal entries."""
    now = _utcnow()  # Use timezone-naive datetime
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = now - timedelta(days=now.weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    recent_cutoff = now - timedelta(days=7)

    # Total entries
    total_entries = (
        (await s.execute(select(func.count(Entry.id)).where(not Entry.is_deleted))).scalar()
        or 0
    )

    # Entries today
    entries_today = (
        (
            await s.execute(
                select(func.count(Entry.id)).where(
                    Entry.created_at >= today_start,
                    not Entry.is_deleted,
                )
            )
        ).scalar()
        or 0
    )

    # Entries this week
    entries_this_week = (
        (
            await s.execute(
                select(func.count(Entry.id)).where(
                    Entry.created_at >= week_start,
                    not Entry.is_deleted,
                )
            )
        ).scalar()
        or 0
    )

    # Entries this month
    entries_this_month = (
        (
            await s.execute(
                select(func.count(Entry.id)).where(
                    Entry.created_at >= month_start,
                    not Entry.is_deleted,
                )
            )
        ).scalar()
        or 0
    )

    # Recently edited entries (last 7 days)
    recent_entries = (
        (
            await s.execute(
                select(func.count(Entry.id)).where(
                    Entry.updated_at >= recent_cutoff,
                    not Entry.is_deleted,
                )
            )
        ).scalar()
        or 0
    )

    return StatsResponse(
        total_entries=total_entries,
        entries_today=entries_today,
        entries_this_week=entries_this_week,
        entries_this_month=entries_this_month,
        recent_entries=recent_entries,
        favorite_entries=0,
    )
