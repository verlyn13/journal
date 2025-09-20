# Phase 0 — Stabilize the docs branch & stage the work

### 0.1 Open a docs-only PR (no runtime changes)

```bash
# Ensure you’re up to date
git fetch origin

# Create PR for docs branch
codex open-pr \
  --base main \
  --head docs/user-management-report \
  --title "docs(auth): user management plan + starter diffs" \
  --labels docs,auth,planning \
  --body "Adds implementation plan and starter diffs; no behavior change."
```

### 0.2 Recover/inspect any stash safely (if it exists)

```bash
# If agent mentioned a stash, land it on a temp branch for review
git checkout -b wip/agent-stash-landing
git stash list  # if entries exist:
git stash show -p | git apply -3  # or: git stash pop (only if you're ready)
git commit -am "chore: land agent stash for inspection"
git push -u origin wip/agent-stash-landing
```

---

# Phase 1 — Create implementation tracks (M1.\*) as small PRs

> We’ll align to the repo’s existing file layout **and** the agent’s docs. Your repo currently centralizes models; we’ll keep **`User` & `UserSession`** in `apps/api/app/infra/models.py` as the docs suggest (instead of a new file), and add migrations. Rotation/jti goes into `infra/auth.py`. Ownership checks go into `api/v1/entries.py`.

### 1.0 Create baseline feature flags in all envs (no behavior change)

```bash
mise env set JOURNAL_USER_MGMT_ENABLED=false JOURNAL_AUTH_ENABLE_PASSKEYS=false JOURNAL_AUTH_ENABLE_OAUTH=false JOURNAL_AUTH_COOKIE_REFRESH=false JOURNAL_PRIVACY_DASHBOARD=false
```

---

## M1.T1 — Persistent Users + Sessions schema

### 1.1 Branch & plan

```bash
git checkout -b feat/auth-M1.T1-users-sessions
codex plan --milestones M1_foundations --filter "T1"
```

### 1.2 Apply model + migration (≤300 LoC diff)

```bash
codex edit <<'BRIEF'
Goal: Add User and UserSession (a.k.a. RefreshSession) to apps/api/app/infra/models.py and create Alembic migration.
- Keep columns: id (UUID), email unique, username?, password_hash?, roles JSON, is_active, is_verified, created_at, updated_at.
- UserSession: id, user_id FK, refresh_id (UUID unique), user_agent, ip_address, issued_at, last_used_at, expires_at, revoked_at.
- Ensure models are imported at app startup so Alembic can autogenerate.
- Generate migration file apps/api/alembic/versions/20250909_0001_users_sessions.py.
Add unit test apps/api/tests/unit/test_user_model.py (defaults).
Do NOT change handlers or behavior yet.
BRIEF
```

### 1.3 Run unit & migration sanity

```bash
alembic -c apps/api/alembic.ini upgrade head
pytest -q apps/api/tests/unit/test_user_model.py
codex open-pr -m "feat(auth): User + UserSession models and migration (M1.T1)" --labels auth,db,migrations
```

---

## M1.T2 — Registration + Email Verify + Password Login (Argon2id)

### 2.1 Branch & plan

```bash
git checkout -b feat/auth-M1.T2-register-login
codex plan --milestones M1_foundations --filter "T2"
```

### 2.2 Implement endpoints under flag

```bash
codex edit <<'BRIEF'
Goal: Add register/verify/login endpoints in apps/api/app/api/v1/auth.py behind JOURNAL_USER_MGMT_ENABLED.
- /register: create user; return 202 and dev_verify_token when testing/dev.
- /verify-email: consume verify token; set is_verified true.
- /login: verify Argon2id hash; return access+refresh (temp, no rotation yet).
- Add hashing helpers in apps/api/app/infra/security.py (argon2).
- Extend auth utils in apps/api/app/infra/auth.py to create verify tokens.
- Rate-limit /register and /login with simple in-proc guard (keep minimal).
- Tests: apps/api/tests/integration/test_auth_password_flow.py happy path.
No impact when JOURNAL_USER_MGMT_ENABLED=false.
BRIEF
```

### 2.3 Run integration tests

```bash
pytest -q apps/api/tests/integration/test_auth_password_flow.py
codex open-pr -m "feat(auth): register/verify/login (M1.T2, flagged)" --labels auth,backend
```

---

## M1.T3 — Refresh Rotation + Server Sessions + Revocation

### 3.1 Branch & plan

```bash
git checkout -b feat/auth-M1.T3-rotation
codex plan --milestones M1_foundations --filter "T3"
```

### 3.2 Implement rotation flow

```bash
codex edit <<'BRIEF'
Goal: Implement refresh rotation and revocation using UserSession.refresh_id (JTI) in apps/api/app/api/v1/auth.py.
- On /login: create UserSession with UA/IP; issue access + refresh(jwt rid=session.refresh_id).
- /refresh: verify refresh; lookup session by rid; rotate rid to new UUID; issue new tokens; revoke old session state.
- /logout: revoke current session via rid.
- Add session helpers in apps/api/app/infra/sessions.py (create/touch/revoke/get_by_rid).
- Tests: apps/api/tests/integration/test_refresh_rotation.py
**Keep behind JOURNAL_USER_MGMT_ENABLED.** Do not break demo endpoints when flag is false.
BRIEF
```

### 3.3 Run rotation tests

```bash
pytest -q apps/api/tests/integration/test_refresh_rotation.py
codex open-pr -m "feat(auth): refresh rotation, sessions, logout (M1.T3, flagged)" --labels auth,sessions,security
```

---

# Phase 2 — Ownership enforcement (M1 remainder)

> The agent’s doc says entries write/delete are being enforced. Do it now with a tiny PR.

### 4.0 Ownership enforcement PR

```bash
git checkout -b feat/auth-M1.own
codex edit <<'BRIEF'
Goal: Enforce author ownership on entries update/delete.
- apps/api/app/api/v1/entries.py: ensure current_user == entry.author_id; else 403.
- Unskip tests in apps/api/tests/integration/test_permissions_scaffold.py; make pass.
**Guard by JOURNAL_USER_MGMT_ENABLED to avoid affecting demo until rollout.**
BRIEF
```

```bash
pytest -q apps/api/tests/integration/test_permissions_scaffold.py
codex open-pr -m "feat(auth): entries ownership enforcement (M1)" --labels auth,authorization
```

---

# Phase 3 — Frontend minimal wiring for rotation (safe/flagged)

> We keep it small: persist rotated refresh token and remove auto-demo login when the flag is on.

### 5.0 Frontend PR

```bash
git checkout -b feat/web-auth-rotation-min
codex edit <<'BRIEF'
Goal: Update apps/web/src/services/api.ts to:
- Expect rotated refresh_token from /auth/refresh and persist it.
- On 401, call /auth/refresh with current refresh; retry original request.
- When JOURNAL_USER_MGMT_ENABLED=true, disable demo auto-login in JournalApp.tsx; when false, keep current dev behavior.
Add a Playwright smoke test for expired access -> refresh -> retry success.
BRIEF
```

```bash
pnpm -C apps/web test -u --run
pnpm -C apps/web exec playwright test --reporter=line
codex open-pr -m "feat(web): client refresh rotation + guard demo auto-login (M1)" --labels frontend,auth
```

---

# Phase 4 — Merge order & rollout switches

### 6.0 Merge order (all green)

1. **M1.T1 models+migration**
2. **M1.T2 register/login**
3. **M1.T3 rotation**
4. **Ownership enforcement**
5. **Frontend rotation**

> After each merge, run DB migrations in **dev** and **staging**; prod later.

### 6.1 Enable staging flags

```bash
# staging only
mise env set JOURNAL_USER_MGMT_ENABLED=true
# keep passkeys/oauth/cookies OFF for now
```

### 6.2 Smoke checklist (staging)

* Register → verify → login → `/auth/me` ok.
* Access expiry → `/auth/refresh` rotates → old refresh rejected.
* Logout → refresh rejected.
* Non-owner entry update/delete → 403.
* Frontend: 401 triggers refresh → retry succeeds.

---

# Phase 5 — Security & observability add-ons (tiny PRs)

### 7.0 Add metrics counters (server)

```bash
git checkout -b feat/auth-metrics
codex edit <<'BRIEF'
Add minimal counters in apps/api/app/infra/metrics.py and increment in auth routes:
- auth_login_success_total, auth_login_fail_total
- auth_refresh_rotations_total, auth_revocations_total
Expose /metrics if already supported or wire into existing exporter.
BRIEF
```

```bash
codex open-pr -m "feat(auth): minimal auth metrics counters"
```

### 7.1 Rate limit guards

```bash
git checkout -b feat/auth-ratelimit
codex edit <<'BRIEF'
Add simple rate limiting to /register and /login (window: 60s, max: 5) using existing middleware or a lightweight in-memory map when REDIS_URL not set. Generic 429 message.
BRIEF
```

```bash
codex open-pr -m "feat(auth): rate limit /register and /login"
```

---

# Phase 6 — Governance & backout

* Flags are the backout: set `JOURNAL_USER_MGMT_ENABLED=false` to instantly fall back to demo flows (no schema rollback).
* To invalidate all sessions: admin script sets `revoked_at` for all **active** `user_sessions`.

---

## Codex “one-liners” you can reuse

**Ask codex to generate migration from models (if you prefer autogen):**

```bash
alembic -c apps/api/alembic.ini revision --autogenerate -m "users + user_sessions"
alembic -c apps/api/alembic.ini upgrade head
```

**Security checklist before merging any auth PR:**

```bash
codex checklist run security <<'SEC'
- Secrets from env; no new hardcoded secrets.
- Rate limiting on /auth endpoints present.
- Refresh rotation implemented; old refresh unusable post-rotation.
- Logout revokes session.
- JWT 'typ' validated ('access' vs 'refresh'); audience checked.
- CSP unchanged or tightened; no unsafe-inline introduced.
- Tests passing: unit, integration, e2e on auth flows.
SEC
```

---

## Small reconciliation notes (so nothing slips)

* **Models location:** use `apps/api/app/infra/models.py` (as in your docs). If you had already created `models_user.py` in a prior branch, codex can merge them back into `models.py` to avoid dual sources of truth.
* **Naming:** `UserSession` vs `RefreshSession`—choose one (I recommend `UserSession`) and keep it consistent across schema, repo, and tests.
* **Demo auth:** keep demo endpoints callable when `JOURNAL_USER_MGMT_ENABLED=false` to preserve local workflows while you roll out.
* **Rotation grace:** we’re using **no grace** for simplicity and security (old refresh invalid immediately). If you want a 10s grace later, we’ll add a scheduled revoke in M4.

---

### Answer to the question:

**Yes—open the docs PR now.** Then execute the branches/PRs above in the exact order. No stash restoration into working branches; land any stash to `wip/agent-stash-landing` only for inspection. Once M1 merges to staging with flags on, I’ll green-light M2 (passkeys) and M4 (cookie refresh) as separate tracks.

