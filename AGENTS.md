# AGENTS.md — Agent Operating Guide

This repository is set up for agent‑assisted development with a focus on deterministic, high‑quality documentation. Follow these conventions and use the provided scripts to discover, validate, and maintain the docs system.

## Quick Start

- Primary shell: `fish` (bash/zsh also available)
- Python: 3.13 via `uv` (virtualenvs managed in-project)
- JS runtime: Node v22 (npm for package management)
- Linting: Ruff (Python), Biome (JS)
- Testing: Pytest (Python), Vitest (JS)

## Project Structure

```
.
├── apps/
│   ├── api/         # FastAPI backend
│   └── web/         # React frontend
├── docs/            # Documentation system
├── scripts/         # Automation tools
└── packages/        # Shared packages
```

## Documentation System

- Source directory: `docs/`
- Deterministic generators and validators live in `scripts/`
- **Master Guide**: `DOCUMENTATION_SYSTEM.md` (start here for docs work)
- Makefile entry points:
  - `make docs-validate` — full validation suite
  - `make docs-fix` — auto-fix documentation issues
  - `make docs-status` — consolidated status report (JSON + Markdown)
  - `make docs-check` — quick integrity check (heuristics)
  - `make docs-taxonomy` — taxonomy conformance report
  - `make docs-relationships` — relationships consistency report
  - `make docs-graph` — docs graph (links, backlinks, tags)
  - `make docs-serve` — serve docs locally

Outputs are written under `docs/_generated/` and human‑readable reports under `docs/_generated/reports/`.

## Conventions

- All Markdown files must include YAML frontmatter with fields: `title`, `category`, `subcategory`, `status`, `created`, `updated`, `tags`
- Use controlled vocabulary from `docs/taxonomy.yaml` for `category` and `tags`
- Use npm + Biome and uv + Ruff throughout docs
- Internal links must be relative and point to existing `*.md` files
- Follow security best practices - never commit secrets

## Agent Discovery Tips

- **Start Here**: `DOCUMENTATION_SYSTEM.md` for complete documentation guide
- Navigation: `docs/INDEX.md` and `docs/README.md`
- Visual Dashboard: `docs/_generated/dashboard.html`
- Use `make docs-graph` to build `docs/_generated/graph.json` with:
  - nodes: `id`, `path`, `category`, `tags`
  - edges: outbound links and backlinks
- Use `make docs-validate` for full validation
- Use `make docs-status` to see health metrics and orphans
- Use `make docs-taxonomy` to check controlled vocabulary compliance
- Use `make docs-relationships` to validate `docs/relationships.json`

## Pull Request Checklist

- Run: `make docs-validate` (includes all checks)
- Fix issues: `make docs-fix`
- Ensure no broken links and taxonomy violations
- Keep README/INDEX links consistent
- Update documentation when changing functionality
- Run tests: `make test`

## Security & Secrets

- Never commit secrets. Use environment variables and gopass (limited agent access under `development/`)
- Authentication: JWT with refresh tokens, WebAuthn support
- Secrets: Gopass (local), Infisical (production)
- Rate limiting on all API endpoints

## Style

- Python: type hints, 4‑space indent, alphabetical imports, Ruff formatting
- Web: 2‑space indent, TypeScript strict mode, Biome formatting
- Prefer readability over cleverness
- Use TodoWrite tool for task tracking
- Always validate documentation after changes

## Current Development Status

- Branch: `pre-deployment-prep`
- Focus: Preparing for Vercel + Supabase deployment
- Documentation system: Fully operational
- Next: Complete deployment configuration

## Key Commands

```bash
# Backend Development
cd apps/api
uv run server      # Start FastAPI
uv run test        # Run tests
uv run lint        # Lint with Ruff

# Frontend Development
cd apps/web
npm run dev        # Start Vite
npm run test       # Run Vitest
npm run lint       # Lint with Biome

# Documentation
make docs-validate # Validate all docs
make docs-fix      # Auto-fix issues
make docs-graph    # Generate graph

# Full Test Suite
make test          # All tests
make check-deploy  # Deployment readiness
```

