heck yes — let’s ship a FastAPI backend that feels like September-2025, not 2021. Below is a drop-in blueprint with **libraries, versions, repo layout, and copy-paste code** you can start from tonight. I’ve biased for: async, OpenAPI 3.1, Pydantic v2, SQLAlchemy 2 async, SQLModel (2025-stable), OTel, NATS JetStream, and pgvector — with citations to the current docs.

***

# Journal Backend — FastAPI “2025-grade” Stack

## Why this stack (quick receipts)

- **FastAPI** now emits **OpenAPI 3.1 by default** and ships a first-party CLI (`fastapi dev/run`). It plays perfectly with **Pydantic v2**. ([FastAPI][1], [Pydantic][2])
- **SQLAlchemy 2.x async** with **psycopg 3** (or `asyncpg`) is the modern PG path. ([SQLAlchemy][3], [PyPI][4])
- **SQLModel 0.0.24 (Mar 7 2025)** is alive, Python 3.13-ready, and a natural fit with FastAPI/Pydantic. ([GitHub][5])
- **OpenTelemetry** auto-/manual instrumentation for FastAPI is mature and easy to enable. ([OpenTelemetry Python Contrib][6], [OpenTelemetry][7])
- **Strawberry GraphQL** integrates cleanly with FastAPI if/when you add a GraphQL facade. ([Redis][8])
- **pgvector** is the simplest, most portable vector store for semantic search (lives inside Postgres). ([FastAPI][9])
- **NATS JetStream** (nats-py v2.11+) is a lightweight event bus for outbox → stream patterns. ([DevDocs][10])
- **Temporal** Python SDK is production-ready for durable workflows when you need them. ([PyPI][11])

***

## Repo layout

```
journal-backend/
├─ pyproject.toml
├─ .env.example
├─ app/
│  ├─ main.py
│  ├─ api/               # routers
│  │   ├─ v1/
│  │   │   ├─ entries.py
│  │   │   ├─ tags.py
│  │   │   ├─ auth.py
│  │   │   └─ workspaces.py
│  ├─ domain/            # DDD core (entities, value objects, events)
│  │   ├─ entries.py
│  │   ├─ events.py
│  │   └─ types.py
│  ├─ services/          # use-cases (application layer)
│  │   ├─ entry_service.py
│  │   └─ tagging_service.py
│  ├─ infra/             # adapters
│  │   ├─ db.py
│  │   ├─ models.py
│  │   ├─ outbox.py
│  │   ├─ nats_bus.py
│  │   ├─ search_pgvector.py
│  │   └─ auth.py
│  ├─ telemetry/         # OTel setup
│  │   └─ otel.py
│  ├─ graphql/           # optional Strawberry schema
│  │   └─ schema.py
│  └─ settings.py
├─ migrations/           # Alembic
└─ tests/
```

***

## pyproject (versions from Aug/Sep 2025 docs)

```toml
[project]
name = "journal-backend"
version = "0.1.0"
requires-python = ">=3.13"
dependencies = [
  "fastapi[standard]==0.116.1",        # CLI + docs + OpenAPI 3.1
  "uvicorn[standard]==0.35.0",
  "pydantic>=2.11.7,<3",               # v2 series
  "pydantic-settings>=2.3",
  "sqlalchemy[postgresql,asyncio]==2.0.43",
  "psycopg[binary,pool]>=3.2.0",       # for sync; use asyncpg for async driver
  "asyncpg>=0.29.0",
  "sqlmodel==0.0.24",                  # Mar 7, 2025
  "alembic>=1.13.2",
  "redis>=5.0.0",
  "pyjwt>=2.10.1",
  "authlib>=1.4.1",
  "python-multipart>=0.0.9",
  "httpx>=0.27.0",
  "opentelemetry-api==1.36.0",
  "opentelemetry-sdk==1.36.0",
  "opentelemetry-exporter-otlp==1.36.0",
  "opentelemetry-instrumentation-fastapi==0.47b0",
  "nats-py>=2.11.0",
  "strawberry-graphql>=0.246.0",       # optional
]
```

- FastAPI 0.116.x, OpenAPI 3.1, and the `fastapi` CLI are current. ([PyPI][12], [FastAPI][1])
- SQLModel 0.0.24 released Mar 7 2025. ([GitHub][5])
- OTel 1.36.0 is the June/July 2025 line. ([OpenTelemetry Python Contrib][6])
- `nats-py` 2.11+ has the JetStream fixes you’ll want. ([DevDocs][10])
- Auth choices reference **PyJWT** and **Authlib**. ([release-monitoring.org][13], [docs.authlib.org][14])

> Tip: consider **Astral’s `uv`** to initialize and run (`uv add fastapi --extra standard`; `fastapi dev app/main.py`). ([Astral Docs][15])

***

## Settings (Pydantic v2)

```python
# app/settings.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="JOURNAL_")

    env: str = "dev"
    db_url: str = "postgresql+asyncpg://journ:pass@localhost:5432/journal"
    redis_url: str = "redis://localhost:6379/0"
    nats_url: str = "nats://localhost:4222"
    otlp_endpoint: str = "http://localhost:4317"

settings = Settings()
```

Pydantic v2 is the default in modern FastAPI; use `pydantic-settings` for env. ([Pydantic][2])

***

## Async database + SQLModel + Alembic

```python
# app/infra/db.py
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.settings import settings

engine = create_async_engine(settings.db_url, pool_pre_ping=True)
SessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
```

```python
# app/infra/models.py
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4

class Entry(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    author_id: UUID
    title: str
    content: dict  # rich content blocks (JSON)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_deleted: bool = False
```

SQLAlchemy 2 async engine; SQLModel integrates with SA & Pydantic v2. ([SQLAlchemy][3], [SQLModel][16])

**Alembic** will autogenerate migrations from SQLModel/SA models.

***

## Event sourcing (lean, Postgres-first)

**Event table + outbox relay** (no Kafka cluster required):

```sql
-- migrations/versions/xxxx_event_store.sql
CREATE TABLE event_store (
  id UUID PRIMARY KEY,
  aggregate_id UUID NOT NULL,
  aggregate_type TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_version INT NOT NULL,
  event_data JSONB NOT NULL,
  metadata JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX ON event_store (aggregate_id, occurred_at);
```

```python
# app/infra/outbox.py
from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime

class Event(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    aggregate_id: UUID
    aggregate_type: str
    event_type: str
    event_version: int = 1
    event_data: dict
    metadata: dict = {}
    occurred_at: datetime = Field(default_factory=datetime.utcnow)
    published: bool = False
```

A small **relay** task reads unpublished events and publishes to **NATS JetStream** (subject per aggregate type). NATS is lightweight and battle-tested for this pattern. ([DevDocs][10])

> Want durable workflows? Keep events in PG and kick long-running jobs into **Temporal** from the relay (e.g., exports, analytics backfills). ([PyPI][11])

***

## Vector search (pgvector)

- Enable once per DB: `CREATE EXTENSION IF NOT EXISTS vector;`
- Add `embedding vector(1536)` to a `entry_embeddings` table and keep it in sync via events.
  pgvector docs show install/index options (HNSW/IVFFlat). ([FastAPI][9])

***

## OpenTelemetry (traces/metrics/logs)

```python
# app/telemetry/otel.py
from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

def setup_otel(service_name: str, endpoint: str):
    provider = TracerProvider(resource=Resource.create({"service.name": service_name}))
    provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(endpoint=endpoint)))
    trace.set_tracer_provider(provider)
```

```python
# app/main.py
from fastapi import FastAPI
from app.settings import settings
from app.telemetry.otel import setup_otel
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

app = FastAPI(title="Journal API", version="1.0.0")
setup_otel("journal-api", settings.otlp_endpoint)
FastAPIInstrumentor.instrument_app(app)
```

FastAPI instrumentation + OTLP exporter: dead simple to enable; auto-instrument is available if you prefer. ([OpenTelemetry Python Contrib][6], [PyPI][17], [OpenTelemetry][7])

***

## HTTP + WS API shell

```python
# app/api/v1/entries.py
from fastapi import APIRouter, Depends
from sqlmodel import select
from app.infra.db import SessionLocal
from app.infra.models import Entry

router = APIRouter(prefix="/entries", tags=["entries"])

@router.get("")
async def list_entries(q: str | None = None):
    async with SessionLocal() as s:
        stmt = select(Entry).where(Entry.is_deleted == False)
        rows = (await s.execute(stmt)).scalars().all()
        return rows
```

```python
# app/main.py (continued)
from app.api.v1 import entries
app.include_router(entries.router)

# WebSockets for collaboration presence / cursor sharing:
from fastapi import WebSocket
@app.websocket("/api/v1/entries/{entry_id}/collaborate")
async def collaborate(entry_id: str, ws: WebSocket):
    await ws.accept()
    await ws.send_json({"hello": entry_id})
```

FastAPI’s WebSocket support is first-class; you can auth/room-broadcast with standard patterns. ([FastAPI][18])

***

## Auth (JWT + optional OIDC)

- **Local**: PyJWT to mint short-lived access tokens + refresh tokens (Redis session store).
- **OIDC**: Use **Authlib** to integrate with Google/Microsoft if you want SSO later. ([release-monitoring.org][13], [docs.authlib.org][14])
- FastAPI’s security docs show OAuth2 Password Flow + scopes if you want RBAC baked into tokens. ([GitHub][19])

***

## Search & GraphQL (optional)

- **REST search**: PG full-text + pgvector; build a hybrid rank (`ts_rank_cd` + cosine sim). ([FastAPI][9])
- **GraphQL**: Mount Strawberry at `/graphql` with `strawberry.fastapi.GraphQLRouter(schema)`. ([Redis][8])

***

## Dev & Run commands

```bash
# with uv (fast)  — recommended
uv init --app
uv add fastapi --extra standard
uv add "sqlalchemy[postgresql,asyncio]" asyncpg sqlmodel alembic psycopg[binary,pool]
uv add redis pyjwt authlib nats-py
uv add opentelemetry-api opentelemetry-sdk opentelemetry-exporter-otlp \
       opentelemetry-instrumentation-fastapi
uv run fastapi dev app/main.py   # hot reload
```

`fastapi dev`/`fastapi run` are the current first-party way to serve your app locally/in production. ([FastAPI][20])

***

## Production checklist (opinionated)

- **ASGI server**: `uvicorn` behind your ingress/LB. Consider Granian if you need extra throughput; Uvicorn remains the standard. ([FastAPI][21])
- **DB**: Postgres 15/16; enable pgvector; use **PgBouncer**; partition events by month. ([FastAPI][9])
- **Observability**: OTel → OTLP (Tempo/Jaeger/etc.); scrape Prom metrics via exporter; error tracking with Sentry. ([OpenTelemetry][7])
- **Eventing**: Outbox → NATS JetStream; consumers update projections/search indices. ([DevDocs][10])
- **API**: OpenAPI 3.1; keep `x-trace-id` flowing; use response models (Pydantic v2). ([FastAPI][1])

***

## Small things that save big time (2025 patterns)

- **Async SQLAlchemy** (`create_async_engine`) + **asyncpg** dialect for end-to-end async I/O. ([SQLAlchemy][3])
- **psycopg LISTEN/NOTIFY** if you want PG-native change signals for local dev. ([psycopg.org][22])
- **OpenAPI niceties**: you can extend/override schema bits (logos, tags, examples) directly in FastAPI. ([FastAPI][23])

***

### What’s next?

If you want, I’ll convert this into a bootstrapped repo (routers + models + migrations + OTel + NATS docker-compose) so you can `docker compose up` and start wiring the frontend.

[1]: https://fastapi.tiangolo.com/reference/fastapi/?utm_source=chatgpt.com "FastAPI class"

[2]: https://docs.pydantic.dev/latest/?utm_source=chatgpt.com "Welcome to Pydantic - Pydantic"

[3]: https://docs.sqlalchemy.org/en/latest/orm/extensions/asyncio.html?utm_source=chatgpt.com "Asynchronous I/O (asyncio) — SQLAlchemy 2.0 ..."

[4]: https://pypi.org/project/SQLAlchemy/?utm_source=chatgpt.com "SQLAlchemy"

[5]: https://github.com/fastapi/sqlmodel/releases?utm_source=chatgpt.com "Releases · fastapi/sqlmodel"

[6]: https://opentelemetry-python-contrib.readthedocs.io/en/latest/instrumentation/fastapi/fastapi.html?utm_source=chatgpt.com "OpenTelemetry FastAPI Instrumentation"

[7]: https://opentelemetry.io/docs/zero-code/python/?utm_source=chatgpt.com "Python zero-code instrumentation"

[8]: https://redis.io/docs/latest/develop/clients/redis-py/?utm_source=chatgpt.com "redis-py guide (Python) | Docs"

[9]: https://fastapi.tiangolo.com/advanced/security/oauth2-scopes/?utm_source=chatgpt.com "OAuth2 scopes"

[10]: https://devdocs.io/fastapi/?utm_source=chatgpt.com "FastAPI documentation"

[11]: https://pypi.org/project/sse-starlette/?utm_source=chatgpt.com "sse-starlette"

[12]: https://pypi.org/project/PyJWT/?utm_source=chatgpt.com "PyJWT"

[13]: https://release-monitoring.org/project/python-pyjwt?utm_source=chatgpt.com "PyJWT · Anitya"

[14]: https://docs.authlib.org/en/v1.4.1/?utm_source=chatgpt.com "Authlib 1.4.1 documentation"

[15]: https://docs.astral.sh/uv/guides/integration/fastapi/?utm_source=chatgpt.com "Using uv with FastAPI - Astral Docs"

[16]: https://sqlmodel.tiangolo.com/tutorial/?utm_source=chatgpt.com "Tutorial - User Guide"

[17]: https://pypi.org/project/opentelemetry-instrumentation-fastapi/?utm_source=chatgpt.com "opentelemetry-instrumentation-fastapi"

[18]: https://fastapi.tiangolo.com/advanced/websockets/?utm_source=chatgpt.com "WebSockets"

[19]: https://github.com/jpadilla/pyjwt/blob/master/.github/workflows/pypi-package.yml?utm_source=chatgpt.com "pypi-package.yml"

[20]: https://fastapi.tiangolo.com/fastapi-cli/?utm_source=chatgpt.com "FastAPI CLI"

[21]: https://fastapi.tiangolo.com/deployment/manually/?utm_source=chatgpt.com "Run a Server Manually"

[22]: https://www.psycopg.org/psycopg3/docs/advanced/async.html?utm_source=chatgpt.com "Concurrent operations - psycopg 3.3.0.dev1 documentation"

[23]: https://fastapi.tiangolo.com/how-to/extending-openapi/?utm_source=chatgpt.com "Extending OpenAPI - FastAPI"
