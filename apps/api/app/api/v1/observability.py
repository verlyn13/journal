"""
Observability endpoints for monitoring and metrics.
"""

import time
from datetime import datetime, timezone
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
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


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
    checks = {
        "status": "ready",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "checks": {},
    }

    # Database check
    try:
        start = time.time()
        result = await session.execute(text("SELECT 1"))
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
    metrics = []

    # System metrics
    try:
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage("/")

        # CPU metrics
        metrics.append(f"# HELP system_cpu_usage_percent CPU usage percentage")
        metrics.append(f"# TYPE system_cpu_usage_percent gauge")
        metrics.append(f"system_cpu_usage_percent {cpu_percent}")

        # Memory metrics
        metrics.append(f"# HELP system_memory_usage_bytes Memory usage in bytes")
        metrics.append(f"# TYPE system_memory_usage_bytes gauge")
        metrics.append(f"system_memory_usage_bytes {memory.used}")

        metrics.append(f"# HELP system_memory_total_bytes Total memory in bytes")
        metrics.append(f"# TYPE system_memory_total_bytes gauge")
        metrics.append(f"system_memory_total_bytes {memory.total}")

        # Disk metrics
        metrics.append(f"# HELP system_disk_usage_bytes Disk usage in bytes")
        metrics.append(f"# TYPE system_disk_usage_bytes gauge")
        metrics.append(f"system_disk_usage_bytes {disk.used}")

        metrics.append(f"# HELP system_disk_total_bytes Total disk space in bytes")
        metrics.append(f"# TYPE system_disk_total_bytes gauge")
        metrics.append(f"system_disk_total_bytes {disk.total}")

    except Exception:
        # If we can't get system metrics, just skip them
        pass

    # Application info
    metrics.append(f"# HELP app_info Application information")
    metrics.append(f"# TYPE app_info gauge")
    metrics.append(f'app_info{{version="1.0.0",name="journal-api"}} 1')

    return "\n".join(metrics) + "\n"


@router.get("/ping")
async def ping() -> dict[str, str]:
    """Simple ping endpoint for uptime monitoring."""
    return {"pong": datetime.now(timezone.utc).isoformat()}