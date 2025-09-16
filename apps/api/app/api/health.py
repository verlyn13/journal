"""Deterministic health check endpoints for liveness and readiness probes.

This module provides side-effect-free health endpoints:
- /healthz: Always returns 200 with process status (no I/O)
- /readyz: Checks dependencies with strict timeouts, never raises
"""

import asyncio
import os
import shutil

from collections.abc import Awaitable, Callable
from enum import StrEnum
from typing import Any

from fastapi import APIRouter, Response, status
from pydantic import BaseModel
from redis.asyncio import Redis
from redis.exceptions import RedisError
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncEngine

from app.infra.db import build_engine
from app.infra.redis import get_redis


router = APIRouter(tags=["health"])


class Status(StrEnum):
    """Health check status values."""

    healthy = "healthy"
    unhealthy = "unhealthy"
    skipped = "skipped"


class Check(BaseModel):
    """Individual health check result."""

    name: str
    status: Status
    detail: str | None = None
    latency_ms: float | None = None


class HealthReport(BaseModel):
    """Complete health report."""

    service: str
    version: str
    environment: str
    checks: list[Check]


async def _timed(fn: Callable[[], Awaitable[None]], name: str, timeout_s: float = 1.0) -> Check:
    """Execute a health check with timeout and specific exception handling.

    Args:
        fn: Async function to execute
        name: Name of the check
        timeout_s: Maximum time to wait (seconds)

    Returns:
        Check result with status and timing
    """
    start = asyncio.get_event_loop().time()
    try:
        await asyncio.wait_for(fn(), timeout=timeout_s)
        latency = (asyncio.get_event_loop().time() - start) * 1000
        return Check(name=name, status=Status.healthy, latency_ms=latency)
    except TimeoutError:
        return Check(
            name=name,
            status=Status.unhealthy,
            detail=f"timeout after {timeout_s}s",
            latency_ms=timeout_s * 1000,
        )
    except RedisError as e:
        latency = (asyncio.get_event_loop().time() - start) * 1000
        return Check(
            name=name,
            status=Status.unhealthy,
            detail=f"RedisError: {str(e)[:100]}",
            latency_ms=latency,
        )
    except (OperationalError, SQLAlchemyError) as e:
        latency = (asyncio.get_event_loop().time() - start) * 1000
        return Check(
            name=name,
            status=Status.unhealthy,
            detail=f"{type(e).__name__}: {str(e)[:100]}",
            latency_ms=latency,
        )
    except RuntimeError as e:
        latency = (asyncio.get_event_loop().time() - start) * 1000
        return Check(
            name=name,
            status=Status.unhealthy,
            detail=str(e)[:100],
            latency_ms=latency,
        )


def _infisical_cli_check() -> Check:
    """Check if Infisical CLI is available (sync, no I/O)."""
    if os.getenv("INFISICAL_PROJECT_ID"):
        if shutil.which("infisical"):
            return Check(name="infisical_cli", status=Status.healthy)
        return Check(
            name="infisical_cli",
            status=Status.unhealthy,
            detail="CLI not found in PATH",
        )
    return Check(
        name="infisical_cli",
        status=Status.skipped,
        detail="INFISICAL_PROJECT_ID not configured",
    )


@router.get("/healthz", response_model=HealthReport)
async def liveness() -> HealthReport:
    """Liveness probe - always returns 200 with process status.

    No I/O, no awaits, deterministic response.

    Returns:
        HealthReport with basic service info and process status
    """
    return HealthReport(
        service=os.getenv("APP_NAME", "journal-api"),
        version=os.getenv("APP_VERSION", "dev"),
        environment=os.getenv("APP_ENV", "development"),
        checks=[Check(name="process", status=Status.healthy)],
    )


@router.get("/readyz", response_model=HealthReport)
async def readiness(response: Response) -> HealthReport:
    """Readiness probe - checks external dependencies with strict timeouts.

    Never raises. Returns 200 when all deps pass, 503 when any fail.

    Returns:
        HealthReport with detailed status of all dependencies
    """
    checks: list[Check] = []

    # Database check
    db_url = (
        os.getenv("DATABASE_URL") or os.getenv("DATABASE_URL_SYNC") or os.getenv("JOURNAL_DB_URL")
    )
    if db_url:

        async def db_probe() -> None:
            # Use sync URL if available for simpler probe
            sync_url = os.getenv("DATABASE_URL_SYNC")
            if sync_url:
                engine = create_engine(sync_url)
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
                    conn.commit()
            else:
                engine: AsyncEngine = build_engine()
                async with engine.connect() as conn:
                    await conn.execute(text("SELECT 1"))
                    await conn.commit()

        checks.append(await _timed(db_probe, "database", timeout_s=1.0))
    else:
        checks.append(
            Check(
                name="database",
                status=Status.skipped,
                detail="No DATABASE_URL configured",
            )
        )

    # Redis check
    redis_url = os.getenv("REDIS_URL") or os.getenv("JOURNAL_REDIS_URL")
    if redis_url:

        async def redis_probe() -> None:
            redis: Redis[Any] = get_redis()
            await redis.ping()

        checks.append(await _timed(redis_probe, "redis", timeout_s=1.0))
    else:
        checks.append(
            Check(
                name="redis",
                status=Status.skipped,
                detail="No REDIS_URL configured",
            )
        )

    # Infisical CLI check (sync, no network)
    checks.append(_infisical_cli_check())

    # Determine overall health
    unhealthy_checks = [c for c in checks if c.status == Status.unhealthy]
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
