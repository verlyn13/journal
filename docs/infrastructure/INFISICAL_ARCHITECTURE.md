---
id: infisical-architecture
title: Infisical Integration Architecture
type: api
version: 1.0.0
created: '2025-09-16'
updated: '2025-09-16'
author: Journal Team
tags:
- api
- python
priority: high
status: approved
visibility: internal
schema_version: v1
last_verified: '2025-09-16'
---

# Infisical Integration Architecture

## Overview

This document describes the Infisical secret management integration architecture for the Journal application, including CI/CD patterns, version handling, and testing strategies.

## Core Principles

### 1. Zero External Dependencies in CI
- **No network downloads during CI runs** - All binaries are either pre-installed or shimmed
- **Deterministic test execution** - Same inputs always produce same outputs
- **Bounded execution times** - All operations have timeouts (max 60s for most operations)

### 2. Single Source of Truth
- **Version management**: All version parsing goes through `app/infra/secrets/version.py`
- **Database configuration**: Single `DATABASE_URL_SYNC` pattern with Alembic `-x` flag
- **Container images**: Pinned by SHA256 digest in `.github/WORKFLOW_VARS.md`

### 3. Least Privilege Security
- **No superuser operations** - Only `journal` user for PostgreSQL
- **No root access** - All operations run as non-root users
- **Granular permissions** - Each component has minimal required permissions

## Version Management

### Centralized Version Module

All Infisical CLI version parsing is handled by `app/infra/secrets/version.py`:

```python
from app.infra.secrets.version import (
    parse_cli_version,      # Parse any CLI output format
    is_compatible_version,  # Check if version is 0.42.x
    format_version,         # Format version consistently
    VersionInfo,           # Structured version data
)
```

### Supported Version Formats

The system supports multiple CLI output formats:
- Standard: `infisical version 0.42.1`
- Alternative: `Infisical CLI v0.42.1`
- Shim format: `Infisical CLI v0.42.1-shim`
- Multi-line: Takes first line only (handles shim's multi-line output)

### Version Constants

```python
EXPECTED_VERSION = "0.42"  # Expected major.minor version
EXPECTED_MAJOR = 0
EXPECTED_MINOR = 42
```

## CI/CD Testing Strategy

### The Infisical CLI Shim

Location: `.github/scripts/infisical-shim.sh`

The shim provides deterministic responses for CI testing:
- **Zero network dependencies** - No downloads, no API calls
- **Predictable outputs** - Always returns same test data
- **Fast execution** - Instant responses, no timeouts
- **Version compatible** - Returns `v0.42.1-shim` to indicate shim mode

#### When to Use the Shim

| Environment | Use Shim? | Reason |
|------------|-----------|---------|
| CI/CD Workflows | ✅ Yes | Deterministic, no network deps |
| Local Development | ❌ No | Use real CLI for actual secrets |
| Production | ❌ No | Use real CLI with proper auth |
| Unit Tests | ✅ Yes | Fast, predictable |
| Integration Tests | ✅ Yes | Controlled environment |
| E2E Tests | ❌ No | Test real integration |

### GitHub Actions Setup

All workflows use the composite action for consistent setup:

```yaml
- name: Setup Infisical CLI for Testing
  uses: ./.github/actions/setup-infisical-testing
  with:
    use-shim: "true"     # Always true for CI
    version: "0.42.1"    # Ignored when using shim
```

## Database Configuration

### Single DSN Pattern

Each workflow job defines ONE sync DSN:

```yaml
env:
  DATABASE_URL_SYNC: postgresql+psycopg://journal:journal@localhost:5433/journal_test
```

### Alembic Migrations

Always use `-x` flag to pass database URL:

```bash
uv run alembic -x sqlalchemy.url=${DATABASE_URL_SYNC} upgrade head
```

### Database Names by Job Type

| Job Type | Database Name | Purpose |
|----------|--------------|---------|
| Unit Tests | `journal_test` | Basic unit testing |
| Integration Tests | `journal_integration` | Integration testing |
| E2E Tests | `journal_e2e_test` | End-to-end testing |
| Infisical Tests | `journal_infisical_test` | Secret management testing |
| Quality Gates | `journal` | Production-like validation |

## Container Images

All images are pinned by SHA256 digest for reproducibility:

### PostgreSQL (pgvector)
```yaml
image: pgvector/pgvector:pg16@sha256:c3c84b85691a264aa3c5b8fc1d611e67d42b0cca8596e3d3d22dc2424c12c4e2
```

### Redis
```yaml
image: redis:7-alpine@sha256:bb186d083732f669da90be8b0f975a37812b15e913465bb14d845db72a4e3e08
```

Updates are documented in `.github/WORKFLOW_VARS.md` with update process.

## Security Framework

### PostgreSQL User Policy

**CRITICAL**: Only `journal` user connections allowed in CI/CD

```yaml
# CORRECT - Uses journal user
POSTGRES_USER: journal
POSTGRES_PASSWORD: journal
POSTGRES_DB: journal_test

# WRONG - Never use postgres/root users
POSTGRES_USER: postgres  # ❌ VIOLATION
```

### Connection Monitoring

The `postgres-monitor.sh` script enforces security:
- Detects unauthorized user connections
- Validates `journal`-only access
- Provides forensic analysis for violations
- Suggests remediation commands

## Error Handling Patterns

### Version Parsing Errors

All version errors are centralized:
```python
try:
    version = parse_cli_version(output)
except ValueError as e:
    # Handle with consistent error message
    raise InfisicalError(str(e)) from e
```

### Health Checks

Health endpoints must be resilient:
```python
try:
    # Check component
    component_healthy = True
except Exception:  # noqa: BLE001
    # Never let health checks crash
    component_healthy = False
```

## Testing Guidelines

### Mock Responses

The shim provides consistent test data:
- JWT keys: Returns valid RSA key pairs
- OAuth tokens: Returns test tokens
- API keys: Returns `sk-test1234567890abcdef`
- Database URLs: Returns test database connections

### Timeout Configuration

| Operation | Timeout | Reason |
|-----------|---------|---------|
| CLI validation | 5s | Quick local check |
| Secret retrieval | 30s | Network operation |
| Migration | 300s | Complex operation |
| Health check | 5s | Must be fast |
| Service startup | 300s | Container initialization |

## Development Workflow

### Adding New Secrets

1. Add to canonical paths:
   - JWT: `/auth/jwt/*`
   - AES: `/auth/aes/*`
   - OAuth: `/auth/oauth/*`

2. Update shim for testing:
   ```bash
   # In .github/scripts/infisical-shim.sh
   "NEW_SECRET")
       echo "test-value-for-ci"
       ;;
   ```

3. Use centralized client:
   ```python
   from app.infra.secrets import InfisicalSecretsClient
   client = InfisicalSecretsClient.from_env()
   value = await client.get_secret("path/to/secret")
   ```

### Debugging CI Failures

1. Check version parsing:
   ```bash
   # Is shim installed?
   which infisical
   infisical --version
   ```

2. Verify database user:
   ```bash
   # Should only show journal user
   psql -c "SELECT current_user"
   ```

3. Check environment:
   ```bash
   # All should be set in CI
   echo $DATABASE_URL_SYNC
   echo $PGDATABASE
   echo $PGUSER
   ```

## Migration Path

### From Environment Variables to Infisical

1. **Development**: Use `.env` files with real Infisical
2. **CI/CD**: Use shim for deterministic testing
3. **Production**: Use real Infisical with OIDC auth

### Rollback Strategy

If Infisical fails, fallback to environment:
```python
try:
    value = await client.get_secret("path")
except SecretNotFoundError:
    value = os.getenv("FALLBACK_ENV_VAR")
```

## Common Issues and Solutions

### Issue: "Unexpected Infisical CLI version format"
**Cause**: Multi-line output or unknown format
**Solution**: Version parser handles first line only

### Issue: "PERMISSION VIOLATION: postgres user detected"
**Cause**: Using postgres superuser instead of journal
**Solution**: Set POSTGRES_USER=journal in all configs

### Issue: "Infisical CLI not found"
**Cause**: Shim not properly installed in CI
**Solution**: Check composite action setup-infisical-testing

### Issue: "Database journal_test does not exist"
**Cause**: Database not created or wrong name
**Solution**: Verify POSTGRES_DB matches DATABASE_URL_SYNC

## Best Practices

1. **Always use the shim in CI** - Never download binaries during tests
2. **One database URL per job** - Avoid multiple conflicting configurations
3. **Version check once** - Use centralized version.py module
4. **Fail fast** - Set reasonable timeouts on all operations
5. **Log forensically** - Include context for debugging
6. **Test deterministically** - Same inputs → same outputs
7. **Monitor security** - Audit all database connections

## References

- [Infisical CLI Documentation](https://infisical.com/docs/cli/overview)
- [GitHub Actions Best Practices](https://docs.github.com/en/actions/guides)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/user-manag.html)
- [Supply Chain Security](https://slsa.dev/)

---

*Last Updated: 2025-01-16*
*Maintained by: Journal Team*