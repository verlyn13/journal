#!/usr/bin/env bash
# test-auth-flow.sh
# End-to-end test: gopass -> UA -> INFISICAL_TOKEN -> basic secret ops

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

require() { command -v "$1" >/dev/null 2>&1 || { echo "Missing: $1" >&2; exit 1; }; }

require gopass
require infisical

echo "Exporting env from gopass..."
eval "$($SCRIPT_DIR/setup-infisical-auth.sh export)"
export INFISICAL_ENVIRONMENT="dev"

echo "Attempting UA login..."
if infisical login --method universal-auth \
    --client-id "$UA_CLIENT_ID_TOKEN_SERVICE" \
    --client-secret "$UA_CLIENT_SECRET_TOKEN_SERVICE" \
    --silent --plain >/dev/null; then
  echo "✅ UA login succeeded"
else
  echo "❌ UA login failed"; exit 1
fi

echo "Listing secrets (sanity check)..."
if infisical secrets list --project-id "$INFISICAL_PROJECT_ID" >/dev/null 2>&1; then
  echo "✅ Secret list successful"
else
  echo "❌ Secret list failed"; exit 1
fi

echo "Running Python client sanity check..."
pushd "$API_DIR" >/dev/null
uv run python - <<'PY'
import os
from app.infra.secrets.infisical_client import InfisicalSecretsClient
from redis.asyncio import Redis
import asyncio

async def main():
    redis = Redis.from_url("redis://localhost:6379/9")
    client = InfisicalSecretsClient.from_env(redis)
    try:
        res = await client.health_check()
        print("Health:", res)
    finally:
        await redis.close()

asyncio.run(main())
PY
popd >/dev/null

echo "✅ Auth flow test completed"

