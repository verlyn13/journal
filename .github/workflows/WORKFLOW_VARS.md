# GitHub Actions Workflow Variables Standard

This document defines the standard environment variables and configuration patterns for CI workflows.

## Global Environment Variables

These should be defined at the workflow level in the `env:` section:

```yaml
env:
  # Python configuration
  PYTHON_VERSION: "3.12"
  UV_CACHE_DIR: /tmp/.uv-cache

  # Infisical CLI configuration
  INFISICAL_CLI_VERSION: "latest"  # Note: APT repo doesn't support version pinning
  INFISICAL_CLI_REQUIRED: "true"   # Set to "false" for jobs that don't need it
```

## Database Configuration

Always use consistent database configuration with explicit user/password:

```yaml
services:
  postgres:
    image: postgres:16  # or pgvector/pgvector:pg16 if needed
    env:
      POSTGRES_USER: journal
      POSTGRES_PASSWORD: journal
      POSTGRES_DB: journal_test  # or journal_integration, journal_e2e_test
    ports: ["5432:5432"]  # or 5433:5432 for non-standard
    options: >-
      --health-cmd "pg_isready -U journal"
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5

# In job steps:
env:
  # Primary database URLs (single source of truth)
  DATABASE_URL: postgresql+asyncpg://journal:journal@localhost:5432/journal_test
  DATABASE_URL_SYNC: postgresql://journal:journal@localhost:5432/journal_test

  # Backward compatibility aliases (if needed)
  JOURNAL_DB_URL: ${{ env.DATABASE_URL }}

  # Explicit user for CLI tools
  PGUSER: journal
```

## Redis Configuration

```yaml
services:
  redis:
    image: redis:7-alpine
    options: >-
      --health-cmd "redis-cli ping"
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
    ports: ["6379:6379"]

# In job steps:
env:
  REDIS_URL: redis://localhost:6379/0
  JOURNAL_REDIS_URL: redis://localhost:6379/0  # Backward compat
```

## Infisical CLI Installation

Use the installer script with timeouts for reliability:

```yaml
# Only if INFISICAL_CLI_REQUIRED == 'true'
- name: Install Infisical CLI
  if: env.INFISICAL_CLI_REQUIRED == 'true'
  timeout-minutes: 5
  run: |
    .github/workflows/scripts/install-infisical-cli.sh
```

## Server Wait Logic

Use `REQUIRES_READY` to control health check requirements:

```yaml
# For jobs that need external dependencies (integration/E2E tests):
- name: Wait for API readiness (with dependencies)
  run: |
    SERVER_URL=http://localhost:8000 \
    MAX_RETRIES=30 \
    REQUIRES_READY=1 \
    ./scripts/wait_for_server.sh

# For jobs that only need the server running (unit tests, linting):
- name: Wait for API liveness (no dependencies)
  run: |
    SERVER_URL=http://localhost:8000 \
    MAX_RETRIES=30 \
    REQUIRES_READY=0 \
    ./scripts/wait_for_server.sh
```

## Job Categories and Requirements

### Unit Tests / Linting
- `INFISICAL_CLI_REQUIRED: "false"`
- No database/redis services needed
- `REQUIRES_READY=0` if server needed

### Integration Tests
- `INFISICAL_CLI_REQUIRED: "false"` (unless testing CLI integration)
- Database and Redis services required
- `REQUIRES_READY=1` for server checks

### E2E Tests / Infisical Tests
- `INFISICAL_CLI_REQUIRED: "true"`
- All services required
- `REQUIRES_READY=1` for server checks

### Static Analysis / Security Scans
- `INFISICAL_CLI_REQUIRED: "false"`
- No services needed
- No server needed

## Anti-patterns to Avoid

❌ **DON'T** use floating versions:
```yaml
INFISICAL_VERSION: "latest"  # Bad - non-deterministic
```

❌ **DON'T** rely on system defaults:
```yaml
# Missing POSTGRES_USER, will default to 'root' in some contexts
POSTGRES_DB: test_db
```

❌ **DON'T** use different database URLs in different places:
```yaml
# In migrations
JOURNAL_DB_URL: postgresql://...

# In app
DATABASE_URL: postgresql+asyncpg://...
```

✅ **DO** use consistent, explicit configuration with single sources of truth.