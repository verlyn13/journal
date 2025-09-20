Yes—kick off **M1.T1 (models + migration)** now. Here’s the exact, copy-paste runbook for the codex CLI session, including the diffs, tests, migration, and the PR template. Keep everything behind `JOURNAL_USER_MGMT_ENABLED`.

---

# M1.T1 — Users & Sessions Schema (with migration)

## 1) Create the branch and set flags

```bash
git checkout -b feat/auth-M1.T1-users-sessions

# Ensure flags exist; no behavior change yet
mise env set JOURNAL_USER_MGMT_ENABLED=false
```

## 2) Tell codex what to implement (single edit brief)

```bash
codex edit <<'BRIEF'
Goal: Add persistent User and UserSession models and an Alembic migration; add a tiny unit test.
Repo layout conventions:
- Centralize models in apps/api/app/infra/models.py (do not create new files unless needed).
- Ensure models are imported on app startup so Alembic "sees" them.
- Migration path: apps/api/alembic/versions/*.py (use a 20250909_* filename).
- Do NOT change runtime logic yet; just schema & unit test. Keep fully compatible with current code while flag stays off.

Implement:
1) apps/api/app/infra/models.py
   - Add:
     class User(SQLModel, table=True):
       id UUID PK default uuid4, email unique not null (index), username optional (index),
       password_hash optional, is_active bool default True, is_verified bool default False,
       roles JSON list default ["user"], created_at, updated_at
     class UserSession(SQLModel, table=True):
       id UUID PK default uuid4, user_id FK users.id (index, not null),
       refresh_id UUID unique (index) default uuid4,
       user_agent str?, ip_address str?,
       issued_at, last_used_at, expires_at, revoked_at?
   - Keep existing imports and style. Use SQLModel Field/Column/JSON appropriately.

2) Import models somewhere that already runs at startup (e.g., apps/api/app/__init__.py or main app module) to register them for Alembic autogenerate.

3) Create Alembic migration file apps/api/alembic/versions/20250909_0001_users_sessions.py:
   - Create "users" and "user_sessions" tables as above (Postgres types; JSONB for roles).
   - Down migration drops both tables.

4) Unit test apps/api/tests/unit/test_user_model.py:
   - Construct a User(email="x@example.com"); assert defaults: is_active True, is_verified False, "user" in roles.

Acceptance:
- alembic upgrade head succeeds
- pytest -q apps/api/tests/unit/test_user_model.py passes
- No other files changed; no endpoint/runtime changes.

Notes:
- Do not modify settings or flags beyond imports needed for the model registration.
BRIEF
```

## 3) Generate/verify the migration and run unit test

```bash
# If codex created the migration, apply it; if not, autogenerate then review:
alembic -c apps/api/alembic.ini revision --autogenerate -m "users + user_sessions" || true

# Always upgrade to ensure it’s valid
alembic -c apps/api/alembic.ini upgrade head

# Run the unit test
pytest -q apps/api/tests/unit/test_user_model.py
```

> If autogenerate includes unrelated churn, open the migration file and trim it to only the two new tables.

## 4) Open the PR

```bash
codex open-pr \
  --base main \
  --head feat/auth-M1.T1-users-sessions \
  --title "feat(auth): add User & UserSession models + migration (M1.T1)" \
  --labels auth,db,migrations,backend \
  --body "$(cat <<'MD'
### What
- Adds `User` and `UserSession` models to `apps/api/app/infra/models.py`.
- Introduces Alembic migration `users` + `user_sessions`.
- Adds unit test for default `User` values.

### Why
Foundation for persistent identities and server-side refresh sessions.

### Guardrails
- Pure schema + unit test; **no runtime behavior change**.
- Feature flags remain unchanged (`JOURNAL_USER_MGMT_ENABLED=false`).

### Validation
- `alembic upgrade head` ✅
- `pytest -q apps/api/tests/unit/test_user_model.py` ✅

### Follow-ups
- M1.T2: register/verify/login (behind flag)
- M1.T3: refresh rotation + revocation (behind flag)
MD
)"
```

---

## Reviewer checklist (include this in PR comment)

* [ ] Only `models.py`, new migration, and new unit test changed.
* [ ] Migration creates exactly `users` and `user_sessions` (no collateral diffs).
* [ ] Fields match plan: unique email, JSONB roles, FK user\_id, unique refresh\_id.
* [ ] `alembic upgrade head` on a clean DB succeeds.
* [ ] Unit test passes locally and in CI.

---

## Backout plan

* If anything looks off: `alembic downgrade -1` and close the PR. No feature flags affected.

---

If you want, I can immediately queue **M1.T2 (register/verify/login)** after this PR is opened—just say the word and I’ll provide the next codex brief and test harness.

