# Journal Project - Claude Code Configuration
## September 2025 - Modern Monorepo Architecture

This configuration optimizes Claude Code CLI (v2025.9) for a modern TypeScript/Python monorepo with separate API and web applications.

## 📍 Project Roadmap
**IMPORTANT**: Always consult `docs/ROADMAP.md` for current development priorities, phases, and acceptance criteria. The roadmap is the source of truth for:
- Current phase objectives (Phase 1: Foundations & Polish)
- Parallel workstreams and task ownership
- PR process and quality gates
- Performance budgets and testing requirements
- Security and privacy guidelines

When implementing features, reference the specific roadmap phase in commits and PRs.

## Project Structure

```
journal/
├── apps/
│   ├── api/         # FastAPI backend (Python 3.11+, uv, SQLModel, pgvector)
│   └── web/         # Vite + React frontend (TypeScript, Tailwind, Shadcn)
├── docs/            # Documentation (Markdown, technical specs)
├── scripts/         # Automation and deployment scripts
└── tests/           # E2E tests (Playwright)
```

## Critical Package Management Rules

### Python (API)
**NEVER use pip, pip-tools, poetry, or conda directly**

All Python operations in `apps/api/`:
- Install: `cd apps/api && uv add <package>`
- Remove: `cd apps/api && uv remove <package>`
- Sync: `cd apps/api && uv sync --frozen`
- Run: `cd apps/api && uv run <command>`

### TypeScript/JavaScript (Web & Root)
**Use Bun exclusively for all JavaScript operations**

- Root level: `bun install`, `bun run <script>`
- Web app: `cd apps/web && bun install`, `bun run dev`
- Never use npm or yarn for package management

## Development Commands

### Quick Actions (from root)
```bash
# API Development
bun run api:dev         # Start FastAPI with hot reload
bun run api:test        # Run pytest with coverage
bun run api:lint        # Run ruff checks

# Web Development  
bun run web:dev         # Start Vite dev server
bun run web:build       # Production build
bun run web:preview     # Preview production build

# Full Stack
bun run lint:all        # Lint everything
bun run format:all      # Format all code
bun run check:all       # CI-equivalent checks
```

### Database Operations (API)
```bash
bun run api:migrate              # Apply migrations
bun run api:db:revision m="msg"  # Create new migration
```

## Code Standards

### Python (apps/api/)
- Style: PEP 8 via Ruff
- Types: Full type hints, SQLModel for ORM
- Testing: pytest with 80%+ coverage
- Docs: Docstrings for public APIs

### TypeScript (apps/web/)
- Style: Biome for formatting and linting
- Types: Strict mode, no implicit any
- Components: Functional React with hooks
- State: Zustand for client state

## Claude Code Optimizations

### Task Management
Use TodoWrite tool for:
- Multi-step implementations
- Complex refactoring
- Bug fix workflows
- Feature development

### Search Strategy
1. Use `Grep` for code searches across the monorepo
2. Use `Glob` for finding files by pattern
3. Use `Task` tool for complex multi-file analysis

### Testing Workflow
1. Write tests alongside implementation
2. Run `bun run api:test` or `bun run web:test`
3. Check coverage with `--cov` flag
4. Use `bun run check:all` before marking complete

### Git Workflow
1. Never commit directly unless asked
2. Follow branching strategy from `docs/ROADMAP.md#branching-pr--merge-management`
3. Use conventional commits: `feat:`, `fix:`, `chore:`
4. Reference roadmap items in PR descriptions
5. Run linting/formatting before commits
6. Squash merge to maintain linear history

## Architecture Decisions

### Backend (apps/api/)
- **Framework**: FastAPI with async/await
- **Database**: PostgreSQL 16+ with pgvector
- **ORM**: SQLModel (SQLAlchemy + Pydantic)
- **Auth**: JWT with refresh tokens
- **Queue**: Redis for sessions, NATS for events
- **Search**: pgvector for semantic search

### Frontend (apps/web/)
- **Framework**: React 19 with TypeScript
- **Build**: Vite for fast HMR
- **Styling**: Tailwind CSS + Shadcn/ui
- **State**: Zustand for global state
- **Forms**: React Hook Form + Zod
- **Testing**: Vitest + React Testing Library

## Security Guidelines

1. Never commit secrets or API keys
2. Use environment variables for configuration
3. Validate all user input
4. Use parameterized queries
5. Implement rate limiting
6. Follow OWASP best practices

## Performance Targets

- API response time: < 200ms p95
- Frontend TTI: < 2s on 3G
- Test execution: < 30s for unit tests
- Build time: < 60s for production builds

## Agent Usage Guidelines

### When to Use Plan Mode
- Analyzing complex architectural changes
- Reviewing security-sensitive code
- Understanding cross-service interactions
- Planning large refactors

### When to Use Subagents
- Database schema migrations
- Complex search operations
- Multi-file refactoring
- Test generation

### Proactive Actions
- Auto-format on file changes
- Run type checking after TypeScript edits
- Update imports when moving files
- Generate missing test files

## Common Workflows

### Implementing Roadmap Features
1. Check `docs/ROADMAP.md` for current phase priorities
2. Pick a task from Phase 1.5 concrete tasks
3. Create feature branch: `feature/[area]-[description]`
4. Implement with tests and documentation
5. Submit PR referencing roadmap item
6. Update roadmap completion status after merge

### Adding a New API Endpoint
1. Define SQLModel schema in `apps/api/app/models/`
2. Create service layer in `apps/api/app/services/`
3. Add FastAPI route in `apps/api/app/api/`
4. Write tests in `apps/api/tests/`
5. Update OpenAPI schema

### Adding a New React Component
1. Create component in `apps/web/src/components/`
2. Add Storybook story if UI component
3. Write unit tests alongside
4. Update barrel exports

### Database Changes
1. Modify SQLModel in `apps/api/app/models/`
2. Create migration: `bun run api:db:revision m="description"`
3. Review generated migration
4. Apply: `bun run api:migrate`

## Monitoring & Observability

- Structured logging with context
- OpenTelemetry instrumentation
- Error tracking with proper grouping
- Performance metrics collection

## Do Not

- Run `pip install` or `npm install` directly
- Create files without checking existing patterns
- Ignore type errors or linting warnings
- Commit without running tests
- Use synchronous code in async contexts
- Mix concerns between services

## Environment Variables

Required for development:
- `DATABASE_URL`: PostgreSQL connection
- `REDIS_URL`: Redis connection
- `JWT_SECRET`: Authentication secret
- `OPENAI_API_KEY`: For embeddings (optional)

## Getting Help

- Check `docs/` for architecture decisions
- Review `BACKEND_ARCHITECTURE.md` for API design
- See `apps/web/EDITOR_GUIDE.md` for frontend patterns
- Use `bun run docs:search <term>` for documentation search