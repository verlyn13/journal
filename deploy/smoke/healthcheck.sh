#!/usr/bin/env bash
# Smoke test: API Health Check
# Usage: ./healthcheck.sh [API_URL]

set -euo pipefail

# Configuration
API_URL="${1:-${API_URL:-http://localhost:5000}}"
TIMEOUT="${TIMEOUT:-10}"
EXPECTED_STATUS="${EXPECTED_STATUS:-200}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Main health check
log_info "Checking API health at: ${API_URL}"

# Check /health endpoint
HEALTH_RESPONSE=$(curl -fsS \
  --max-time "${TIMEOUT}" \
  -w "\n%{http_code}" \
  "${API_URL}/health" 2>/dev/null || echo "FAILED")

if [[ "${HEALTH_RESPONSE}" == "FAILED" ]]; then
  log_error "Failed to connect to API at ${API_URL}/health"
  exit 1
fi

# Extract status code (last line)
HTTP_STATUS=$(echo "${HEALTH_RESPONSE}" | tail -n1)
BODY=$(echo "${HEALTH_RESPONSE}" | head -n-1)

if [[ "${HTTP_STATUS}" != "${EXPECTED_STATUS}" ]]; then
  log_error "Unexpected status code: ${HTTP_STATUS} (expected ${EXPECTED_STATUS})"
  log_error "Response body: ${BODY}"
  exit 1
fi

# Check for "ok" in response
if ! echo "${BODY}" | grep -qi "ok\|healthy\|true"; then
  log_warn "Health response doesn't contain expected keywords"
  log_warn "Response: ${BODY}"
fi

log_info "✓ API health check passed (status: ${HTTP_STATUS})"

# Optional: Check additional endpoints
if [[ "${CHECK_ADDITIONAL:-false}" == "true" ]]; then
  log_info "Checking additional endpoints..."

  # Check /api/v1/health
  V1_HEALTH=$(curl -fsS --max-time "${TIMEOUT}" -o /dev/null -w "%{http_code}" \
    "${API_URL}/api/v1/health" 2>/dev/null || echo "404")

  if [[ "${V1_HEALTH}" == "200" ]]; then
    log_info "✓ /api/v1/health endpoint available"
  else
    log_warn "✗ /api/v1/health returned ${V1_HEALTH}"
  fi

  # Check /docs (FastAPI)
  DOCS=$(curl -fsS --max-time "${TIMEOUT}" -o /dev/null -w "%{http_code}" \
    "${API_URL}/docs" 2>/dev/null || echo "404")

  if [[ "${DOCS}" == "200" ]]; then
    log_info "✓ API documentation available at /docs"
  else
    log_warn "✗ /docs returned ${DOCS}"
  fi
fi

log_info "All health checks completed successfully"
exit 0