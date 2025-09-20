---
id: ci-cd-guide
title: CI/CD Developer Guide
type: guide
version: 1.0.0
created: '2025-09-16'
updated: '2025-09-16'
author: Journal Team
tags:
- python
- guide
- docker
priority: medium
status: approved
visibility: internal
schema_version: v1
---

# CI/CD Developer Guide

## Overview

This guide documents the Journal project's CI/CD pipeline, focusing on developer experience and troubleshooting.

## Local Development with Testcontainers

### Why Testcontainers?

While our CI uses GitHub Actions service containers for speed and cost efficiency, developers can use Testcontainers locally for:
- Automatic container lifecycle management
- Consistent test environments
- No manual Docker commands needed
- Parallel test execution with isolated containers

### Setup

```python
# tests/test_with_containers.py (example)
import uv run pytest
from testcontainers.postgres import PostgresContainer
from testcontainers.redis import RedisContainer

@uv run pytest.fixture(scope="session")
def postgres_container():
    """Spin up a PostgreSQL container for testing."""
    with PostgresContainer(
        image="pgvector/pgvector:pg16@sha256:c3c84b85691a264aa3c5b8fc1d611e67d42b0cca8596e3d3d22dc2424c12c4e2",
        user="journal",
        password="journal",
        dbname="journal_test"
    ) as postgres:
        postgres.start()
        yield postgres.get_connection_url()

@uv run pytest.fixture(scope="session")
def redis_container():
    """Spin up a Redis container for testing."""
    with RedisContainer(
        image="redis:7-alpine@sha256:bb186d083732f669da90be8b0f975a37812b15e913465bb14d845db72a4e3e08"
    ) as redis:
        redis.start()
        yield redis.get_connection_url()
```

### Running Tests Locally

```bash
# Install test dependencies
cd apps/api
uv sync --all-extras --dev

# Run with Testcontainers (requires Docker)
uv run pytest tests/local/ -v

# Run without containers (uses existing services)
uv run pytest tests/ -v
```

## CI/CD Pipeline Architecture

### Workflow Organization

```
.github/workflows/
├── api-ci.yml           # API linting, testing, integration
├── api-tests.yml        # API test matrix (unit, component, integration)
├── infisical-ci.yml     # Infisical integration tests
├── quality-gates.yml    # Quality checks and performance tests
├── security-scan.yml    # Security scanning (OSV, Trivy, etc.)
└── web-tests.yml        # Frontend tests (Vitest, Playwright)
```

### Service Container Configuration

All workflows use pinned container images for reproducibility:

| Service | Image | Port |
|---------|-------|------|
| PostgreSQL | `pgvector/pgvector:pg16@sha256:c3c84b85...` | 5433 |
| Redis | `redis:7-alpine@sha256:bb186d083732...` | 6379/6380 |
| NATS | `nats:2-alpine` | 4222 |

### Database Configuration

Every workflow uses a standardized pattern:

```yaml
env:
  DATABASE_URL_SYNC: postgresql+psycopg://journal:journal@localhost:5433/journal_test

steps:
  - name: Run migrations
    timeout-minutes: 5
    run: uv run alembic -x sqlalchemy.url=${DATABASE_URL_SYNC} upgrade head
```

## Troubleshooting CI Failures

### Common Issues and Solutions

#### 1. Infisical CLI Installation Failures

**Symptom**: `curl: (22) The requested URL returned error: 404`

**Solution**: The composite action handles this with fallback to Cloudsmith:
```bash
# Primary: GitHub Releases
https://github.com/Infisical/infisical/releases/download/v${VERSION}/...

# Fallback: Cloudsmith APT
curl -1sLf https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh
```

#### 2. Database Connection Errors

**Symptom**: `FATAL: role "root" does not exist`

**Solution**: All workflows now use explicit DATABASE_URL_SYNC with user `journal`:
```yaml
DATABASE_URL_SYNC: postgresql+psycopg://journal:journal@localhost:5433/journal_test
```

#### 3. Python Environment Warnings

**Symptom**: `VIRTUAL_ENV does not match the project environment path`

**Solution**: Use `uv run` without setting VIRTUAL_ENV:
```bash
# Good
uv run uv run pytest

# Bad
export VIRTUAL_ENV=/path/to/venv && uv run pytest
```

#### 4. OSV Scanner Failures

**Symptom**: `Top level 'runs:' section is required`

**Solution**: We install OSV Scanner as a CLI tool instead of using the action:
```bash
curl -LO https://github.com/google/osv-scanner/releases/download/v1.9.1/osv-scanner_1.9.1_linux_amd64.deb
sudo dpkg -i osv-scanner_1.9.1_linux_amd64.deb
```

### Debugging Workflow Runs

```bash
# View PR checks
gh pr checks 32

# View specific job logs
gh run view <run-id> --job <job-id> --log

# Watch checks in real-time
gh pr checks 32 --watch

# Re-run failed jobs
gh run rerun <run-id> --failed
```

## Performance Benchmarks

### Expected Durations

| Step | Target | Actual |
|------|--------|--------|
| Infisical CLI install (cached) | < 5s | ~3s |
| Infisical CLI install (fresh) | < 30s | ~20s |
| Database migrations | < 5s | ~3s |
| Unit tests | < 60s | ~35s |
| Integration tests | < 120s | ~90s |
| Security scans | < 180s | ~120s |

### Optimization Tips

1. **Parallel Execution**: Run independent jobs concurrently
2. **Caching**: Use GitHub Actions cache for dependencies
3. **Service Containers**: Prefer over Docker Compose for CI
4. **Timeouts**: Set appropriate timeouts to fail fast

## Security Scanning

### Scan Types

| Scanner | Purpose | Blocking | Frequency |
|---------|---------|----------|------------|
| OSV | Known vulnerabilities | No | Every PR |
| Trivy | Container vulnerabilities | No | Every PR |
| pip-audit | Python dependencies | No | Every PR |
| Gitleaks | Secret detection | No | Every PR |
| Bandit | Python security | No | Every PR |

### Reviewing Security Findings

1. Check GitHub Security tab for SARIF results
2. Download artifacts from workflow runs
3. Review severity levels (focus on Critical/High)
4. Update dependencies as needed

## Maintenance Tasks

### Weekly
- Review and update container image digests
- Check for new security vulnerabilities
- Update Infisical CLI version if available

### Monthly
- Review CI performance metrics
- Adjust timeouts based on actual durations
- Clean up old workflow runs

### Quarterly
- Audit all environment variables
- Review and update this documentation
- Performance profiling of slow tests

## Best Practices

### For Developers

1. **Run tests locally first**: `uv run uv run pytest` before pushing
2. **Use descriptive commit messages**: Helps identify issues in CI
3. **Keep PRs focused**: Smaller PRs = faster CI
4. **Monitor your PR checks**: Use `gh pr checks --watch`

### For CI Maintenance

1. **Pin everything**: Images, actions, tool versions
2. **Document changes**: Update WORKFLOW_VARS.md
3. **Test workflow changes**: Use a draft PR first
4. **Monitor costs**: Service containers are free but runners aren't

## Emergency Procedures

### CI/CD Outage

1. **Check GitHub Status**: https://www.githubstatus.com/
2. **Verify secrets**: Ensure GitHub secrets are set correctly
3. **Rollback option**: Previous workflow versions in git history
4. **Manual validation**: Run critical tests locally

### Rollback Procedure

```bash
# Revert to previous workflow version
git revert <commit-with-broken-workflow>
git push

# Or checkout previous version
git checkout <last-known-good> -- .github/workflows/
git commit -m "Revert to working CI configuration"
git push
```

## Contact & Support

- **CI/CD Issues**: Create issue with `ci/cd` label
- **Security Findings**: Report via security@journal.com
- **Documentation**: PRs welcome to improve this guide

## Appendix

### Environment Variables Reference

See `.github/WORKFLOW_VARS.md` for:
- Service container configurations
- Database naming conventions
- Port mappings
- Image update procedures

### Tool Versions

| Tool | Version | Update Frequency |
|------|---------|------------------|
| Python | 3.13 | Quarterly |
| uv | latest | Monthly |
| Infisical CLI | 0.42.1 | As needed |
| PostgreSQL | 16 | Yearly |
| Redis | 7 | Yearly |

### Useful Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Testcontainers Python](https://testcontainers-python.readthedocs.io/)
- [uv Documentation](https://github.com/astral-sh/uv)
- [OSV Database](https://osv.dev/)