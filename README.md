# Journal

A personal journaling application built for privacy, speed, and thoughtful reflection.

## What This Is

Journal is a web-based journaling platform designed around the principle of private, encrypted entries with powerful search and organization capabilities. Each entry is encrypted client-side before storage, ensuring that your thoughts remain yours alone.

## Notable Technical Decisions

### Architecture
- **Monorepo structure** using Turborepo for coordinated builds between API and web applications
- **FastAPI backend** (Python 3.13) chosen for its async capabilities and type safety
- **React 19** with TypeScript for the frontend, embracing the latest concurrent features
- **PostgreSQL with pgvector** for semantic search capabilities on encrypted metadata

### Development Tools
- **Ruff 0.13.0** for Python linting and formatting (replacing Black, isort, and flake8)
- **Biome** for JavaScript/TypeScript linting and formatting
- **Bun** as the JavaScript runtime and package manager
- **uv** for Python package management

### Security & Privacy
- **Client-side encryption** using Web Crypto API before any data leaves the browser
- **EdDSA JWT tokens** for authentication
- **Argon2** for password hashing
- **Content Security Policy** enforcement with strict directives

### Infrastructure
- **GitHub Actions** for CI/CD with contract-based testing between services
- **Vercel** for frontend deployment with preview environments
- **Supabase** for managed PostgreSQL with pgvector extension

## Core Features

- **Encrypted entries**: All journal content encrypted client-side
- **Rich text editing**: Full markdown support with live preview using CodeMirror
- **Semantic search**: Find entries by meaning, not just keywords
- **Tag organization**: Flexible tagging system with nested tag support
- **Daily prompts**: Optional reflection prompts to inspire writing
- **Export options**: Download your data in multiple formats
- **PWA support**: Works offline and installs as a native app

## Stack

### Backend (apps/api)
- FastAPI 0.115.6
- SQLAlchemy 2.0 with async support
- PostgreSQL with pgvector extension
- Python 3.13

### Frontend (apps/web)
- React 19.0
- TypeScript 5.7
- Tailwind CSS
- CodeMirror 6 for the editor
- Radix UI for accessible components

### Testing
- Playwright for E2E tests
- Vitest for unit tests
- pytest for API tests

## Development

Requirements:
- Python 3.13
- Bun 1.1+
- PostgreSQL 15+ with pgvector
- Node.js 20+ (for some tooling)

Setup:
```bash
# Install dependencies
bun install
cd apps/api && uv sync

# Set up environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Run database migrations
cd apps/api && uv run alembic upgrade head

# Start development servers
bun run dev
```

## Project Structure

```
journal/
├── apps/
│   ├── api/         # FastAPI backend
│   └── web/         # React frontend
├── packages/        # Shared packages
│   └── config/      # Shared configuration
├── docs/            # Documentation
├── scripts/         # Build and maintenance scripts
└── .github/         # CI/CD workflows
```

## Design Philosophy

This project prioritizes:
1. **Privacy first**: Your data is encrypted before it leaves your device
2. **Performance**: Fast load times and responsive interactions
3. **Simplicity**: Clean interface that doesn't get in the way of writing
4. **Reliability**: Comprehensive testing and type safety throughout
5. **Developer experience**: Clear code structure and modern tooling

## License

Private project - not for redistribution