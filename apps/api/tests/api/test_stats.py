"""
Consolidated test cases for stats API endpoint.
Moved from test_api_admin_extended.py to proper location.
"""

import pytest
from datetime import datetime, timedelta
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.models import Entry


@pytest.mark.component()
class TestStatsAPI:
    """Test cases for stats endpoint."""

    @pytest.mark.asyncio()
    async def test_stats_with_various_date_ranges(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        db_session: AsyncSession,
        monkeypatch,
    ):
        """Test stats calculation with entries across different time periods."""
        # Mock current time for deterministic testing
        mock_now = datetime(2024, 6, 15, 14, 30, 0)  # Friday, June 15, 2024

        def mock_utcnow():
            return mock_now

        monkeypatch.setattr("app.api.v1.stats._utcnow", mock_utcnow)

        # Create entries at different times
        entries = [
            # Today (June 15)
            Entry(
                title="Today 1",
                content="Content",
                author_id="11111111-1111-1111-1111-111111111111",
                created_at=mock_now.replace(hour=10),
                updated_at=mock_now.replace(hour=10),
            ),
            Entry(
                title="Today 2",
                content="Content",
                author_id="11111111-1111-1111-1111-111111111111",
                created_at=mock_now.replace(hour=8),
                updated_at=mock_now.replace(hour=8),
            ),
            # This week but not today (June 12, Tuesday)
            Entry(
                title="This week",
                content="Content",
                author_id="11111111-1111-1111-1111-111111111111",
                created_at=mock_now - timedelta(days=3),
                updated_at=mock_now - timedelta(days=3),
            ),
            # This month but not this week (June 1)
            Entry(
                title="This month",
                content="Content",
                author_id="11111111-1111-1111-1111-111111111111",
                created_at=mock_now.replace(day=1),
                updated_at=mock_now.replace(day=1),
            ),
            # Last month (May 20)
            Entry(
                title="Last month",
                content="Content",
                author_id="11111111-1111-1111-1111-111111111111",
                created_at=mock_now.replace(month=5, day=20),
                updated_at=mock_now.replace(month=5, day=20),
            ),
            # Recently updated (created long ago but updated 3 days ago)
            Entry(
                title="Recently updated",
                content="Content",
                author_id="11111111-1111-1111-1111-111111111111",
                created_at=mock_now.replace(month=1),
                updated_at=mock_now - timedelta(days=3),
            ),
            # Deleted entry (should not be counted)
            Entry(
                title="Deleted",
                content="Content",
                author_id="11111111-1111-1111-1111-111111111111",
                created_at=mock_now,
                updated_at=mock_now,
                is_deleted=True,
            ),
        ]

        for entry in entries:
            db_session.add(entry)
        await db_session.commit()

        # Get stats
        response = await client.get("/api/v1/stats", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()

        # Verify counts
        assert data["total_entries"] == 6  # All non-deleted entries
        assert data["entries_today"] == 2  # Today 1 and Today 2
        assert data["entries_this_week"] == 3  # Today (2) + This week (1)
        assert data["entries_this_month"] == 4  # This week (3) + This month (1)
        assert data["recent_entries"] == 4  # Updated in last 7 days
        assert data["favorite_entries"] == 0  # Not implemented yet

    @pytest.mark.asyncio()
    async def test_stats_with_no_entries(self, client: AsyncClient, auth_headers: dict[str, str]):
        """Test stats when there are no entries."""
        response = await client.get("/api/v1/stats", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()

        # All counts should be zero
        assert data["total_entries"] == 0
        assert data["entries_today"] == 0
        assert data["entries_this_week"] == 0
        assert data["entries_this_month"] == 0
        assert data["recent_entries"] == 0
        assert data["favorite_entries"] == 0

    @pytest.mark.asyncio()
    async def test_stats_week_boundary(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        db_session: AsyncSession,
        monkeypatch,
    ):
        """Test stats calculation at week boundaries."""
        # Mock current time to be Monday morning
        mock_now = datetime(2024, 6, 10, 0, 30, 0)  # Monday, June 10, 2024

        def mock_utcnow():
            return mock_now

        monkeypatch.setattr("app.api.v1.stats._utcnow", mock_utcnow)

        # Create entries
        entries = [
            # This week (Monday morning)
            Entry(
                title="Monday",
                content="Content",
                author_id="11111111-1111-1111-1111-111111111111",
                created_at=mock_now.replace(minute=0),
                updated_at=mock_now.replace(minute=0),
            ),
            # Last week (Sunday night)
            Entry(
                title="Sunday",
                content="Content",
                author_id="11111111-1111-1111-1111-111111111111",
                created_at=mock_now - timedelta(hours=1),
                updated_at=mock_now - timedelta(hours=1),
            ),
        ]

        for entry in entries:
            db_session.add(entry)
        await db_session.commit()

        response = await client.get("/api/v1/stats", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()

        # Monday entry is in this week, Sunday is not
        assert data["entries_this_week"] == 1
        assert data["total_entries"] == 2

    @pytest.mark.asyncio()
    async def test_stats_month_boundary(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        db_session: AsyncSession,
        monkeypatch,
    ):
        """Test stats calculation at month boundaries."""
        # Mock current time to be first day of month
        mock_now = datetime(2024, 6, 1, 0, 30, 0)  # June 1, 2024

        def mock_utcnow():
            return mock_now

        monkeypatch.setattr("app.api.v1.stats._utcnow", mock_utcnow)

        # Create entries
        entries = [
            # This month (June 1)
            Entry(
                title="June",
                content="Content",
                author_id="11111111-1111-1111-1111-111111111111",
                created_at=mock_now.replace(minute=0),
                updated_at=mock_now.replace(minute=0),
            ),
            # Last month (May 31)
            Entry(
                title="May",
                content="Content",
                author_id="11111111-1111-1111-1111-111111111111",
                created_at=mock_now - timedelta(hours=1),
                updated_at=mock_now - timedelta(hours=1),
            ),
        ]

        for entry in entries:
            db_session.add(entry)
        await db_session.commit()

        response = await client.get("/api/v1/stats", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()

        # June entry is in this month, May is not
        assert data["entries_this_month"] == 1
        assert data["total_entries"] == 2

    @pytest.mark.asyncio()
    async def test_stats_requires_authentication(self, client: AsyncClient):
        """Test that stats endpoint requires authentication."""
        response = await client.get("/api/v1/stats")
        assert response.status_code == 401

    @pytest.mark.asyncio()
    async def test_stats_recent_entries_calculation(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        db_session: AsyncSession,
        monkeypatch,
    ):
        """Test recent entries calculation based on updated_at."""
        mock_now = datetime(2024, 6, 15, 14, 30, 0)

        def mock_utcnow():
            return mock_now

        monkeypatch.setattr("app.api.v1.stats._utcnow", mock_utcnow)

        # Create entries with different update times
        entries = [
            # Updated 3 days ago (should be included)
            Entry(
                title="Recent 1",
                content="Content",
                author_id="11111111-1111-1111-1111-111111111111",
                created_at=mock_now - timedelta(days=30),
                updated_at=mock_now - timedelta(days=3),
            ),
            # Updated 6 days ago (should be included)
            Entry(
                title="Recent 2",
                content="Content",
                author_id="11111111-1111-1111-1111-111111111111",
                created_at=mock_now - timedelta(days=30),
                updated_at=mock_now - timedelta(days=6),
            ),
            # Updated 8 days ago (should NOT be included)
            Entry(
                title="Old",
                content="Content",
                author_id="11111111-1111-1111-1111-111111111111",
                created_at=mock_now - timedelta(days=30),
                updated_at=mock_now - timedelta(days=8),
            ),
        ]

        for entry in entries:
            db_session.add(entry)
        await db_session.commit()

        response = await client.get("/api/v1/stats", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()

        # Only entries updated within last 7 days
        assert data["recent_entries"] == 2
        assert data["total_entries"] == 3
