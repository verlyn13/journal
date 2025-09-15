"""Infisical Integration Monitoring and Alerting.

This module provides comprehensive monitoring for the Infisical CLI v0.42.1 integration,
including metrics collection, health checks, and alerting capabilities.
"""

from __future__ import annotations

import logging
import time

from datetime import UTC, datetime, timedelta
from typing import Any

from redis.asyncio import Redis

from app.infra.secrets import InfisicalSecretsClient
from app.infra.secrets.enhanced_key_manager import InfisicalKeyManager
from app.telemetry.metrics_runtime import inc as metrics_inc


logger = logging.getLogger(__name__)


class InfisicalMonitoringService:
    """Service for monitoring Infisical integration health and performance."""

    def __init__(
        self,
        redis: Redis,
        infisical_client: InfisicalSecretsClient,
        key_manager: InfisicalKeyManager,
    ) -> None:
        self.redis = redis
        self.infisical_client = infisical_client
        self.key_manager = key_manager
        self._monitoring_key = "infisical:monitoring"

    async def collect_metrics(self) -> dict[str, Any]:
        """Collect comprehensive Infisical integration metrics.

        Returns:
            Dictionary containing all monitoring metrics
        """
        start_time = time.time()

        try:
            # Core health metrics
            health_metrics = await self._collect_health_metrics()

            # Performance metrics
            performance_metrics = await self._collect_performance_metrics()

            # Security metrics
            security_metrics = await self._collect_security_metrics()

            # Cache metrics
            cache_metrics = await self._collect_cache_metrics()

            # Key rotation metrics
            rotation_metrics = await self._collect_rotation_metrics()

            # Webhook metrics
            webhook_metrics = await self._collect_webhook_metrics()

            collection_duration = time.time() - start_time

            metrics = {
                "timestamp": datetime.now(UTC).isoformat(),
                "collection_duration": collection_duration,
                "health": health_metrics,
                "performance": performance_metrics,
                "security": security_metrics,
                "cache": cache_metrics,
                "rotation": rotation_metrics,
                "webhooks": webhook_metrics,
            }

            # Store metrics for trending
            await self._store_metrics(metrics)

            # Check alerting conditions
            await self._check_alerts(metrics)

            metrics_inc("infisical_monitoring_collection_total")
            metrics_inc(
                "infisical_monitoring_collection_duration",
                {"duration": str(int(collection_duration))},
            )

            return metrics

        except Exception:
            logger.exception("Failed to collect Infisical metrics")
            metrics_inc("infisical_monitoring_collection_errors_total")
            raise

    async def _collect_health_metrics(self) -> dict[str, Any]:
        """Collect health status metrics."""
        try:
            # Test Infisical client connectivity
            client_health = await self.infisical_client.health_check()

            # Test key manager health
            key_manager_health = await self.key_manager.health_check()

            # Test Redis connectivity
            redis_health = await self._test_redis_health()

            overall_status = "healthy"
            if not all([
                client_health.get("status") == "healthy",
                key_manager_health.get("overall_status") == "healthy",
                redis_health.get("status") == "healthy",
            ]):
                overall_status = "unhealthy"

            return {
                "overall_status": overall_status,
                "infisical_client": client_health,
                "key_manager": key_manager_health,
                "redis": redis_health,
                "last_check": datetime.now(UTC).isoformat(),
            }

        except Exception as e:
            logger.exception("Health metrics collection failed")
            return {
                "overall_status": "error",
                "error": str(e),
                "last_check": datetime.now(UTC).isoformat(),
            }

    async def _collect_performance_metrics(self) -> dict[str, Any]:
        """Collect performance and latency metrics."""
        try:
            # Test secret retrieval performance
            start_time = time.time()
            try:
                await self.infisical_client.get_secret("test_key", default="test")
                secret_retrieval_latency = time.time() - start_time
                secret_retrieval_success = True
            except Exception as e:
                secret_retrieval_latency = time.time() - start_time
                secret_retrieval_success = False
                logger.warning("Secret retrieval test failed: %s", e)

            # Test cache performance
            cache_metrics = await self._test_cache_performance()

            # Get CLI version and configuration
            cli_info = await self._get_cli_info()

            return {
                "secret_retrieval": {
                    "latency_seconds": secret_retrieval_latency,
                    "success": secret_retrieval_success,
                },
                "cache": cache_metrics,
                "cli": cli_info,
                "last_measurement": datetime.now(UTC).isoformat(),
            }

        except Exception as e:
            logger.exception("Performance metrics collection failed")
            return {
                "error": str(e),
                "last_measurement": datetime.now(UTC).isoformat(),
            }

    async def _collect_security_metrics(self) -> dict[str, Any]:
        """Collect security-related metrics."""
        try:
            # Check JWT key status
            jwt_status = await self._check_jwt_key_status()

            # Check AES key status
            aes_status = await self._check_aes_key_status()

            # Check rotation schedule compliance
            rotation_compliance = await self._check_rotation_compliance()

            # Check for failed authentication attempts
            auth_failures = await self._get_auth_failure_metrics()

            return {
                "jwt_keys": jwt_status,
                "aes_keys": aes_status,
                "rotation_compliance": rotation_compliance,
                "authentication": auth_failures,
                "last_check": datetime.now(UTC).isoformat(),
            }

        except Exception as e:
            logger.exception("Security metrics collection failed")
            return {
                "error": str(e),
                "last_check": datetime.now(UTC).isoformat(),
            }

    async def _collect_cache_metrics(self) -> dict[str, Any]:
        """Collect cache performance and health metrics."""
        try:
            # Get cache statistics
            cache_stats = {
                "enabled": self.infisical_client.cache is not None,
                "ttl_seconds": self.infisical_client.cache_ttl,
            }

            if self.infisical_client.cache:
                # Count cached items
                cache_keys = await self.redis.keys(f"{self.infisical_client._cache_prefix}*")
                cache_stats["cached_items"] = len(cache_keys)

                # Estimate cache memory usage
                memory_usage = 0
                for key in cache_keys[:100]:  # Sample first 100 keys
                    size = await self.redis.memory_usage(key)
                    if size:
                        memory_usage += size

                cache_stats["estimated_memory_bytes"] = memory_usage
                cache_stats["sampled_keys"] = min(len(cache_keys), 100)

            return cache_stats

        except Exception as e:
            logger.exception("Cache metrics collection failed")
            return {
                "error": str(e),
                "enabled": False,
            }

    async def _collect_rotation_metrics(self) -> dict[str, Any]:
        """Collect key rotation metrics."""
        try:
            # Check last rotation times
            last_jwt_rotation = await self.key_manager._get_last_rotation_time()

            # Check if rotation is needed
            jwt_needs_rotation, jwt_reason = await self.key_manager.check_rotation_needed()
            aes_needs_rotation, aes_reason = await self.key_manager._check_aes_rotation_needed()

            # Get rotation history from cache
            rotation_history = await self._get_rotation_history()

            return {
                "last_jwt_rotation": last_jwt_rotation.isoformat() if last_jwt_rotation else None,
                "jwt_rotation_needed": jwt_needs_rotation,
                "jwt_rotation_reason": jwt_reason if jwt_needs_rotation else None,
                "aes_rotation_needed": aes_needs_rotation,
                "aes_rotation_reason": aes_reason if aes_needs_rotation else None,
                "rotation_history": rotation_history,
                "last_check": datetime.now(UTC).isoformat(),
            }

        except Exception as e:
            logger.exception("Rotation metrics collection failed")
            return {
                "error": str(e),
                "last_check": datetime.now(UTC).isoformat(),
            }

    async def _collect_webhook_metrics(self) -> dict[str, Any]:
        """Collect webhook activity metrics."""
        try:
            # Get webhook metrics from Redis (if stored)
            webhook_stats = await self.redis.hgetall("infisical:webhook:stats")

            metrics = {}
            for key, value in webhook_stats.items():
                try:
                    metrics[key.decode()] = int(value) if value.isdigit() else value.decode()
                except (AttributeError, ValueError):
                    continue

            # Add timestamp
            metrics["last_updated"] = datetime.now(UTC).isoformat()

            return metrics

        except Exception as e:
            logger.exception("Webhook metrics collection failed")
            return {
                "error": str(e),
                "last_updated": datetime.now(UTC).isoformat(),
            }

    async def _test_redis_health(self) -> dict[str, Any]:
        """Test Redis connectivity and performance."""
        try:
            start_time = time.time()
            await self.redis.ping()
            latency = time.time() - start_time

            # Get Redis info
            info = await self.redis.info()

            return {
                "status": "healthy",
                "latency_seconds": latency,
                "version": info.get("redis_version"),
                "memory_used": info.get("used_memory_human"),
                "connected_clients": info.get("connected_clients"),
            }

        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
            }

    async def _test_cache_performance(self) -> dict[str, Any]:
        """Test cache read/write performance."""
        try:
            test_key = "infisical:monitor:test"
            test_value = "test_performance"

            # Test write
            start_time = time.time()
            await self.redis.set(test_key, test_value, ex=60)
            write_latency = time.time() - start_time

            # Test read
            start_time = time.time()
            result = await self.redis.get(test_key)
            read_latency = time.time() - start_time

            # Cleanup
            await self.redis.delete(test_key)

            return {
                "write_latency_seconds": write_latency,
                "read_latency_seconds": read_latency,
                "success": result == test_value.encode() if result else False,
            }

        except Exception as e:
            return {
                "error": str(e),
                "success": False,
            }

    async def _get_cli_info(self) -> dict[str, Any]:
        """Get Infisical CLI version and configuration info."""
        try:
            # This would normally run `infisical --version` but we'll return static info
            return {
                "version": "0.42.1",
                "server_url": self.infisical_client.server_url,
                "project_id": self.infisical_client.project_id,
                "environment": self.infisical_client.environment,
            }

        except Exception as e:
            return {
                "error": str(e),
            }

    async def _check_jwt_key_status(self) -> dict[str, Any]:
        """Check JWT key health and status."""
        try:
            current_key = await self.key_manager.get_current_private_key()
            next_key = await self.key_manager.get_next_private_key()

            return {
                "current_key_exists": current_key is not None,
                "next_key_exists": next_key is not None,
                "keys_properly_configured": current_key is not None and next_key is not None,
            }

        except Exception as e:
            return {
                "error": str(e),
                "keys_properly_configured": False,
            }

    async def _check_aes_key_status(self) -> dict[str, Any]:
        """Check AES encryption key health and status."""
        try:
            active_cipher = await self.key_manager.get_aes_cipher()

            return {
                "active_cipher_exists": active_cipher is not None,
                "cipher_properly_configured": active_cipher is not None,
            }

        except Exception as e:
            return {
                "error": str(e),
                "cipher_properly_configured": False,
            }

    async def _check_rotation_compliance(self) -> dict[str, Any]:
        """Check if key rotation is happening according to schedule."""
        try:
            last_rotation = await self.key_manager._get_last_rotation_time()

            if not last_rotation:
                return {
                    "compliant": False,
                    "reason": "No rotation history found",
                }

            # Check if rotation is overdue (assuming 30-day rotation policy)
            rotation_interval = timedelta(days=30)
            overdue_threshold = datetime.now(UTC) - rotation_interval

            if last_rotation < overdue_threshold:
                return {
                    "compliant": False,
                    "reason": f"Rotation overdue by {datetime.now(UTC) - last_rotation}",
                    "last_rotation": last_rotation.isoformat(),
                }

            return {
                "compliant": True,
                "last_rotation": last_rotation.isoformat(),
            }

        except Exception as e:
            return {
                "compliant": False,
                "error": str(e),
            }

    async def _get_auth_failure_metrics(self) -> dict[str, Any]:
        """Get authentication failure metrics."""
        try:
            # Get failed authentication attempts from Redis
            failed_attempts = await self.redis.get("infisical:auth:failures:24h")

            return {
                "failed_attempts_24h": int(failed_attempts) if failed_attempts else 0,
                "last_updated": datetime.now(UTC).isoformat(),
            }

        except Exception as e:
            return {
                "error": str(e),
                "failed_attempts_24h": 0,
            }

    async def _get_rotation_history(self) -> list[dict[str, Any]]:
        """Get recent key rotation history."""
        try:
            # Get rotation events from Redis (last 10)
            history_keys = await self.redis.lrange("infisical:rotation:history", 0, 9)

            history = []
            for key in history_keys:
                try:
                    import json

                    event = json.loads(key)
                    history.append(event)
                except (json.JSONDecodeError, TypeError):
                    continue

            return history

        except Exception:
            logger.exception("Failed to get rotation history")
            return []

    async def _store_metrics(self, metrics: dict[str, Any]) -> None:
        """Store metrics for historical tracking."""
        try:
            import json

            # Store current metrics
            await self.redis.hset(
                f"{self._monitoring_key}:current",
                mapping={
                    "data": json.dumps(metrics),
                    "timestamp": metrics["timestamp"],
                },
            )

            # Store in time series (keep last 24 hours)
            timestamp_key = int(time.time() // 300) * 300  # 5-minute buckets
            await self.redis.hset(
                f"{self._monitoring_key}:timeseries", str(timestamp_key), json.dumps(metrics)
            )

            # Cleanup old timeseries data (keep 24 hours)
            cutoff_time = timestamp_key - (24 * 60 * 60)
            old_keys = await self.redis.hkeys(f"{self._monitoring_key}:timeseries")
            for key in old_keys:
                try:
                    if int(key) < cutoff_time:
                        await self.redis.hdel(f"{self._monitoring_key}:timeseries", key)
                except (ValueError, TypeError):
                    continue

        except Exception:
            logger.exception("Failed to store metrics")

    async def _check_alerts(self, metrics: dict[str, Any]) -> None:
        """Check metrics against alerting thresholds."""
        try:
            alerts = []

            # Check overall health
            if metrics.get("health", {}).get("overall_status") != "healthy":
                alerts.append({
                    "severity": "critical",
                    "message": "Infisical integration is unhealthy",
                    "details": metrics.get("health", {}),
                })

            # Check performance thresholds
            secret_latency = (
                metrics.get("performance", {}).get("secret_retrieval", {}).get("latency_seconds", 0)
            )
            if secret_latency > 5.0:  # 5 second threshold
                alerts.append({
                    "severity": "warning",
                    "message": f"Secret retrieval latency high: {secret_latency:.2f}s",
                    "details": {"latency": secret_latency, "threshold": 5.0},
                })

            # Check rotation compliance
            rotation_metrics = metrics.get("rotation", {})
            if rotation_metrics.get("jwt_rotation_needed") or rotation_metrics.get(
                "aes_rotation_needed"
            ):
                alerts.append({
                    "severity": "warning",
                    "message": "Key rotation needed",
                    "details": rotation_metrics,
                })

            # Check security issues
            security_metrics = metrics.get("security", {})
            if not security_metrics.get("jwt_keys", {}).get("keys_properly_configured"):
                alerts.append({
                    "severity": "critical",
                    "message": "JWT keys not properly configured",
                    "details": security_metrics.get("jwt_keys", {}),
                })

            # Store alerts
            if alerts:
                await self._store_alerts(alerts)
                logger.warning("Infisical monitoring alerts: %s", alerts)

        except Exception:
            logger.exception("Failed to check alerts")

    async def _store_alerts(self, alerts: list[dict[str, Any]]) -> None:
        """Store alerts for external monitoring systems."""
        try:
            import json

            timestamp = datetime.now(UTC).isoformat()

            for alert in alerts:
                alert_data = {
                    "timestamp": timestamp,
                    "service": "infisical",
                    **alert,
                }

                # Store in Redis for external monitoring to pick up
                await self.redis.lpush("infisical:alerts", json.dumps(alert_data))

            # Keep only last 100 alerts
            await self.redis.ltrim("infisical:alerts", 0, 99)

        except Exception:
            logger.exception("Failed to store alerts")

    async def get_current_metrics(self) -> dict[str, Any] | None:
        """Get the latest collected metrics."""
        try:
            data = await self.redis.hget(f"{self._monitoring_key}:current", "data")
            if data:
                import json

                return json.loads(data)
            return None

        except Exception:
            logger.exception("Failed to get current metrics")
            return None

    async def get_metrics_history(self, hours: int = 24) -> list[dict[str, Any]]:
        """Get historical metrics for the specified time period."""
        try:
            import json

            cutoff_time = int(time.time()) - (hours * 60 * 60)
            all_metrics = await self.redis.hgetall(f"{self._monitoring_key}:timeseries")

            history = []
            for timestamp_str, data in all_metrics.items():
                try:
                    timestamp = int(timestamp_str)
                    if timestamp >= cutoff_time:
                        metrics = json.loads(data)
                        history.append(metrics)
                except (ValueError, json.JSONDecodeError):
                    continue

            # Sort by timestamp
            history.sort(key=lambda x: x.get("timestamp", ""))
            return history

        except Exception:
            logger.exception("Failed to get metrics history")
            return []

    async def get_active_alerts(self) -> list[dict[str, Any]]:
        """Get currently active alerts."""
        try:
            import json

            alert_data = await self.redis.lrange("infisical:alerts", 0, -1)

            alerts = []
            for data in alert_data:
                try:
                    alert = json.loads(data)
                    alerts.append(alert)
                except json.JSONDecodeError:
                    continue

            return alerts

        except Exception:
            logger.exception("Failed to get active alerts")
            return []
