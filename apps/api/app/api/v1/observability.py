"""
Observability endpoints for monitoring and metrics.
"""

import logging
import time

from datetime import UTC, datetime
from typing import Any

import psutil

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.db import get_session
from app.infra.redis import get_redis_client


router = APIRouter(prefix="/observability", tags=["observability"])


@router.get("/health")
async def health_check() -> dict[str, str]:
    """Basic health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.now(UTC).isoformat()}


@router.get("/ready")
async def readiness_check(
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """
    Readiness check with dependency validation.

    Checks:
    - Database connectivity
    - Redis connectivity (if configured)
    - Disk space
    - Memory usage
    """
    checks: dict[str, Any] = {
        "status": "ready",
        "timestamp": datetime.now(UTC).isoformat(),
        "checks": {},
    }

    # Database check
    try:
        start = time.time()
        await session.execute(text("SELECT 1"))
        await session.commit()
        checks["checks"]["database"] = {
            "status": "healthy",
            "latency_ms": round((time.time() - start) * 1000, 2),
        }
    except Exception as e:
        checks["status"] = "not_ready"
        checks["checks"]["database"] = {
            "status": "unhealthy",
            "error": str(e),
        }

    # Redis check (optional)
    try:
        redis = await get_redis_client()
        if redis:
            start = time.time()
            await redis.ping()
            checks["checks"]["redis"] = {
                "status": "healthy",
                "latency_ms": round((time.time() - start) * 1000, 2),
            }
    except Exception as e:
        # Redis is optional, don't fail readiness
        checks["checks"]["redis"] = {
            "status": "degraded",
            "error": str(e),
        }

    # System resources
    try:
        disk = psutil.disk_usage("/")
        memory = psutil.virtual_memory()

        checks["checks"]["resources"] = {
            "disk_free_gb": round(disk.free / (1024**3), 2),
            "disk_percent": disk.percent,
            "memory_free_gb": round(memory.available / (1024**3), 2),
            "memory_percent": memory.percent,
        }

        # Fail if critically low on resources
        if disk.percent > 95 or memory.percent > 95:
            checks["status"] = "degraded"
            checks["checks"]["resources"]["status"] = "warning"
        else:
            checks["checks"]["resources"]["status"] = "healthy"

    except Exception as e:
        checks["checks"]["resources"] = {
            "status": "unknown",
            "error": str(e),
        }

    return checks


@router.get("/metrics")
async def metrics_endpoint() -> str:
    """
    Prometheus-compatible metrics endpoint.

    Provides basic metrics in Prometheus text format.
    Can be extended with prometheus-fastapi-instrumentator for full metrics.
    """
    metrics: list[str] = []

    # System metrics
    try:
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage("/")

        # CPU metrics
        metrics.extend([
            "# HELP system_cpu_usage_percent CPU usage percentage",
            "# TYPE system_cpu_usage_percent gauge",
            f"system_cpu_usage_percent {cpu_percent}",
        ])

        # Memory metrics
        metrics.extend([
            "# HELP system_memory_usage_bytes Memory usage in bytes",
            "# TYPE system_memory_usage_bytes gauge",
            f"system_memory_usage_bytes {memory.used}",
            "# HELP system_memory_total_bytes Total memory in bytes",
            "# TYPE system_memory_total_bytes gauge",
            f"system_memory_total_bytes {memory.total}",
        ])

        # Disk metrics
        metrics.extend([
            "# HELP system_disk_usage_bytes Disk usage in bytes",
            "# TYPE system_disk_usage_bytes gauge",
            f"system_disk_usage_bytes {disk.used}",
            "# HELP system_disk_total_bytes Total disk space in bytes",
            "# TYPE system_disk_total_bytes gauge",
            f"system_disk_total_bytes {disk.total}",
        ])

    except Exception as exc:
        # Log the exception for debugging, but don't fail the metrics endpoint
        logger = logging.getLogger(__name__)
        logger.debug(f"Failed to collect system metrics: {exc}")

    # Application info
    metrics.extend([
        "# HELP app_info Application information",
        "# TYPE app_info gauge",
        'app_info{version="1.0.0",name="journal-api"} 1',
    ])

    return "\n".join(metrics) + "\n"


@router.get("/ping")
async def ping() -> dict[str, str]:
    """Simple ping endpoint for uptime monitoring."""
    return {"pong": datetime.now(UTC).isoformat()}
