#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Initializing test environment via docker-compose.test.yml"

docker compose -f docker-compose.test.yml up -d

"$(dirname "$0")/wait-for-services.sh"

echo "✅ Test environment initialized"

