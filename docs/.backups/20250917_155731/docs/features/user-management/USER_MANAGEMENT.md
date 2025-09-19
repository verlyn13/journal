---
id: user-management
title: 'User Management: Current State and Implementation Considerations'
type: api
version: 1.0.0
created: '2025-09-10'
updated: '2025-09-10'
author: Journal Team
tags:
- api
- react
- fastapi
priority: high
status: approved
visibility: internal
schema_version: v1
---

# User Management: Current State and Implementation Considerations

This document summarizes the current user/authentication mechanics across the codebase and outlines key considerations for implementing full user management. The goal is to provide an objective, value‑dense reference for next steps, risks, and integration constraints from backend to frontend.

## Status Snapshot (Merged: PR #19, PR #20)

- Cookie-based refresh and CSRF guard are implemented behind flags.
- Server-side sessions (`UserSession`) with refresh rotation on `/auth/refresh`.
- Metrics counters are wired for auth flows (success/fail/rotation/revocation).
- Integration tests cover register/verify/login/refresh/logout and rotation.

## Executive Summary

- Current auth is a minimal JWT-based demo implementation (no persisted users) with access/refresh tokens and a fixed demo credential flow.
- Backend protects application routes via a lightweight `require_user` dependency that validates JWTs and passes a `user_id` through.
- Frontend stores tokens in `localStorage`, attaches `Authorization: Bearer` headers, and auto-refreshes access tokens on 401.
- Tests include scaffolds (skipped) for real user management, passkeys (WebAuthn), OAuth providers, and ownership enforcement.
- Essential next steps: introduce persistent users, secure credential flows, session/refresh management, token rotation and revocation, and enforcement of ownership/roles in API.

---

## Current Capabilities (As Implemented)

Backend (FastAPI):
- Endpoints in `apps/api/app/api/auth.py`:
  - `POST /api/auth/register`: Creates user; in testing/dev returns `dev_verify_token`.
  - `POST /api/auth/verify-email`: Marks user verified with a valid token.
  - `POST /api/auth/login`: Password login (hash verify), creates `UserSession`, returns `{access, refresh}` or cookie when enabled.
  - `POST /api/auth/refresh`: Validates refresh, looks up session by `rid`, rotates and returns new tokens (or cookie + access only).
  - `POST /api/auth/logout`: Revokes session and clears refresh cookie (when enabled).
  - `GET /api/auth/csrf`: Ensures CSRF cookie and returns `{ csrfToken }` for web fallback.
  - `GET /api/auth/me`: Returns a synthetic profile based on `sub` (roles included in access claims).
- Cookie-based refresh (flagged): helpers in `app.infra.cookies` set/clear refresh cookie and enforce CSRF via header `X-CSRF-Token`.
- Sessions: `UserSession` model and helpers in `app.infra.sessions` manage issuance, rotation, revoke.
- Metrics: counters in `app.infra.auth_counters` instrument login success/fail, refresh rotation, and revocation.
- Flags: `user_mgmt_enabled`, `auth_cookie_refresh`, `csrf_cookie_name`, `refresh_cookie_name`, cookie attributes in `settings`.

Frontend (React):
- API client persists rotated refresh tokens; in cookie mode, uses `credentials: 'include'` and echoes `X-CSRF-Token` if available.
- Autosave test seam (`autosaveMs` + `__TEST__`) makes editor tests deterministic.
- Planned: when cookie mode is on in prod, stop storing refresh in localStorage.

Tests:
- Integration: register/verify/login/refresh/logout + rotation (see `apps/api/tests/integration`).
- API: CSRF warmup endpoint sanity (see `apps/api/tests/api/test_csrf_endpoint.py`).

---

## Essential Structures in Code

- Settings (`apps/api/app/settings.py`):
  - `jwt_secret`, `jwt_iss`, `jwt_aud`, `access_token_minutes`, `refresh_token_days`.
  - `user_mgmt_enabled` feature flag.
  - Demo credentials: `demo_username`, `demo_password`.
- Auth infra (`apps/api/app/infra/auth.py`):
  - `create_access_token(sub, scopes?)`, `create_refresh_token(sub)`, `require_user`.
  - Uses PyJWT; test mode can bypass exp verification (controlled by `settings.testing`).
- Auth API (`apps/api/app/api/auth.py`):
  - Endpoints for demo login/refresh/me/logout as described above.
- Domain models:
  - `Entry` includes `author_id: UUID` (`apps/api/app/infra/models.py`). No `User` table defined yet.
- Protected routes:
  - `entries`, `stats`, and some `admin` endpoints use `require_user` dependency for access control.
- Frontend API client:
  - Centralized fetch wrapper with token attach/refresh (`apps/web/src/services/api.ts`).

---

## Backend Considerations for Full User Management

Authentication and Identity:
- Introduce persistent `User` model (SQLModel) with fields such as `id (UUID)`, `email`, `username`, `password_hash`, `created_at`, `updated_at`, `is_active`, `is_verified`.
- Passwords: use strong hashing (e.g., Argon2id; at minimum, bcrypt with appropriate cost). Enforce password policy server-side.
- Registration and verification: email verification (token/exp), optional invite codes for closed beta.
- Login throttling and lockout after repeated failures (defend against credential stuffing).
- MFA (optional later): TOTP or WebAuthn passkeys.

Sessions, Tokens, and Revocation:
- Access/refresh tokens should support rotation. On refresh:
  - Issue new access token and a rotated refresh token.
  - Persist refresh sessions (e.g., Redis or DB) with metadata (user_id, device, ip, exp, last_used).
  - Revoke old refresh token; maintain a short grace window to handle race conditions.
- Token invalidation on logout and password reset; maintain server-side denylist or session state.
- Consider JWT key management and algorithm:
  - Keep HS256 for simplicity with strong secret in prod or move to RS256/EC for key separation.

Authorization and Ownership:
- Enforce ownership on `entries` endpoints using `author_id == user_id` checks in repository/service layer.
- Prepare for role-based access control (RBAC):
  - `roles` (e.g., `user`, `admin`) and optional `permissions` granularity.
  - Scope claims in JWT and route-level enforcement (e.g., `scope: "entries:read entries:write"`).

Data Model and Migrations:
- Add `User` table and optional `UserSession`/`RefreshToken` table.
- Add FK constraint from `Entry.author_id` to `User.id` (nullable during migration; backfill demo UUID rows).
- Write Alembic migrations with careful backfill/validation steps.

Security Controls:
- Validate and sanitize all inputs via Pydantic.
- Rate limit auth endpoints and public endpoints.
- CORS: limit to known origins in non-dev environments.
- Logging/metrics: auth success/fail, refresh, logout, revocations, anomalous patterns.

Operational Concerns:
- Secret management via environment variables (never commit secrets). Rotate on compromise.
- Observability: counters for auth flows, latency, error rates; traces for critical paths.

---

## Frontend Considerations

Token Storage and Refresh:
- Current storage uses `localStorage` for access/refresh tokens. This is simple but vulnerable to XSS.
  - Consider moving to httpOnly, secure cookies (sameSite) for refresh tokens and keep access token in memory.
  - If staying with storage, ensure robust XSS defenses and CSP.
- The client retries a failed request after refresh. With rotation enabled, update client to persist the rotated refresh token.

Auth Flows and UX:
- Login: username/password form, error handling, lockout messaging.
- Registration: email verification flow and resends.
- Logout: call server, clear tokens reliably; handle cross-tab sync (storage events).
- Session expiry: surface toast/banner when refresh fails; redirect to login.

Ownership and Authorization UI:
- Hide/disable update/delete actions for entries not owned by the user; show appropriate errors on server denial.
- Admin-only UI surfaces gated by role flags returned from `/auth/me` or a profile endpoint.

Provider Integrations:
- Passkeys (WebAuthn): ceremony initiation endpoints, challenge signing; frontend uses WebAuthn APIs and passes results to verify endpoints.
- OAuth providers: link buttons, provider availability checks, and redirect flows.

---

## API Contracts: Existing and Planned

Existing (implemented):
- `POST /api/auth/login` → `{ access_token, refresh_token, token_type }`
- `POST /api/auth/refresh` → `{ access_token, refresh_token, token_type }`
- `GET /api/auth/me` → `{ id, username, email }`
- `POST /api/auth/logout` → `{ message }`

Planned (scaffolded in tests):
- Passkeys (WebAuthn):
  - `POST /api/auth/webauthn/register/options` → registration options incl. `challenge`.
  - `POST /api/auth/webauthn/register/verify` → completes registration.
  - `POST /api/auth/webauthn/authenticate/options` → authentication options.
  - `POST /api/auth/webauthn/authenticate/verify` → completes authentication.
- OAuth providers:
  - `GET /api/auth/oauth/:provider/available`
  - `POST /api/auth/oauth/:provider/connect`
- Ownership enforcement:
  - `entries` update/delete return 401/403 when user is not the owner.

---

## Configuration and Environment

Environment variables (see `apps/api/app/settings.py`):
- `JOURNAL_JWT_SECRET`: Strong secret in production (required).
- `JOURNAL_JWT_ISS` / `JOURNAL_JWT_AUD`: Issuer and audience.
- `JOURNAL_ACCESS_TOKEN_MINUTES` / `JOURNAL_REFRESH_TOKEN_DAYS`: Token TTLs.
- `JOURNAL_USER_MGMT_ENABLED`: Feature flag to gate new functionality.
- `JOURNAL_DEMO_USERNAME` / `JOURNAL_DEMO_PASSWORD`: Development/demo overrides.

Frontend:
- API base derived from `VITE_API_URL`; client appends `/api` automatically.
- Tokens persisted in `localStorage` by default; update strategy if moving to cookie-based refresh.

---

## Gaps and Risks (Objective)

- No persisted users; demo-only identity tied to a fixed UUID.
- No password hashing or credential storage; no registration/verification.
- No server-side session state; no refresh token rotation; no revocation or device management.
- Access/refresh tokens stored in `localStorage` → XSS exposure risk.
- HS256 with default secret in repo; must be overridden in prod (risk if misconfigured).
- Ownership is not enforced consistently on all write/delete operations.
- No rate limiting on auth endpoints; potential brute-force risk.

---

## Implementation Roadmap (Phased)

Phase 1: Foundations
- Add `User` model + Alembic migrations; seed admin if needed.
- Integrate password hashing (Argon2id preferred) and credential login.
- Implement `/auth/register`, `/auth/verify-email`, `/auth/login` (password), `/auth/me`, `/auth/logout` with proper session semantics.
- Introduce refresh token rotation with server-side session store (Redis/DB) and revocation on logout/reset.
- Enforce ownership on `entries` update/delete; add 401/403 responses accordingly.

Phase 2: Enhancements
- Add OAuth providers abstraction (Google, GitHub) and link flows.
- Add WebAuthn passkeys for registration and login; store credentials per user.
- Add RBAC (roles/scopes) and surface in JWT claims; gate admin endpoints.
- Strengthen CORS, rate limiting, telemetry, and audit logs.

Phase 3: Hardening and UX
- Move refresh to httpOnly secure cookies (if feasible) and keep access token in memory.
- Add device/session management pages (list, revoke).
- Add comprehensive tests (unit, component, integration, E2E) for all flows.

---

## Testing Strategy (Target)

- Unit tests: token utils, password hashing, validators, session repository logic.
- Component tests: FastAPI routes for auth/register/refresh/logout/me; entries ownership enforcement.
- Integration tests: full login → refresh → logout; OAuth and WebAuthn via mocked ceremonies.
- E2E: UI flows for login, registration, session expiry handling, and restricted actions.
- Coverage target: ≥70% overall; do not exclude feature code.

---

## Backward Compatibility and Rollout

- Keep demo login behind `JOURNAL_USER_MGMT_ENABLED=false` for local/tests; disable in prod.
- Provide migration to map existing `Entry.author_id` demo UUID to real users or retain for dev-only data.
- Maintain `/auth/me` response shape; add fields (e.g., `roles`) without breaking existing consumers.
- Incrementally enforce ownership with feature flags and clear error messages in UI.

---

## References (Code Pointers)

- Backend settings: `apps/api/app/settings.py`
- Auth utilities: `apps/api/app/infra/auth.py`
- Auth routes: `apps/api/app/api/auth.py`
- Protected routes examples: `apps/api/app/api/entries.py`, `apps/api/app/api/stats.py`, `apps/api/app/api/admin.py`
- Frontend API client: `apps/web/src/services/api.ts`
- Tests (scaffolds):
  - `apps/api/tests/integration/test_auth_user_management_scaffold.py`
  - `apps/api/tests/integration/test_permissions_scaffold.py`
