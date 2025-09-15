"""Background scheduler for Infisical monitoring tasks.

This module provides automated monitoring task scheduling for the Infisical
CLI v0.42.1 integration, including periodic metrics collection and alerting.
"""

from __future__ import annotations

import asyncio
import json
import logging

from datetime import UTC, datetime, timedelta
from typing import Any

from app.infra.db import build_engine, sessionmaker_for
from app.infra.redis import get_redis_pool
from app.infra.secrets import InfisicalSecretsClient
from app.infra.secrets.enhanced_key_manager import InfisicalKeyManager
from app.settings import settings
from app.telemetry.infisical_monitoring import InfisicalMonitoringService


logger = logging.getLogger(__name__)


class MonitoringScheduler:
    """Background scheduler for Infisical monitoring tasks."""

    def __init__(self) -> None:
        self._running = False
        self._tasks: list[asyncio.Task[Any]] = []
        self._session_maker = sessionmaker_for(build_engine())

    async def start(self) -> None:
        """Start the monitoring scheduler."""
        if self._running:
            logger.warning("Monitoring scheduler is already running")
            return

        self._running = True
        logger.info("Starting Infisical monitoring scheduler")

        # Start background tasks
        self._tasks = [
            asyncio.create_task(self._metrics_collection_loop()),
            asyncio.create_task(self._health_check_loop()),
            asyncio.create_task(self._cleanup_loop()),
        ]

        # Only start rotation monitoring in production
        if not settings.testing:
            self._tasks.append(asyncio.create_task(self._rotation_monitoring_loop()))

        logger.info("Monitoring scheduler started with %d tasks", len(self._tasks))

    async def stop(self) -> None:
        """Stop the monitoring scheduler."""
        if not self._running:
            return

        logger.info("Stopping Infisical monitoring scheduler")
        self._running = False

        # Cancel all tasks
        for task in self._tasks:
            task.cancel()

        # Wait for tasks to complete
        if self._tasks:
            await asyncio.gather(*self._tasks, return_exceptions=True)

        self._tasks.clear()
        logger.info("Monitoring scheduler stopped")

    async def _get_monitoring_service(self) -> InfisicalMonitoringService:
        """Get a monitoring service instance."""
        redis = get_redis_pool()
        infisical_client = InfisicalSecretsClient.from_env(redis)

        # Create a session for this monitoring run
        async with self._session_maker() as session:
            key_manager = InfisicalKeyManager(session, redis, infisical_client)
            return InfisicalMonitoringService(redis, infisical_client, key_manager)

    async def _metrics_collection_loop(self) -> None:
        """Background task for periodic metrics collection."""
        logger.info("Starting metrics collection loop (5-minute intervals)")

        while self._running:
            try:
                # Collect metrics every 5 minutes
                monitoring_service = await self._get_monitoring_service()
                metrics = await monitoring_service.collect_metrics()

                logger.debug(
                    "Collected metrics: health=%s, duration=%.2fs",
                    metrics.get("health", {}).get("overall_status", "unknown"),
                    metrics.get("collection_duration", 0),
                )

                # Wait 5 minutes before next collection
                await asyncio.sleep(300)

            except asyncio.CancelledError:
                break
            except Exception:
                logger.exception("Metrics collection failed")
                # Back off for 1 minute on error
                await asyncio.sleep(60)

        logger.info("Metrics collection loop stopped")

    async def _health_check_loop(self) -> None:
        """Background task for frequent health checks."""
        logger.info("Starting health check loop (1-minute intervals)")

        while self._running:
            try:
                # Quick health check every minute
                monitoring_service = await self._get_monitoring_service()

                # Get cached metrics first, fall back to fresh if needed
                current_metrics = await monitoring_service.get_current_metrics()

                if current_metrics:
                    health_status = current_metrics.get("health", {}).get("overall_status")

                    if health_status != "healthy":
                        logger.warning("Infisical integration unhealthy: %s", health_status)

                        # Trigger immediate metrics collection for detailed status
                        await monitoring_service.collect_metrics()

                # Wait 1 minute before next check
                await asyncio.sleep(60)

            except asyncio.CancelledError:
                break
            except Exception:
                logger.exception("Health check failed")
                # Back off for 30 seconds on error
                await asyncio.sleep(30)

        logger.info("Health check loop stopped")

    async def _rotation_monitoring_loop(self) -> None:
        """Background task for key rotation monitoring."""
        logger.info("Starting rotation monitoring loop (hourly checks)")

        while self._running:
            try:
                # Check rotation status every hour
                await self._get_monitoring_service()

                # Get key manager for rotation checks
                redis = get_redis_pool()
                infisical_client = InfisicalSecretsClient.from_env(redis)

                async with self._session_maker() as session:
                    key_manager = InfisicalKeyManager(session, redis, infisical_client)

                    # Check if JWT rotation is needed
                    jwt_needs_rotation, jwt_reason = await key_manager.check_rotation_needed()
                    if jwt_needs_rotation:
                        logger.warning("JWT rotation needed: %s", jwt_reason)

                        # Store rotation alert
                        await self._store_rotation_alert("jwt", jwt_reason)

                    # Check if AES rotation is needed
                    aes_needs_rotation, aes_reason = await key_manager._check_aes_rotation_needed()
                    if aes_needs_rotation:
                        logger.warning("AES rotation needed: %s", aes_reason)

                        # Store rotation alert
                        await self._store_rotation_alert("aes", aes_reason)

                # Wait 1 hour before next check
                await asyncio.sleep(3600)

            except asyncio.CancelledError:
                break
            except Exception:
                logger.exception("Rotation monitoring failed")
                # Back off for 10 minutes on error
                await asyncio.sleep(600)

        logger.info("Rotation monitoring loop stopped")

    async def _cleanup_loop(self) -> None:
        """Background task for cleaning up old monitoring data."""
        logger.info("Starting cleanup loop (daily cleanup)")

        while self._running:
            try:
                # Clean up old data daily
                redis = get_redis_pool()

                # Clean up old metrics (keep 7 days)
                cutoff_time = int((datetime.now(UTC) - timedelta(days=7)).timestamp())

                # Clean up timeseries data
                timeseries_data = await redis.hgetall("infisical:monitoring:timeseries")
                old_keys = []

                for timestamp_str in timeseries_data:
                    try:
                        timestamp = int(timestamp_str)
                        if timestamp < cutoff_time:
                            old_keys.append(timestamp_str)
                    except (ValueError, TypeError):
                        # Remove invalid keys
                        old_keys.append(timestamp_str)

                if old_keys:
                    await redis.hdel("infisical:monitoring:timeseries", *old_keys)
                    logger.info("Cleaned up %d old metrics entries", len(old_keys))

                # Clean up old alerts (keep 100 most recent)
                await redis.ltrim("infisical:alerts", 0, 99)

                # Clean up old rotation history (keep 50 most recent)
                await redis.ltrim("infisical:rotation:history", 0, 49)

                # Wait 24 hours before next cleanup
                await asyncio.sleep(86400)

            except asyncio.CancelledError:
                break
            except Exception:
                logger.exception("Cleanup failed")
                # Back off for 1 hour on error
                await asyncio.sleep(3600)

        logger.info("Cleanup loop stopped")

    @staticmethod
    async def _store_rotation_alert(key_type: str, reason: str) -> None:
        """Store a rotation alert in Redis."""
        try:
            redis = get_redis_pool()

            alert = {
                "timestamp": datetime.now(UTC).isoformat(),
                "service": "infisical",
                "severity": "warning",
                "message": f"{key_type.upper()} key rotation needed",
                "details": {
                    "key_type": key_type,
                    "reason": reason,
                    "automated_check": True,
                },
            }

            await redis.lpush("infisical:alerts", json.dumps(alert))
            logger.info("Stored rotation alert for %s keys: %s", key_type, reason)

        except Exception:
            logger.exception("Failed to store rotation alert")


# Global scheduler instance
_scheduler: MonitoringScheduler | None = None


async def start_monitoring_scheduler() -> None:
    """Start the global monitoring scheduler."""
    global _scheduler  # noqa: PLW0603

    if _scheduler is not None:
        logger.warning("Monitoring scheduler already exists")
        return

    _scheduler = MonitoringScheduler()
    await _scheduler.start()


async def stop_monitoring_scheduler() -> None:
    """Stop the global monitoring scheduler."""
    global _scheduler  # noqa: PLW0603

    if _scheduler is None:
        return

    await _scheduler.stop()
    _scheduler = None


def get_monitoring_scheduler() -> MonitoringScheduler | None:
    """Get the global monitoring scheduler instance."""
    return _scheduler
