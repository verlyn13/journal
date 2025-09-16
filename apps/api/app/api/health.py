"""Robust health check endpoints for liveness and readiness probes.

This module provides production-ready health endpoints that:
- Never throw unhandled exceptions
- Use timeouts for all external checks
- Support graceful degradation
- Provide detailed status information
"""

import asyncio
import os
from enum import Enum
from typing import Any

from fastapi import APIRouter, Response, status
from pydantic import BaseModel

router = APIRouter(tags=["health"])


class HealthStatus(str, Enum):
    """Health check status values."""

    healthy = "healthy"
    unhealthy = "unhealthy"
    skipped = "skipped"


class HealthCheck(BaseModel):
    """Individual health check result."""

    name: str
    status: HealthStatus
    detail: str | None = None
    latency_ms: float | None = None


class HealthReport(BaseModel):
    """Complete health report."""

    service: str
    version: str
    environment: str
    checks: list[HealthCheck]


async def _timed_check(check_fn, name: str, timeout: float = 1.0) -> HealthCheck:
    """Execute a health check with timeout and error handling.

    Args:
        check_fn: Async function to execute
        name: Name of the check
        timeout: Maximum time to wait (seconds)

    Returns:
        HealthCheck result with status and timing
    """
    start = asyncio.get_event_loop().time()
    try:
        await asyncio.wait_for(check_fn(), timeout=timeout)
        latency = (asyncio.get_event_loop().time() - start) * 1000
        return HealthCheck(name=name, status=HealthStatus.healthy, latency_ms=latency)
    except asyncio.TimeoutError:
        return HealthCheck(
            name=name,
            status=HealthStatus.unhealthy,
            detail=f"timeout after {timeout}s",
            latency_ms=timeout * 1000,
        )
    except Exception as e:
        latency = (asyncio.get_event_loop().time() - start) * 1000
        return HealthCheck(
            name=name,
            status=HealthStatus.unhealthy,
            detail=f"{type(e).__name__}: {str(e)[:100]}",
            latency_ms=latency,
        )


@router.get("/healthz", response_model=HealthReport)
async def liveness() -> HealthReport:
    """Liveness probe - always returns 200 if the process is running.

    This endpoint should never fail and does not check external dependencies.
    It only confirms that the application process is alive and the router is mounted.

    Returns:
        HealthReport with basic service info and process status
    """
    return HealthReport(
        service=os.getenv("APP_NAME", "journal-api"),
        version=os.getenv("APP_VERSION", "dev"),
        environment=os.getenv("APP_ENV", "development"),
        checks=[HealthCheck(name="process", status=HealthStatus.healthy)],
    )


@router.get("/readyz", response_model=HealthReport)
async def readiness(response: Response) -> HealthReport:
    """Readiness probe - checks external dependencies with timeouts.

    This endpoint verifies that all required external services are accessible.
    Returns 503 if any critical service is unhealthy, 200 otherwise.

    Returns:
        HealthReport with detailed status of all dependencies
    """
    checks: list[HealthCheck] = []

    # Database check
    db_url = os.getenv("DATABASE_URL") or os.getenv("DATABASE_URL_SYNC") or os.getenv("JOURNAL_DB_URL")
    if db_url:

        async def db_probe():
            from sqlalchemy import text

            from app.infra.db import build_engine

            # Use sync URL if available for simpler probe
            sync_url = os.getenv("DATABASE_URL_SYNC")
            if sync_url:
                from sqlalchemy import create_engine

                engine = create_engine(sync_url)
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
                    conn.commit()
            else:
                engine = build_engine()
                async with engine.connect() as conn:
                    await conn.execute(text("SELECT 1"))
                    await conn.commit()

        checks.append(await _timed_check(db_probe, "database", timeout=2.0))
    else:
        checks.append(
            HealthCheck(name="database", status=HealthStatus.skipped, detail="No DATABASE_URL configured")
        )

    # Redis check
    redis_url = os.getenv("REDIS_URL") or os.getenv("JOURNAL_REDIS_URL")
    if redis_url:

        async def redis_probe():
            from app.infra.redis import get_redis

            redis = get_redis()
            # Ping is the lightest operation
            await redis.ping()

        checks.append(await _timed_check(redis_probe, "redis", timeout=1.0))
    else:
        checks.append(HealthCheck(name="redis", status=HealthStatus.skipped, detail="No REDIS_URL configured"))

    # Infisical check (lightweight - just verify CLI exists)
    if os.getenv("INFISICAL_PROJECT_ID"):

        async def infisical_probe():
            import shutil

            # Just check if CLI is available - don't make network calls
            if not shutil.which("infisical"):
                raise RuntimeError("Infisical CLI not found in PATH")

        checks.append(await _timed_check(infisical_probe, "infisical_cli", timeout=0.5))
    else:
        checks.append(
            HealthCheck(
                name="infisical",
                status=HealthStatus.skipped,
                detail="INFISICAL_PROJECT_ID not configured",
            )
        )

    # Determine overall health
    unhealthy_checks = [c for c in checks if c.status == HealthStatus.unhealthy]
    if unhealthy_checks:
        # Return 503 if any check is unhealthy
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return HealthReport(
        service=os.getenv("APP_NAME", "journal-api"),
        version=os.getenv("APP_VERSION", "dev"),
        environment=os.getenv("APP_ENV", "development"),
        checks=checks,
    )


@router.get("/health")
async def legacy_health() -> dict[str, str]:
    """Legacy health endpoint for backward compatibility.

    Deprecated: Use /healthz for liveness or /readyz for readiness checks.

    Returns:
        Simple status response
    """
    return {"status": "ok", "message": "Use /healthz or /readyz for detailed health checks"}