# Journal Project - Complete Development Framework

## Modern Monorepo Architecture with FastAPI + Vite

### Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Development Setup](#development-setup)
- [Package Management](#package-management)
- [Build System](#build-system)
- [Testing Framework](#testing-framework)
- [CI/CD Pipeline](#cicd-pipeline)
- [Development Workflow](#development-workflow)
- [Tooling Configuration](#tooling-configuration)
- [Commands Reference](#commands-reference)

## Overview

The Journal project is a modern full-stack application built as a monorepo, combining a FastAPI backend with a Vite-powered React frontend. It emphasizes type safety, automated testing, and developer experience through carefully selected tooling.

### Tech Stack Summary

**Backend (Python 3.11+)**

- FastAPI with async/await patterns
- SQLModel (SQLAlchemy + Pydantic) for ORM
- PostgreSQL 16+ with pgvector extension
- Redis for session management
- NATS for event streaming
- OpenTelemetry for observability

**Frontend (TypeScript/React)**

- Vite for blazing fast HMR
- React 18 with hooks
- TipTap for rich text editing
- Tailwind CSS v4 for styling
- Monaco Editor for code editing
- KaTeX for mathematical notation

**Build & Development**

- Bun 1.2.21 as JavaScript runtime
- uv for Python dependency management
- Rollup for legacy bundle generation
- Biome v2.2.2 for JS/TS linting
- Ruff for Python linting
- Playwright for E2E testing

## Architecture

### Project Structure

```
journal/
├── apps/
│   ├── api/                 # FastAPI backend application
│   │   ├── app/             # Application code
│   │   │   ├── api/         # API routes and endpoints
│   │   │   ├── core/        # Core configuration and security
│   │   │   ├── models/      # SQLModel database models
│   │   │   ├── services/    # Business logic layer
│   │   │   └── workers/     # Background task workers
│   │   ├── alembic/         # Database migrations
│   │   ├── tests/           # API test suite
│   │   ├── docker-compose.yml
│   │   ├── Makefile
│   │   └── pyproject.toml
│   │
│   └── web/                 # Vite + React frontend
│       ├── src/
│       │   ├── components/  # React components
│       │   ├── hooks/       # Custom React hooks
│       │   ├── lib/         # Utility functions
│       │   └── styles/      # CSS/Tailwind styles
│       ├── package.json
│       ├── vite.config.ts
│       └── tsconfig.json
│
├── journal/                 # Legacy Flask application
│   ├── static/
│   │   └── gen/            # Generated assets from build
│   └── templates/
│
├── tests/                   # E2E and integration tests
│   ├── a11y/               # Accessibility tests
│   ├── visual/             # Visual regression tests
│   └── web/                # Web application tests
│
├── docs/                    # Documentation
├── scripts/                 # Automation scripts
├── .storybook/             # Storybook configuration
├── package.json            # Root package configuration
├── bunfig.toml            # Bun configuration
├── Makefile               # Make targets
└── playwright.config.js   # Playwright configuration
```

### Monorepo Strategy

The project uses a **workspace-based monorepo** approach:

- Root `package.json` orchestrates all commands
- Each app maintains its own dependencies
- Shared tooling configuration at root level
- Unified CI/CD pipeline for all components

## Development Setup

### Prerequisites

1. **System Requirements**

- Node.js 20+ (for compatibility)
- Bun 1.2.21+ (primary JS runtime)
- Python 3.11+ (backend)
- Docker & Docker Compose (infrastructure)
- PostgreSQL 16+ (if running locally)

2. **Install Bun**
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

3. **Install uv (Python package manager)**
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

### Initial Setup

```bash
# Clone repository
git clone https://github.com/verlyn13/journal.git
cd journal

# Install all dependencies
make fresh  # Clean install with documentation

# Or manually:
bun install                    # Root dependencies
bun --cwd apps/web install    # Web app dependencies
cd apps/api && uv sync         # API dependencies
```

### Database Setup

```bash
# Start infrastructure services
cd apps/api
docker compose up -d

# Run migrations
make db-upgrade

# Or from root:
bun run api:setup
```

## Package Management

### JavaScript/TypeScript (Bun)

**NEVER use npm, yarn, or pnpm**

```bash
# Root level
bun install              # Install all dependencies
bun add <package>        # Add dependency
bun remove <package>     # Remove dependency
bun update              # Update dependencies

# Web application
bun --cwd apps/web add <package>
bun --cwd apps/web remove <package>
```

### Python (uv)

**NEVER use pip, pip-tools, poetry, or conda**

```bash
cd apps/api
uv add <package>         # Add dependency
uv remove <package>      # Remove dependency
uv sync --frozen         # Install exact versions
uv run <command>         # Run in venv context
```

### Lock Files

- `package-lock.json` - Root JavaScript dependencies
- `apps/web/bun.lockb` - Web app dependencies
- `apps/api/uv.lock` - Python dependencies

**Always commit lock files to ensure reproducible builds**

## Build System

### Frontend Build Pipeline

#### Legacy Bundle (Rollup)

```bash
# Development watch mode
bun run dev

# Production build
bun run build

# Verbose build with details
bun run build:verbose
```

**Rollup Configuration:**

- Entry points: `src/js/main.js`, `src/css/main.css`
- Output: `journal/static/gen/`
- Features:
  - ES module format
  - Code splitting with dynamic imports
  - PostCSS with autoprefixer
  - Terser minification in production
  - Manifest generation for cache busting

#### Modern Web App (Vite)

```bash
# Development server
bun run web:dev         # Runs on http://localhost:5173

# Production build
bun run web:build       # Output to apps/web/dist/

# Preview production build
bun run web:preview
```

**Vite Configuration:**

- React with Fast Refresh
- TypeScript with strict mode
- Tailwind CSS v4
- Automatic chunking
- Asset optimization

### Backend Build Pipeline

```bash
# Development server with hot reload
bun run api:dev         # FastAPI on http://localhost:8000

# Production server
cd apps/api && make run

# Background workers
bun run api:worker      # Embedding consumer
```

## Testing Framework

### Test Categories

1. **Unit Tests** (Python)

- Framework: pytest
- Coverage target: 85%+
- Location: `apps/api/tests/`

2. **E2E Tests** (Playwright)

- Browsers: Chrome, Firefox, Safari
- Viewports: Desktop, Mobile, Tablet
- Location: `tests/`

3. **Visual Regression**

- Project: `visual`
- Baseline screenshots
- Pixel-perfect comparisons

4. **Accessibility Tests**

- Project: `a11y`
- axe-core integration
- WCAG 2.1 compliance

### Running Tests

```bash
# All tests
bun run check:all

# Specific test suites
bun run test            # Playwright E2E
bun run test:a11y       # Accessibility
bun run test:visual     # Visual regression
bun run api:test        # Python unit tests

# Interactive modes
bun run test:ui         # Playwright UI mode
```

### Test Configuration

**Playwright (`playwright.config.js`):**

- Parallel execution
- Retry on failure (2x in CI)
- Trace on first retry
- Screenshot on failure
- Multiple reporters (HTML, JSON, GitHub)

**Pytest (`apps/api/pyproject.toml`):**

- Auto async mode
- Coverage reporting (XML, HTML)
- Strict markers
- Custom test markers (slow, integration, unit)

## CI/CD Pipeline

### GitHub Actions Workflow

**Trigger Events:**

- Push to `main` branch
- Pull requests to `main`
- Manual dispatch

**Job: build-test**

1. **Environment Setup**

- Ubuntu latest
- Bun 1.2.21
- Python 3.13.7 via uv
- Playwright browsers

2. **Dependency Installation**

- Frozen lockfile installs
- Cached dependencies

3. **Quality Checks**

- Biome CI with GitHub reporter
- TypeScript type checking
- Ruff linting with GitHub annotations
- Ruff format check
- MyPy type checking

4. **Testing**

- pytest with 80% coverage requirement
- Playwright accessibility tests
- Playwright visual tests

5. **Build Artifacts**

- Storybook static build
- Coverage reports
- Test results

### Deployment Strategy

Currently manual deployment with automated build verification:

- Production builds validated in CI
- Artifacts uploaded for review
- Manual deployment to production

## Development Workflow

### Daily Development

```bash
# Start all services
make dev                # Legacy development
bun run web:dev        # Modern web app
bun run api:dev        # API server

# Code quality
bun run lint:all       # Lint everything
bun run format:all     # Format all code
bun run check:all      # Full CI checks locally

# Database operations
bun run api:migrate    # Apply migrations
bun run api:db:revision m="description"  # Create migration
```

### Git Workflow

1. **Feature Development**
   ```bash
   git checkout -b feature/description
   # Make changes
   bun run check:all  # Validate locally
   git commit -m "feat: description"
   git push origin feature/description
   ```

2. **Commit Convention**

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Test changes
- `chore:` Maintenance

### Code Review Process

1. All code requires PR review
2. CI must pass (all checks green)
3. Coverage must not decrease
4. Visual regression tests reviewed
5. Accessibility tests must pass

## Tooling Configuration

### Biome (JavaScript/TypeScript Linting)

**Configuration (`.biome.json`):**

- Formatter: 2 spaces, 100 char line width
- Organizes imports automatically
- Recommended rules enabled
- Ignores generated files

### Ruff (Python Linting)

**Configuration (`apps/api/pyproject.toml`):**

- Target: Python 3.11+
- Line length: 100 characters
- Auto-fix enabled
- Comprehensive rule set (E, W, F, I, B, etc.)
- Format: double quotes, space indentation

### TypeScript

**Configuration (`tsconfig.json`):**

- Strict mode enabled
- No implicit any
- ES2022 target
- Module resolution: bundler

### Storybook

**Configuration:**

- Framework: React + Vite
- Addons: Essentials, A11y, Performance
- Port: 6006

```bash
bun run storybook       # Development
bun run build-storybook # Static build
```

## Commands Reference

### Development Commands

| Command             | Description                      |
| ------------------- | -------------------------------- |
| `make dev`          | Start legacy development server  |
| `bun run web:dev`   | Start Vite development server    |
| `bun run api:dev`   | Start FastAPI development server |
| `bun run dev`       | Watch and rebuild legacy assets  |
| `bun run storybook` | Start Storybook server           |

### Build Commands

| Command                   | Description              |
| ------------------------- | ------------------------ |
| `bun run build`           | Build legacy assets      |
| `bun run web:build`       | Build modern web app     |
| `bun run web:publish`     | Build and copy to static |
| `bun run build-storybook` | Build Storybook static   |

### Testing Commands

| Command               | Description             |
| --------------------- | ----------------------- |
| `bun run test`        | Run Playwright tests    |
| `bun run test:a11y`   | Run accessibility tests |
| `bun run test:visual` | Run visual regression   |
| `bun run api:test`    | Run Python tests        |
| `bun run check:all`   | Run all checks          |

### Code Quality Commands

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `bun run lint`      | Lint JavaScript/TypeScript   |
| `bun run format`    | Format JavaScript/TypeScript |
| `bun run api:lint`  | Lint and format Python       |
| `bun run typecheck` | TypeScript type checking     |

### Database Commands

| Command                           | Description                   |
| --------------------------------- | ----------------------------- |
| `bun run api:setup`               | Setup database infrastructure |
| `bun run api:migrate`             | Apply migrations              |
| `bun run api:db:revision m="msg"` | Create migration              |
| `bun run api:db:downgrade`        | Rollback migration            |

### Documentation Commands

| Command                            | Description                 |
| ---------------------------------- | --------------------------- |
| `bun run docs:fetch`               | Fetch tool documentation    |
| `bun run docs:serve`               | Serve documentation locally |
| `bun run docs:search TERM="query"` | Search documentation        |

### Utility Commands

| Command             | Description              |
| ------------------- | ------------------------ |
| `make fresh`        | Clean install everything |
| `make clean`        | Remove build artifacts   |
| `make assets-clean` | Clean generated assets   |
| `make help`         | Show all make targets    |

## Environment Variables

### Required for Development

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/journal

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=development-secret-change-in-production

# Optional
OPENAI_API_KEY=sk-...  # For embeddings
LOG_LEVEL=INFO
OTEL_ENABLED=false     # OpenTelemetry
```

### Web Application

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## Debugging

### Backend Debugging

```python
# Add breakpoint
import ipdb; ipdb.set_trace()

# Or with rich
from rich import print
from rich.console import Console
console = Console()
console.log(data)
```

### Frontend Debugging

```typescript
// React Developer Tools
// Redux DevTools (if using Redux)
// Vite inspector: press 'v' in terminal

// Performance profiling
console.time('operation');
// ... code ...
console.timeEnd('operation');
```

### Database Debugging

```bash
# Connect to PostgreSQL
docker exec -it journal-postgres psql -U journal

# View running queries
SELECT * FROM pg_stat_activity;

# Check table sizes
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

## Performance Optimization

### Frontend Optimization

1. **Code Splitting**

- Dynamic imports for routes
- Lazy loading for heavy components
- Vendor chunk optimization

2. **Asset Optimization**

- Image lazy loading
- WebP/AVIF formats
- Critical CSS inlining

3. **Caching Strategy**

- Content-hash based filenames
- Long-term browser caching
- Service worker for offline

### Backend Optimization

1. **Database**

- Connection pooling
- Query optimization with EXPLAIN
- Proper indexing strategy
- pgvector for similarity search

2. **Caching**

- Redis for session data
- Query result caching
- Static file caching

3. **Async Operations**

- Background tasks with workers
- Event-driven architecture
- WebSocket for real-time updates

## Security Considerations

1. **Authentication & Authorization**

- JWT with refresh tokens
- Role-based access control
- Secure password hashing (bcrypt)

2. **Input Validation**

- Pydantic models for API
- Zod schemas for frontend
- SQL injection prevention

3. **Security Headers**

- CORS configuration
- CSP headers
- Rate limiting

4. **Secrets Management**

- Environment variables
- Never commit secrets
- Rotate regularly

## Monitoring & Observability

1. **Logging**

- Structured JSON logging
- Log levels (DEBUG, INFO, WARNING, ERROR)
- Correlation IDs for tracing

2. **Metrics**

- OpenTelemetry instrumentation
- Custom business metrics
- Performance monitoring

3. **Error Tracking**

- Comprehensive error handling
- Stack trace preservation
- User-friendly error messages

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   lsof -i :5000  # or :8000, :5173
   kill -9 <PID>
   ```

2. **Database Connection Issues**
   ```bash
   docker compose ps
   docker compose logs postgres
   docker compose restart postgres
   ```

3. **Dependency Conflicts**
   ```bash
   # JavaScript
   rm -rf node_modules bun.lockb
   bun install

   # Python
   cd apps/api
   rm -rf .venv uv.lock
   uv sync
   ```

4. **Build Failures**
   ```bash
   make clean
   make fresh
   ```

## Contributing Guidelines

1. **Code Style**

- Follow existing patterns
- Use type hints/annotations
- Write self-documenting code
- Add tests for new features

2. **Pull Request Process**

- Create feature branch
- Write descriptive commits
- Update documentation
- Ensure CI passes
- Request review

3. **Testing Requirements**

- Unit tests for logic
- Integration tests for APIs
- E2E tests for critical paths
- Maintain coverage above 80%

## Future Roadmap

- [ ] Kubernetes deployment configuration
- [ ] GraphQL API implementation
- [ ] Real-time collaboration features
- [ ] Mobile application
- [ ] Advanced search with AI
- [ ] Plugin system architecture

***

## Quick Start Summary

```bash
# Setup
git clone https://github.com/verlyn13/journal.git
cd journal
make fresh

# Development
make dev           # Legacy app
bun run web:dev   # Modern web
bun run api:dev   # API server

# Testing
bun run check:all

# Build
bun run build
bun run web:build
```

For questions or issues, refer to the [GitHub Issues](https://github.com/verlyn13/journal/issues) page.
