#!/bin/bash
# Wait for server readiness with proper health checks
# Policy: /healthz must return 200, /readyz is optional based on REQUIRES_READY

set -e

# Configuration
SERVER_URL="${SERVER_URL:-http://localhost:5000}"
MAX_RETRIES="${MAX_RETRIES:-30}"
RETRY_DELAY="${RETRY_DELAY:-2}"
REQUIRES_READY="${REQUIRES_READY:-0}"

echo "Waiting for server at $SERVER_URL to be ready..."
echo "Max retries: $MAX_RETRIES, Retry delay: ${RETRY_DELAY}s"
echo "Requires readiness: $REQUIRES_READY"

# Step 1: Check liveness (process is up) - REQUIRED
echo "Step 1: Checking liveness (/healthz)..."
for i in $(seq 1 $MAX_RETRIES); do
    echo "  Attempt $i/$MAX_RETRIES..."

    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${SERVER_URL}/healthz" 2>/dev/null || echo "000")

    if [ "$HTTP_STATUS" = "200" ]; then
        echo "✓ Server is alive (HTTP 200)"
        break
    fi

    if [ $i -eq $MAX_RETRIES ]; then
        echo "✗ Server failed to start after $MAX_RETRIES attempts"
        exit 1
    fi

    sleep $RETRY_DELAY
done

# Step 2: Check readiness (dependencies) - OPTIONAL
if [ "$REQUIRES_READY" = "1" ]; then
    echo "Step 2: Checking readiness (/readyz) - REQUIRED..."

    for i in $(seq 1 $MAX_RETRIES); do
        echo "  Attempt $i/$MAX_RETRIES..."

        # Get the readiness status
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${SERVER_URL}/readyz" 2>/dev/null || echo "000")

        if [ "$HTTP_STATUS" = "200" ]; then
            echo "✓ Server is ready (all dependencies healthy)"

            # Show detailed status if jq is available
            if command -v jq > /dev/null 2>&1; then
                echo "Dependency status:"
                curl -s "${SERVER_URL}/readyz" 2>/dev/null | jq -r '.checks[] | "  - \(.name): \(.status)"' 2>/dev/null || true
            fi

            exit 0
        elif [ "$HTTP_STATUS" = "503" ]; then
            echo "⚠ Server is up but dependencies not ready (HTTP 503)"

            # Show which checks are failing if jq is available
            if command -v jq > /dev/null 2>&1; then
                echo "Failed checks:"
                curl -s "${SERVER_URL}/readyz" 2>/dev/null | jq -r '.checks[] | select(.status == "unhealthy") | "  - \(.name): \(.detail)"' 2>/dev/null || true
            fi
        else
            echo "⚠ Server not responding correctly (HTTP $HTTP_STATUS)"
        fi

        if [ $i -eq $MAX_RETRIES ]; then
            echo "✗ Server dependencies failed to become ready after $MAX_RETRIES attempts"
            echo "Final readiness status:"
            curl -s "${SERVER_URL}/readyz" 2>/dev/null | jq 2>/dev/null || curl -s "${SERVER_URL}/readyz" 2>/dev/null || echo "Could not get status"
            exit 1
        fi

        sleep $RETRY_DELAY
    done
else
    echo "Step 2: Checking readiness (/readyz) - INFORMATIONAL ONLY..."

    # Get readiness status once for information
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${SERVER_URL}/readyz" 2>/dev/null || echo "000")

    if [ "$HTTP_STATUS" = "200" ]; then
        echo "ℹ Server reports all dependencies healthy (not required for this job)"
    elif [ "$HTTP_STATUS" = "503" ]; then
        echo "ℹ Server reports some dependencies unhealthy (not required for this job)"

        # Show status if available
        if command -v jq > /dev/null 2>&1; then
            curl -s "${SERVER_URL}/readyz" 2>/dev/null | jq -r '.checks[] | "  - \(.name): \(.status)"' 2>/dev/null || true
        fi
    else
        echo "ℹ Could not get readiness status (HTTP $HTTP_STATUS) - proceeding anyway"
    fi
fi

echo "✓ Server wait complete"
exit 0