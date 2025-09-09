# Testing Quick Reference

**See [TESTING.md](../TESTING.md) for comprehensive testing documentation.**

## Quick Commands

```bash
# Run all tests with coverage
make test

# Run specific test categories
uv run pytest tests/api/              # API endpoint tests
uv run pytest tests/integration/       # Integration tests
uv run pytest tests/unit/             # Unit tests

# Run with coverage report
uv run pytest --cov=app --cov-report=term-missing
```

## Test Organization

- **api/** - HTTP endpoint tests (73 tests)
- **integration/** - Cross-component tests (41 tests)
- **unit/** - Pure function tests (19 tests)
- **e2e/** - End-to-end scenarios (9 tests)

## Requirements

- PostgreSQL with pgvector: `docker compose up -d db`
- NATS (optional): `docker compose up -d nats`
- Coverage minimum: **85%** (currently 79%)

## Key Fixtures

- `client` - Async HTTP test client
- `db_session` - Database session with rollback
- `auth_headers` - JWT authentication headers
- `nats_capture` - Mock NATS for testing
