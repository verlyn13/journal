"""Statistics API endpoints with advanced SQLAlchemy 2.0 patterns.

This module demonstrates production-grade SQLAlchemy 2.0 query patterns with:
- Proper type safety for all queries
- Efficient aggregation queries
- CTE (Common Table Expression) usage where beneficial
- Comprehensive result typing with TypedDict
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import TypedDict

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import Integer, and_, cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.enhanced_auth import require_user
from app.infra.db import get_session
from app.infra.sa_models import Entry


router = APIRouter(tags=["stats"])


def _utcnow() -> datetime:
    """UTC now; returns naive UTC for DB comparisons while avoiding utcnow()."""
    # Use aware UTC then drop tzinfo to keep DB comparisons consistent
    return datetime.now(UTC).replace(tzinfo=None)


class StatsQueryResult(TypedDict):
    """Type-safe representation of stats query results."""

    total_entries: int
    entries_today: int
    entries_this_week: int
    entries_this_month: int
    recent_entries: int


class StatsResponse(BaseModel):
    """Response model for stats endpoint with Pydantic V2 config."""

    model_config = ConfigDict(from_attributes=True)

    total_entries: int = Field(..., ge=0, description="Total number of entries")
    entries_today: int = Field(..., ge=0, description="Entries created today")
    entries_this_week: int = Field(..., ge=0, description="Entries created this week")
    entries_this_month: int = Field(..., ge=0, description="Entries created this month")
    recent_entries: int = Field(..., ge=0, description="Recently updated entries")
    favorite_entries: int = Field(default=0, ge=0, description="Favorite entries count")


async def get_entry_stats(session: AsyncSession, user_id: str) -> StatsQueryResult:
    """Get entry statistics using optimized SQLAlchemy 2.0 queries.

    This function demonstrates:
    - Proper use of SQLAlchemy's comparison operators (== False instead of not)
    - Efficient single-query aggregation with conditional counting
    - Type-safe result handling with TypedDict

    Args:
        session: Async database session
        user_id: ID of the user requesting stats

    Returns:
        TypedDict with all statistics
    """
    now = _utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = now - timedelta(days=now.weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    recent_cutoff = now - timedelta(days=7)

    # Single optimized query using conditional aggregation
    # This is more efficient than multiple queries and demonstrates
    # advanced SQLAlchemy patterns
    stats_query = select(
        # Total entries (using proper SQLAlchemy comparison)
        func.count(Entry.id).label("total_entries"),
        # Conditional counts using CASE expressions
        func.sum(
            cast(
                and_(
                    Entry.created_at >= today_start,
                    Entry.is_deleted == False,  # noqa: E712 - SQLAlchemy requires ==
                ),
                Integer,
            )
        ).label("entries_today"),
        func.sum(
            cast(
                and_(
                    Entry.created_at >= week_start,
                    Entry.is_deleted == False,  # noqa: E712
                ),
                Integer,
            )
        ).label("entries_this_week"),
        func.sum(
            cast(
                and_(
                    Entry.created_at >= month_start,
                    Entry.is_deleted == False,  # noqa: E712
                ),
                Integer,
            )
        ).label("entries_this_month"),
        func.sum(
            cast(
                and_(
                    Entry.updated_at >= recent_cutoff,
                    Entry.is_deleted == False,  # noqa: E712
                ),
                Integer,
            )
        ).label("recent_entries"),
    ).where(
        Entry.is_deleted == False  # noqa: E712 - SQLAlchemy requires == for proper SQL generation
    )

    # Execute query and handle results with proper typing
    result = await session.execute(stats_query)
    row = result.one()

    # Return typed result with null coalescing
    return StatsQueryResult(
        total_entries=row.total_entries or 0,
        entries_today=row.entries_today or 0,
        entries_this_week=row.entries_this_week or 0,
        entries_this_month=row.entries_this_month or 0,
        recent_entries=row.recent_entries or 0,
    )


@router.get(
    "/stats",
    response_model=StatsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get user statistics",
    description="Returns aggregated statistics about the user's journal entries",
)
async def get_stats(
    user_id: str = Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> StatsResponse:
    """Get statistics about user's journal entries.

    This endpoint demonstrates:
    - Proper FastAPI response model typing
    - Efficient database query patterns
    - Clean separation of concerns
    """
    stats = await get_entry_stats(session, user_id)

    return StatsResponse(
        total_entries=stats["total_entries"],
        entries_today=stats["entries_today"],
        entries_this_week=stats["entries_this_week"],
        entries_this_month=stats["entries_this_month"],
        recent_entries=stats["recent_entries"],
        favorite_entries=0,  # Placeholder for future feature
    )
