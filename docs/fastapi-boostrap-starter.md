# Bootstrap

See /home/verlyn13/Projects/verlyn13/journal/docs/journal-backend-bootstrap-pgvector-fts-reindex

## Quickstart (dev)

1. install deps

```bash
# optional but recommended
# curl -LsSf https://astral.sh/uv/install.sh | sh
uv venv
uv pip install -e .
```

2. bring up infra and migrate

```bash
docker compose up -d db redis nats
alembic upgrade head
```

3. run the API (hot reload)

```bash
fastapi dev app/main.py
# http://127.0.0.1:8000/docs
```

### What you’ve got

- **REST**: `/api/v1/entries` (list + create), `/api/v1/auth/login` (demo JWT)
- **Events**: Postgres outbox → NATS JetStream relay (background task)
- **Telemetry**: OTel OTLP exporter wired; optional collector config in `ops/`
- **Migrations**: Alembic with SQLModel metadata autogenerate
- **Tests**: `tests/test_smoke.py`
- **Make targets**: `make up|down|dev|migrate|upgrade|lint|fmt|test`

Want me to add pgvector embeddings + a hybrid search endpoint, or wire GraphQL at `/graphql` next?
