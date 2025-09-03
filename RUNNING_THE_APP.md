# Running the Journal (Local Development)

This project runs a React frontend (`apps/web`) against a FastAPI backend (`apps/api`).

## Prerequisites

- Python 3.11+ (3.13 OK)
- uv 0.8+ (recommended): `pip install uv`
- Docker & Docker Compose
- Bun (and Node 18+) for the frontend
- jq (optional) for curl examples

## Backend (FastAPI)

```bash
cd apps/api

# Start infra (Postgres 5433, Redis 6380, NATS 4222) and run migrations
make setup

# Start the API with hot reload
make dev   # -> http://127.0.0.1:8000

# Optional: start the embedding worker in a new terminal
make worker

# Useful commands
make db-upgrade      # apply migrations
make db-downgrade    # rollback one
make db-revision m="add_feature"  # create migration
make test            # run API tests
make lint            # lint and format
make reset           # drop and recreate DB volume (dev only)
```

Auth (dev/demo):
```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/auth/demo | jq
TOKEN=$(curl -s -X POST http://127.0.0.1:8000/api/v1/auth/demo | jq -r .access_token)
curl -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8000/api/v1/auth/me | jq
```

Docs:
- OpenAPI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc
- GraphQL: http://127.0.0.1:8000/graphql

## Frontend (Web)

```bash
cd apps/web

# Configure API URL
cat > .env <<'ENV'
VITE_API_URL=http://127.0.0.1:8000/api
ENV

# Install and run
bun install
bun run dev   # -> http://localhost:5173
```

Login in development:
- Use demo credentials `demo` / `demo123` in the web app, or
- Use `/api/v1/auth/demo` and set tokens in localStorage.

## Ports

- API: `127.0.0.1:8000`
- Postgres: `localhost:5433` (container port 5432)
- Redis: `localhost:6380`
- NATS: `localhost:4222`

## Troubleshooting

- “No such file or directory: fastapi”: ensure `uv` is installed; Makefile runs via `uv run ...`.
- Alembic revision missing: `make reset` to reset volume or `uv run alembic -c alembic.ini stamp base && make db-upgrade`.
- Frontend 401s: verify you have a valid `access_token` set; use the demo endpoints above.
