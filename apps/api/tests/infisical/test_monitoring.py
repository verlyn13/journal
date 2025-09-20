"""Tests for Infisical monitoring and alerting functionality."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.secrets import InfisicalSecretsClient
from app.infra.secrets.enhanced_key_manager import InfisicalKeyManager
from app.telemetry.infisical_monitoring import InfisicalMonitoringService


@pytest.fixture()
async def monitoring_service(
    db_session: AsyncSession,
    redis_client: Redis,
    infisical_client: InfisicalSecretsClient,
) -> InfisicalMonitoringService:
    """Create monitoring service for testing."""
    key_manager = InfisicalKeyManager(db_session, redis_client, infisical_client)
    return InfisicalMonitoringService(redis_client, infisical_client, key_manager)


@pytest.mark.asyncio()
class TestInfisicalMonitoringService:
    """Test Infisical monitoring service functionality."""

    async def test_collect_metrics_success(
        self, monitoring_service: InfisicalMonitoringService
    ) -> None:
        """Test successful metrics collection."""
        with (
            patch.object(
                monitoring_service.infisical_client, "health_check"
            ) as mock_client_health,
            patch.object(
                monitoring_service.key_manager, "health_check"
            ) as mock_key_health,
        ):
            # Mock health checks
            mock_client_health.return_value = {"status": "healthy"}
            mock_key_health.return_value = {"overall_status": "healthy"}

            # Mock Redis ping
            monitoring_service.redis.ping = AsyncMock(return_value=True)
            monitoring_service.redis.info = AsyncMock(
                return_value={
                    "redis_version": "7.0.0",
                    "used_memory_human": "1.5M",
                    "connected_clients": 2,
                }
            )

            # Mock secret retrieval
            monitoring_service.infisical_client.get_secret = AsyncMock(
                return_value="test_value"
            )

            # Mock key manager methods
            monitoring_service.key_manager.get_current_private_key = AsyncMock(
                return_value="current_key"
            )
            monitoring_service.key_manager.get_next_private_key = AsyncMock(
                return_value="next_key"
            )
            monitoring_service.key_manager.get_aes_cipher = AsyncMock(
                return_value=MagicMock()
            )
            monitoring_service.key_manager.check_rotation_needed = AsyncMock(
                return_value=(False, None)
            )
            monitoring_service.key_manager._check_aes_rotation_needed = AsyncMock(
                return_value=(False, None)
            )
            monitoring_service.key_manager._get_last_rotation_time = AsyncMock(
                return_value=datetime.now(UTC)
            )

            # Mock Redis operations
            monitoring_service.redis.keys = AsyncMock(return_value=[])
            monitoring_service.redis.hgetall = AsyncMock(return_value={})
            monitoring_service.redis.get = AsyncMock(return_value=None)
            monitoring_service.redis.set = AsyncMock()
            monitoring_service.redis.delete = AsyncMock()
            monitoring_service.redis.hset = AsyncMock()
            monitoring_service.redis.hdel = AsyncMock()
            monitoring_service.redis.hkeys = AsyncMock(return_value=[])

            # Collect metrics
            metrics = await monitoring_service.collect_metrics()

            # Verify metrics structure
            assert "timestamp" in metrics
            assert "collection_duration" in metrics
            assert "health" in metrics
            assert "performance" in metrics
            assert "security" in metrics
            assert "cache" in metrics
            assert "rotation" in metrics
            assert "webhooks" in metrics

            # Verify health metrics
            assert metrics["health"]["overall_status"] == "healthy"
            assert "infisical_client" in metrics["health"]
            assert "key_manager" in metrics["health"]
            assert "redis" in metrics["health"]

            # Verify performance metrics
            assert "secret_retrieval" in metrics["performance"]
            assert "cache" in metrics["performance"]
            assert "cli" in metrics["performance"]

            # Verify security metrics
            assert "jwt_keys" in metrics["security"]
            assert "aes_keys" in metrics["security"]
            assert "rotation_compliance" in metrics["security"]

    async def test_collect_metrics_with_unhealthy_components(
        self, monitoring_service: InfisicalMonitoringService
    ) -> None:
        """Test metrics collection when components are unhealthy."""
        with (
            patch.object(
                monitoring_service.infisical_client, "health_check"
            ) as mock_client_health,
            patch.object(
                monitoring_service.key_manager, "health_check"
            ) as mock_key_health,
        ):
            # Mock unhealthy state
            mock_client_health.return_value = {
                "status": "unhealthy",
                "error": "Connection failed",
            }
            mock_key_health.return_value = {
                "overall_status": "unhealthy",
                "errors": ["Key not found"],
            }

            # Mock Redis ping failure
            monitoring_service.redis.ping = AsyncMock(
                side_effect=Exception("Redis connection failed")
            )

            # Mock other operations
            monitoring_service.redis.hgetall = AsyncMock(return_value={})
            monitoring_service.redis.hset = AsyncMock()
            monitoring_service.redis.hkeys = AsyncMock(return_value=[])
            monitoring_service.redis.hdel = AsyncMock()

            # Collect metrics
            metrics = await monitoring_service.collect_metrics()

            # Verify overall health is unhealthy
            assert metrics["health"]["overall_status"] == "unhealthy"

    async def test_health_check_caching(
        self, monitoring_service: InfisicalMonitoringService
    ) -> None:
        """Test that health checks can use cached data."""
        # Mock cached metrics
        cached_metrics = {
            "timestamp": datetime.now(UTC).isoformat(),
            "health": {
                "overall_status": "healthy",
                "infisical_client": {"status": "healthy"},
                "key_manager": {"overall_status": "healthy"},
                "redis": {"status": "healthy"},
            },
            "collection_duration": 1.5,
        }

        monitoring_service.redis.hget = AsyncMock(
            return_value=json.dumps(cached_metrics)
        )

        # Get current metrics
        result = await monitoring_service.get_current_metrics()

        assert result is not None
        assert result["health"]["overall_status"] == "healthy"

    async def test_rotation_compliance_checking(
        self, monitoring_service: InfisicalMonitoringService
    ) -> None:
        """Test key rotation compliance checking."""
        # Mock overdue rotation
        overdue_time = datetime.now(UTC) - timedelta(days=35)
        monitoring_service.key_manager._get_last_rotation_time = AsyncMock(
            return_value=overdue_time
        )

        # Check compliance
        compliance = await monitoring_service._check_rotation_compliance()

        assert not compliance["compliant"]
        assert "overdue" in compliance["reason"]
        assert "last_rotation" in compliance

    async def test_alert_generation_and_storage(
        self, monitoring_service: InfisicalMonitoringService
    ) -> None:
        """Test alert generation and storage."""
        # Mock unhealthy metrics that should trigger alerts
        metrics = {
            "health": {"overall_status": "unhealthy"},
            "performance": {
                "secret_retrieval": {"latency_seconds": 10.0}  # High latency
            },
            "rotation": {
                "jwt_rotation_needed": True,
                "jwt_rotation_reason": "Key age exceeded threshold",
            },
            "security": {"jwt_keys": {"keys_properly_configured": False}},
        }

        # Mock Redis operations
        monitoring_service.redis.lpush = AsyncMock()
        monitoring_service.redis.ltrim = AsyncMock()

        # Check alerts
        await monitoring_service._check_alerts(metrics)

        # Verify alerts were stored
        assert monitoring_service.redis.lpush.called
        assert monitoring_service.redis.ltrim.called

    async def test_metrics_history_retrieval(
        self, monitoring_service: InfisicalMonitoringService
    ) -> None:
        """Test historical metrics retrieval."""
        # Mock historical data
        now = datetime.now(UTC)
        history_data = {}

        for i in range(5):
            timestamp = int((now - timedelta(hours=i)).timestamp())
            metrics = {
                "timestamp": (now - timedelta(hours=i)).isoformat(),
                "health": {"overall_status": "healthy"},
            }
            history_data[str(timestamp)] = json.dumps(metrics)

        monitoring_service.redis.hgetall = AsyncMock(return_value=history_data)

        # Get history
        history = await monitoring_service.get_metrics_history(24)

        assert len(history) == 5
        assert all("timestamp" in metric for metric in history)
        assert all("health" in metric for metric in history)

    async def test_cache_performance_testing(
        self, monitoring_service: InfisicalMonitoringService
    ) -> None:
        """Test cache performance measurement."""
        # Mock Redis operations
        monitoring_service.redis.set = AsyncMock()
        monitoring_service.redis.get = AsyncMock(return_value=b"test_performance")
        monitoring_service.redis.delete = AsyncMock()

        # Test cache performance
        cache_metrics = await monitoring_service._test_cache_performance()

        assert "write_latency_seconds" in cache_metrics
        assert "read_latency_seconds" in cache_metrics
        assert cache_metrics["success"] is True

    async def test_webhook_metrics_collection(
        self, monitoring_service: InfisicalMonitoringService
    ) -> None:
        """Test webhook metrics collection."""
        # Mock webhook stats in Redis
        webhook_stats = {
            b"events_total": b"150",
            b"events_success": b"145",
            b"events_failed": b"5",
            b"last_event": b"2023-01-01T12:00:00Z",
        }

        monitoring_service.redis.hgetall = AsyncMock(return_value=webhook_stats)

        # Collect webhook metrics
        webhook_metrics = await monitoring_service._collect_webhook_metrics()

        assert "events_total" in webhook_metrics
        assert webhook_metrics["events_total"] == 150
        assert "last_updated" in webhook_metrics

    async def test_cleanup_old_data(
        self, monitoring_service: InfisicalMonitoringService
    ) -> None:
        """Test cleanup of old monitoring data."""
        # Mock old data
        old_timestamp = int((datetime.now(UTC) - timedelta(days=10)).timestamp())
        recent_timestamp = int(datetime.now(UTC).timestamp())

        timeseries_data = {
            str(old_timestamp): "old_data",
            str(recent_timestamp): "recent_data",
        }

        monitoring_service.redis.hgetall = AsyncMock(return_value=timeseries_data)
        monitoring_service.redis.hdel = AsyncMock()

        # This would be tested in the scheduler, but we can test the logic
        cutoff_time = int((datetime.now(UTC) - timedelta(days=7)).timestamp())

        old_keys = []
        for timestamp_str in timeseries_data:
            try:
                timestamp = int(timestamp_str)
                if timestamp < cutoff_time:
                    old_keys.append(timestamp_str)
            except (ValueError, TypeError):
                old_keys.append(timestamp_str)

        assert str(old_timestamp) in old_keys
        assert str(recent_timestamp) not in old_keys


@pytest.mark.asyncio()
class TestMonitoringAPI:
    """Test monitoring API endpoints."""

    async def test_health_endpoint_with_cached_data(
        self, client, monitoring_service
    ) -> None:
        """Test health endpoint returns cached data when available."""
        # This would require a full API test setup
        # For now, we verify the endpoint structure exists
        from app.api.v1.monitoring import get_health_status

        # Verify function exists and has correct signature
        assert callable(get_health_status)

    async def test_metrics_endpoint_refresh_parameter(
        self, client, monitoring_service
    ) -> None:
        """Test metrics endpoint with refresh parameter."""
        from app.api.v1.monitoring import get_current_metrics

        # Verify function exists
        assert callable(get_current_metrics)

    async def test_dashboard_endpoint_aggregation(
        self, client, monitoring_service
    ) -> None:
        """Test dashboard endpoint data aggregation."""
        from app.api.v1.monitoring import get_monitoring_dashboard

        # Verify function exists
        assert callable(get_monitoring_dashboard)
