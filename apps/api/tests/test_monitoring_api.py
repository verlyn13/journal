"""Tests for monitoring API endpoints with proper authorization."""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest

from fastapi import status
from httpx import AsyncClient
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from tests.helpers.auth_helpers import (
    create_monitoring_token,
    create_readonly_token,
    create_test_token_with_scopes,
)


@pytest.mark.asyncio()
class TestMonitoringEndpoints:
    """Test monitoring API endpoints with scope requirements."""

    async def test_health_requires_monitor_scope(
        self,
        async_client: AsyncClient,
        db_session: AsyncSession,
        redis_client: Redis,
    ) -> None:
        """Test that health endpoint requires admin.monitor scope."""
        # Try without token - should fail
        response = await async_client.get("/api/v1/monitoring/health")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        # Try with token lacking monitor scope - should fail
        readonly_token = await create_readonly_token(db_session, redis_client)
        response = await async_client.get(
            "/api/v1/monitoring/health",
            headers={"Authorization": f"Bearer {readonly_token}"},
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert "Missing required scopes" in response.json()["detail"]

        # Try with proper monitor scope - should succeed
        monitor_token = await create_monitoring_token(db_session, redis_client)

        # Mock the monitoring service
        with patch("app.api.v1.monitoring.get_monitoring_service") as mock_get_service:
            mock_service = AsyncMock()
            mock_service.collect_metrics.return_value = {
                "timestamp": "2024-01-01T00:00:00Z",
                "infisical": {"status": "healthy"},
                "redis": {"status": "healthy"},
                "secrets": {"cached": 10, "ttl_avg": 300},
            }
            mock_get_service.return_value = mock_service

            response = await async_client.get(
                "/api/v1/monitoring/health",
                headers={"Authorization": f"Bearer {monitor_token}"},
            )
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["infisical"]["status"] == "healthy"

    async def test_metrics_requires_monitor_scope(
        self,
        async_client: AsyncClient,
        db_session: AsyncSession,
        redis_client: Redis,
    ) -> None:
        """Test that metrics endpoint requires admin.monitor scope."""
        # Without token
        response = await async_client.get("/api/v1/monitoring/metrics")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        # With insufficient scope
        readonly_token = await create_readonly_token(db_session, redis_client)
        response = await async_client.get(
            "/api/v1/monitoring/metrics",
            headers={"Authorization": f"Bearer {readonly_token}"},
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

        # With proper scope
        monitor_token = await create_monitoring_token(db_session, redis_client)

        with patch("app.api.v1.monitoring.get_monitoring_service") as mock_get_service:
            mock_service = AsyncMock()
            mock_service.get_metrics_summary.return_value = {
                "api_requests": {"total": 1000, "errors": 5},
                "jwt_operations": {"signs": 100, "verifies": 500},
                "cache": {"hits": 800, "misses": 200},
            }
            mock_get_service.return_value = mock_service

            response = await async_client.get(
                "/api/v1/monitoring/metrics",
                headers={"Authorization": f"Bearer {monitor_token}"},
            )
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert "api_requests" in data

    async def test_metrics_history_requires_monitor_scope(
        self,
        async_client: AsyncClient,
        db_session: AsyncSession,
        redis_client: Redis,
    ) -> None:
        """Test that metrics history endpoint requires admin.monitor scope."""
        # Without token
        response = await async_client.get("/api/v1/monitoring/metrics/history")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        # With proper scope
        monitor_token = await create_monitoring_token(db_session, redis_client)

        with patch("app.api.v1.monitoring.get_monitoring_service") as mock_get_service:
            mock_service = AsyncMock()
            mock_service.get_metrics_history.return_value = []
            mock_get_service.return_value = mock_service

            response = await async_client.get(
                "/api/v1/monitoring/metrics/history?hours=24",
                headers={"Authorization": f"Bearer {monitor_token}"},
            )
            assert response.status_code == status.HTTP_200_OK
            assert isinstance(response.json(), list)

    async def test_multiple_scopes_accepted(
        self,
        async_client: AsyncClient,
        db_session: AsyncSession,
        redis_client: Redis,
    ) -> None:
        """Test that tokens with multiple scopes including monitor work."""
        # Create token with multiple admin scopes
        admin_token = await create_test_token_with_scopes(
            session=db_session,
            redis=redis_client,
            scopes=["admin.read", "admin.write", "admin.monitor", "api.read"],
        )

        with patch("app.api.v1.monitoring.get_monitoring_service") as mock_get_service:
            mock_service = AsyncMock()
            mock_service.collect_metrics.return_value = {
                "timestamp": "2024-01-01T00:00:00Z",
                "infisical": {"status": "healthy"},
                "redis": {"status": "healthy"},
                "secrets": {},
            }
            mock_get_service.return_value = mock_service

            response = await async_client.get(
                "/api/v1/monitoring/health",
                headers={"Authorization": f"Bearer {admin_token}"},
            )
            assert response.status_code == status.HTTP_200_OK

    async def test_scope_error_message(
        self,
        async_client: AsyncClient,
        db_session: AsyncSession,
        redis_client: Redis,
    ) -> None:
        """Test that scope error messages are clear."""
        # Create token with wrong scope
        wrong_token = await create_test_token_with_scopes(
            session=db_session,
            redis=redis_client,
            scopes=["admin.read"],  # Has admin scope but not monitor
        )

        response = await async_client.get(
            "/api/v1/monitoring/health",
            headers={"Authorization": f"Bearer {wrong_token}"},
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN
        error = response.json()
        assert "Missing required scopes: admin.monitor" in error["detail"]

        # Check WWW-Authenticate header
        assert "WWW-Authenticate" in response.headers
        auth_header = response.headers["WWW-Authenticate"]
        assert 'error="insufficient_scope"' in auth_header
        assert 'scope="admin.monitor"' in auth_header
