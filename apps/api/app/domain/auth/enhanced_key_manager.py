"""Enhanced key management with comprehensive Infisical integration and
security hardening."""

from __future__ import annotations

from datetime import UTC, datetime
import json
import logging
from typing import Any, cast

from redis.asyncio import Redis
from redis.exceptions import RedisError
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.audit_service import AuditService
from app.domain.auth.key_manager import KeyManager
from app.infra.crypto.key_generation import Ed25519KeyGenerator, KeyPair
from app.infra.secrets import InfisicalSecretsClient
from app.settings import settings


logger = logging.getLogger(__name__)


class SecurityEvent:
    """Security event for monitoring and alerting."""

    def __init__(
        self,
        event_type: str,
        severity: str,
        message: str,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        self.event_type = event_type
        self.severity = severity  # low, medium, high, critical
        self.message = message
        self.metadata = metadata or {}
        self.timestamp = datetime.now(UTC)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for logging/alerting."""
        return {
            "event_type": self.event_type,
            "severity": self.severity,
            "message": self.message,
            "metadata": self.metadata,
            "timestamp": self.timestamp.isoformat(),
        }


class SecurityMonitor:
    """Security monitoring and alerting for key operations."""

    def __init__(self, redis: Redis, audit_service: AuditService) -> None:
        self.redis = redis
        self.audit_service = audit_service
        self._alert_prefix = "security:alerts:"
        self._metrics_prefix = "security:metrics:"

    async def record_event(self, event: SecurityEvent) -> None:
        """Record security event for monitoring.

        Args:
            event: Security event to record
        """
        # Store event in Redis for real-time monitoring
        event_key = (
            f"{self._alert_prefix}{event.event_type}:{int(event.timestamp.timestamp())}"
        )
        await self.redis.setex(event_key, 86400, json.dumps(event.to_dict()))  # 24h TTL

        # Update metrics
        metrics_key = f"{self._metrics_prefix}{event.event_type}"
        await self.redis.incr(metrics_key)
        await self.redis.expire(metrics_key, 86400)  # Reset daily

        # Log to audit trail for critical events
        if event.severity in {"high", "critical"}:
            await self.audit_service.log_event(
                user_id=settings.system_user_id,
                event_type=f"security_{event.event_type}",
                event_data={
                    "severity": event.severity,
                    "message": event.message,
                    "metadata": event.metadata,
                },
            )

        # Log to application logs
        log_level = {
            "low": logging.INFO,
            "medium": logging.WARNING,
            "high": logging.ERROR,
            "critical": logging.CRITICAL,
        }.get(event.severity, logging.INFO)

        logger.log(
            log_level,
            "Security event: %s",
            event.message,
            extra={
                "event_type": event.event_type,
                "severity": event.severity,
                "metadata": event.metadata,
            },
        )

    async def get_recent_events(
        self,
        event_type: str | None = None,
        limit: int = 100,
    ) -> list[dict[str, Any]]:
        """Get recent security events.

        Args:
            event_type: Filter by event type, or None for all
            limit: Maximum number of events to return

        Returns:
            List of security events
        """
        pattern = f"{self._alert_prefix}{event_type or '*'}:*"
        events = []

        async for key in self.redis.scan_iter(match=pattern):
            try:
                event_data = await self.redis.get(key)
                if event_data:
                    events.append(json.loads(event_data.decode()))
            except (json.JSONDecodeError, UnicodeDecodeError):
                continue  # Skip corrupted entries

        # Sort by timestamp (newest first) and limit
        events.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return events[:limit]

    async def get_metrics_summary(self) -> dict[str, int]:
        """Get security metrics summary.

        Returns:
            Dictionary of event type counts
        """
        metrics = {}
        pattern = f"{self._metrics_prefix}*"

        async for key in self.redis.scan_iter(match=pattern):
            try:
                count = await self.redis.get(key)
                if count:
                    event_type = key.decode().split(":")[-1]
                    metrics[event_type] = int(count)
            except (ValueError, UnicodeDecodeError):
                continue

        return metrics


class EnhancedKeyManager(KeyManager):
    """Enhanced key manager with comprehensive security hardening."""

    def __init__(
        self,
        session: AsyncSession,
        redis: Redis,
        infisical_client: InfisicalSecretsClient | None = None,
    ) -> None:
        """Initialize enhanced key manager.

        Args:
            session: Database session
            redis: Redis client
            infisical_client: Enhanced Infisical client
        """
        super().__init__(session, redis, infisical_client)

        # Override with enhanced client
        self.infisical_client = infisical_client

        # Add security monitoring
        self.security_monitor = SecurityMonitor(redis, self.audit_service)

        # Enhanced cache configuration
        self._health_check_cache = "auth:keys:health"
        self._rotation_lock = "auth:keys:rotation_lock"
        self._emergency_fallback_cache = "auth:keys:emergency"

    async def initialize_key_system(self) -> None:
        """Initialize key system with enhanced security monitoring."""
        try:
            await super().initialize_key_system()

            await self.security_monitor.record_event(
                SecurityEvent(
                    event_type="key_system_initialized",
                    severity="medium",
                    message="Key management system initialized successfully",
                )
            )

        except Exception as e:
            await self.security_monitor.record_event(
                SecurityEvent(
                    event_type="key_system_init_failed",
                    severity="critical",
                    message=f"Failed to initialize key system: {e}",
                    metadata={"error": str(e)},
                )
            )
            raise

    async def get_current_signing_key(self) -> KeyPair:
        """Get current signing key with enhanced fallback and monitoring."""
        try:
            # Check if emergency fallback is needed
            if await self._is_emergency_mode():
                return await self._get_emergency_fallback_key()

            # Try parent implementation first
            return await super().get_current_signing_key()

        except RuntimeError as e:
            await self.security_monitor.record_event(
                SecurityEvent(
                    event_type="signing_key_retrieval_failed",
                    severity="high",
                    message=f"Failed to retrieve signing key: {e}",
                    metadata={"error": str(e)},
                )
            )

            # Attempt emergency fallback
            try:
                fallback_key = await self._get_emergency_fallback_key()

                await self.security_monitor.record_event(
                    SecurityEvent(
                        event_type="emergency_fallback_used",
                        severity="critical",
                        message="Using emergency fallback signing key",
                        metadata={"reason": str(e)},
                    )
                )

                return fallback_key

            except Exception as fallback_error:
                await self.security_monitor.record_event(
                    SecurityEvent(
                        event_type="total_key_failure",
                        severity="critical",
                        message="Total key system failure - no keys available",
                        metadata={
                            "primary_error": str(e),
                            "fallback_error": str(fallback_error),
                        },
                    )
                )
                raise RuntimeError(
                    f"Total key system failure: {e}. Fallback also failed: {fallback_error}"
                ) from e

    async def rotate_keys(self, force: bool = False) -> dict[str, Any]:
        """Perform zero-downtime key rotation with enhanced monitoring."""
        # Acquire rotation lock to prevent concurrent rotations
        lock_acquired = await self._acquire_rotation_lock()
        if not lock_acquired:
            await self.security_monitor.record_event(
                SecurityEvent(
                    event_type="rotation_lock_failed",
                    severity="medium",
                    message="Key rotation skipped - another rotation in progress",
                )
            )
            return {"status": "skipped", "reason": "rotation already in progress"}

        try:
            # Pre-rotation health check
            health_status = await self._comprehensive_health_check()
            if not health_status["healthy"] and not force:
                await self.security_monitor.record_event(
                    SecurityEvent(
                        event_type="rotation_blocked_unhealthy",
                        severity="high",
                        message="Key rotation blocked due to unhealthy system",
                        metadata=health_status,
                    )
                )
                return {
                    "status": "blocked",
                    "reason": "system unhealthy",
                    "health": health_status,
                }

            # Store current key as emergency fallback before rotation
            await self._store_emergency_fallback()

            # Perform rotation with parent implementation
            result = await super().rotate_keys(force)

            # Post-rotation validation
            await self._validate_rotation_success()

            await self.security_monitor.record_event(
                SecurityEvent(
                    event_type="key_rotation_completed",
                    severity="medium",
                    message="Key rotation completed successfully",
                    metadata={
                        "forced": force,
                        "result": result,
                        "health_check": health_status,
                    },
                )
            )

            return result

        except Exception as e:
            await self.security_monitor.record_event(
                SecurityEvent(
                    event_type="key_rotation_failed",
                    severity="critical",
                    message=f"Key rotation failed: {e}",
                    metadata={"forced": force, "error": str(e)},
                )
            )
            raise
        finally:
            await self._release_rotation_lock()

    async def verify_key_integrity(self) -> dict[str, Any]:
        """Enhanced key integrity verification with security monitoring."""
        results = await super().verify_key_integrity()

        # Additional security checks
        results.update(await self._security_integrity_checks())

        # Record security event based on results
        issues = cast("list[str]", results.get("issues", []))
        if issues:
            await self.security_monitor.record_event(
                SecurityEvent(
                    event_type="key_integrity_issues",
                    severity="high" if len(issues) > 2 else "medium",
                    message=f"Key integrity issues detected: {', '.join(issues)}",
                    metadata={"issues": issues, "full_results": results},
                )
            )
        else:
            await self.security_monitor.record_event(
                SecurityEvent(
                    event_type="key_integrity_verified",
                    severity="low",
                    message="Key integrity verification passed",
                    metadata={"results": results},
                )
            )

        return results

    async def _acquire_rotation_lock(self, lock_ttl: int = 300) -> bool:
        """Acquire rotation lock to prevent concurrent rotations.

        Args:
            lock_ttl: Lock TTL in seconds

        Returns:
            True if lock acquired, False otherwise
        """
        try:
            # Use Redis SET with NX (not exists) and EX (expiry)
            result = await self.redis.set(
                self._rotation_lock,
                datetime.now(UTC).isoformat(),
                nx=True,  # Only set if not exists
                ex=lock_ttl,  # Expire after TTL
            )
            return bool(result)
        except RedisError as e:
            logger.warning("Failed to acquire rotation lock", extra={"error": str(e)})
            return False

    async def _release_rotation_lock(self) -> None:
        """Release rotation lock."""
        try:
            await self.redis.delete(self._rotation_lock)
        except RedisError as e:
            logger.warning("Failed to release rotation lock", extra={"error": str(e)})

    async def _is_emergency_mode(self) -> bool:
        """Check if system is in emergency mode (fallback required).

        Returns:
            True if emergency mode is active
        """
        try:
            # Check if emergency mode flag is set
            emergency_flag = await self.redis.get("auth:keys:emergency_mode")
            if emergency_flag:
                return True

            # Check Infisical health if available
            if self.infisical_client:
                health = await self.infisical_client.health_check()
                if not health.get("healthy", False):
                    return True

            return False

        except Exception as e:  # noqa: BLE001 - emergency checks should be resilient
            logger.warning("Emergency mode check failed", extra={"error": str(e)})
            return True  # Fail safe to emergency mode

    async def _get_emergency_fallback_key(self) -> KeyPair:
        """Get emergency fallback key.

        Returns:
            Emergency fallback key pair

        Raises:
            RuntimeError: If no fallback key available
        """
        try:
            fallback_data = await self.redis.get(self._emergency_fallback_cache)
            if not fallback_data:
                raise RuntimeError("No emergency fallback key available")

            key_data = json.loads(fallback_data.decode())
            private_key = Ed25519KeyGenerator.load_private_key_from_pem(
                key_data["private_key_pem"]
            )

            return KeyPair(
                private_key=private_key,
                public_key=private_key.public_key(),
                kid=key_data["kid"],
                created_at=datetime.fromisoformat(key_data["created_at"]),
            )

        except (json.JSONDecodeError, KeyError, ValueError) as e:
            raise RuntimeError(f"Failed to load emergency fallback key: {e}") from e

    async def _store_emergency_fallback(self) -> None:
        """Store current key as emergency fallback."""
        try:
            current_key = await super().get_current_signing_key()
            key_material = Ed25519KeyGenerator.serialize_key_pair(current_key)

            fallback_data = {
                "private_key_pem": key_material.private_key_pem,
                "kid": current_key.kid,
                "created_at": current_key.created_at.isoformat(),
                "stored_at": datetime.now(UTC).isoformat(),
            }

            # Store with 7-day TTL (longer than normal cache)
            await self.redis.setex(
                self._emergency_fallback_cache,
                7 * 24 * 3600,  # 7 days
                json.dumps(fallback_data),
            )

        except Exception as e:  # noqa: BLE001 - fallback storage shouldn't break rotation
            logger.warning(
                "Failed to store emergency fallback", extra={"error": str(e)}
            )

    async def _comprehensive_health_check(self) -> dict[str, Any]:
        """Perform comprehensive health check before rotation.

        Returns:
            Health check results
        """
        health_status = {
            "healthy": True,
            "checks": {},
            "timestamp": datetime.now(UTC).isoformat(),
        }

        # Check Redis connectivity
        try:
            await self.redis.ping()
            health_status["checks"]["redis"] = {"status": "healthy"}
        except Exception as e:  # noqa: BLE001 - health check should be resilient
            health_status["healthy"] = False
            health_status["checks"]["redis"] = {"status": "unhealthy", "error": str(e)}

        # Check Infisical connectivity
        if self.infisical_client:
            try:
                infisical_health = await self.infisical_client.health_check()
                health_status["checks"]["infisical"] = infisical_health
                if not infisical_health.get("healthy", False):
                    health_status["healthy"] = False
            except Exception as e:  # noqa: BLE001 - health check should be resilient
                health_status["healthy"] = False
                health_status["checks"]["infisical"] = {
                    "status": "unhealthy",
                    "error": str(e),
                }

        # Check key integrity
        try:
            integrity_results = await super().verify_key_integrity()
            health_status["checks"]["key_integrity"] = integrity_results
            if not integrity_results.get("current_key_valid", False):
                health_status["healthy"] = False
        except Exception as e:  # noqa: BLE001 - health check should be resilient
            health_status["healthy"] = False
            health_status["checks"]["key_integrity"] = {
                "status": "failed",
                "error": str(e),
            }

        return health_status

    async def _validate_rotation_success(self) -> None:
        """Validate that key rotation was successful.

        Raises:
            RuntimeError: If rotation validation fails
        """
        try:
            # Test that we can get the new current key
            new_key = await super().get_current_signing_key()

            # Test that we can sign with the new key
            test_data = b"rotation_validation_test"
            signature = new_key.private_key.sign(test_data)
            new_key.public_key.verify(signature, test_data)

            # Test that JWKS includes the new key
            verification_keys = await self.get_verification_keys()
            if not any(key.kid == new_key.kid for key in verification_keys):
                raise RuntimeError("New key not found in verification keys")

        except Exception as e:
            raise RuntimeError(f"Rotation validation failed: {e}") from e

    async def _security_integrity_checks(self) -> dict[str, Any]:
        """Additional security-focused integrity checks.

        Returns:
            Security check results
        """
        security_results = {
            "cache_consistency": False,
            "fallback_available": False,
            "rotation_lock_status": "unknown",
            "security_events_recent": 0,
        }

        # Check cache consistency
        try:
            if self.infisical_client:
                # Compare cached vs stored secrets (simplified check)
                current_cached = await self.redis.get(self._current_key_cache)
                if current_cached:
                    security_results["cache_consistency"] = True
        except Exception as e:  # noqa: BLE001 - security check should be resilient
            logger.warning(
                "Security check (cache consistency) failed unexpectedly: %s", e
            )

        # Check if emergency fallback is available
        try:
            fallback_exists = await self.redis.exists(self._emergency_fallback_cache)
            security_results["fallback_available"] = bool(fallback_exists)
        except Exception as e:  # noqa: BLE001 - security check should be resilient
            logger.warning(
                "Security check (fallback available) failed unexpectedly: %s", e
            )

        # Check rotation lock status
        try:
            lock_exists = await self.redis.exists(self._rotation_lock)
            security_results["rotation_lock_status"] = (
                "locked" if lock_exists else "free"
            )
        except Exception as e:  # noqa: BLE001 - security check should be resilient
            logger.warning("Security check (rotation lock) failed unexpectedly: %s", e)

        # Count recent security events
        try:
            recent_events = await self.security_monitor.get_recent_events(limit=10)
            security_results["security_events_recent"] = len(recent_events)
        except Exception as e:  # noqa: BLE001 - security check should be resilient
            logger.warning("Security check (recent events) failed unexpectedly: %s", e)

        return security_results

    async def get_security_status(self) -> dict[str, Any]:
        """Get comprehensive security status for monitoring.

        Returns:
            Security status information
        """
        status = {
            "timestamp": datetime.now(UTC).isoformat(),
            "emergency_mode": await self._is_emergency_mode(),
            "health": await self._comprehensive_health_check(),
            "recent_events": await self.security_monitor.get_recent_events(limit=20),
            "metrics": await self.security_monitor.get_metrics_summary(),
        }

        # Add rotation lock status
        try:
            lock_exists = await self.redis.exists(self._rotation_lock)
            status["rotation_locked"] = bool(lock_exists)
            if lock_exists:
                lock_data = await self.redis.get(self._rotation_lock)
                status["rotation_lock_time"] = lock_data.decode() if lock_data else None
        except Exception:  # noqa: BLE001 - status check should be resilient
            status["rotation_locked"] = "unknown"

        return status
