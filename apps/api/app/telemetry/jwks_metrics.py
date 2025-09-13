"""Performance monitoring for JWKS endpoint."""

from __future__ import annotations

import logging
import time

from collections.abc import AsyncGenerator, Awaitable
from contextlib import asynccontextmanager, suppress
from datetime import UTC, datetime
from typing import Any, cast

from redis.asyncio import Redis

from app.telemetry.metrics_runtime import (
    COUNTER_JWKS_CACHE_HIT,
    COUNTER_JWKS_CACHE_MISS,
    COUNTER_JWKS_REQUESTS,
    HISTOGRAM_JWKS_RESPONSE_TIME,
)


logger = logging.getLogger(__name__)


class JWKSMetrics:
    """Metrics collector for JWKS endpoint performance."""

    def __init__(self, redis: Redis | None = None) -> None:
        """Initialize metrics collector.

        Args:
            redis: Optional Redis client for distributed metrics
        """
        self.redis = redis
        self._metrics_prefix = "metrics:jwks:"

    async def record_request(
        self,
        cache_hit: bool,
        response_time_ms: float,
        etag_match: bool = False,
    ) -> None:
        """Record JWKS request metrics.

        Args:
            cache_hit: Whether response was served from cache
            response_time_ms: Response time in milliseconds
            etag_match: Whether request returned 304 Not Modified
        """
        # Update counters
        COUNTER_JWKS_REQUESTS.inc()

        if cache_hit:
            COUNTER_JWKS_CACHE_HIT.inc()
        else:
            COUNTER_JWKS_CACHE_MISS.inc()

        # Record response time
        HISTOGRAM_JWKS_RESPONSE_TIME.observe(response_time_ms)

        # Store in Redis for distributed tracking
        if self.redis:
            try:
                pipeline = self.redis.pipeline()

                # Increment request counter
                pipeline.hincrby(f"{self._metrics_prefix}counters", "total_requests", 1)

                # Track cache performance
                if cache_hit:
                    pipeline.hincrby(f"{self._metrics_prefix}counters", "cache_hits", 1)
                else:
                    pipeline.hincrby(f"{self._metrics_prefix}counters", "cache_misses", 1)

                # Track ETag matches (304 responses)
                if etag_match:
                    pipeline.hincrby(f"{self._metrics_prefix}counters", "etag_matches", 1)

                # Store response time in histogram buckets
                bucket = self._get_histogram_bucket(response_time_ms)
                pipeline.hincrby(f"{self._metrics_prefix}histogram", bucket, 1)

                # Update last request timestamp
                pipeline.set(
                    f"{self._metrics_prefix}last_request",
                    datetime.now(UTC).isoformat(),
                    ex=86400,  # Expire after 24 hours
                )

                # Execute pipeline (support both async and sync mocks in tests)
                exec_fn = getattr(pipeline, "execute", None)
                if exec_fn is not None:
                    try:
                        result = exec_fn()
                        if hasattr(result, "__await__"):
                            await result
                    except TypeError:
                        # Some MagicMock may need explicit await on the function itself
                        with suppress(Exception):
                            await exec_fn()
            except (ConnectionError, TimeoutError, ValueError) as e:
                # Metrics collection failure should not affect service
                logger.debug("Failed to record JWKS metrics: %s", e)

    async def record_key_rotation(self, rotated_keys: int) -> None:
        """Record key rotation event.

        Args:
            rotated_keys: Number of keys rotated
        """
        if self.redis:
            try:
                pipeline = self.redis.pipeline()

                # Increment rotation counter
                pipeline.hincrby(f"{self._metrics_prefix}counters", "key_rotations", 1)
                pipeline.hincrby(
                    f"{self._metrics_prefix}counters", "total_keys_rotated", rotated_keys
                )

                # Store rotation timestamp
                pipeline.rpush(
                    f"{self._metrics_prefix}rotation_history",
                    datetime.now(UTC).isoformat(),
                )
                # Keep only last 100 rotation events
                pipeline.ltrim(f"{self._metrics_prefix}rotation_history", -100, -1)

                await pipeline.execute()
            except (ConnectionError, TimeoutError, ValueError) as e:
                logger.debug("Failed to record key rotation: %s", e)

    async def get_metrics_summary(self) -> dict[str, Any]:
        """Get summary of JWKS metrics.

        Returns:
            Dictionary with metrics summary
        """
        if not self.redis:
            return {"error": "Redis not available"}

        try:
            # Get all counters
            counters = await cast(
                "Awaitable[dict[bytes, bytes]]",
                self.redis.hgetall(f"{self._metrics_prefix}counters"),
            )

            # Get histogram data
            histogram = await cast(
                "Awaitable[dict[bytes, bytes]]",
                self.redis.hgetall(f"{self._metrics_prefix}histogram"),
            )

            # Get last request time
            last_request = await cast(
                "Awaitable[bytes | None]", self.redis.get(f"{self._metrics_prefix}last_request")
            )

            # Get recent rotation history
            rotation_history = await cast(
                "Awaitable[list[bytes]]",
                self.redis.lrange(f"{self._metrics_prefix}rotation_history", -10, -1),
            )

            # Calculate cache hit rate
            total_requests = int(counters.get(b"total_requests", 0))
            cache_hits = int(counters.get(b"cache_hits", 0))
            cache_hit_rate = (cache_hits / total_requests * 100) if total_requests > 0 else 0

            # Calculate response time percentiles from histogram
            response_times = JWKSMetrics._calculate_percentiles(histogram)

            return {
                "total_requests": total_requests,
                "cache_hits": cache_hits,
                "cache_misses": int(counters.get(b"cache_misses", 0)),
                "cache_hit_rate": f"{cache_hit_rate:.2f}%",
                "etag_matches": int(counters.get(b"etag_matches", 0)),
                "key_rotations": int(counters.get(b"key_rotations", 0)),
                "total_keys_rotated": int(counters.get(b"total_keys_rotated", 0)),
                "response_times": response_times,
                "last_request": last_request.decode() if last_request else None,
                "recent_rotations": [r.decode() for r in rotation_history],
            }
        except (ConnectionError, TimeoutError, ValueError, AttributeError) as e:
            logger.warning("Failed to get metrics summary: %s", e)
            return {"error": str(e)}

    async def reset_metrics(self) -> None:
        """Reset all JWKS metrics (for testing or maintenance)."""
        if self.redis:
            try:
                keys = [
                    f"{self._metrics_prefix}counters",
                    f"{self._metrics_prefix}histogram",
                    f"{self._metrics_prefix}last_request",
                    f"{self._metrics_prefix}rotation_history",
                ]
                await self.redis.delete(*keys)
            except (ConnectionError, TimeoutError, ValueError) as e:
                logger.debug("Failed to reset metrics: %s", e)

    @asynccontextmanager
    async def measure_time(self) -> AsyncGenerator[dict[str, Any], None]:
        """Context manager to measure operation time.

        Yields:
            Dictionary to store metrics data
        """
        start_time = time.perf_counter()
        metrics_data: dict[str, Any] = {}

        try:
            yield metrics_data
        finally:
            # Calculate response time
            response_time_ms = (time.perf_counter() - start_time) * 1000

            # Record metrics
            await self.record_request(
                cache_hit=metrics_data.get("cache_hit", False),
                response_time_ms=response_time_ms,
                etag_match=metrics_data.get("etag_match", False),
            )

    @staticmethod
    def _get_histogram_bucket(value_ms: float) -> str:
        """Get histogram bucket for response time.

        Args:
            value_ms: Response time in milliseconds

        Returns:
            Bucket name
        """
        buckets = [
            (1, "lt_1ms"),
            (5, "1_5ms"),
            (10, "5_10ms"),
            (50, "10_50ms"),
            (100, "50_100ms"),
            (500, "100_500ms"),
        ]

        for threshold, bucket_name in buckets:
            if value_ms < threshold:
                return bucket_name
        return "gte_500ms"

    @staticmethod
    def _calculate_percentiles(histogram: dict[bytes, bytes]) -> dict[str, float]:
        """Calculate response time percentiles from histogram.

        Args:
            histogram: Raw histogram data from Redis

        Returns:
            Dictionary with percentile values
        """
        # Map buckets to median values
        bucket_values = {
            b"lt_1ms": 0.5,
            b"1_5ms": 3.0,
            b"5_10ms": 7.5,
            b"10_50ms": 30.0,
            b"50_100ms": 75.0,
            b"100_500ms": 300.0,
            b"gte_500ms": 750.0,
        }

        # Build sorted list of response times
        response_times = []
        for bucket, count in histogram.items():
            if bucket in bucket_values:
                median_value = bucket_values[bucket]
                count_int = int(count)
                response_times.extend([median_value] * count_int)

        if not response_times:
            return {"p50": 0, "p95": 0, "p99": 0}

        response_times.sort()
        total = len(response_times)

        return {
            "p50": response_times[int(total * 0.5)],
            "p95": response_times[int(total * 0.95)] if total > 1 else response_times[0],
            "p99": response_times[int(total * 0.99)] if total > 1 else response_times[0],
        }
