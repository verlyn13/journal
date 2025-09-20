---
id: ci-contract
title: CI Contract — Required Gates and Policy
type: reference
status: approved
created: 2025-09-20
updated: 2025-09-20
author: Journal Team
tags: [ci-cd, github-actions, testing, deployment]
---

# CI Contract — Required Gates and Policy

This document defines the “green CI” contract: the minimal, reproducible set of checks every change must satisfy before merge.

## Required Gates

- Lint (Python)
  - Ruff check/format (no autofix in CI) via `uv run ruff` with a locked version.
- Docs
  - Structure & policy validation: `scripts/validate_documentation.py --strict`.
  - Link check: lychee with `lychee.toml` config.
  - Prose lint: Vale with `docs/.vale/config.ini`.
- API Tests
  - Pytest suite against Postgres service with required extensions.
  - Alembic upgrade to head before tests.
- DB Smoke
  - Create `vector`, `pg_trgm`, `btree_gin` extensions.
  - Alembic upgrade to head and empty‑diff check.
- Web Tests
  - Playwright (sharded; trace on retry), Bun 1.2.x.
- Verify Alignment
  - Python 3.13 and Ruff 0.13 pinned; config consistency (preview rules).

## Runner Contract

- Tools installed hermetically: Python via `uv`; JS via Bun; Actions pinned to SHAs.
- Workflows are deterministic and reproducible; no reliance on ambient system state.
- Workflows run from the repo and use only committed lockfiles/config.

## Local First

- `make verify` mirrors the CI gates so contributors can reproduce results locally before pushing.
- Pre‑commit hooks enforce fast checks (ruff, docs validator, markdownlint, optional vale/lychee).

## Dependency Hygiene

- Renovate groups weekly updates; a scheduled canary lane runs the latest toolchain without merging.

## Policy

- The “Required” checks are blocking on PRs.
- Coverage (codecov/patch) is informational for feature branches; enforce on main if needed.
- New checks must be deterministic and documented here.
