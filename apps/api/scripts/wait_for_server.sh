#!/bin/bash
# Wait for server readiness with proper health checks

set -e

# Configuration
SERVER_URL="${SERVER_URL:-http://localhost:5000}"
MAX_RETRIES="${MAX_RETRIES:-30}"
RETRY_DELAY="${RETRY_DELAY:-2}"

echo "Waiting for server at $SERVER_URL to be ready..."
echo "Max retries: $MAX_RETRIES, Retry delay: ${RETRY_DELAY}s"

# First check liveness (process is up)
for i in $(seq 1 $MAX_RETRIES); do
    echo "Attempt $i/$MAX_RETRIES: Checking liveness..."

    if curl -f -s "${SERVER_URL}/healthz" > /dev/null 2>&1; then
        echo "✓ Server is alive"
        break
    fi

    if [ $i -eq $MAX_RETRIES ]; then
        echo "✗ Server failed to start after $MAX_RETRIES attempts"
        exit 1
    fi

    sleep $RETRY_DELAY
done

# Then check readiness (dependencies are ready)
for i in $(seq 1 $MAX_RETRIES); do
    echo "Attempt $i/$MAX_RETRIES: Checking readiness..."

    # Get the readiness status
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${SERVER_URL}/readyz" 2>/dev/null || echo "000")

    if [ "$HTTP_STATUS" = "200" ]; then
        echo "✓ Server is ready (all dependencies healthy)"

        # Show detailed status if available
        if command -v jq > /dev/null 2>&1; then
            curl -s "${SERVER_URL}/readyz" | jq -r '.checks[] | "\(.name): \(.status)"' 2>/dev/null || true
        fi

        exit 0
    elif [ "$HTTP_STATUS" = "503" ]; then
        echo "⚠ Server is up but dependencies not ready (HTTP 503)"

        # Show which checks are failing if jq is available
        if command -v jq > /dev/null 2>&1; then
            echo "Failed checks:"
            curl -s "${SERVER_URL}/readyz" | jq -r '.checks[] | select(.status == "unhealthy") | "  - \(.name): \(.detail)"' 2>/dev/null || true
        fi
    else
        echo "⚠ Server not responding (HTTP $HTTP_STATUS)"
    fi

    if [ $i -eq $MAX_RETRIES ]; then
        echo "✗ Server dependencies failed to become ready after $MAX_RETRIES attempts"
        echo "Final status:"
        curl -s "${SERVER_URL}/readyz" | jq 2>/dev/null || curl -s "${SERVER_URL}/readyz" || echo "Could not get status"
        exit 1
    fi

    sleep $RETRY_DELAY
done