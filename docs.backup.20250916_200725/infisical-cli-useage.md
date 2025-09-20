# Infisical CLI Companion (for Token Handling & Rotation)

> Scope: only CLI features you listed (`login`, `init`, `run`, `export`, `secrets`, `user`, `vaults`) and the environment variables you provided.
> Assumption: **secret writes & key rotations** to `/auth/*` are approved via **Change Requests in the UI** (per your plan). The CLI is used here for **auth, fetch, runtime injection, verification, and CI/K8s ergonomics**.

---

## 0) Prereqs & Version Guards

```bash
# Point CLI to your self-hosted backend
export INFISICAL_API_URL="https://your-instance.com/api"

# Version behavior (from your doc):
# - cloud login flow needs CLI >= 0.4.0
# - manual API URL is required with older CLIs (< 0.4.0)
# Recommend: pin CLI >= 0.4.0 across your dev/CI images
```

**Security hardening for terminals** (avoid leaking “set secret” commands if you ever use them in the future):

```bash
# ~/.profile or shell rc
export HISTIGNORE="*infisical secrets set*:$DEFAULT_HISTIGNORE"
```

---

## 1) Authentication Patterns (choose one per context)

### A) Local development (interactive keyring)

```bash
infisical login
# Stores login in system keyring (per your doc)
```

### B) Machine identity (universal-auth)

```bash
# Clean token capture (prints token only)
export INFISICAL_TOKEN="$(
  infisical login \
    --method=universal-auth \
    --client-id="$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID" \
    --client-secret="$INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET" \
    --silent --plain
)"
```

### C) Kubernetes native auth

```bash
# Default service account token path is used unless you override it
export INFISICAL_MACHINE_IDENTITY_ID="mi-xxxxxxxx"
export INFISICAL_TOKEN="$(
  infisical login \
    --method=kubernetes \
    --machine-identity-id="$INFISICAL_MACHINE_IDENTITY_ID" \
    --silent --plain
)"
```

### D) Cloud native auth (Azure / AWS IAM / GCP)

```bash
# Azure (example)
export INFISICAL_MACHINE_IDENTITY_ID="mi-xxxxxxxx"
export INFISICAL_TOKEN="$(
  infisical login \
    --method=azure \
    --machine-identity-id="$INFISICAL_MACHINE_IDENTITY_ID" \
    --silent --plain
)"
```

### E) OIDC / JWT auth (federated)

```bash
# OIDC auth
export INFISICAL_MACHINE_IDENTITY_ID="mi-xxxxxxxx"
export INFISICAL_OIDC_AUTH_JWT="eyJ..."            # Provided by your IdP
export INFISICAL_TOKEN="$(
  infisical login \
    --method=oidc-auth \
    --machine-identity-id="$INFISICAL_MACHINE_IDENTITY_ID" \
    --oidc-jwt="$INFISICAL_OIDC_AUTH_JWT" \
    --silent --plain
)"
```

> **Tip:** For CI, prefer **machine identity** or **service token** (exported to `INFISICAL_TOKEN`). Disable CLI update checks for speed:

```bash
export INFISICAL_DISABLE_UPDATE_CHECK=true
```

---

## 2) Project Bootstrap

Initialize once per repo (safe to commit):

```bash
cd /path/to/project
infisical init
# Creates .infisical.json (git-committable, contains no secrets)
```

Recommended **directory conventions** (mirrors your plan):

```
/auth/jwt/current_private_key
/auth/jwt/next_private_key
/auth/jwt/public_jwks
/auth/aes/enc_keys
/auth/aes/active_kid
/auth/oauth/<provider>/client_id
/auth/oauth/<provider>/client_secret
```

> Creation/updates of these **secrets** are done via **UI Change Requests** as per your rotation policy. The CLI consumes them.

---

## 3) Runtime Injection (no secrets in images)

Use `infisical run` to **inject** environment variables and start your app in each environment. Your app can then read its config (`AUTH_ENC_KEYS`, `AUTH_ENC_ACTIVE_KID`, `JWKS_JSON`, etc.) from env.

### Node / nodemon (staging)

```bash
infisical run \
  --env=staging \
  --path=/auth \
  -- nodemon apps/api/index.js
```

### Flask (prod)

```bash
infisical run \
  --env=prod \
  --path=/auth \
  -- flask run --host=0.0.0.0 --port=8080
```

### Spring Boot (dev)

```bash
infisical run \
  --env=dev \
  --path=/auth \
  -- ./mvnw spring-boot:run --quiet
```

> The CLI reads `INFISICAL_TOKEN` automatically (or accept `--token=<access-token>`).
> **Benefit:** during rotations, **no rebuild** is required; a restart re-reads fresh secrets.

---

## 4) Non-interactive Fetch (verification/observability)

### A) List secrets (for verification)

```bash
# Minimal read of /auth in prod (projectId required for machine identity flow)
infisical secrets \
  --projectId="$PROJECT_ID" \
  --env=prod \
  --recursive
# (Use in scripts to assert presence of /auth/jwt/* and /auth/aes/*)
```

### B) Export for offline checks / tooling

```bash
# Using service token
infisical export --token="$SERVICE_TOKEN"

# Using machine identity token
infisical export \
  --projectId="$PROJECT_ID" \
  --env=prod \
  --path=/auth
```

> Use `export` for **diagnostics** and **ad-hoc verification** (e.g., confirm that `/auth/aes/active_kid` changed, or that `public_jwks` contains both current+next keys during overlap). Do **not** persist exports in logs/artifacts.

---

## 5) CI Recipes

### A) Universal CI shim (bash)

```bash
set -euo pipefail
export INFISICAL_DISABLE_UPDATE_CHECK=true
export INFISICAL_API_URL="https://your-instance.com/api"

# Auth (pick one)
export INFISICAL_TOKEN="$(
  infisical login \
    --method=universal-auth \
    --client-id="${INFISICAL_UNIVERSAL_AUTH_CLIENT_ID}" \
    --client-secret="${INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET}" \
    --silent --plain
)"

# Start the service with injected secrets
infisical run \
  --projectId="$PROJECT_ID" \
  --env=prod \
  --path=/auth \
  -- ./scripts/start-service.sh
```

### B) Build-only jobs (no runtime secrets baked)

```bash
# Need only OAuth client id/secret for building an SDK?
export INFISICAL_TOKEN="$SERVICE_TOKEN"   # minimal scope path=/auth/oauth/*
infisical export \
  --projectId="$PROJECT_ID" \
  --env=prod \
  --path=/auth/oauth/myidp \
  > /tmp/oauth.json

# Consume, then delete /tmp/oauth.json
```

> Keep **Service Tokens** in CI <= 30 days, rotate on a schedule, and avoid mounting them in running workloads.

---

## 6) Kubernetes Patterns (without Operator)

> You can use the CLI inside a sidecar/init container to inject env at pod start.

**InitContainer example** (pseudo-yaml):

```yaml
initContainers:
  - name: infisical-init
    image: your/cli-image:with-infisical
    env:
      - name: INFISICAL_API_URL
        value: "https://your-instance.com/api"
      - name: INFISICAL_MACHINE_IDENTITY_ID
        valueFrom:
          secretKeyRef: { name: mi-config, key: machineIdentityId }
    volumeMounts:
      - { name: app-env, mountPath: /app/env }
    command:
      - /bin/sh
      - -lc
      - |
        export INFISICAL_TOKEN="$(infisical login --method=kubernetes --machine-identity-id="$INFISICAL_MACHINE_IDENTITY_ID" --silent --plain)"
        infisical export --projectId="$PROJECT_ID" --env=prod --path=/auth > /app/env/auth.json
```

**App container** then parses `/app/env/auth.json` into env at boot (or you can run the app with `infisical run` directly inside the container if that’s your preference).

> If you later adopt the **Infisical K8s Operator**, it can replace this with native secret injection. This CLI flow still works anywhere (including bare Docker).

---

## 7) Rotation Support (CLI roles in the runbooks)

Remember: **writes and key flips** are Change-Request-gated (UI). The CLI’s role in rotations:

### A) Pre-cutover verification

```bash
# Confirm next key exists in prod and JWKS includes current+next
infisical secrets --projectId="$PROJECT_ID" --env=prod --path=/auth/jwt --recursive
infisical export   --projectId="$PROJECT_ID" --env=prod --path=/auth/jwt/public_jwks > /tmp/jwks.json
jq '.keys[].kid' /tmp/jwks.json   # Expect: current + next KIDs
```

### B) Post-flip cache bust

Your **webhook** already notifies the API; for belts-and-suspenders, you can redeploy/restart with `infisical run` so the process **re-reads** secrets:

```bash
# Example: restart API with fresh env after key flip
infisical run --projectId="$PROJECT_ID" --env=prod --path=/auth -- systemctl restart your-api
```

### C) AES-GCM active\_kid check

```bash
infisical export --projectId="$PROJECT_ID" --env=prod --path=/auth/aes > /tmp/aes.json
jq -r '.active_kid' /tmp/aes.json
```

> Your token service should try **active\_kid + previous\_kid** for decryption during the overlap window.

---

## 8) Makefile Targets (quality of life)

```make
INFISICAL_API_URL ?= https://your-instance.com/api
PROJECT_ID        ?= your-project-id

.PHONY: infi-login
infi-login:
	@export INFISICAL_API_URL=$(INFISICAL_API_URL); \
	export INFISICAL_TOKEN="$$(infisical login --method=universal-auth \
	  --client-id="$${INFISICAL_UNIVERSAL_AUTH_CLIENT_ID}" \
	  --client-secret="$${INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET}" \
	  --silent --plain)"; \
	echo "INFISICAL_TOKEN acquired."

.PHONY: api-dev
api-dev: infi-login
	@infisical run --projectId=$(PROJECT_ID) --env=dev --path=/auth -- \
	  uv run fastapi dev apps/api/main.py

.PHONY: jwks-check
jwks-check:
	@infisical export --projectId=$(PROJECT_ID) --env=prod --path=/auth/jwt/public_jwks > .jwks.json
	@jq '.keys | length' .jwks.json
```

---

## 9) Cloudflare Access / custom headers (if fronted)

If your Infisical sits behind Cloudflare Access (or similar), pass headers via:

```bash
export INFISICAL_CUSTOM_HEADERS="Access-Client-Id=${CF_CLIENT_ID} Access-Client-Secret=${CF_CLIENT_SECRET}"
# The CLI will include these headers on requests
```

---

## 10) Troubleshooting Matrix

| Symptom                                | Likely Cause                                 | CLI Aid                                                                      |
| -------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------- |
| App still signs with old KID           | App not reloading secret cache               | Run with `infisical run` (fresh env) or hit your webhook endpoint manually   |
| Verifiers failing with “kid not found” | JWKS did not publish “next” before flip      | `infisical export --path=/auth/jwt/public_jwks` to confirm both keys present |
| Clients missing env in CI              | `INFISICAL_TOKEN` not set / expired          | Re-auth: `infisical login … --silent --plain` and rerun                      |
| K8s pod can’t login                    | Missing machine identity ID or SA token path | Set `INFISICAL_MACHINE_IDENTITY_ID`; verify default SA token path            |
| Slow CLI in CI                         | Update check                                 | `export INFISICAL_DISABLE_UPDATE_CHECK=true`                                 |

---

## 11) Minimal “golden flows” (copy/paste)

### Local dev, passkeys + token service

```bash
# one time
infisical login && infisical init

# start API with injected /auth/*
infisical run --env=dev --path=/auth -- uv run fastapi dev apps/api/main.py
```

### CI, machine identity

```bash
export INFISICAL_API_URL="https://your-instance.com/api"
export INFISICAL_DISABLE_UPDATE_CHECK=true
export INFISICAL_TOKEN="$(
  infisical login --method=universal-auth \
    --client-id="$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID" \
    --client-secret="$INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET" \
    --silent --plain
)"
infisical run --projectId="$PROJECT_ID" --env=prod --path=/auth -- ./scripts/start.sh
```

### Rotation verification (post-Change-Request)

```bash
# Confirm AES active_kid
infisical export --projectId="$PROJECT_ID" --env=prod --path=/auth/aes | jq -r '.active_kid'
# Confirm JWKS dual keys
infisical export --projectId="$PROJECT_ID" --env=prod --path=/auth/jwt/public_jwks | jq '.keys[].kid'
```

---

## 12) Guardrails & Reminders

* **Writes to `/auth/*`**: keep them gated via **Change Requests** in the UI (per your policy). Use the CLI here for **auth, fetch, inject, and verify**.
* **Never bake secrets** into images; always **inject at runtime** with `infisical run` or init-export + tmpfs.
* **Keep Service Tokens short-lived** and scoped (≤30 days). Prefer **Machine Identity** for runtime/CI.
* **Don’t log exports**; treat them as sensitive and ephemeral.
* **Rotate**: JWT signing keys (60d), AES active\_kid (90d or usage-based), CI Service Tokens (≤30d), refresh tokens (per issuance), sessions (on privilege change).

---

If you want this dropped into your repo, I can package it as:

* `docs/security/infisical_cli_playbook.md` (this doc),
* `scripts/infi_login.sh` (universal-auth helper),
* `Makefile` targets shown above, and
* a tiny `verify_rotation.sh` that runs the two verification checks and returns non-zero on mismatch.

