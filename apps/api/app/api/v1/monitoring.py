"""Monitoring API endpoints for Infisical integration.

This module provides REST endpoints for monitoring the Infisical CLI v0.42.1
integration health, performance metrics, and alerting status.
"""

from __future__ import annotations

import logging

from datetime import UTC, datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, Field
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.db import get_session
from app.infra.redis import get_redis
from app.infra.secrets import InfisicalSecretsClient
from app.infra.secrets.enhanced_key_manager import InfisicalKeyManager
from app.middleware.enhanced_jwt_middleware import require_scopes
from app.telemetry.infisical_monitoring import InfisicalMonitoringService
from app.telemetry.metrics_runtime import inc as metrics_inc


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/monitoring", tags=["monitoring"])


class MonitoringMetrics(BaseModel):
    """Model for Infisical monitoring metrics."""

    timestamp: str = Field(..., description="Metrics collection timestamp")
    collection_duration: float = Field(..., description="Time taken to collect metrics")
    health: dict[str, Any] = Field(..., description="Health status metrics")
    performance: dict[str, Any] = Field(..., description="Performance metrics")
    security: dict[str, Any] = Field(..., description="Security-related metrics")
    cache: dict[str, Any] = Field(..., description="Cache performance metrics")
    rotation: dict[str, Any] = Field(..., description="Key rotation metrics")
    webhooks: dict[str, Any] = Field(..., description="Webhook activity metrics")


class AlertModel(BaseModel):
    """Model for monitoring alerts."""

    timestamp: str = Field(..., description="Alert timestamp")
    service: str = Field(..., description="Service name")
    severity: str = Field(..., description="Alert severity (critical, warning, info)")
    message: str = Field(..., description="Alert message")
    details: dict[str, Any] = Field(default_factory=dict, description="Alert details")


class HealthStatus(BaseModel):
    """Model for health check status."""

    status: str = Field(..., description="Overall health status")
    timestamp: str = Field(..., description="Health check timestamp")
    components: dict[str, Any] = Field(..., description="Component health status")
    uptime_seconds: float | None = Field(None, description="Service uptime")


async def get_infisical_client() -> InfisicalSecretsClient:
    """Get Infisical client dependency."""
    redis = await get_redis()
    return InfisicalSecretsClient.from_env(redis)


async def get_key_manager(
    session: AsyncSession = Depends(get_session),
    redis: Redis = Depends(get_redis),
    infisical_client: InfisicalSecretsClient = Depends(get_infisical_client),
) -> InfisicalKeyManager:
    """Get enhanced key manager dependency."""
    return InfisicalKeyManager(session, redis, infisical_client)


async def get_monitoring_service(
    redis: Redis = Depends(get_redis),
    infisical_client: InfisicalSecretsClient = Depends(get_infisical_client),
    key_manager: InfisicalKeyManager = Depends(get_key_manager),
) -> InfisicalMonitoringService:
    """Get monitoring service dependency."""
    return InfisicalMonitoringService(redis, infisical_client, key_manager)


@router.get("/health", response_model=HealthStatus)
async def get_health_status(
    request: Request,
    monitoring_service: InfisicalMonitoringService = Depends(get_monitoring_service),
) -> HealthStatus:
    """Get overall health status of Infisical integration.

    Returns:
        Health status including all component statuses
    """
    try:
        # Get cached metrics first for quick response
        current_metrics = await monitoring_service.get_current_metrics()

        if current_metrics and current_metrics.get("health"):
            health_data = current_metrics["health"]

            return HealthStatus(
                status=health_data.get("overall_status", "unknown"),
                timestamp=current_metrics.get("timestamp", datetime.now(UTC).isoformat()),
                components={
                    "infisical_client": health_data.get("infisical_client", {}),
                    "key_manager": health_data.get("key_manager", {}),
                    "redis": health_data.get("redis", {}),
                },
                uptime_seconds=current_metrics.get("collection_duration"),
            )

        # Fall back to fresh health check if no cached data
        logger.info("No cached health data, performing fresh check")
        metrics = await monitoring_service.collect_metrics()
        health_data = metrics.get("health", {})

        metrics_inc("monitoring_health_check_total")

        return HealthStatus(
            status=health_data.get("overall_status", "unknown"),
            timestamp=metrics.get("timestamp", datetime.now(UTC).isoformat()),
            components={
                "infisical_client": health_data.get("infisical_client", {}),
                "key_manager": health_data.get("key_manager", {}),
                "redis": health_data.get("redis", {}),
            },
            uptime_seconds=metrics.get("collection_duration"),
        )

    except Exception as e:
        logger.error("Health check failed: %s", e)
        metrics_inc("monitoring_health_check_errors_total")

        return HealthStatus(
            status="error",
            timestamp=datetime.now(UTC).isoformat(),
            components={"error": str(e)},
        )


@router.get("/metrics", response_model=MonitoringMetrics)
async def get_current_metrics(
    request: Request,
    refresh: bool = Query(False, description="Force refresh of metrics"),
    monitoring_service: InfisicalMonitoringService = Depends(get_monitoring_service),
) -> MonitoringMetrics:
    """Get current Infisical integration metrics.

    Args:
        refresh: If True, collect fresh metrics instead of using cached data

    Returns:
        Current monitoring metrics
    """
    try:
        if refresh:
            # Collect fresh metrics
            metrics = await monitoring_service.collect_metrics()
        else:
            # Try to get cached metrics first
            metrics = await monitoring_service.get_current_metrics()

            # If no cached data or data is stale (>5 minutes), collect fresh
            if not metrics:
                logger.info("No cached metrics found, collecting fresh data")
                metrics = await monitoring_service.collect_metrics()
            else:
                # Check if data is stale
                from datetime import UTC, datetime

                import dateutil.parser

                timestamp = dateutil.parser.parse(metrics["timestamp"])
                age_seconds = (datetime.now(UTC) - timestamp).total_seconds()

                if age_seconds > 300:  # 5 minutes
                    logger.info(
                        "Cached metrics are stale (%d seconds), collecting fresh", age_seconds
                    )
                    metrics = await monitoring_service.collect_metrics()

        metrics_inc("monitoring_metrics_request_total")

        return MonitoringMetrics.model_validate(metrics)

    except Exception as e:
        logger.error("Failed to get metrics: %s", e)
        metrics_inc("monitoring_metrics_request_errors_total")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to collect metrics: {e}",
        ) from e


@router.get("/metrics/history", response_model=list[MonitoringMetrics])
async def get_metrics_history(
    request: Request,
    hours: int = Query(24, ge=1, le=168, description="Hours of history to retrieve (max 7 days)"),
    monitoring_service: InfisicalMonitoringService = Depends(get_monitoring_service),
) -> list[MonitoringMetrics]:
    """Get historical metrics for the specified time period.

    Args:
        hours: Number of hours of history to retrieve (1-168)

    Returns:
        List of historical metrics
    """
    try:
        history = await monitoring_service.get_metrics_history(hours)

        metrics_inc("monitoring_metrics_history_request_total")

        return [MonitoringMetrics.model_validate(metrics) for metrics in history]

    except Exception as e:
        logger.error("Failed to get metrics history: %s", e)
        metrics_inc("monitoring_metrics_history_request_errors_total")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get metrics history: {e}",
        ) from e


@router.get("/alerts", response_model=list[AlertModel])
async def get_active_alerts(
    monitoring_service: InfisicalMonitoringService = Depends(get_monitoring_service),
) -> list[AlertModel]:
    """Get currently active alerts.

    Returns:
        List of active alerts
    """
    try:
        alerts = await monitoring_service.get_active_alerts()

        metrics_inc("monitoring_alerts_request_total")

        return [AlertModel.model_validate(alert) for alert in alerts]

    except Exception as e:
        logger.error("Failed to get alerts: %s", e)
        metrics_inc("monitoring_alerts_request_errors_total")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to get alerts: {e}"
        ) from e


@router.post("/metrics/collect")
async def trigger_metrics_collection(
    background_tasks: BackgroundTasks,
    monitoring_service: InfisicalMonitoringService = Depends(get_monitoring_service),
) -> dict[str, Any]:
    """Trigger immediate metrics collection in the background.

    Returns:
        Confirmation of metrics collection initiation
    """
    try:
        # Run collection in background to avoid blocking the request
        background_tasks.add_task(monitoring_service.collect_metrics)

        metrics_inc("monitoring_metrics_collection_triggered_total")

        return {
            "status": "accepted",
            "message": "Metrics collection initiated",
            "timestamp": datetime.now(UTC).isoformat(),
        }

    except Exception as e:
        logger.error("Failed to trigger metrics collection: %s", e)
        metrics_inc("monitoring_metrics_collection_trigger_errors_total")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to trigger metrics collection: {e}",
        ) from e


@router.get("/dashboard")
async def get_monitoring_dashboard(
    monitoring_service: InfisicalMonitoringService = Depends(get_monitoring_service),
) -> dict[str, Any]:
    """Get comprehensive monitoring dashboard data.

    Returns:
        Dashboard data including metrics, alerts, and trends
    """
    try:
        # Get current metrics
        current_metrics = await monitoring_service.get_current_metrics()
        if not current_metrics:
            current_metrics = await monitoring_service.collect_metrics()

        # Get recent alerts
        alerts = await monitoring_service.get_active_alerts()

        # Get short history for trends (last 6 hours)
        history = await monitoring_service.get_metrics_history(6)

        # Calculate simple trends
        trends = {}
        if len(history) > 1:
            latest = history[-1]
            previous = history[0]

            # Health trend
            latest_health = latest.get("health", {}).get("overall_status")
            previous_health = previous.get("health", {}).get("overall_status")
            trends["health"] = {
                "current": latest_health,
                "previous": previous_health,
                "improving": latest_health == "healthy" and previous_health != "healthy",
            }

            # Performance trend
            latest_latency = (
                latest.get("performance", {}).get("secret_retrieval", {}).get("latency_seconds", 0)
            )
            previous_latency = (
                previous.get("performance", {})
                .get("secret_retrieval", {})
                .get("latency_seconds", 0)
            )
            trends["performance"] = {
                "current_latency": latest_latency,
                "previous_latency": previous_latency,
                "improving": latest_latency < previous_latency,
            }

        dashboard_data = {
            "timestamp": datetime.now(UTC).isoformat(),
            "current_metrics": current_metrics,
            "active_alerts": alerts,
            "alert_summary": {
                "total": len(alerts),
                "critical": len([a for a in alerts if a.get("severity") == "critical"]),
                "warning": len([a for a in alerts if a.get("severity") == "warning"]),
            },
            "trends": trends,
            "data_points": len(history),
        }

        metrics_inc("monitoring_dashboard_request_total")

        return dashboard_data

    except Exception as e:
        logger.error("Failed to get dashboard data: %s", e)
        metrics_inc("monitoring_dashboard_request_errors_total")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get dashboard data: {e}",
        ) from e


@router.delete("/alerts/{alert_id}")
async def acknowledge_alert(
    alert_id: str,
    redis: Redis = Depends(get_redis),
) -> dict[str, Any]:
    """Acknowledge and dismiss a specific alert.

    Args:
        alert_id: ID of the alert to acknowledge

    Returns:
        Confirmation of alert acknowledgment
    """
    try:
        # Remove alert from active alerts list
        # Note: This is a simplified implementation
        # In production, you'd want to mark alerts as acknowledged rather than delete

        import json

        # Get all alerts
        alerts = await redis.lrange("infisical:alerts", 0, -1)

        # Find and remove the specified alert
        removed = False
        for i, alert_data in enumerate(alerts):
            try:
                alert = json.loads(alert_data)
                # Use timestamp + message as pseudo-ID (better to have real IDs)
                pseudo_id = f"{alert.get('timestamp', '')}:{alert.get('message', '')}"
                if pseudo_id == alert_id:
                    await redis.lrem("infisical:alerts", 1, alert_data)
                    removed = True
                    break
            except json.JSONDecodeError:
                continue

        if not removed:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

        metrics_inc("monitoring_alert_acknowledged_total")

        return {
            "status": "acknowledged",
            "alert_id": alert_id,
            "timestamp": datetime.now(UTC).isoformat(),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to acknowledge alert: %s", e)
        metrics_inc("monitoring_alert_acknowledge_errors_total")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to acknowledge alert: {e}",
        ) from e
