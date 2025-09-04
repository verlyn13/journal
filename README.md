# Journal Application

A modern web application for journaling with a rich text editor, code highlighting, math rendering, and AI-powered semantic search.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and Bun
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 16+ (via Docker)

### Setup & Run (One‑Command Dev)

```bash
# Using the new dev script
./scripts/dev.sh

# Or with Make
make dev-full

# Or with Mise
mise run dev:full

# API: http://localhost:5000 (health: /health, metrics: /metrics)
# Web: http://localhost:5173
```

## 🏗 Architecture

### Frontend (React + TypeScript)
- **Location**: `apps/web/`
- **Tech Stack**: React 18, TypeScript, Vite, CodeMirror
- **Features**: 
  - Markdown editor with live preview (CodeMirror)
  - Math rendering with KaTeX
  - Code syntax highlighting (rehype-highlight)
  - Split-pane view for editing and preview
  - Hybrid search (keyword + semantic)

### Backend (FastAPI + PostgreSQL)
- **Location**: `apps/api/`
- **Tech Stack**: FastAPI, SQLModel, PostgreSQL with pgvector
- **Features**:
  - JWT authentication with refresh tokens
  - Vector embeddings for semantic search
  - Full-text search with hybrid ranking
  - Event sourcing with NATS
  - GraphQL endpoint

## 📚 Development

### Frontend Development

```bash
# Start development server
bun run web:dev

# Build for production
bun run web:build

# Run tests
bun run test

# Type checking
bun run typecheck
```

### Backend Development

```bash
cd apps/api

# Start dev server with hot reload
make dev

# Run tests
make test

# Code quality
make lint        # Lint and format
make lint-check  # Check only

# Database operations
make db-upgrade     # Run migrations
make db-downgrade   # Rollback one

# Background workers
make worker      # Start embedding worker
```

### Full Stack Commands (from root)

```bash
# Start everything (single command)
make dev-full

# API management
make api-setup   # Setup infrastructure
make api-test    # Run API tests
make api-worker  # Start workers
make api-down    # Stop services

# Testing
make test        # Run all tests
make e2e         # Playwright E2E tests
```

## Scripts Reference

Run with Bun from the repo root (use Node/npm if preferred):

- API
  - `bun run api:setup` — start Postgres (5433), Redis (6380), NATS (4222) and run migrations
  - `bun run api:dev` — start FastAPI dev server (http://127.0.0.1:8000)
  - `bun run api:test` — run API tests via pytest
  - `bun run api:lint` — lint/format API code (ruff)
  - `bun run api:db:upgrade` — apply DB migrations (alembic via uv)
  - `bun run api:db:downgrade` — rollback last migration
  - `M="add feature" bun run api:db:revision` — create a new migration revision
  - `bun run api:worker` — start embedding consumer worker

- Web
  - `bun run web:dev` — start frontend dev server (http://localhost:5173)
  - `bun run web:build` — build frontend assets
  - `bun run web:preview` — preview built frontend

## 🔧 Configuration

### Frontend Environment
Create `apps/web/.env`:
```env
VITE_API_URL=http://127.0.0.1:5000/api
VITE_GRAPHQL_URL=http://127.0.0.1:8000/graphql
```

### Backend Environment
Create `apps/api/.env`:
```env
JOURNAL_DB_URL=postgresql+asyncpg://journal:journal@localhost:5433/journal
JOURNAL_REDIS_URL=redis://localhost:6380/0
JOURNAL_NATS_URL=nats://localhost:4222
JOURNAL_JWT_SECRET=your-secret-key-change-in-production
```

## 📖 API Documentation

- **OpenAPI/Swagger**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc
- **GraphQL Playground**: http://127.0.0.1:8000/graphql

## 🧪 Testing

### Frontend Tests
```bash
# Unit tests
bun run test

# E2E tests with Playwright
bun run test:e2e

# Accessibility tests
bun run test:a11y

# Visual regression tests
bun run test:visual
```

### Backend Tests
```bash
cd apps/api

# Run all tests with coverage
make test

# Run specific test categories
uv run pytest -m unit
uv run pytest -m integration
```

## 🛠 Tooling

### Frontend
- **Biome**: Formatting and linting
- **TypeScript**: Type checking
- **Vite**: Build tooling
- **Playwright**: E2E testing

### Backend
- **uv**: Python package management
- **Ruff**: Python linting and formatting
- **MyPy**: Static type checking
- **pytest**: Testing framework

### Pre-commit Hooks
```bash
# Frontend
cd apps/web
npm install

# Backend
cd apps/api
uv run pre-commit install
```

## 🚢 Deployment

### Using Docker

```bash
# Build and run the complete stack
docker compose up

# Or use the production images
docker build -t journal-api apps/api/
docker build -t journal-web apps/web/

docker run -p 8000:8000 journal-api
docker run -p 3000:3000 journal-web
```

### Using DevContainers

For VS Code users:
1. Install "Dev Containers" extension
2. Open project in VS Code
3. `Cmd/Ctrl + Shift + P` → "Dev Containers: Reopen in Container"
4. Everything will be configured automatically

## 📋 Features

### Editor Features
- **Markdown Editing**: Native markdown editing with CodeMirror
- **Live Preview**: Real-time markdown-to-HTML preview
- **Math Rendering**: LaTeX math with KaTeX (inline: `$x^2$`, block: `$$...$$`)
- **Code Blocks**: Syntax highlighting with language support
- **Split-Pane View**: Side-by-side editor and preview
- **Dark Mode**: Built-in OneDark theme

### Search & Discovery
- **Hybrid Search**: Combines keyword and semantic search
- **Vector Embeddings**: AI-powered content similarity
- **Full-text Search**: PostgreSQL FTS with ranking
- **Smart Suggestions**: Auto-complete and recommendations

### Backend Capabilities
- **Event Sourcing**: Complete audit trail
- **Background Processing**: Async embedding generation
- **GraphQL API**: Flexible data queries
- **JWT Auth**: Secure token-based authentication
- **Real-time Updates**: WebSocket support (planned)

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## 📚 Documentation

- [Backend Architecture](apps/api/README.md)
- [API Documentation](http://localhost:8000/docs)
- [Editor Guide](apps/web/EDITOR_GUIDE.md)
- [Initial Planning](docs/initial-planning/)
