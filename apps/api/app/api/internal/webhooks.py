"""Internal webhook endpoints for Infisical key rotation notifications."""

from __future__ import annotations

import json
import logging

from contextlib import suppress
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from redis.asyncio import Redis
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.audit_service import AuditService
from app.domain.auth.key_manager import KeyManager
from app.infra.db import get_session
from app.infra.redis import get_redis
from app.infra.security import WebhookSecurityManager, WebhookVerificationError
from app.settings import settings


logger = logging.getLogger(__name__)
router = APIRouter()


class WebhookDependencies:
    """Dependency provider for webhook endpoints."""

    def __init__(self) -> None:
        self._security_manager: WebhookSecurityManager | None = None

    async def get_security_manager(
        self, redis: Redis = Depends(get_redis)
    ) -> WebhookSecurityManager:
        """Get webhook security manager singleton."""
        if self._security_manager is None:
            self._security_manager = WebhookSecurityManager(
                redis=redis,
                webhook_secret=settings.infisical_webhook_secret,
                max_requests=50,  # Conservative rate limit for internal webhooks
                window_seconds=3600,
            )
        return self._security_manager


webhook_deps = WebhookDependencies()


async def verify_webhook_security(
    request: Request,
    security_manager: WebhookSecurityManager = Depends(webhook_deps.get_security_manager),
) -> dict[str, Any]:
    """Verify webhook signature and rate limiting.

    Args:
        request: FastAPI request object
        security_manager: Webhook security manager

    Returns:
        Verification result metadata

    Raises:
        HTTPException: For security validation failures
    """
    # Extract required headers
    signature = request.headers.get("X-Infisical-Signature")
    timestamp = request.headers.get("X-Infisical-Timestamp")
    nonce = request.headers.get("X-Infisical-Nonce")

    if not signature:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing webhook signature"
        )

    if not timestamp:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing webhook timestamp"
        )

    # Get raw payload
    payload = await request.body()

    # Use client IP for rate limiting
    client_ip = request.client.host if request.client else "unknown"

    try:
        verification_result = await security_manager.verify_and_rate_limit(
            signature=signature,
            timestamp=timestamp,
            payload=payload,
            identifier=client_ip,
            nonce=nonce,
        )

        # Parse JSON payload for webhook processing
        try:
            webhook_data = json.loads(payload.decode())
            verification_result["webhook_data"] = webhook_data
        except (json.JSONDecodeError, UnicodeDecodeError) as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid webhook payload: {e}"
            ) from e

        return verification_result

    except WebhookVerificationError as e:
        logger.warning(
            "Webhook verification failed", extra={"error": str(e), "client_ip": client_ip}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Webhook verification failed: {e}"
        ) from e
    except ValueError as e:
        logger.warning("Webhook rate limited", extra={"error": str(e), "client_ip": client_ip})
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(e)) from e


@router.post("/keys/changed")
async def handle_jwt_key_rotation(
    verification_result: dict[str, Any] = Depends(verify_webhook_security),
    session: AsyncSession = Depends(get_session),
    redis: Redis = Depends(get_redis),
) -> dict[str, str]:
    """Handle JWT key rotation webhook from Infisical.

    This endpoint is called by Infisical when JWT signing keys are rotated.
    It triggers the local key rotation process to maintain synchronization.

    Args:
        verification_result: Verified webhook data and metadata
        session: Database session
        redis: Redis client

    Returns:
        Success response with rotation status
    """
    webhook_data = verification_result["webhook_data"]

    # Extract webhook details
    event_type = webhook_data.get("event", "unknown")
    secret_path = webhook_data.get("secretPath", "")
    project_id = webhook_data.get("projectId", "")

    logger.info(
        "JWT key rotation webhook received",
        extra={
            "event_type": event_type,
            "secret_path": secret_path,
            "project_id": project_id,
            "verification_time": verification_result["verification_time"].isoformat(),
        },
    )

    try:
        # Initialize key manager and trigger rotation
        key_manager = KeyManager(session, redis)

        # Check if rotation is needed and force if webhook indicates key change
        needs_rotation, reason = await key_manager.check_rotation_needed()

        if event_type in {"secret.created", "secret.updated", "secret.deleted"}:
            # Force rotation for key-related events
            rotation_result = await key_manager.rotate_keys(force=True)

            # Log to audit trail
            audit_service = AuditService(session)
            await audit_service.log_event(
                user_id=settings.system_user_id,
                event_type="webhook_key_rotation",
                event_data={
                    "trigger": "infisical_webhook",
                    "event_type": event_type,
                    "secret_path": secret_path,
                    "rotation_result": rotation_result,
                    "project_id": project_id,
                },
            )

            return {
                "status": "success",
                "message": f"Key rotation triggered by {event_type}",
                "rotation_status": rotation_result.get("status", "unknown"),
            }
        # Non-key events - just log and verify system health
        integrity_result = await key_manager.verify_key_integrity()

        return {
            "status": "acknowledged",
            "message": f"Webhook {event_type} processed",
            "key_system_healthy": integrity_result.get("current_key_valid", False),
        }

    except Exception as e:
        logger.exception("Failed to process JWT key rotation webhook")

        # Log failure to audit trail
        with suppress(Exception):
            audit_service = AuditService(session)
            await audit_service.log_event(
                user_id=settings.system_user_id,
                event_type="webhook_key_rotation_failed",
                event_data={
                    "error": str(e),
                    "event_type": event_type,
                    "secret_path": secret_path,
                    "project_id": project_id,
                },
            )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Key rotation processing failed: {e}",
        ) from e


@router.post("/aes/activekid")
async def handle_aes_key_rotation(
    verification_result: dict[str, Any] = Depends(verify_webhook_security),
    session: AsyncSession = Depends(get_session),
    redis: Redis = Depends(get_redis),
) -> dict[str, str]:
    """Handle AES key rotation webhook from Infisical.

    This endpoint handles notifications when AES encryption keys are rotated
    in Infisical, triggering cache invalidation and key refresh.

    Args:
        verification_result: Verified webhook data and metadata
        session: Database session
        redis: Redis client

    Returns:
        Success response with processing status
    """
    webhook_data = verification_result["webhook_data"]

    # Extract webhook details
    event_type = webhook_data.get("event", "unknown")
    secret_path = webhook_data.get("secretPath", "")
    new_key_id = webhook_data.get("newKeyId")
    project_id = webhook_data.get("projectId", "")

    logger.info(
        "AES key rotation webhook received",
        extra={
            "event_type": event_type,
            "secret_path": secret_path,
            "new_key_id": new_key_id,
            "project_id": project_id,
        },
    )

    try:
        # Invalidate AES key caches
        cache_keys_to_clear = [
            "auth:aes:current_key",
            "auth:aes:active_keys",
            "auth:encryption:*",  # Pattern for encryption-related caches
        ]

        cleared_count = 0
        for cache_key in cache_keys_to_clear:
            if "*" in cache_key:
                # Handle pattern deletion
                pattern_keys = [key async for key in redis.scan_iter(match=cache_key)]
                if pattern_keys:
                    cleared_count += await redis.delete(*pattern_keys)
            else:
                # Direct key deletion
                cleared_count += await redis.delete(cache_key)

        # Update active key ID if provided
        if new_key_id:
            await redis.setex("auth:aes:active_key_id", 3600, new_key_id)  # 1-hour cache

        # Log to audit trail
        audit_service = AuditService(session)
        await audit_service.log_event(
            user_id=settings.system_user_id,
            event_type="webhook_aes_key_rotation",
            event_data={
                "trigger": "infisical_webhook",
                "event_type": event_type,
                "secret_path": secret_path,
                "new_key_id": new_key_id,
                "caches_cleared": cleared_count,
                "project_id": project_id,
            },
        )

        return {
            "status": "success",
            "message": f"AES key rotation processed for {event_type}",
            "caches_cleared": cleared_count,
            "new_key_id": new_key_id,
        }

    except Exception as e:
        logger.exception("Failed to process AES key rotation webhook")

        # Log failure to audit trail
        with suppress(Exception):
            audit_service = AuditService(session)
            await audit_service.log_event(
                user_id=settings.system_user_id,
                event_type="webhook_aes_key_rotation_failed",
                event_data={
                    "error": str(e),
                    "event_type": event_type,
                    "secret_path": secret_path,
                    "new_key_id": new_key_id,
                    "project_id": project_id,
                },
            )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AES key rotation processing failed: {e}",
        ) from e


@router.get("/health")
async def webhook_health(
    redis: Redis = Depends(get_redis),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """Health check endpoint for webhook system.

    Returns:
        Health status and system information
    """
    try:
        # Check Redis connectivity
        await redis.ping()
        redis_healthy = True
    except Exception:  # noqa: BLE001 - health check should be resilient
        redis_healthy = False

    try:
        # Check database connectivity with a simple query
        await session.execute(text("SELECT 1"))
        db_healthy = True
    except Exception:  # noqa: BLE001 - health check should be resilient
        db_healthy = False

    try:
        # Check key system integrity
        key_manager = KeyManager(session, redis)
        integrity_result = await key_manager.verify_key_integrity()
        key_system_healthy = integrity_result.get("current_key_valid", False)
    except Exception:  # noqa: BLE001 - health check should be resilient
        key_system_healthy = False

    overall_healthy = redis_healthy and db_healthy and key_system_healthy

    return {
        "status": "healthy" if overall_healthy else "degraded",
        "components": {
            "redis": "healthy" if redis_healthy else "unhealthy",
            "database": "healthy" if db_healthy else "unhealthy",
            "key_system": "healthy" if key_system_healthy else "unhealthy",
        },
        "timestamp": datetime.now(UTC).isoformat(),
    }
