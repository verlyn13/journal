"""Security monitoring and alerting endpoints for the Infisical integration."""

from __future__ import annotations

from contextlib import suppress
from datetime import UTC, datetime
import json
import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.db import get_session
from app.infra.redis import get_redis
from app.infra.secrets import InfisicalSecretsClient
from app.infra.secrets.enhanced_key_manager import InfisicalKeyManager
from app.infra.secrets.infisical_client import InfisicalError
from app.settings import settings


logger = logging.getLogger(__name__)
router = APIRouter()


def get_enhanced_key_manager(
    session: AsyncSession = Depends(get_session),
    redis: Redis = Depends(get_redis),
) -> InfisicalKeyManager:
    """Get enhanced key manager with optional Infisical client.

    Args:
        session: Database session dependency
        redis: Redis client dependency

    Returns:
        InfisicalKeyManager configured with optional Infisical client
    """
    infisical_client = None
    try:
        if settings.infisical_enabled:
            infisical_client = InfisicalSecretsClient.from_env(redis)
    except InfisicalError:
        # Fallback gracefully if env not configured in this environment
        infisical_client = None

    return InfisicalKeyManager(session, redis, infisical_client)


@router.get("/security/status")
async def get_security_status(
    key_manager: InfisicalKeyManager = Depends(get_enhanced_key_manager),
) -> dict[str, Any]:
    """Get comprehensive security status for monitoring dashboards.

    Returns:
        Complete security status including health, events, and metrics
    """
    try:
        security_status = await key_manager.get_security_status()

        # Add system-wide status
        # Derive system metadata from available settings
        infisical_configured = bool(
            getattr(settings, "infisical_enabled", False)
            and getattr(settings, "infisical_project_id", "")
            and getattr(settings, "infisical_server_url", "")
        )

        security_status["system"] = {
            "version": "1.0.0",
            "environment": settings.env,
            "infisical_configured": bool(infisical_configured),
        }

        return security_status

    except Exception as e:
        logger.exception("Failed to get security status")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve security status: {e}",
        ) from e


@router.get("/security/events")
async def get_security_events(
    event_type: str | None = None,
    limit: int = 50,
    key_manager: InfisicalKeyManager = Depends(get_enhanced_key_manager),
) -> dict[str, Any]:
    """Get recent security events for monitoring and alerting.

    Args:
        event_type: Filter by specific event type
        limit: Maximum number of events to return (max 100)
        key_manager: Dependency-injected key manager

    Returns:
        List of recent security events with metadata
    """
    limit = min(limit, 100)

    try:
        events = await key_manager.security_monitor.get_recent_events(
            event_type=event_type,
            limit=limit,
        )

        return {
            "events": events,
            "count": len(events),
            "filter": {
                "event_type": event_type,
                "limit": limit,
            },
            "timestamp": datetime.now(UTC).isoformat(),
        }

    except Exception as e:
        logger.exception("Failed to get security events")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve security events: {e}",
        ) from e


@router.get("/security/metrics")
async def get_security_metrics(
    key_manager: InfisicalKeyManager = Depends(get_enhanced_key_manager),
) -> dict[str, Any]:
    """Get security metrics summary for monitoring dashboards.

    Returns:
        Security metrics including event counts and trends
    """
    try:
        metrics = await key_manager.security_monitor.get_metrics_summary()

        # Add computed metrics
        total_events = sum(metrics.values())
        critical_events = sum(
            count
            for event_type, count in metrics.items()
            if "failed" in event_type or "emergency" in event_type
        )

        return {
            "metrics": metrics,
            "summary": {
                "total_events": total_events,
                "critical_events": critical_events,
                "health_score": max(0, 100 - (critical_events * 10)),  # Simple health score
            },
            "timestamp": datetime.now(UTC).isoformat(),
        }

    except Exception as e:
        logger.exception("Failed to get security metrics")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve security metrics: {e}",
        ) from e


@router.post("/security/emergency-mode")
async def toggle_emergency_mode(
    enable: bool,
    reason: str,
    redis: Redis = Depends(get_redis),
    key_manager: InfisicalKeyManager = Depends(get_enhanced_key_manager),
) -> dict[str, str]:
    """Toggle emergency mode for the key management system.

    Emergency mode forces the system to use cached/fallback keys
    when Infisical is unavailable or compromised.

    Args:
        enable: True to enable emergency mode, False to disable
        reason: Reason for the change
        redis: Dependency-injected Redis client
        key_manager: Dependency-injected key manager

    Returns:
        Emergency mode status
    """
    try:
        if enable:
            # Enable emergency mode
            await redis.setex(
                "auth:keys:emergency_mode",
                86400,  # 24 hours
                datetime.now(UTC).isoformat(),
            )

            # Record security event
            await key_manager.security_monitor.record_event(
                key_manager.security_monitor.SecurityEvent(
                    event_type="emergency_mode_enabled",
                    severity="critical",
                    message=f"Emergency mode enabled: {reason}",
                    metadata={"reason": reason, "enabled_at": datetime.now(UTC).isoformat()},
                )
            )

            return {
                "status": "enabled",
                "message": f"Emergency mode enabled: {reason}",
                "timestamp": datetime.now(UTC).isoformat(),
            }
        # Disable emergency mode
        await redis.delete("auth:keys:emergency_mode")

        # Record security event
        await key_manager.security_monitor.record_event(
            key_manager.security_monitor.SecurityEvent(
                event_type="emergency_mode_disabled",
                severity="medium",
                message=f"Emergency mode disabled: {reason}",
                metadata={"reason": reason, "disabled_at": datetime.now(UTC).isoformat()},
            )
        )

        return {
            "status": "disabled",
            "message": f"Emergency mode disabled: {reason}",
            "timestamp": datetime.now(UTC).isoformat(),
        }

    except Exception as e:
        logger.exception("Failed to toggle emergency mode")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to toggle emergency mode: {e}",
        ) from e


@router.post("/security/force-rotation")
async def force_key_rotation(
    reason: str,
    key_manager: InfisicalKeyManager = Depends(get_enhanced_key_manager),
) -> dict[str, Any]:
    """Force immediate key rotation for security incidents.

    Args:
        reason: Reason for forced rotation
        key_manager: Dependency-injected key manager

    Returns:
        Rotation result
    """
    try:
        # Record security event for forced rotation
        await key_manager.security_monitor.record_event(
            key_manager.security_monitor.SecurityEvent(
                event_type="forced_rotation_requested",
                severity="high",
                message=f"Forced key rotation requested: {reason}",
                metadata={"reason": reason},
            )
        )

        # Perform forced rotation
        rotation_result = await key_manager.rotate_keys(force=True)

        return {
            "status": "completed",
            "result": rotation_result,
            "reason": reason,
            "timestamp": datetime.now(UTC).isoformat(),
        }

    except Exception as e:
        logger.exception("Failed to force key rotation")

        # Record failure event without masking original error
        with suppress(Exception):
            await key_manager.security_monitor.record_event(
                key_manager.security_monitor.SecurityEvent(
                    event_type="forced_rotation_failed",
                    severity="critical",
                    message=f"Forced key rotation failed: {e}",
                    metadata={"reason": reason, "error": str(e)},
                )
            )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to force key rotation: {e}",
        ) from e


@router.post("/security/invalidate-cache")
async def invalidate_secrets_cache(
    secret_path: str | None = None,
    key_manager: InfisicalKeyManager = Depends(get_enhanced_key_manager),
) -> dict[str, Any]:
    """Invalidate secrets cache for security incidents.

    Args:
        secret_path: Specific secret path to invalidate, or None for all
        key_manager: Dependency-injected key manager

    Returns:
        Cache invalidation result
    """
    try:
        if not key_manager.infisical_client:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="Infisical client not configured",
            )

        # Invalidate cache
        invalidated_count = await key_manager.infisical_client.invalidate_cache(secret_path)

        # Record security event
        await key_manager.security_monitor.record_event(
            key_manager.security_monitor.SecurityEvent(
                event_type="cache_invalidated",
                severity="medium",
                message=f"Secrets cache invalidated: {secret_path or 'all secrets'}",
                metadata={
                    "secret_path": secret_path,
                    "invalidated_count": invalidated_count,
                },
            )
        )

        return {
            "status": "completed",
            "invalidated_count": invalidated_count,
            "secret_path": secret_path or "all",
            "timestamp": datetime.now(UTC).isoformat(),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to invalidate cache")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to invalidate cache: {e}",
        ) from e


@router.get("/security/alerts")
async def get_active_alerts(
    severity: str | None = None,
    redis: Redis = Depends(get_redis),
) -> dict[str, Any]:
    """Get active security alerts for monitoring systems.

    Args:
        severity: Filter by severity level (low, medium, high, critical)
        redis: Dependency-injected Redis client

    Returns:
        List of active security alerts
    """
    try:
        alerts = []
        pattern = "security:alerts:*"

        async for key in redis.scan_iter(match=pattern):
            try:
                alert_data = await redis.get(key)
                if alert_data:
                    alert = json.loads(alert_data.decode())

                    # Filter by severity if specified
                    if severity and alert.get("severity") != severity:
                        continue

                    alerts.append(alert)
            except (json.JSONDecodeError, UnicodeDecodeError):
                continue  # Skip corrupted entries

        # Sort by timestamp (newest first)
        alerts.sort(key=lambda x: x.get("timestamp", ""), reverse=True)

        return {
            "alerts": alerts,
            "count": len(alerts),
            "filter": {"severity": severity},
            "timestamp": datetime.now(UTC).isoformat(),
        }

    except Exception as e:
        logger.exception("Failed to get active alerts")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve active alerts: {e}",
        ) from e
