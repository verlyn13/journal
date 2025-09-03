from __future__ import annotations
import asyncio
from fastapi import FastAPI
from app.settings import settings
from app.telemetry.otel import setup_otel
from app.api.v1 import entries, auth, admin
from app.api.v1 import search as search_api
from strawberry.fastapi import GraphQLRouter
from app.graphql.schema import schema
from app.infra.db import AsyncSessionLocal
from app.infra.outbox import relay_outbox

app = FastAPI(title="Journal API", version="1.0.0")

# Telemetry
setup_otel("journal-api", settings.otlp_endpoint)

# Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(entries.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(search_api.router, prefix="/api/v1")
app.include_router(GraphQLRouter(schema), prefix="/graphql")

# Background task: outbox relay
@app.on_event("startup")
async def _startup():
    asyncio.create_task(relay_outbox(AsyncSessionLocal))
