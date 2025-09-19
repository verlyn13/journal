---
id: ci-checklist
title: CI/CD Implementation Checklist
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

# CI/CD Implementation Checklist

## For All CI/CD Changes

### ✅ Pre-Implementation Review

- [ ] Read `CLAUDE.md` for project rules
- [ ] Read `.github/WORKFLOW_VARS.md` for CI configuration
- [ ] Read `docs/INFISICAL_ARCHITECTURE.md` for secret management patterns

### ✅ Critical Rules (NEVER VIOLATE)

- [ ] **NO binary downloads in CI** - Use shims or pre-installed tools
- [ ] **NO postgres/root users** - Only `journal` user in PostgreSQL
- [ ] **NO hardcoded versions** - Use `app/infra/secrets/version.py`
- [ ] **NO multiple database URLs** - One `DATABASE_URL_SYNC` per job
- [ ] **NO unpinned images** - All containers pinned by SHA256

### ✅ Infisical Integration

- [ ] Always use shim in CI: `use-shim: "true"`
- [ ] Version parsing via: `from app.infra.secrets.version import parse_cli_version`
- [ ] Shim location: `.github/scripts/infisical-shim.sh`
- [ ] Expected version: `0.42.x` (defined in version.py)

### ✅ Database Configuration

- [ ] Single DSN pattern: `DATABASE_URL_SYNC=postgresql+psycopg://journal:journal@...`
- [ ] Alembic with `-x` flag: `alembic -x sqlalchemy.url=${DATABASE_URL_SYNC} upgrade head`
- [ ] Correct database names:
  - Unit: `journal_test`
  - Integration: `journal_integration`
  - E2E: `journal_e2e_test`
  - Infisical: `journal_infisical_test`

### ✅ Container Setup

- [ ] PostgreSQL: `pgvector/pgvector:pg16@sha256:c3c84b8569...`
- [ ] Redis: `redis:7-alpine@sha256:bb186d0837...`
- [ ] Port 5433 for PostgreSQL (not 5432)
- [ ] Environment variables set:
  ```yaml
  POSTGRES_USER: journal
  POSTGRES_PASSWORD: journal
  POSTGRES_DB: <appropriate_test_db>
  PGUSER: journal
  PGPASSWORD: journal
  PGHOST: localhost
  PGPORT: 5433
  PGDATABASE: <appropriate_test_db>
  ```

### ✅ Error Handling

- [ ] Health endpoints resilient (catch all exceptions)
- [ ] Timeouts on all operations (max 60s for most)
- [ ] Forensic logging for failures
- [ ] No 500 errors from health checks

### ✅ Testing Strategy

- [ ] Shim provides deterministic test data
- [ ] No network calls during tests
- [ ] Predictable outputs for all inputs
- [ ] Fast execution (no waiting for downloads)

## Common Pitfalls to Avoid

### ❌ DON'T

1. Download Infisical CLI from the internet
2. Use `postgres` or `root` PostgreSQL users
3. Parse versions in multiple places
4. Mix DATABASE_URL and DATABASE_URL_SYNC
5. Use floating container tags (`:latest`, `:16`)
6. Create superuser PostgreSQL operations
7. Let health endpoints throw 500 errors
8. Skip timeouts on external operations

### ✅ DO

1. Use the Infisical shim for all CI testing
2. Use `journal` user exclusively in PostgreSQL
3. Parse versions via `app/infra/secrets/version.py`
4. Use single `DATABASE_URL_SYNC` per job
5. Pin containers by SHA256 digest
6. Run as least-privilege users
7. Make health endpoints resilient
8. Set reasonable timeouts everywhere

## Quick Debug Commands

```bash
# Check shim is installed
which infisical
infisical --version

# Verify PostgreSQL user
PGPASSWORD=journal psql -U journal -d journal_test -c "SELECT current_user"

# Test version parsing
uv run python -c "from app.infra.secrets.version import parse_cli_version; print(parse_cli_version('Infisical CLI v0.42.1-shim'))"

# Check environment
env | grep -E "DATABASE_URL|POSTGRES|PG|INFISICAL"
```

## References

- **Main Docs**: `docs/INFISICAL_ARCHITECTURE.md`
- **Shim Guide**: `.github/scripts/SHIM_GUIDE.md`
- **Workflow Config**: `.github/WORKFLOW_VARS.md`
- **Project Rules**: `CLAUDE.md`

---

**Remember**: Deterministic CI is the goal. No flakes, no surprises, no external dependencies.