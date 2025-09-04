#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
API_DIR="$ROOT_DIR/apps/api"
WEB_DIR="$ROOT_DIR/apps/web"

info() { echo -e "\033[1;34m[dev]\033[0m $*"; }
err()  { echo -e "\033[1;31m[dev]\033[0m $*" >&2; }

cleanup() {
  local pids=("${API_PID:-}" "${WEB_PID:-}")
  for pid in "${pids[@]}"; do
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
}
trap cleanup EXIT INT TERM

info "Starting services (Postgres, NATS, Redis)..."
pushd "$API_DIR" >/dev/null
docker compose up -d db nats redis
popd >/dev/null

info "Running DB migrations (IPv4 to avoid localhost/::1 auth)…"
export DATABASE_URL_SYNC="postgresql+psycopg2://journal:journal@127.0.0.1:5433/journal"
pushd "$API_DIR" >/dev/null
uv run alembic upgrade head || {
  err "Migration failed. If this is a fresh DB, try: docker compose down -v && rerun."
  exit 1
}
popd >/dev/null

API_PORT=${JOURNAL_API_PORT:-5000}
API_HOST=${JOURNAL_API_HOST:-0.0.0.0}
# Handle API port conflicts: kill (opt-in) or auto-bump.
if command -v lsof >/dev/null 2>&1; then
  if lsof -iTCP:${API_PORT} -sTCP:LISTEN -P -n >/dev/null 2>&1; then
    if [[ "${DEV_KILL_PORT:-0}" == "1" ]]; then
      info "Port ${API_PORT} busy; killing listener (DEV_KILL_PORT=1)"
      lsof -tiTCP:${API_PORT} -sTCP:LISTEN | xargs -r kill -9 || true
      sleep 0.5
    else
      info "Port ${API_PORT} busy; auto-bumping to next free port"
      for try in {1..10}; do
        API_PORT=$((API_PORT+1))
        if ! lsof -iTCP:${API_PORT} -sTCP:LISTEN -P -n >/dev/null 2>&1; then
          break
        fi
      done
      export JOURNAL_API_PORT=${API_PORT}
      info "Using API port ${API_PORT}"
    fi
  fi
fi
info "Starting API (http://localhost:${API_PORT})"
pushd "$API_DIR" >/dev/null
UVICORN_CMD=(uv run fastapi run app/main.py --host "${API_HOST}" --port "${API_PORT}" --reload)
"${UVICORN_CMD[@]}" &
API_PID=$!
popd >/dev/null

WEB_PORT=${WEB_PORT:-5173}
# Normalize VITE_API_URL to always end with /api
if [[ -n "${VITE_API_URL:-}" ]]; then
  if [[ "${VITE_API_URL}" != */api ]]; then
    VITE_API_URL="${VITE_API_URL%/}/api"
  fi
else
  VITE_API_URL="http://localhost:${API_PORT}/api"
fi
export VITE_API_URL
# Handle web port conflicts similarly (auto-bump only)
if command -v lsof >/dev/null 2>&1; then
  if lsof -iTCP:${WEB_PORT} -sTCP:LISTEN -P -n >/dev/null 2>&1; then
    info "Web port ${WEB_PORT} busy; auto-bumping"
    for try in {1..10}; do
      WEB_PORT=$((WEB_PORT+1))
      if ! lsof -iTCP:${WEB_PORT} -sTCP:LISTEN -P -n >/dev/null 2>&1; then
        break
      fi
    done
    info "Using web port ${WEB_PORT}"
  fi
fi
info "Starting Web (http://localhost:${WEB_PORT})"
pushd "$WEB_DIR" >/dev/null
VITE_API_URL="$VITE_API_URL" bun run dev -- --port "$WEB_PORT" &
WEB_PID=$!
popd >/dev/null

info "Servers running. Press Ctrl+C to stop."
info "  API:   http://localhost:${API_PORT} (health: /health, metrics: /metrics)"
info "  Web:   http://localhost:${WEB_PORT}"

wait
