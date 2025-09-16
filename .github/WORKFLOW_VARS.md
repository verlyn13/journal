# GitHub Workflow Variables

This document contains centralized configuration for GitHub Actions workflows.

## Service Container Images

All service container images are pinned by digest for reproducibility and security.

### PostgreSQL (pgvector)
- **Image**: `pgvector/pgvector:pg16@sha256:c3c84b85691a264aa3c5b8fc1d611e67d42b0cca8596e3d3d22dc2424c12c4e2`
- **Tag Reference**: `pgvector/pgvector:pg16`
- **Last Updated**: 2025-01-15
- **Update Process**:
  ```bash
  docker pull pgvector/pgvector:pg16
  docker inspect pgvector/pgvector:pg16 --format='{{.RepoDigests}}'
  ```

### Redis
- **Image**: `redis:7-alpine@sha256:bb186d083732f669da90be8b0f975a37812b15e913465bb14d845db72a4e3e08`
- **Tag Reference**: `redis:7-alpine`
- **Last Updated**: 2025-01-15
- **Update Process**:
  ```bash
  docker pull redis:7-alpine
  docker inspect redis:7-alpine --format='{{.RepoDigests}}'
  ```

### NATS
- **Image**: `nats:2-alpine`
- **Note**: Not yet pinned by digest (lower priority, used less frequently)

### WireMock
- **Image**: `wiremock/wiremock:3.3.1`
- **Note**: Version-specific tag, lower risk

## Standard Ports

- **PostgreSQL**: Always map to host port `5433` (container port `5432`)
- **Redis**: Map to host port `6379` or `6380` for isolation
- **NATS**: Map to host port `4222` (JetStream) and `8222` (monitoring)
- **API Server**: Always use port `8000`

## Database Configuration Policy

### Single DSN Pattern
Each workflow job should define exactly ONE sync DSN:
```yaml
env:
  DATABASE_URL_SYNC: postgresql+psycopg://journal:journal@localhost:5433/<database_name>
```

### Alembic Migration Pattern
Always use the `-x` flag to pass the database URL:
```yaml
run: uv run alembic -x sqlalchemy.url=${DATABASE_URL_SYNC} upgrade head
```

### Database Names by Job Type
- Unit tests: `journal_test`
- Integration tests: `journal_integration`
- E2E tests: `journal_e2e_test`
- Infisical tests: `journal_infisical_test`
- Quality gates: `journal`

## Wait Script Configuration

### wait_for_server.sh Usage
```yaml
# For E2E/integration tests (requires full readiness)
SERVER_URL=http://localhost:8000 MAX_RETRIES=30 REQUIRES_READY=1 ./scripts/wait_for_server.sh

# For smoke tests or performance baselines (health check only)
SERVER_URL=http://localhost:8000 MAX_RETRIES=30 REQUIRES_READY=0 ./scripts/wait_for_server.sh
```

### When to use REQUIRES_READY
- **REQUIRES_READY=1**: E2E tests, integration tests, tests that need database/Redis connectivity
- **REQUIRES_READY=0**: Frontend tests, smoke tests, performance baselines

## Timeout Guidelines

- **Service startup**: 5 minutes max
- **Database migrations**: 5 minutes max
- **Test execution**: 10-15 minutes for full suites
- **Infisical CLI install**: 5 minutes max
- **Docker image pulls**: 10 minutes max

## Environment Variables

### Infisical CLI
- **Version**: `0.42.1`
- **Variable**: `INFISICAL_CLI_VERSION`
- **Required Flag**: Set `INFISICAL_CLI_REQUIRED=true` only for jobs that need it
- **Setup**: Use `./.github/actions/setup-infisical-testing` with `use-shim: 'true'` for deterministic CI

### Python
- **Version**: `3.13`
- **Variable**: `PYTHON_VERSION`

### Cache Directories
- **uv cache**: `/tmp/.uv-cache`
- **Infisical cache**: `~/.cache/infisical`

## Infisical CLI Testing Setup

**CRITICAL**: All CI/CD workflows MUST use the shim for deterministic testing.

```yaml
- name: Setup Infisical CLI for Testing
  uses: ./.github/actions/setup-infisical-testing
  with:
    use-shim: "true"     # ALWAYS true for CI/CD - no exceptions
    version: "0.42.1"    # Ignored when using shim
```

### Why Shim is Mandatory in CI

1. **Zero network dependencies** - No flaky downloads or API timeouts
2. **Deterministic results** - Same inputs always produce same outputs
3. **Fast execution** - Instant responses, no waiting
4. **Version stability** - Returns `v0.42.1-shim` consistently

### Version Management

**SINGLE SOURCE OF TRUTH**: All version parsing MUST use:
```python
from app.infra.secrets.version import parse_cli_version
```

This handles:
- Standard format: `infisical version 0.42.1`
- Shim format: `Infisical CLI v0.42.1-shim`
- Multi-line output (takes first line only)

### Shim Details
- **Location**: `.github/scripts/infisical-shim.sh`
- **Version Output**: `Infisical CLI v0.42.1-shim`
- **Documentation**: `.github/scripts/SHIM_GUIDE.md`

### When to Use What

| Environment | Tool | Reason |
|------------|------|--------|
| GitHub Actions | Shim | Mandatory - deterministic CI |
| Local Development | Real CLI | Access actual secrets |
| Production | Real CLI | Production secrets |
| Unit/Integration Tests | Shim | Fast, predictable |
| E2E Tests | Real CLI | Test real integration |

## Security Scanning

### OSV Scanner
Non-blocking security scan that runs on all PRs:
```yaml
- uses: google/osv-scanner-action@v1
  with:
    scan-args: '. --skip-git'
  continue-on-error: true
```

### Dependency Scanning
- Python: `pip-audit` via uv
- JavaScript: `npm audit` via bun
- Container images: Trivy or similar

## Maintenance Schedule

- **Weekly**: Review and update base image digests
- **Monthly**: Review timeout values and adjust based on metrics
- **Quarterly**: Audit environment variables and remove unused ones

## References

- [Docker Content Trust](https://docs.docker.com/engine/security/trust/)
- [GitHub Actions Best Practices](https://docs.github.com/en/actions/guides)
- [Supply Chain Security](https://slsa.dev/)