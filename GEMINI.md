# Gemini Code Assistant Context

This document provides context for the Gemini Code Assistant to understand the project structure, technologies, and development conventions.

## Project Overview

This is a full-stack journaling application with a rich text editor, code highlighting, math rendering, and AI-powered semantic search.

The project is a monorepo with two main applications:

-   **`apps/web`**: A React frontend built with TypeScript and Vite.
-   **`apps/api`**: A FastAPI backend written in Python.

The application uses a PostgreSQL database with the `pgvector` extension for semantic search. It also uses Redis for caching and NATS for event sourcing.

## Building and Running

The project uses a `Makefile` to simplify common tasks.

### Development

To start the entire application (frontend, backend, and services) for development, run:

```bash
make dev-full
```

This will start the following services:

-   **API**: `http://localhost:5000`
-   **Web**: `http://localhost:5173`

You can also run the frontend and backend development servers separately:

-   **Frontend**: `bun run web:dev`
-   **Backend**: `cd apps/api && make dev`

### Production

To build the application for production, run:

```bash
make build
```

The application can be deployed using Docker. Use the `docker-compose.yml` file to build and run the complete stack:

```bash
docker compose up
```

## Testing

The project has a comprehensive test suite, including unit, integration, and end-to-end tests.

To run all tests, use the following command:

```bash
make test
```

You can also run tests for the frontend and backend separately:

-   **Frontend**: `bun run test`
-   **Backend**: `cd apps/api && make test`

End-to-end tests are run with Playwright:

```bash
make e2e
```

## Development Conventions

### Code Style

-   **Python**: The backend follows the PEP 8 style guide and uses Ruff for linting and formatting.
-   **TypeScript/JavaScript**: The frontend uses Biome for linting and formatting.

### Commits

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Pre-commit Hooks

The project uses pre-commit hooks to enforce code quality. To install the hooks, run:

```bash
# Frontend
cd apps/web
npm install

# Backend
cd apps/api
uv run pre-commit install
```

### Documentation

Documentation is located in the `docs/` directory. All new features should be documented.
