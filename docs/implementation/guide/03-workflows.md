---
id: implementation-guide-workflows
title: "Implementation Guide \u2014 Workflows"
type: guide
created: '2025-09-17'
updated: '2025-09-17'
author: documentation-system
tags: []
last_verified: '2025-09-17'
---

# Workflows

Development workflows, CI/CD, documentation automation, and validation gates.

## Development

- Git workflow: feature branches, conventional commits, squash on merge
- Lint + format: `make lint-all` / `make format-all`
- Type checks: `make typecheck-all`

## Testing

General testing guidance derived from Phase 1 (made generic):

- Unit tests for core models and utilities
- Unit tests for form/validation logic
- Integration tests for API routes (FastAPI) using a test client
- Ensure CSRF and auth flows are exercised where applicable

API commands:
- `cd apps/api && uv run pytest -m "unit or component" -q`
- Optional E2E (web): `RUN_E2E=1 make quality`

Examples:

```bash
# Run unit + component tests (API)
cd apps/api
uv run pytest -m "unit or component" -q

# Integration tests (API)
uv run pytest -m integration -q

# Web tests (Vitest)
cd ../web
bun test
```

Minimal pytest fixture (API):

```python
# tests/conftest.py (illustrative)
import pytest
from journal import create_app, db


@pytest.fixture
def app():
    app = create_app("config.TestingConfig")
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()
```

## CI/CD

- Docs status workflow: `.github/workflows/docs-status.yml`
  - Runs quick health + authoritative validator
  - Fails on strict validation
  - Publishes consolidated status report artifacts

```yaml
# Excerpt
jobs:
  docs-status:
    steps:
      - run: bash scripts/check_docs.sh
      - run: python3 scripts/validate_documentation.py --json --quiet
      - run: python3 scripts/validate_documentation.py --strict
      - run: python3 scripts/generate_status_report.py
```

## Documentation Automation

- Index: `python3 scripts/generate_doc_index.py`
- Status: `make docs-status`
- Authoritative validation: `python3 scripts/validate_documentation.py --strict`
- Fixers:
  - `python3 scripts/documentation_fix_workflow.py`
  - `python3 scripts/fix_remaining_issues.py`
  - `python3 scripts/normalize_docs_text.py`

Validation gates:

- Pre-commit runs schema validator and authoritative validator (strict)
- CI blocks merges on validator failures
