# Journal Backend (FastAPI • Sept 2025 Bootstrap)

A modern async FastAPI backend scaffold with SQLModel/SQLAlchemy 2, Postgres, Redis, NATS JetStream, OpenTelemetry, and Alembic migrations.

## Quickstart (Dev)

```bash
# 1) Install uv (fast Python package manager) if needed: https://github.com/astral-sh/uv
#    macOS/Linux: curl -LsSf https://astral.sh/uv/install.sh | sh
#    Windows (PowerShell): iwr https://astral.sh/uv/install.ps1 -UseBasicParsing | iex

# 2) Create virtualenv & install deps
uv venv
uv pip install -e .

# 3) Start infra (Postgres/Redis/NATS)
docker compose up -d db redis nats

# 4) Run migrations
alembic upgrade head

# 5) Run the API (hot reload)
fastapi dev app/main.py

# API docs at http://127.0.0.1:8000/docs  (OpenAPI 3.1)
```

## Core Tech

- FastAPI (OpenAPI 3.1, first‑party dev server)
- SQLAlchemy 2 (async) & SQLModel
- Postgres + Alembic migrations
- Redis (sessions/cache) & NATS JetStream (event bus)
- OpenTelemetry (OTLP exporter)
- Optional Strawberry GraphQL mount

## Make Targets

```bash
make up         # docker compose up -d
make down       # docker compose down -v
make dev        # fastapi dev app/main.py
make migrate    # alembic revision --autogenerate -m "…"
make upgrade    # alembic upgrade head
make lint       # ruff check .
make fmt        # ruff format .
make test       # pytest -q
```

## Semantic Search (pgvector)

This project ships with `pgvector` via the `pgvector/pgvector:pg16` image. The initial migration enables the extension and creates the `entry_embeddings` table with a `vector(1536)` column and an IVFFlat index (cosine).

### Endpoints

- `POST /api/v1/entries/{entry_id}/embed` → computes/updates the entry embedding (fake provider by default)
- `GET  /api/v1/search?q=hello&k=10&alpha=0.6` → hybrid (vector + FTS) search
- `POST /api/v1/search/semantic` with `{ "q": "query", "k": 10 }` → vector-only search

### GraphQL

- Mounts at `/graphql`
- Query:

```graphql
query {
  searchEntries(q: "morning notes", k: 5, alpha: 0.6) {
    score
    vecSim
    ftsRank
    entry { id title }
  }
}
```

### Embedding Providers

- Default: `JOURNAL_EMBED_PROVIDER=fake` (deterministic, no network)
- OpenAI: set `JOURNAL_EMBED_PROVIDER=openai` and `OPENAI_API_KEY`, optionally `JOURNAL_EMBED_MODEL`

## Full‑text Search Upgrade

We now index **title (weight A)** and **JSON `content` (weight B)** using:

```sql
setweight(to_tsvector('english', coalesce(title,'')), 'A')
||
setweight(jsonb_to_tsvector('english', content, '["string"]'), 'B')
```

Run:

```bash
alembic upgrade head  # ensures 0002_fts_json
```

## Embedding Worker

Start the NATS embedding worker (consumes `journal.entry` + `journal.reindex`):

```bash
uv run python -m app.workers.embedding_consumer
```

Trigger a full reindex:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/admin/reindex-embeddings
```

Optionally pass `{"batch": 500}` in the body.

### Provider

- `JOURNAL_EMBED_PROVIDER=fake` (default, offline)
- `JOURNAL_EMBED_PROVIDER=openai` (requires `OPENAI_API_KEY`)
