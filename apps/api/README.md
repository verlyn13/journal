# Journal API

A modern FastAPI-based backend for the Journal application, featuring:

- **FastAPI 0.115+** with async/await throughout
- **SQLModel + SQLAlchemy 2.0** for type-safe database operations
- **PostgreSQL with pgvector** for embeddings and vector similarity search
- **Full-text search (FTS)** with hybrid ranking
- **Event sourcing** with NATS for reliable event processing
- **Redis** for caching and session management
- **GraphQL** endpoint with Strawberry
- **JWT authentication** with refresh tokens
- **Comprehensive testing** with pytest and coverage
- **Modern Python tooling** (uv, ruff, mypy)
- **Docker & DevContainers** for consistent development

## 🚀 Quick Start

### Prerequisites

- Python 3.13+
- uv 0.8+ (recommended): `pip install uv`
- Docker & Docker Compose
- jq (optional, for curl examples)

### Local Development

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd journal/apps/api
   ```

2. **Install dependencies**:
   ```bash
   # With uv (recommended)
   uv sync --all-extras --dev

   # Or with pip
   pip install -e ".[dev]"
   ```

3. **Start infrastructure**:
   ```bash
   make setup
   # Or manually: docker compose up -d && sleep 5 && make db-upgrade
   ```

4. **Run the API**:
   ```bash
   make dev
   # API will be available at http://127.0.0.1:8000
   ```

### Local Development (This System)

- Ports (from docker compose):
  - API: `127.0.0.1:8000`
  - Postgres: `localhost:5433` (container 5432)
  - Redis: `localhost:6380`
  - NATS: `localhost:4222` (JetStream on same)

- Common commands:
  - Start infra + migrate: `make setup`
  - Start API (hot reload): `make dev` (uses `uv run fastapi dev`)
  - Apply migrations: `make db-upgrade`
  - Create new migration: `make db-revision m="add_feature"`
  - Roll back last migration: `make db-downgrade`
  - Reset DB volume (dev only): `make reset`
  - Start embedding worker: `make worker`
  - Tests: `make test`
  - Lint/format: `make lint` or `make lint-check`

### Auth (Dev/Demo)

- Get demo tokens (no credentials):
  ```bash
  curl -s -X POST http://127.0.0.1:8000/api/v1/auth/demo | jq
  ```
- Save token for other requests:
  ```bash
  TOKEN=$(curl -s -X POST http://127.0.0.1:8000/api/v1/auth/demo | jq -r .access_token)
  ```
- Whoami:
  ```bash
  curl -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8000/api/v1/auth/me | jq
  ```
- Refresh:
  ```bash
  REFRESH=$(curl -s -X POST http://127.0.0.1:8000/api/v1/auth/demo | jq -r .refresh_token)
  curl -s -X POST http://127.0.0.1:8000/api/v1/auth/refresh \
  -H 'Content-Type: application/json' \
  -d "{\"refresh_token\":\"$REFRESH\"}" | jq
  ```
  ```
  ```

### Using DevContainers

For the most consistent development experience:

1. Open the project in VS Code
2. Install the "Dev Containers" extension
3. `Cmd/Ctrl + Shift + P` → "Dev Containers: Reopen in Container"
4. Everything will be set up automatically!

## 📚 API Documentation

- **OpenAPI Docs**: <http://127.0.0.1:8000/docs>
- **ReDoc**: <http://127.0.0.1:8000/redoc>
- **GraphQL Playground**: <http://127.0.0.1:8000/graphql>

### Authentication

The API uses JWT tokens with refresh token rotation:

```bash
# Demo login (development only)
curl -X POST http://localhost:8000/api/v1/auth/demo

# Use the returned access_token in subsequent requests
curl -H "Authorization: Bearer <access_token>" http://localhost:8000/api/v1/entries
```

### Core Endpoints

```
# Authentication
POST   /api/v1/auth/demo              # Demo login (no credentials)
POST   /api/v1/auth/login             # User login (demo/demo123)
POST   /api/v1/auth/logout            # Logout
POST   /api/v1/auth/refresh           # Refresh token
GET    /api/v1/auth/me                # Current user

# Entries
GET    /api/v1/entries                # List entries
POST   /api/v1/entries                # Create entry
GET    /api/v1/entries/{id}           # Get entry
PUT    /api/v1/entries/{id}           # Update entry
DELETE /api/v1/entries/{id}           # Delete entry

# Search
GET    /api/v1/search?q={query}       # Hybrid search (FTS + vector)
POST   /api/v1/search/semantic        # Semantic-only search
POST   /api/v1/entries/{id}/embed     # Generate embedding

# Admin
POST   /api/v1/admin/reindex-embeddings  # Trigger bulk reindex

# Health & Monitoring
GET    /health                        # Health check
GET    /metrics                       # Prometheus metrics (if enabled)
```

## 🏗 Architecture

### Directory Structure

```
apps/api/
├── app/
│   ├── api/v1/                # API route handlers
│   ├── infra/                 # Infrastructure layer
│   │   ├── db.py             # Database connection
│   │   ├── models.py         # SQLModel definitions
│   │   ├── auth.py           # Authentication utilities
│   │   ├── search_pgvector.py # Vector search implementation
│   │   └── embeddings.py     # Embedding generation
│   ├── services/             # Business logic layer
│   ├── workers/              # Background workers
│   ├── graphql/              # GraphQL schema
│   ├── main.py               # FastAPI application
│   └── settings.py           # Configuration
├── alembic/                  # Database migrations
├── tests/                    # Test suite
├── .devcontainer/           # VS Code dev container config
├── docker-compose.yml       # Local development services
├── Dockerfile               # Production container
├── pyproject.toml          # Python project configuration
└── Makefile                # Development commands
```

### Key Components

#### 1. **Hybrid Search Engine**

Combines PostgreSQL full-text search with pgvector similarity:

```python
# Hybrid search with configurable alpha blending
results = await hybrid_search(
    session=db,
    query="machine learning",
    k=10,
    alpha=0.7  # 70% semantic, 30% keyword
)
```

#### 2. **Event Sourcing**

All domain events are stored and published to NATS:

```python
# Events are automatically published via outbox pattern
await entry_service.create_entry(
    db=session,
    title="My Entry",
    content="Content here..."
)
# → Publishes "entry.created" event to NATS
```

#### 3. **Background Workers**

Embedding generation happens asynchronously:

```bash
# Start the embedding worker
make worker

# Or directly
python -m app.workers.embedding_consumer
```

## 🧪 Testing

Comprehensive test suite with 136 tests across multiple categories. **See [TESTING.md](TESTING.md) for complete testing documentation.**

### Quick Start

```bash
# Run all tests with coverage
make test

# Run specific test categories
uv run pytest tests/api/              # API endpoint tests (73 tests)
uv run pytest tests/integration/       # Integration tests (41 tests)
uv run pytest tests/unit/             # Unit tests (19 tests)

# Run with detailed coverage report
uv run pytest --cov=app --cov-report=term-missing

# Run tests in parallel (faster)
uv run pytest -n auto
```

### Coverage Requirements

- **Minimum**: 85% coverage for all features
- **Current**: 79% (686/836 lines)
- **Target**: Need 6% more coverage to meet standards

## 🔧 Development Commands

```bash
# Development server with hot reload
make dev

# Run tests with coverage
make test

# Code quality checks
make lint
make lint-check  # Check only, don't fix

# Database operations
make upgrade     # Apply migrations
make downgrade   # Rollback one migration
make migrate m="description"  # Create new migration

# Background services
make worker      # Start embedding consumer
make setup       # Start all infrastructure
make down        # Stop all services
make reset       # Full reset (destroys data!)

# Install/update dependencies
make install     # Install from pyproject.toml
uv sync --upgrade  # Update all dependencies
```

## 📊 Monitoring & Observability

### Health Checks

```bash
curl http://localhost:8000/health
# {"status": "ok", "database": "connected", "redis": "connected"}
```

### Logging

Structured JSON logging with correlation IDs:

```python
import logging
logger = logging.getLogger(__name__)

logger.info(
    "Entry created",
    extra={
        "entry_id": entry.id,
        "user_id": user.id,
        "correlation_id": request.headers.get("x-correlation-id")
    }
)
```

### OpenTelemetry (Optional)

Enable distributed tracing by setting:

```bash
export JOURNAL_OTLP_ENDPOINT="http://jaeger:14268/api/traces"
```

## 🔒 Security

### Authentication Flow

1. **Demo Login** (development): `POST /api/v1/auth/demo`
2. **Regular Login**: `POST /api/v1/auth/login`
3. **Token Usage**: Include `Authorization: Bearer <token>` header
4. **Token Refresh**: `POST /api/v1/auth/refresh` when access token expires

### Security Features

- JWT tokens with configurable expiration
- Refresh token rotation
- Password hashing with bcrypt
- CORS configuration
- Request rate limiting (Redis-based)
- SQL injection protection (SQLAlchemy)
- Input validation (Pydantic)

## 🗃 Database

### Migrations

```bash
# Create new migration
make migrate m="add user table"

# Apply migrations
make upgrade

# Rollback one migration
make downgrade

# Show current migration
uv run alembic current

# Show migration history
uv run alembic history
```

### Schema Overview

```sql
-- Core tables
entries (id, title, content, author_id, created_at, updated_at, word_count)
events (id, aggregate_id, event_type, event_data, occurred_at)
entry_embeddings (entry_id, embedding::vector(1536), created_at)

-- Indexes
CREATE INDEX ON entries USING gin(to_tsvector('english', title || ' ' || content));
CREATE INDEX ON entry_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

## 🚢 Deployment

### Docker

```bash
# Build production image
docker build -t journal-api .

# Run with external services
docker run -p 8000:8000 \
  -e JOURNAL_DB_URL="postgresql+asyncpg://..." \
  -e JOURNAL_REDIS_URL="redis://..." \
  journal-api
```

### Environment Variables

```bash
# Required
JOURNAL_DB_URL="postgresql+asyncpg://user:pass@host:5432/dbname"
JOURNAL_JWT_SECRET="your-secret-key"

# Optional
JOURNAL_REDIS_URL="redis://localhost:6379/0"
JOURNAL_NATS_URL="nats://localhost:4222"
JOURNAL_LOG_LEVEL="INFO"
JOURNAL_OTLP_ENDPOINT=""  # OpenTelemetry endpoint
JOURNAL_EMBED_PROVIDER="fake"  # or "openai"
OPENAI_API_KEY=""  # if using OpenAI embeddings
```

## 🤝 Contributing

1. **Code Style**: We use `ruff` for formatting and linting
2. **Type Hints**: All code must include type hints (`mypy` enforced)
3. **Tests**: All new features require tests (85% coverage minimum)
4. **Commits**: Use conventional commits format
5. **Pre-commit**: Hooks will run automatically (`pre-commit install`)

### Code Quality Tools

- **ruff**: Fast linting and formatting
- **mypy**: Static type checking
- **bandit**: Security linting
- **pytest**: Testing framework
- **coverage**: Code coverage tracking

## 📈 Performance

### Benchmarks

- **Entry Creation**: \~50ms (including embedding generation)
- **Search Query**: \~10ms (hybrid search, 1000 entries)
- **Vector Search**: \~5ms (semantic only, 1000 entries)
- **Entry Retrieval**: \~2ms (single entry by ID)

### Optimization Features

- Connection pooling (SQLAlchemy)
- Redis caching for frequent queries
- Async/await throughout the stack
- Efficient vector similarity search (IVFFlat index)
- Background processing for heavy operations

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
