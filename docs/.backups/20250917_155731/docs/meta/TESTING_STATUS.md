---
id: testing-status
title: 'Testing Work: Status & Plan'
type: api
version: 1.0.0
created: '2025-09-16'
updated: '2025-09-16'
author: Journal Team
tags:
- api
- python
- docker
- fastapi
priority: high
status: approved
visibility: internal
schema_version: v1
---

# Testing Work: Status & Plan

This document summarizes the current end-to-end testing setup, recent improvements, and the concrete plan going forward. It is the single source of truth for how to run, validate, and extend the test suites across the repository.

***

## Overview

- Backends: Modern FastAPI service lives under `apps/api` (Alembic, pgvector, NATS, outbox, workers). Legacy Flask tests remain under the root `tests/` and are not a focus here.
- Frontend: `apps/web` (Vitest unit tests), root Playwright E2E for browser automation.
- Goals: Deterministic, layered tests with honest coverage as a byproduct. No loosening of assertions; flakiness minimized via dependency injection and fakes.

Layers and markers:

- `unit`: pure logic, no I/O
- `component`: HTTP + DB (no external services)
- `integration`: DB + NATS/pgvector/workers
- `e2e`: end-to-end in browser (Playwright)

Reference: `apps/api/docs/testing.md` describes test layers, fixtures, and determinism details.

***

## What Changed (Implemented)

- Pytest taxonomy registered in `apps/api/pyproject.toml` with strict markers.
- Deterministic DB setup for tests using Alembic migrations and `NullPool` engine; tables truncated after each test.
- Added `nats_capture` fixture to record NATS publications deterministically in integration tests.
- Added `process_outbox_batch()` to test outbox idempotency in a single-shot manner.
- Stats endpoint now:
  \- Uses an overridable `_utcnow()` for deterministic tests.
  \- Excludes soft-deleted records from all counters.
- New tests:
  \- Unit: JWT claim logic; markdown/html conversion.
  \- Component: Stats with frozen time; annotated existing API tests as `component`.
  \- Integration: Outbox semantics; pgvector ranking and soft-delete exclusion; embedding worker upserts + reindex idempotency; Alembic schema validation; optional real NATS pubsub/request-reply (gated by env).
- CI (GitHub Actions):
  \- API Unit+Component: spins up Postgres; runs strict tests with coverage artifacts.
  \- API Integration: spins up Postgres+NATS; runs Alembic; executes integration tests (optionally real NATS) with coverage artifacts.
  \- Web: Vitest with coverage; Playwright job enabled (starts API server, runs E2E, uploads report).
- Developer Experience:
  \- Make targets in `apps/api`: `test-unit`, `test-component`, `test-integration`, `test-all`.
  \- Root Makefile: `test-unit`, `test-component`, `test-integration`, and `quality` (includes lint + tests; E2E opt-in via `RUN_E2E=1`).

***

## How To Run Locally

Prereqs:

- Docker + Compose
- Python 3.13 with `uv`
- Node 20 + Bun 1.2.x
- Free ports: 5000 (API), 5173 (web), 5433 (Postgres), 4222/8222 (NATS)

Services:

- `cd apps/api && docker compose up -d db nats`

API tests:

- Unit: `cd apps/api && uv run pytest -m unit -q`
- Component: `cd apps/api && uv run pytest -m component -q`
- Integration: `cd apps/api && uv run alembic -c alembic.ini upgrade head && uv run pytest -m integration -q`
- Optional real NATS tests: `RUN_REAL_NATS=1 uv run pytest -m integration -q`

Web tests:

- Unit (Vitest): `cd apps/web && bun install && bun run test:coverage`
- E2E (Playwright):
  1\) Start API: `cd apps/api && uv run fastapi run app/main.py --port 5000`
  2\) In repo root: `bun ci && bunx playwright install && bun test`

Root shortcuts:

- `make test-unit` (API unit + web vitest), `make test-component`, `make test-integration`
- `make e2e` (starts API, waits for health, runs Playwright, cleans up)
- `make quality` (lint + unit tests; set `RUN_E2E=1` to include Playwright)

Environment variables:

- `TEST_DB_URL=postgresql+asyncpg://journal:journal@localhost:5433/journal`
- `JOURNAL_DB_URL=postgresql+asyncpg://journal:journal@localhost:5433/journal`
- Optional: `RUN_REAL_NATS=1`, `RUN_REAL_NATS_RESTART=1` (for reconnect test)

***

## CI Workflows

- API tests: `.github/workflows/api-tests.yml`
  \- Unit+Component: Postgres service, strict markers, coverage artifacts
  \- Integration: Postgres+NATS services, Alembic upgrade, coverage artifacts, optional real NATS
- Web tests: `.github/workflows/web-tests.yml`
  \- Vitest with coverage artifact
  \- Playwright E2E: Starts API server, installs Playwright browsers, uploads report

***

## Current Status

- Test taxonomy and fixtures in place; deterministic DB and NATS capture implemented.
- Unit, component, and integration tests implemented for core infra and services.
- CI pipelines created and ready to run in GitHub Actions.
- Frontend unit and E2E pipelines in place; E2E enabled in CI and documented.

***

## Next Steps (Execution Plan)

1. Confirm CI runs are green on both API and Web jobs (including Playwright).
2. Expand NATS integration suite (request/reply contracts, reconnect) as needed in non-default runs via env flags.
3. Add a short CONTRIBUTING testing policy and link to this file and `apps/api/docs/testing.md`.
4. (Optional) Wire Codecov or upload combined coverage as a badge.

- Note: `make e2e` now available at repo root.

***

## Acceptance Criteria

- Unit+Component tests are deterministic and pass locally and in CI.
- Integration tests (DB + NATS/pgvector/workers) pass locally and in CI with services up.
- Stats tests produce consistent results and exclude soft-deleted entries.
- Search tests produce predictable ranked results.
- Outbox tests prove idempotent, exactly-once delivery semantics.
- Backfill test validates content is upgraded without brittle equality checks.
