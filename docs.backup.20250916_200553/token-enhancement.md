# 0) Design goals

* **First-party web:** cookie-based session is primary; access tokens are short-lived and optional for your own UI.
* **Strict rotation:** rotating **refresh tokens** and **signing keys** on fixed cadences with overlap.
* **No static long-lived power tokens** in code/containers; use **Machine Identities** + least-privilege **Service Tokens** only for bootstraps/CI.
* **Tamper-evident & auditable:** hash-chained audit log + Infisical audit history + change requests for secrets under `/auth/*`.

---

# 1) Token model (four classes)

| Token              | Where used                                    | Format                              | TTL                            | Storage at rest                         | Rotation                                                  |
| ------------------ | --------------------------------------------- | ----------------------------------- | ------------------------------ | --------------------------------------- | --------------------------------------------------------- |
| **Session Cookie** | First-party browser → your API                | Opaque, random                      | 15–30 min idle, hard cap ≤12 h | Redis (session store)                   | Rotated on privilege-change, sign-in, sensitive action    |
| **Access JWT**     | API calls from first-party web or trusted SPA | JWT (RS256/EdDSA), **aud**=api      | 5–15 min                       | Not persisted (issued on demand)        | Key rotation via JWKS; clients auto-refresh               |
| **Refresh Token**  | Exchange for new access JWT                   | Opaque random; **one-time-use**     | 7–30 days (sliding)            | AES-GCM envelope in DB/Redis            | **Rotating**; reuse detection (your TokenRotationService) |
| **M2M Token**      | Service↔Service                               | JWT (mTLS optional) or short opaque | 5–30 min                       | None (fetched JIT via Machine Identity) | JWKS rotation + identity-scoped access                    |

**Principle:** Your UI never stores OAuth provider tokens long-term; you immediately exchange for **your** session + refresh token. OAuth tokens are “portable,” your **session is primary**.

---

# 2) Infisical layout & controls

## 2.1 Secret taxonomy (use **Environments**, **Tags**, and **Secret Paths**)

Use these **paths** so Policy/Change Requests can target clean scopes:

```
/auth/jwt/current_private_key       # PEM or JWK (private)
 /auth/jwt/next_private_key         # pre-published “next”
 /auth/jwt/public_jwks              # JWKS JSON (public set served by your app)
/auth/aes/enc_keys                  # JSON map {kid: base64urlkey, ...}
/auth/aes/active_kid                # string kid
/auth/oauth/<provider>/client_id
/auth/oauth/<provider>/client_secret
/auth/email/smtp_*                  # if needed for magic links
```

**Tags**: `auth`, `crypto`, `rotation`, `prod|staging|dev`.
**Version retention** (Settings → Secrets Management): keep default `10` (safe overlap/rollback).
**Enforce Capitalization**: ON (prevents key drift).
**Allow Secret Sharing**: OFF (prod).

## 2.2 Access Control (least privilege)

* **Project Roles**: keep defaults; create a **custom “auth-operator” role** that can only:

  * read `/auth/jwt/*` public JWKS,
  * write `/auth/jwt/*` under **Change Requests only**,
  * read `/auth/aes/*`, not write.
* **Machine Identities**:

  * `token-service@api` → **read** `/auth/jwt/*`, `/auth/aes/*`, `/auth/oauth/*`.
  * `web@frontend` → **read** only what’s needed (usually none; the API issues tokens).
  * `rotator@ops` → **write** `/auth/jwt/*`, `/auth/aes/*` but **only via Change Requests**.
* **Policies** (Change Management → Policies):

  * Deny direct writes to `/auth/*` unless **Change Request** approved in `prod`.
  * Deny read of private keys to anything except `token-service@api` and `rotator@ops`.

## 2.3 Service Tokens (bootstrap only)

* Create **1 Service Token per CI pipeline** with:

  * **Environment**: the exact env (dev/staging/prod).
  * **Secret Path**: minimal (`/auth/oauth/*` for build-time, not `/auth/jwt/*`).
  * **Valid Until**: ≤ 30 days; diarize rotation; store the token **outside** Infisical (break-glass doc).
* Never mount Service Tokens into runtime containers; they’re for fetch-and-exit in CI.

## 2.4 Webhooks (Settings → Webhooks)

Create two webhooks:

1. **`auth-key-rollover`** (env=prod, path `/auth/jwt/*`):

   * Triggers **your API** endpoint `POST /internal/keys/changed`.
   * Your API purges signing-key caches and re-reads Infisical.

2. **`aes-active-kid-changed`** (env=prod, path `/auth/aes/active_kid`):

   * Triggers `POST /internal/aes/activekid`.
   * Your API updates the **active KID** in the `TokenCipher`.

## 2.5 Change Requests (Change Management)

* Require **Change Requests** for:

  * Writing `/auth/jwt/current_private_key`,
  * Writing `/auth/jwt/next_private_key`,
  * Switching `/auth/aes/active_kid`.
* Reviewer: you (Admin) + a second “auth-operator” for four-eyes in prod.

---

# 3) App surfaces (what your services expose)

## 3.1 JWKS endpoint (public)

* `GET /.well-known/jwks.json` → publishes **both** current and next public keys:

```json
{ "keys": [ { "kty":"RSA", "kid":"2025-09-01", ... }, { "kty":"RSA", "kid":"2025-10-01", ... } ] }
```

* Your API **reads private keys** (`/auth/jwt/*`) from Infisical on boot and upon `auth-key-rollover` webhook.

## 3.2 Session cookie

* `Set-Cookie: sid=<opaque>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=1800`
* Server-side store: `redis.setex("sess:<id>", ttl, json_blob)`
* Rotate on privilege elevation and periodically (sliding window).

## 3.3 Refresh token (one-time use)

* Stored server-side as AES-GCM envelope (you already have `TokenCipher`).
* **Redis reuse detector** (you implemented): `used_refresh:<sha256(token)>` w/ 24h TTL.
* On refresh:

  1. mark old as used,
  2. mint new refresh (new id),
  3. mint new access JWT,
  4. update session.

## 3.4 Access JWT

* TTL 5–15 min, **aud**=`api`, **iss**=`https://your-issuer`.
* Signed with **current** private key (KID=“current”).
* Clients verify via JWKS; your own API trusts your issuer only.

## 3.5 M2M

* Each service runs under an **Infisical Machine Identity** and exchanges that for a **short-lived M2M token** from your token service.
* Scope M2M JWTs with fine-grained claims: `{"sub":"svc:console","scopes":["docs.read"],"env":"prod"}` and 5–30 min TTL.

---

# 4) Rotation cadences & overlaps (copy/paste table)

| Item                    | Cadence                      | Overlap window                                              | Mechanism                                                                 |
| ----------------------- | ---------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Access JWT key**      | every **30–90 days**         | keep **current+next** in JWKS for ≥ `max(access_ttl)` + 10m | Infisical `/auth/jwt/current_private_key` + `/next_private_key` + webhook |
| **AES-GCM active\_kid** | **90 days** (or usage-based) | load both old+new for 24–48h reads                          | Update `/auth/aes/active_kid` + webhook                                   |
| **Refresh token**       | per refresh (sliding)        | N/A (single-use; no overlap)                                | Reuse detector + revoke sessions                                          |
| **Service Tokens (CI)** | ≤ **30 days**                | 24h grace (two tokens valid)                                | Staggered issue; CI variables roll                                        |
| **M2M tokens**          | 5–30 min                     | None                                                        | Reissue from token service                                                |
| **Session cookie**      | 15–30 min idle, ≤12 h hard   | N/A                                                         | Re-issue on activity                                                      |

---

# 5) Exact Infisical-aligned runbooks

## 5.1 JWT signing-key rollover (zero downtime)

1. **Change Request**: add `/auth/jwt/next_private_key` (PEM/JWK, `kid=YYYY-MM-DD`).
2. **Deploy**: your app pulls **public** from Infisical and publishes JWKS with **both** keys (`current`,`next`).
3. **Flip issuer**: start issuing access JWTs signed with **next** key (config switch in app).
4. Wait `max(access_ttl)+10m`.
5. **Change Request**: move `next_private_key` → `current_private_key` (rename or swap).
6. **Webhook** fires → app reloads key.
7. Remove old key from JWKS in the next deploy.

> If anything misbehaves, revert by re-setting `current_private_key` to the prior one (versions retained = 10).

## 5.2 AES-GCM key rotation

1. **Change Request**: write new K/V into `/auth/aes/enc_keys` (add `{ "2025-10":"<b64url>" }`).
2. **Change Request**: set `/auth/aes/active_kid = "2025-10"`.
3. Webhook `aes-active-kid-changed` → token service starts encrypting with new kid; **decryption** still tries old+new for 24–48h.
4. Background re-encrypt (optional): rewrap stored envelopes with new kid.
5. Remove old kid after the overlap.

---

# 6) Concrete data & code shapes you can drop in

## 6.1 JWKS (public) example

```json
{
  "keys": [
    {
      "kty": "OKP",
      "crv": "Ed25519",
      "kid": "2025-09-01",
      "use": "sig",
      "alg": "EdDSA",
      "x": "…public…"
    },
    {
      "kty": "OKP",
      "crv": "Ed25519",
      "kid": "2025-10-01",
      "use": "sig",
      "alg": "EdDSA",
      "x": "…public…"
    }
  ]
}
```

> Use Ed25519 (EdDSA) or RSA-PSS (PS256). Keep both keys published during overlap.

## 6.2 AES-GCM envelope (you already have this)

```json
{"v":1,"kid":"2025-10","iv":"…","ct":"…"}
```

* Reads try `{active_kid} + {previous_kid}` for 24–48h.

## 6.3 Redis keys (refresh reuse & sessions)

```
used_refresh:<sha256(bearer)>  -> "1" (TTL 86400)
sess:<opaque_session_id>       -> JSON (TTL session idle)
```

## 6.4 Policy sketch (informal)

* **Deny write** to `/auth/*` **unless** request flows through **Change Requests** and actor in role `auth-operator` on `prod`.
* **Allow read** of `/auth/jwt/public_jwks` for everyone.
* **Allow read** of `/auth/jwt/*` (private) only for `token-service@api` and `rotator@ops`.
* **Deny sharing** of `/auth/*` secrets (Settings toggle: “Allow Secret Sharing” OFF in prod).

---

# 7) Using your UI features (mapping)

* **Secrets → Create Secrets**: create `/auth/*` keys and values per env; apply `auth`,`rotation` tags.
* **Secret Syncs**: optional—use to mirror **public JWKS** to a CDN bucket if desired; otherwise skip.
* **Integrations (Infrastructure)**:

  * **Kubernetes / Infisical Agent/Operator**: sidecar fetch for the **token service** only (keeps keys out of images).
  * **Docker Compose**: infisical CLI at container start → write keys to tmpfs or env; app reads on boot.
* **Change Management → Policies**: encode the rules above so **prod** requires approvals.
* **Access Control → Machine Identities**: add the three identities noted; scope to env and paths.
* **Service Tokens**: create minimal scopes for CI; set **Valid Until**; diarize rotation.
* **Audit Logs**: set retention; export via **Webhooks** to your logging stack.

---

# 8) Security-critical behaviors (bake into tests)

* **Refresh reuse** → immediate user-wide token revocation (you implemented).
* **Step-up WebAuthn** on sensitive actions (you implemented)—treat success as “recent authentication” for 5 min.
* **Cookie flags**: `HttpOnly, Secure, SameSite=Lax` (or `Strict` for auth-only pages).
* **OIDC**: PKCE required; nonce validated; PAR used when supported.
* **SQLAlchemy 2.x**: `select()/scalars()` only.
* **Email auth artifacts**: SPF/DKIM/DMARC pass for magic links; MJML compiled in CI (don’t template at runtime).

---

# 9) Suggested cadences (final concrete defaults)

* **Access JWT**: 10 min TTL (SPA/API), refresh at 7–8 min.
* **Refresh token**: 14 days sliding, single-use, rotate every refresh.
* **Session**: 30 min idle, 12 h absolute.
* **JWT keys**: rotate every 60 days with ≥20 min overlap (≥ `max(access_ttl)` + jitter).
* **AES-GCM active\_kid**: 90 days or **earlier if usage high**; 48 h read-overlap.
* **CI Service Tokens**: ≤30 days; keep old+new valid for 24 h during switch.

---

# 10) “Do it now” checklist

* [ ] Create `/auth/jwt/current_private_key`, `/auth/jwt/next_private_key`, `/auth/jwt/public_jwks`, `/auth/aes/enc_keys`, `/auth/aes/active_kid` (prod/staging/dev), tag them.
* [ ] Add **Machine Identities** (`token-service@api`, `rotator@ops`, `web@frontend`) + **Policies** to gate `/auth/*`.
* [ ] Create **Webhooks** → your API (`/internal/keys/changed`, `/internal/aes/activekid`).
* [ ] Require **Change Requests** for `/auth/*` writes in prod.
* [ ] Publish **JWKS** with current+next; switch issuer to sign with “next”; after overlap, swap “next→current”.
* [ ] Turn on your **refresh reuse detector** in prod (enforce revoke + alert).
* [ ] Set **Audit Logs** retention; forward via webhook to SIEM/Loki.
