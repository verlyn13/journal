---
id: fastapi-boostrap-starter
title: Bootstrap
type: api
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- api
- docker
- fastapi
priority: high
status: approved
visibility: internal
schema_version: v1
last_verified: '2025-09-09'
---

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
# http://127.0.0.1:5000/docs
```

### What you’ve got

- **REST**: `/api/entries` (list + create), `/api/auth/login` (demo JWT)
- **Events**: Postgres outbox → NATS JetStream relay (background task)
- **Telemetry**: OTel OTLP exporter wired; optional collector config in `ops/`
- **Migrations**: Alembic with SQLModel metadata autogenerate
- **Tests**: `tests/test_smoke.py`
- **Make targets**: `make up|down|dev|migrate|upgrade|lint|fmt|test`

Want me to add pgvector embeddings + a hybrid search endpoint, or wire GraphQL at `/graphql` next?
