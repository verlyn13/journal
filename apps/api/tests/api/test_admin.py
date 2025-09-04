"""
Consolidated test cases for admin API endpoints.
Combines tests from test_api_admin.py and test_api_admin_extended.py
"""
import json

from datetime import datetime, timedelta
from unittest.mock import AsyncMock, patch

import pytest

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.models import Entry


@pytest.mark.component()
class TestAdminAPI:
    """Test cases for admin endpoints."""

    @pytest.mark.asyncio()
    async def test_admin_ping(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str]
    ):
        """Test admin ping endpoint."""
        response = await client.get("/api/v1/admin/ping", headers=auth_headers)
        assert response.status_code == 200
        assert response.json() == {"status": "pong"}

    @pytest.mark.asyncio()
    async def test_admin_health(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str]
    ):
        """Test admin health check endpoint."""
        response = await client.get("/api/v1/admin/health", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "database" in data
        assert data["status"] == "healthy"

    @pytest.mark.asyncio()
    async def test_admin_endpoints_unauthorized(
        self,
        client: AsyncClient
    ):
        """Test admin endpoints without authentication."""
        response = await client.get("/api/v1/admin/ping")
        assert response.status_code == 401

        response = await client.get("/api/v1/admin/health")
        assert response.status_code == 401

    @pytest.mark.asyncio()
    async def test_health_check_with_db_failure(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        monkeypatch
    ):
        """Test health check when database is unavailable."""
        # Mock the database session to fail
        from app.infra.db import get_session
        from app.main import app

        async def mock_get_session():
            mock_session = AsyncMock()
            mock_session.execute = AsyncMock(side_effect=Exception("Database connection failed"))
            yield mock_session

        # Override the dependency in the FastAPI app
        app.dependency_overrides[get_session] = mock_get_session

        response = await client.get(
            "/api/v1/admin/health",
            headers=auth_headers
        )

        # Clean up the override
        app.dependency_overrides.clear()

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "degraded"
        assert data["database"] == "unhealthy"

    @pytest.mark.asyncio()
    async def test_reindex_embeddings_endpoint(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        monkeypatch
    ):
        """Test triggering bulk embedding reindex."""
        # Mock NATS connection
        published_messages = []

        class MockNC:
            async def __aenter__(self):
                return self

            async def __aexit__(self, *args):
                pass

            async def publish(self, subject, payload):
                published_messages.append((subject, payload))

        def mock_nats_conn():
            return MockNC()

        monkeypatch.setattr("app.api.v1.admin.nats_conn", mock_nats_conn)

        # Test without body
        response = await client.post(
            "/api/v1/admin/reindex-embeddings",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "queued"
        assert "queued" in data["message"].lower()

        # Check NATS message was published
        assert len(published_messages) == 1
        assert published_messages[0][0] == "journal.reindex.bulk"

    @pytest.mark.asyncio()
    async def test_reindex_embeddings_with_parameters(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        monkeypatch
    ):
        """Test reindex with custom parameters."""
        published_messages = []

        class MockNC:
            async def __aenter__(self):
                return self

            async def __aexit__(self, *args):
                pass

            async def publish(self, subject, payload):
                published_messages.append((subject, json.loads(payload)))

        def mock_nats_conn():
            return MockNC()

        monkeypatch.setattr("app.api.v1.admin.nats_conn", mock_nats_conn)

        # Test with custom body
        request_body = {
            "batch_size": 100,
            "start_date": "2024-01-01"
        }

        response = await client.post(
            "/api/v1/admin/reindex-embeddings",
            json=request_body,
            headers=auth_headers
        )

        assert response.status_code == 200

        # Check message contains custom parameters
        assert len(published_messages) == 1
        message_data = published_messages[0][1]
        assert message_data["event_type"] == "embedding.reindex"
        assert message_data["event_data"]["batch_size"] == 100
        assert message_data["event_data"]["start_date"] == "2024-01-01"

    @pytest.mark.asyncio()
    async def test_reindex_does_not_require_authentication(
        self,
        client: AsyncClient,
        monkeypatch
    ):
        """Test that reindex endpoint doesn't require authentication (current implementation)."""
        # Mock NATS connection
        class MockNC:
            async def __aenter__(self):
                return self

            async def __aexit__(self, *args):
                pass

            async def publish(self, subject, payload):
                pass

        def mock_nats_conn():
            return MockNC()

        monkeypatch.setattr("app.api.v1.admin.nats_conn", mock_nats_conn)

        # Should work without auth headers
        response = await client.post("/api/v1/admin/reindex-embeddings")
        assert response.status_code == 200
