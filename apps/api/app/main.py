from __future__ import annotations

import asyncio
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from strawberry.fastapi import GraphQLRouter

from app.api.v1 import (
    admin as admin_api,
    auth as auth_api,
    entries as entries_api,
    search as search_api,
    stats as stats_api,
    webauthn as webauthn_api,
)
from app.graphql.schema import schema
from app.infra.db import build_engine, sessionmaker_for
from app.infra.outbox import relay_outbox
from app.settings import settings
from app.telemetry.metrics_runtime import render_prom
from app.telemetry.otel import setup_otel


app = FastAPI(title="Journal API", version="1.0.0")

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

# Routers
app.include_router(auth_api.router, prefix="/api/v1")
app.include_router(webauthn_api.router, prefix="/api/v1")
app.include_router(entries_api.router, prefix="/api/v1")
app.include_router(admin_api.router, prefix="/api/v1")
app.include_router(search_api.router, prefix="/api/v1")
app.include_router(stats_api.router, prefix="/api/v1")
app.include_router(GraphQLRouter(schema), prefix="/graphql")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/metrics")
async def metrics() -> PlainTextResponse:
    # Minimal Prometheus exposition format
    return PlainTextResponse(render_prom(), media_type="text/plain; version=0.0.4")


@app.on_event("startup")
def _startup() -> None:
    # Background outbox relay publisher (skip in tests)
    if not settings.testing:
        session_maker = sessionmaker_for(build_engine())
        task = asyncio.create_task(relay_outbox(session_maker))
        app.state.outbox_task = task
