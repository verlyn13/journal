"""Infisical webhook handlers for key rotation and secrets management.

This module provides secure webhook endpoints for handling Infisical events,
including automated key rotation, secret updates, and health monitoring.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import logging

from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.db import get_session
from app.infra.redis import get_redis
from app.infra.secrets import InfisicalSecretsClient
from app.infra.secrets.enhanced_key_manager import InfisicalKeyManager
from app.settings import settings
from app.telemetry.metrics_runtime import inc as metrics_inc


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/infisical", tags=["infisical"])


class WebhookEvent(BaseModel):
    """Infisical webhook event model."""

    id: str = Field(..., description="Event ID")
    event: str = Field(..., description="Event type")
    project_id: str = Field(..., description="Project ID")
    environment: str = Field(..., description="Environment name")
    secret_path: str = Field(..., description="Secret path")
    timestamp: str = Field(..., description="Event timestamp")
    data: dict[str, Any] = Field(default_factory=dict, description="Event data")


class KeyRotationRequest(BaseModel):
    """Manual key rotation request."""

    rotation_type: str = Field(..., description="Type of rotation: jwt, aes, or both")
    force: bool = Field(default=False, description="Force rotation even if not needed")
    reason: str = Field(default="", description="Reason for manual rotation")


class WebhookResponse(BaseModel):
    """Webhook response model."""

    status: str = Field(..., description="Response status")
    message: str = Field(..., description="Response message")
    event_id: str | None = Field(None, description="Event ID if applicable")
    processed_at: str = Field(..., description="Processing timestamp")


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


async def verify_webhook_signature(request: Request, body: bytes) -> None:
    """Verify Infisical webhook signature.

    Args:
        request: FastAPI request object
        body: Raw request body

    Raises:
        HTTPException: If signature verification fails
    """
    signature = request.headers.get("x-infisical-signature")
    if not signature:
        logger.warning("Missing webhook signature")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing webhook signature"
        )

    # Get webhook secret from environment or Infisical
    webhook_secret = settings.infisical_webhook_secret
    if not webhook_secret:
        logger.error("Webhook secret not configured")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Webhook secret not configured",
        )

    # Verify HMAC signature
    expected_signature = hmac.new(webhook_secret.encode(), body, hashlib.sha256).hexdigest()

    # Use constant-time comparison
    if not hmac.compare_digest(f"sha256={expected_signature}", signature):
        logger.warning("Invalid webhook signature")
        metrics_inc("infisical_webhook_signature_invalid_total")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid webhook signature"
        )

    metrics_inc("infisical_webhook_signature_valid_total")


@router.post("/webhook", response_model=WebhookResponse)
async def handle_infisical_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    key_manager: InfisicalKeyManager = Depends(get_key_manager),
) -> WebhookResponse:
    """Handle Infisical webhook events.

    Supports the following events:
    - secret.created
    - secret.updated
    - secret.deleted
    - project.updated

    Args:
        request: FastAPI request
        background_tasks: Background tasks
        key_manager: Enhanced key manager

    Returns:
        Webhook response
    """
    # Read raw body for signature verification
    body = await request.body()

    # Verify webhook signature
    await verify_webhook_signature(request, body)

    try:
        # Parse webhook event
        event_data = json.loads(body.decode())
        event = WebhookEvent.model_validate(event_data)

        logger.info("Received Infisical webhook: %s for project %s", event.event, event.project_id)

        # Validate project ID
        if event.project_id != settings.infisical_project_id:
            logger.warning(
                "Webhook for unknown project: %s (expected: %s)",
                event.project_id,
                settings.infisical_project_id,
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown project ID"
            )

        # Handle different event types
        response_message = "Event received"

        if event.event in ("secret.created", "secret.updated", "secret.deleted"):
            response_message = await _handle_secret_event(event, key_manager, background_tasks)
        elif event.event == "project.updated":
            response_message = await _handle_project_event(event, key_manager, background_tasks)
        else:
            logger.info("Ignoring unsupported event type: %s", event.event)
            response_message = f"Ignored unsupported event: {event.event}"

        metrics_inc("infisical_webhook_events_total", {"event": event.event, "status": "success"})

        return WebhookResponse(
            status="success",
            message=response_message,
            event_id=event.id,
            processed_at=datetime.now(UTC).isoformat(),
        )

    except json.JSONDecodeError as e:
        logger.error("Invalid JSON in webhook payload: %s", e)
        metrics_inc("infisical_webhook_events_total", {"event": "unknown", "status": "json_error"})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON payload"
        ) from e
    except Exception as e:
        logger.error("Webhook processing failed: %s", e)
        metrics_inc("infisical_webhook_events_total", {"event": "unknown", "status": "error"})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Webhook processing failed"
        ) from e


@router.post("/rotate", response_model=dict[str, Any])
async def manual_key_rotation(
    request: KeyRotationRequest,
    background_tasks: BackgroundTasks,
    key_manager: InfisicalKeyManager = Depends(get_key_manager),
) -> dict[str, Any]:
    """Manually trigger key rotation.

    Args:
        request: Rotation request
        background_tasks: Background tasks
        key_manager: Enhanced key manager

    Returns:
        Rotation results
    """
    logger.info(
        "Manual key rotation requested: type=%s, force=%s, reason=%s",
        request.rotation_type,
        request.force,
        request.reason or "No reason provided",
    )

    if request.rotation_type not in ("jwt", "aes", "both"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid rotation_type. Must be 'jwt', 'aes', or 'both'",
        )

    # Prepare webhook data for the rotation handler
    webhook_data = {
        "rotation_type": request.rotation_type,
        "force": request.force,
        "reason": request.reason,
        "source": "manual_api",
        "timestamp": datetime.now(UTC).isoformat(),
    }

    try:
        # Perform rotation in background for async processing
        background_tasks.add_task(_perform_key_rotation, key_manager, webhook_data)

        metrics_inc("manual_key_rotation_total", {"type": request.rotation_type})

        return {
            "status": "accepted",
            "message": f"Key rotation initiated for {request.rotation_type}",
            "rotation_type": request.rotation_type,
            "force": request.force,
            "submitted_at": datetime.now(UTC).isoformat(),
        }

    except Exception as e:
        logger.error("Failed to initiate key rotation: %s", e)
        metrics_inc("manual_key_rotation_errors_total", {"type": request.rotation_type})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate rotation: {e}",
        ) from e


@router.get("/health", response_model=dict[str, Any])
async def infisical_health_check(
    key_manager: InfisicalKeyManager = Depends(get_key_manager),
    infisical_client: InfisicalSecretsClient = Depends(get_infisical_client),
) -> dict[str, Any]:
    """Check health of Infisical integration.

    Args:
        key_manager: Enhanced key manager
        infisical_client: Infisical client

    Returns:
        Health check results
    """
    try:
        # Perform comprehensive health check
        health_results = await key_manager.health_check()

        # Add client-specific health info
        client_health = await infisical_client.health_check()
        health_results["client_health"] = client_health

        # Add configuration info (without sensitive data)
        health_results["configuration"] = {
            "project_id": infisical_client.project_id,
            "server_url": infisical_client.server_url,
            "cache_enabled": infisical_client.cache is not None,
            "cache_ttl": infisical_client.cache_ttl,
        }

        return health_results

    except Exception as e:
        logger.error("Health check failed: %s", e)
        return {
            "overall_status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now(UTC).isoformat(),
        }


@router.post("/cache/invalidate")
async def invalidate_cache(
    pattern: str = "*",
    infisical_client: InfisicalSecretsClient = Depends(get_infisical_client),
    key_manager: InfisicalKeyManager = Depends(get_key_manager),
) -> dict[str, Any]:
    """Invalidate Infisical cache.

    Args:
        pattern: Cache pattern to invalidate (default: all)
        infisical_client: Infisical client
        key_manager: Enhanced key manager

    Returns:
        Cache invalidation results
    """
    try:
        # Invalidate secrets cache
        await infisical_client.invalidate_cache(pattern)

        # Invalidate key manager caches
        await key_manager.redis.delete(
            key_manager._current_key_cache,
            key_manager._next_key_cache,
            key_manager._aes_cipher_cache,
            key_manager._keys_health_cache,
        )

        metrics_inc("cache_invalidation_total", {"pattern": pattern})

        return {
            "status": "success",
            "message": f"Cache invalidated for pattern: {pattern}",
            "pattern": pattern,
            "invalidated_at": datetime.now(UTC).isoformat(),
        }

    except Exception as e:
        logger.error("Cache invalidation failed: %s", e)
        metrics_inc("cache_invalidation_errors_total", {"pattern": pattern})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cache invalidation failed: {e}",
        ) from e


async def _handle_secret_event(
    event: WebhookEvent,
    key_manager: InfisicalKeyManager,
    background_tasks: BackgroundTasks,
) -> str:
    """Handle secret-related events.

    Args:
        event: Webhook event
        key_manager: Enhanced key manager
        background_tasks: Background tasks

    Returns:
        Response message
    """
    secret_path = event.secret_path.lower()

    # Check if this is a key-related secret
    if any(key_path in secret_path for key_path in ["/auth/jwt/", "/auth/aes/"]):
        logger.info("Key-related secret event: %s for path %s", event.event, event.secret_path)

        # Invalidate relevant caches
        if "/auth/jwt/" in secret_path:
            await key_manager.redis.delete(
                key_manager._current_key_cache,
                key_manager._next_key_cache,
            )
        elif "/auth/aes/" in secret_path:
            await key_manager.redis.delete(key_manager._aes_cipher_cache)

        # If this was a key update, trigger rotation check in background
        if event.event == "secret.updated":
            background_tasks.add_task(_check_rotation_needed, key_manager, secret_path)

        return f"Processed key-related {event.event} for {event.secret_path}"

    # For non-key secrets, just invalidate cache
    await key_manager.infisical_client.invalidate_cache(event.secret_path)

    return f"Processed {event.event} for {event.secret_path}"


async def _handle_project_event(
    event: WebhookEvent,
    key_manager: InfisicalKeyManager,
    background_tasks: BackgroundTasks,
) -> str:
    """Handle project-related events.

    Args:
        event: Webhook event
        key_manager: Enhanced key manager
        background_tasks: Background tasks

    Returns:
        Response message
    """
    logger.info("Project updated for %s", event.project_id)

    # Invalidate all caches on project updates
    await key_manager.infisical_client.invalidate_cache("*")
    await key_manager.redis.delete(
        key_manager._current_key_cache,
        key_manager._next_key_cache,
        key_manager._aes_cipher_cache,
        key_manager._keys_health_cache,
    )

    # Trigger health check in background
    background_tasks.add_task(_background_health_check, key_manager)

    return f"Processed project update for {event.project_id}"


async def _perform_key_rotation(
    key_manager: InfisicalKeyManager,
    webhook_data: dict[str, Any],
) -> None:
    """Perform key rotation in background.

    Args:
        key_manager: Enhanced key manager
        webhook_data: Rotation parameters
    """
    try:
        result = await key_manager.webhook_rotate_keys(webhook_data)
        logger.info("Background key rotation completed: %s", result)
    except Exception as e:
        logger.error("Background key rotation failed: %s", e)


async def _check_rotation_needed(
    key_manager: InfisicalKeyManager,
    secret_path: str,
) -> None:
    """Check if rotation is needed after secret update.

    Args:
        key_manager: Enhanced key manager
        secret_path: Updated secret path
    """
    try:
        if "/auth/jwt/" in secret_path:
            needs_rotation, reason = await key_manager.check_rotation_needed()
            if needs_rotation:
                logger.info("JWT rotation triggered by secret update: %s", reason)
                await key_manager.rotate_keys(force=False)
        elif "/auth/aes/" in secret_path:
            needs_rotation, reason = await key_manager._check_aes_rotation_needed()
            if needs_rotation:
                logger.info("AES rotation triggered by secret update: %s", reason)
                await key_manager.rotate_aes_keys(force=False)
    except Exception as e:
        logger.error("Rotation check failed for %s: %s", secret_path, e)


async def _background_health_check(key_manager: InfisicalKeyManager) -> None:
    """Perform health check in background.

    Args:
        key_manager: Enhanced key manager
    """
    try:
        health_results = await key_manager.health_check()
        if health_results["overall_status"] != "healthy":
            logger.warning("Health check shows issues: %s", health_results)
        else:
            logger.debug("Background health check passed")
    except Exception as e:
        logger.error("Background health check failed: %s", e)
