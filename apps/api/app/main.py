from __future__ import annotations

import asyncio
import logging
import os

from fastapi import FastAPI
from contextlib import asynccontextmanager
from typing import AsyncIterator
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from strawberry.fastapi import GraphQLRouter

from app.api.internal import security_monitoring as security_api, webhooks as webhook_api
from app.api.v1 import (
    admin as admin_api,
    admin_enhanced as admin_v2_api,
    auth as auth_api,
    auth_enhanced as auth_enhanced_api,
    entries as entries_api,
    infisical_webhooks as infisical_api,
    jwks as jwks_api,
    monitoring as monitoring_api,
    search as search_api,
    stats as stats_api,
    webauthn as webauthn_api,
)
from app.graphql.schema import schema
from app.infra.db import build_engine, sessionmaker_for
from app.infra.outbox import relay_outbox
from app.infra.secrets.auth_bootstrap import ensure_authenticated
from app.middleware.enhanced_jwt_middleware import EnhancedJWTMiddleware
from app.services.monitoring_scheduler import start_monitoring_scheduler, stop_monitoring_scheduler
from app.settings import settings
from app.telemetry.metrics_runtime import render_prom
from app.telemetry.otel import setup_otel


@asynccontextmanager
async def _lifespan(_app: FastAPI) -> AsyncIterator[None]:
    # Initialize Universal Auth (if credentials provided)
    await ensure_authenticated()
    yield


app = FastAPI(title="Journal API", version="1.0.0", lifespan=_lifespan)

# Observability (configurable endpoint)
try:
    setup_otel("journal-api", settings.otlp_endpoint)
except Exception as exc:  # noqa: BLE001 - otel is optional in dev
    # Non-fatal if OTel collector isn't up in dev
    logging.getLogger(__name__).warning("OTel setup skipped: %s", exc)

# CORS (frontend at localhost:5173 / 127.0.0.1:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enhanced JWT middleware for EdDSA token validation
# Note: EnhancedJWTMiddleware is used via require_scopes dependency, not as middleware

# Public API routers
app.include_router(jwks_api.router)  # No prefix, uses /.well-known
app.include_router(auth_api.router, prefix="/api/v1")  # Legacy HS256 auth
app.include_router(auth_enhanced_api.router, prefix="/api/v2")  # Enhanced EdDSA auth
app.include_router(admin_v2_api.router, prefix="/api/v2")
app.include_router(webauthn_api.router, prefix="/api/v1")
app.include_router(entries_api.router, prefix="/api/v1")
app.include_router(admin_api.router, prefix="/api/v1")
app.include_router(search_api.router, prefix="/api/v1")
app.include_router(stats_api.router, prefix="/api/v1")
app.include_router(infisical_api.router, prefix="/api/v1")
app.include_router(monitoring_api.router, prefix="/api/v1")
app.include_router(GraphQLRouter(schema), prefix="/graphql")

# Internal API routers (security-hardened)
app.include_router(webhook_api.router, prefix="/internal")
app.include_router(security_api.router, prefix="/internal")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/metrics")
async def metrics() -> PlainTextResponse:
    # Minimal Prometheus exposition format
    return PlainTextResponse(render_prom(), media_type="text/plain; version=0.0.4")


@app.on_event("startup")
async def _startup() -> None:
    # Initialize Infisical authentication (Universal Auth or static token fallback)
    logger = logging.getLogger(__name__)
    try:
        success = await ensure_authenticated()
        if success:
            logger.info("Infisical authentication initialized successfully")
        else:
            logger.warning("Infisical authentication failed - some features may not work correctly")
    except Exception as e:
        logger.error("Failed to initialize Infisical authentication: %s", e)
        # Continue startup even if auth fails - app may work with static tokens

    # Configure trusted proxies for IP extraction
    from app.infra.ip_extraction import configure_trusted_proxies

    configure_trusted_proxies()

    # Background outbox relay publisher (skip in tests or when disabled via env)
    disable_startup = os.getenv("JOURNAL_DISABLE_STARTUP") == "1"
    if not settings.testing and not disable_startup:
        session_maker = sessionmaker_for(build_engine())
        task = asyncio.create_task(relay_outbox(session_maker))
        app.state.outbox_task = task

        # Start Infisical monitoring scheduler
        await start_monitoring_scheduler()
        logger.info("Infisical monitoring scheduler started")


@app.on_event("shutdown")
async def _shutdown() -> None:
    # Stop monitoring scheduler
    await stop_monitoring_scheduler()
    logging.getLogger(__name__).info("Infisical monitoring scheduler stopped")

    # Cancel outbox task if it exists
    if hasattr(app.state, "outbox_task"):
        app.state.outbox_task.cancel()
        try:
            await app.state.outbox_task
        except asyncio.CancelledError:
            pass
