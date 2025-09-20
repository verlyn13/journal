---
id: agents
title: Agents
type: configuration
created: '2025-09-17'
updated: '2025-09-17'
author: documentation-system
tags:
- python
- typescript
- react
- database
status: active
description: This project uses a modern monorepo architecture with strict package
  management and comprehensive testing.
last_verified: '2025-09-17'
---

# Journal Project - Agent Instructions

## Modern TypeScript/Python Monorepo - September 2025

This project uses a modern monorepo architecture with strict package management and comprehensive testing.

## Project Structure

```
journal/
├── apps/
│   ├── api/         # FastAPI backend (Python 3.13+, uv, SQLModel, pgvector)
│   └── web/         # Vite + React frontend (TypeScript, Tailwind, Shadcn)
├── docs/            # Documentation (Markdown, technical specs)
├── scripts/         # Automation and deployment scripts
└── tests/           # E2E tests (Playwright)
```

## Critical Package Management Rules

### Python (API) - NEVER use pip, uv, conda

**ALL Python operations in `apps/api/` must use `uv` with virtual environment:**

- **Virtual env management**: `uv venv`, `uv sync`, `uv lock`
- **Package operations**: `uv add <package>`, `uv remove <package>`
- **Development sync**: `uv sync --all-extras --dev`
- **Command execution**: `uv run <command>` (auto-activates venv)
- **Python execution**: `uv run python <script>`
- **Tests**: `uv run pytest`, `uv run pytest -m "unit or component"`
- **Database migrations**: `uv run alembic upgrade head`
- **Server**: `uv run fastapi run app/main.py --host 0.0.0.0 --port 5000`

### TypeScript/JavaScript - Use Bun exclusively (Node 22+ required)

**ALL JS/TS operations must use `bun`:**

- Root level: `bun install`, `bun run <script>`
- Web app: `cd apps/web && bun install`, `bun run dev`
- Never use bun or bun for package management
- **Node requirement**: Node 22+ for modern JavaScript features

## Development Environment

### Required Services

Before running tests or development servers:

```bash
cd apps/api && docker compose up -d db nats
```

### Environment Variables

- `TEST_DB_URL=postgresql+asyncpg://journal:journal@localhost:5433/journal_test`
- `JOURNAL_DB_URL=postgresql+asyncpg://journal:journal@localhost:5433/journal`

### Quick Development Commands

```bash
# Backend development
cd apps/api && uv run fastapi run app/main.py --host 0.0.0.0 --port 5000

# Frontend development  
cd apps/web && bun run dev

# Database migrations
cd apps/api && uv run alembic -c alembic.ini upgrade head

# Backend tests
cd apps/api && uv run pytest -m "unit or component"
cd apps/api && uv run pytest -m integration

# Frontend tests
cd apps/web && bun run test:coverage

# E2E tests
bun ci && bunx playwright install && bun test
```

## Testing Strategy

### Test Markers

- `@pytest.mark.unit` - Fast, pure logic tests
- `@pytest.mark.component` - HTTP + DB integration tests
- `@pytest.mark.integration` - Full integration with external services
- `@pytest.mark.e2e` - End-to-end scenarios

### Coverage Requirements

- Maintain 70%+ test coverage (honest coverage, no cheating)
- Only exclude integration-heavy modules from coverage
- All feature code (API endpoints, services, models) must be covered

## Architecture Principles

### Backend (apps/api/)

- **Framework**: FastAPI with async/await
- **Database**: PostgreSQL 16+ with pgvector extension
- **ORM**: SQLModel (SQLAlchemy + Pydantic)
- **Auth**: JWT with refresh tokens
- **Queue**: Redis for sessions, NATS for events
- **Search**: pgvector for semantic search
- **Testing**: pytest with asyncio support

### Frontend (apps/web/)

- **Framework**: React 19 with TypeScript
- **Build**: Vite for fast HMR and bundling
- **Styling**: Tailwind CSS + Shadcn/ui components
- **State**: Zustand for global state management
- **Forms**: React Hook Form + Zod validation
- **Testing**: Vitest + React Testing Library

## Code Standards

### Python Style

- PEP 8 via Ruff (configured in pyproject.toml)
- Full type hints with SQLModel for ORM
- Async/await throughout
- 100-character line length
- Docstrings for public APIs

### TypeScript Style

- Strict mode, no implicit any
- Biome for formatting and linting
- Functional React components with hooks
- 2-space indentation
- Import organization: external → internal → local

## Security Guidelines

1. **Never commit secrets** - Use environment variables
2. **Validate all input** - Use Pydantic/Zod for validation
3. **Parameterized queries** - SQLModel handles this automatically
4. **Rate limiting** - Implement for all public endpoints
5. **CORS** - Configured for localhost:5173 in development

## Performance Targets

- API response time: < 200ms p95
- Frontend TTI: < 2s on 3G
- Test execution: < 30s for unit/component tests
- Build time: < 60s for production builds

## Git Workflow

1. **Never force push** to main branch
2. **Feature branches** with descriptive names
3. **Atomic commits** with conventional commit messages
4. **PR reviews** required for main branch
5. **CI/CD** must pass before merge

## Common Workflows

### Adding New API Endpoint

1. Define SQLModel schema in `apps/api/app/models/`
2. Create service layer in `apps/api/app/services/`
3. Add FastAPI route in `apps/api/app/api/`
4. Write tests in `apps/api/tests/`
5. Update OpenAPI documentation

### Adding New React Component

1. Create component in `apps/web/src/components/`
2. Add Storybook story if UI component
3. Write unit tests alongside component
4. Update barrel exports if needed

### Database Changes

1. Modify SQLModel in `apps/api/app/models/`
2. Generate migration: `cd apps/api && uv run alembic revision --autogenerate -m "description"`
3. Review generated migration carefully
4. Apply: `cd apps/api && uv run alembic upgrade head`

## Troubleshooting

### Common Issues

1. **Import errors**: Check virtual environment activation
2. **Database connection**: Ensure Docker services are running
3. **Type errors**: Run `bun run typecheck` or `uv run mypy`
4. **Test failures**: Check database state and cleanup
5. **Port conflicts**: Ensure ports 5000, 5173, 5433, 4222 are free

### Service Dependencies

- **PostgreSQL**: Required for all database operations
- **NATS**: Required for event streaming (optional for basic testing)
- **Redis**: Required for session management
- **Docker**: Required for local service orchestration

## Agent Permissions & Constraints

When running as Codex agent in this project:

- **Sandbox**: `danger-full-access` (filesystem, network, processes)
- **Approvals**: `never` (non-interactive execution)
- **Timeout**: 15 minutes (for long operations like Playwright install)
- **Commands**: Restricted from using pip/bun directly
- **Services**: Permission to start/stop Docker services
- **Git**: Permission to create feature branches and commit
- **CI**: Permission to modify GitHub Actions workflows

## Codex Configuration

### Project Bootstrap

To set up or refresh Codex configuration for this project:

```bash
# Read system configuration and create/update project config
codex "Read ~/Projects/verlyn13/system-setup/PROJECT-AGENT-BOOTSTRAP.md and update project configuration"
```

### Model Selection & Usage

#### Available Profiles (from \~/.codex/config.toml)

- **speed** (default): `gpt-5-mini`, fast iteration, routine tasks
- **depth**: `gpt-5` with high reasoning, complex analysis
- **permissive**: `gpt-5`, auto-approves successful commands
- **agent**: `gpt-5-mini`, for CI/CD automation
- **budget**: `gpt-5-mini`, minimal tokens, cost-optimized

#### Profile-Based Execution

```bash
# Fast profile (default) - routine tasks, simple fixes
codex --profile speed "run the test suite and fix any linting errors"
mise run codex:fast "implement the new endpoint"

# Deep reasoning - complex debugging, architecture  
codex --profile depth "analyze why the database connection is timing out"
mise run codex:deep "refactor the authentication system"

# Permissive mode - rapid iteration, auto-approval
codex --profile permissive "update all dependencies and fix breaking changes"
mise run codex:permissive "scaffold new components"
```

### Mise Integration

The project includes `.mise.toml` with predefined tasks:

```bash
# Quick Codex invocations
mise run codex:fast "quick fix"     # Uses speed profile
mise run codex:deep "complex task"  # Uses depth profile

# Development workflow
mise run setup        # Complete project setup
mise run dev         # Start both API and web dev servers
mise run test        # Run all tests
mise run ci          # Simulate CI pipeline locally
```

### Context Inheritance

1. **Global Config**: `~/.codex/config.toml` - Models and profiles
2. **Global Context**: `~/.codex/AGENTS.md` - System preferences
3. **Project Context**: `./AGENTS.md` (this file) - Project specifics
4. **Mise Tasks**: `./.mise.toml` - Task automation

### Recommended Usage by Task Type

| Task Type          | Profile     | Example                                          |
| ------------------ | ----------- | ------------------------------------------------ |
| Bug fixes          | speed       | `codex "fix the failing test"`                   |
| New features       | speed/depth | `codex "add user profile endpoint"`              |
| Refactoring        | depth       | `codex --profile depth "refactor service layer"` |
| Architecture       | depth       | `codex --profile depth "design event system"`    |
| Dependency updates | permissive  | `codex --profile permissive "update packages"`   |
| CI/CD tasks        | agent       | `codex --profile agent "fix CI pipeline"`        |

### Security Note

API key is retrieved from gopass at `codex/openai/api-key`. Never commit API keys or use environment variables directly.

## Do Not

- Run `uv pip install` or `bun install` directly
- Create files without checking existing patterns
- Ignore type errors or linting warnings
- Commit without running tests
- Use synchronous code in async contexts
- Mix concerns between API and web layers
- Exclude feature code from test coverage

## Environment Setup Verification

```bash
# Verify all tools are available
python3 --version    # 3.13.7+
uv --version         # latest (with virtual env support)
node --version       # 22.0.0+ (latest LTS or current)
bun --version        # 1.2.x+ (latest)
docker --version     # with compose
psql --version       # PostgreSQL client

# Verify virtual environment capabilities
cd apps/api && uv venv --python 3.13  # Create venv if needed
cd apps/api && uv sync --all-extras --dev  # Sync dependencies
cd apps/api && uv run python --version  # Test venv activation

# Start services and run health checks
cd apps/api && docker compose up -d
cd apps/api && uv run python -c "import asyncpg; print('AsyncPG OK')"
cd apps/web && bun run typecheck
```

This configuration ensures reliable, fast development with proper testing and deployment practices.
