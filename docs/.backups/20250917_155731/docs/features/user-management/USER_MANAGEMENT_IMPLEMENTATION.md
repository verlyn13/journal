---
id: user-management-implementation
title: User Management Implementation Plan
type: api
version: 1.0.0
created: '2025-09-10'
updated: '2025-09-10'
author: Journal Team
tags:
- api
- python
- fastapi
priority: high
status: approved
visibility: internal
schema_version: v1
---

# User Management Implementation Plan

This guide defines a pragmatic, phased implementation for full user management in the Journal monorepo. It builds on the current demo JWT flow and moves toward persistent users, secure sessions, ownership enforcement, and optional providers (OAuth, WebAuthn).

The plan is objective, implementation-focused, and aligned with existing patterns, tooling, and testing practices in this repo.

## Goals

- Persisted users with secure password auth and optional providers.
- Short‑lived access tokens; rotated refresh tokens with server-side session state and revocation.
- Strict authorization and ownership on content.
- Minimal disruption to existing routes; gradual rollout behind feature flags.
- Comprehensive tests with ≥70% coverage on feature code.

## Architecture Additions

Data model (SQLModel in `apps/api/app/infra/models.py`):
- User: `id (UUID)`, `email (unique)`, `username (unique, optional)`, `password_hash`, `is_active`, `is_verified`, timestamps.
- RefreshSession: `id (UUID)`, `user_id (FK)`, `jti (unique)`, `revoked`, `expires_at`, `created_at`, optional device/agent metadata.
- Optional (later): OAuthAccount, PasskeyCredential.

Auth flow:
- Password login: verify credentials, create access token (short TTL), create refresh session + refresh token (contains `jti`) and return.
- Refresh: validate refresh token, check session by `jti`, rotate by issuing new refresh token and revoking old session entry; issue new access token.
- Logout: revoke current refresh session; optionally all sessions if requested.
- Ownership: enforce `author_id == user_id` for entry update/delete; list filters by `author_id`.

Frontend:
- Continue using bearer access tokens for API calls.
- Support refresh rotation (persist rotated `refresh_token`), or move to httpOnly cookie for refresh in later phase.
- Remove development auto‑login when `JOURNAL_USER_MGMT_ENABLED=true`.

## Backend Tasks

1) Models and Migrations
- Add `User` and `RefreshSession` to `app/infra/models.py`.
- Create Alembic migration: create tables and indexes; optionally backfill an admin user for development.
- Transitional step: keep existing demo login while `settings.user_mgmt_enabled == False`.

2) Security Primitives
- Password hashing: Argon2id (preferred) via `argon2-cffi` or `argon2-cffi-bindings`. If not available, bcrypt as fallback.
- JWTs: Include `jti` in refresh tokens; consider RS256 later (HS256 acceptable with strong secret).
- Rate limiting (optional in near-term): use a simple in‑memory or Redis limiter for `/auth/login` and `/auth/refresh`.

3) Session Management
- Create session on login; store `(user_id, jti, expires_at, revoked=False)`.
- On refresh: verify token, find session by `jti`, ensure not revoked and not expired; issue new `jti`, persist new session, revoke old one; return new refresh token + new access token.
- On logout: revoke session (by `jti`).

4) API Endpoints (FastAPI)
- `POST /api/auth/register` (optional phase 1): create user, send verification (stub or real email flow); return pending/created.
- `POST /api/auth/login`: password login with session creation and token pair issuance.
- `POST /api/auth/refresh`: rotate refresh token and return new tokens.
- `GET /api/auth/me`: return user profile + roles/scopes; stable shape with additive fields.
- `POST /api/auth/logout`: revoke current session; return success.
- `GET /api/auth/sessions`: list active sessions for the user (optional, phase 2).
- `POST /api/auth/sessions/{id}/revoke`: revoke a specific session (optional, phase 2).

5) Authorization & Ownership
- Repository or service layer checks to ensure modifying/deleting entries require ownership.
- Consider basic RBAC: `roles` claim in access token (`user`, `admin`) to guard admin endpoints.

6) Observability & Security
- Metrics: login success/fail, refresh success/fail, logout, revocations.
- Logging: structured logs with minimal PII.
- CORS: restrict in non-dev.
- Secrets: ensure `JOURNAL_JWT_SECRET` set in production; never commit secrets.

## Frontend Tasks

1) Token Handling
- Update refresh logic to accept and persist rotated `refresh_token` (already supported by current API client if response includes it).
- In a future phase, move refresh token to secure httpOnly cookie; then stop storing refresh token in `localStorage` and update API client accordingly.

2) Auth UI
- Login form: email/username + password; errors on invalid credentials; lockout messaging on throttling.
- Registration form (optional P1); email verification flow in P2.
- Session expiry: when refresh fails, clear tokens and show login screen.
- Remove dev `demoLogin()` fallback when `JOURNAL_USER_MGMT_ENABLED=true`.

3) Ownership in UI
- Hide or disable actions (update/delete) for entries not owned by the user; handle server 403 gracefully.

## Configuration

Backend (`apps/api/app/settings.py`):
- `user_mgmt_enabled: bool` – feature flag.
- `jwt_secret: str` – must be strong in production.
- `access_token_minutes: int` – default 15.
- `refresh_token_days: int` – default 30.
- Additions:
  - `password_hash_scheme: str = "argon2"` (or "bcrypt").
  - `refresh_cookie_enabled: bool = False`
  - `refresh_cookie_name: str = "jr_refresh"`
  - `refresh_cookie_secure: bool = True`
  - `refresh_cookie_samesite: str = "lax"`

Frontend:
- `VITE_API_URL`
- If cookie-based refresh is enabled, client should not store refresh token.

## Testing Strategy

- Unit: hashing, token create/verify, session repo logic, permission checks.
- Component (API): register/login/refresh/logout/me; ownership enforcement on `entries`.
- Integration: rotation and revocation flows; invalid/expired tokens.
- E2E: login, session expiry, logout, restricted actions.
- Convert scaffolded integration tests from skipped to active as features land.

## Rollout Plan

Phase 1 (Foundations):
- Add models/migrations, credential login, sessions, rotation, logout, basic `/me`, enforce ownership, metrics/logging.
- Keep demo login behind `user_mgmt_enabled=false` and disabled in prod.

Phase 2 (Enhancements):
- Sessions management endpoints, email verification, OAuth provider abstraction, WebAuthn passkeys.

Phase 3 (Hardening):
- Cookie-based refresh, device management UI, RBAC enforcement on admin routes, rate limiting.

## Commands (Python API)

Using uv (never pip/uv):
- `cd apps/api && uv run alembic revision --autogenerate -m "add user and refresh sessions"`
- Review migration; then `cd apps/api && uv run alembic upgrade head`
- Run tests: `cd apps/api && uv run pytest -m "unit or component"`

## Minimal Endpoint Contracts

- `POST /api/auth/login` → `{ access_token, refresh_token, token_type }`
- `POST /api/auth/refresh` → `{ access_token, refresh_token, token_type }` (rotated)
- `GET /api/auth/me` → `{ id, email, username, roles?: string[] }`
- `POST /api/auth/logout` → `{ message }`

Keep shapes stable and additive to avoid frontend breakage.

## Code Pointers

- Existing: `app/infra/auth.py`, `app/api/auth.py`, `app/infra/models.py`, `app/api/entries.py`, `web/src/services/api.ts`.
- New: Models + session repo, updated auth routes, optional cookie helpers.

