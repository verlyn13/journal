---
id: infisical-secret-paths-setup
title: Infisical Secret Paths Configuration Guide
description: This guide implements the exact secret taxonomy from the token enhancement
  plan for the Journal API's Infisical integration.
type: api
created: '2025-09-17'
updated: '2025-09-17'
author: Journal Team
tags:
- /
- home
- verlyn13
- projects
- journal
priority: 2
status: current
visibility: public
schema_version: v1
version: 1.0.0
---

# Infisical Secret Paths Configuration Guide

This guide implements the exact secret taxonomy from the token enhancement plan for the Journal API's Infisical integration.

## 1. Secret Path Structure

Create these paths in Infisical for each environment (dev/staging/prod):

### 1.1 JWT Signing Keys
```
/auth/jwt/current_private_key    # EdDSA private key (PEM or JWK format)
/auth/jwt/next_private_key       # Pre-published "next" key for rotation
/auth/jwt/public_jwks            # Public JWKS JSON (served by API)
```

### 1.2 AES Encryption Keys  
```
/auth/aes/enc_keys               # JSON map: {"kid": "base64url_key", ...}
/auth/aes/active_kid             # String: currently active key ID
```

### 1.3 OAuth Provider Secrets
```
/auth/oauth/google/client_id
/auth/oauth/google/client_secret
/auth/oauth/github/client_id
/auth/oauth/github/client_secret
```

### 1.4 Email Authentication (if using magic links)
```
/auth/email/smtp_host
/auth/email/smtp_port
/auth/email/smtp_user
/auth/email/smtp_password
/auth/email/from_address
```

### 1.5 Service Identities
```
/services/<service_name>/identity   # Machine identity configuration
```

## 2. Tagging Strategy

Apply these tags to secrets for policy enforcement:

- `auth` - All authentication-related secrets
- `crypto` - Cryptographic keys (JWT, AES)
- `rotation` - Secrets requiring rotation
- `prod` / `staging` / `dev` - Environment tags
- `sensitive` - High-security secrets (private keys)

## 3. Machine Identities Configuration

### 3.1 Create Machine Identities

Create these identities in Infisical:

#### token-service@api
- **Purpose**: Token service that reads keys for signing/verification
- **Permissions**: 
  - READ `/auth/jwt/*`
  - READ `/auth/aes/*`
  - READ `/auth/oauth/*`
- **Environments**: dev, staging, prod

#### rotator@ops
- **Purpose**: Key rotation service
- **Permissions**:
  - WRITE `/auth/jwt/*` (via Change Requests only in prod)
  - WRITE `/auth/aes/*` (via Change Requests only in prod)
- **Environments**: dev, staging, prod

#### web@frontend
- **Purpose**: Frontend service (minimal access)
- **Permissions**: None (API handles all token operations)
- **Environments**: dev, staging, prod

## 4. Access Control Policies

### 4.1 Production Environment Policies

Create these policies in Infisical (Change Management → Policies):

```yaml
# Policy: Deny Direct Writes to Auth Secrets
name: "auth-write-protection"
environment: "prod"
rules:
  - path: "/auth/*"
    action: "write"
    effect: "deny"
    conditions:
      - type: "change_request"
        value: "required"
    exceptions:
      - identity: "rotator@ops"
        during: "rotation_window"

# Policy: Protect Private Keys
name: "private-key-protection"
environment: "prod"
rules:
  - path: "/auth/jwt/*private*"
    action: "read"
    effect: "allow"
    identities:
      - "token-service@api"
      - "rotator@ops"
  - path: "/auth/jwt/*private*"
    action: "read"
    effect: "deny"
    identities: ["*"]

# Policy: Public JWKS Access
name: "public-jwks-access"
environment: "all"
rules:
  - path: "/auth/jwt/public_jwks"
    action: "read"
    effect: "allow"
    identities: ["*"]
```

### 4.2 Change Request Configuration

Enable Change Requests for production `/auth/*` paths:

1. Go to **Change Management → Change Requests**
2. Enable for `prod` environment
3. Set reviewers:
   - Primary: Admin role
   - Secondary: auth-operator role (create custom role)
4. Configure paths requiring approval:
   - `/auth/jwt/current_private_key`
   - `/auth/jwt/next_private_key`  
   - `/auth/aes/active_kid`
   - `/auth/aes/enc_keys`

## 5. Webhook Configuration

### 5.1 Key Rotation Webhook

```yaml
name: "auth-key-rollover"
environment: "prod"
secret_path: "/auth/jwt/*"
url: "https://api.journal.com/internal/keys/changed"
method: "POST"
headers:
  Authorization: "Bearer ${WEBHOOK_SECRET}"
  Content-Type: "application/json"
```

### 5.2 AES Key Change Webhook

```yaml
name: "aes-active-kid-changed"
environment: "prod"
secret_path: "/auth/aes/active_kid"
url: "https://api.journal.com/internal/aes/activekid"
method: "POST"
headers:
  Authorization: "Bearer ${WEBHOOK_SECRET}"
  Content-Type: "application/json"
```

## 6. Service Tokens (CI/Bootstrap Only)

Create minimal-privilege service tokens:

### 6.1 CI Pipeline Token
```yaml
name: "ci-pipeline-token"
environment: "prod"
secret_path: "/auth/oauth/*"  # Only OAuth secrets for builds
valid_until: "30 days"
permissions: ["read"]
```

### 6.2 Bootstrap Token
```yaml
name: "bootstrap-token"
environment: "dev"
secret_path: "/"
valid_until: "7 days"
permissions: ["read"]
```

## 7. Initial Secret Values

### 7.1 Generate Initial JWT Keys

```bash
# Generate EdDSA (Ed25519) key pair
openssl genpkey -algorithm ED25519 -out current_private.pem
openssl pkey -in current_private.pem -pubout -out current_public.pem

# Generate next key pair
openssl genpkey -algorithm ED25519 -out next_private.pem
openssl pkey -in next_private.pem -pubout -out next_public.pem

# Create JWKS from public keys
python scripts/generate_jwks.py current_public.pem next_public.pem > jwks.json
```

### 7.2 Generate AES Keys

```python
import secrets
import base64
import json

# Generate AES-256 keys
keys = {
    "2025-01": base64.urlsafe_b64encode(secrets.token_bytes(32)).decode(),
    "2025-02": base64.urlsafe_b64encode(secrets.token_bytes(32)).decode(),
}

# Store as JSON
enc_keys = json.dumps(keys)
active_kid = "2025-01"
```

### 7.3 Store in Infisical

```bash
# Using Infisical CLI
infisical secrets set --env=prod --path=/auth/jwt current_private_key="$(cat current_private.pem)"
infisical secrets set --env=prod --path=/auth/jwt next_private_key="$(cat next_private.pem)"
infisical secrets set --env=prod --path=/auth/jwt public_jwks="$(cat jwks.json)"
infisical secrets set --env=prod --path=/auth/aes enc_keys='{"2025-01":"...","2025-02":"..."}'
infisical secrets set --env=prod --path=/auth/aes active_kid="2025-01"
```

## 8. Rotation Procedures

### 8.1 JWT Key Rotation (60-day cadence)

1. **Day 0**: Generate new key pair, store as `next_private_key`
2. **Day 0-7**: Publish both keys in JWKS
3. **Day 7**: Start signing with `next_private_key`
4. **Day 7+20min**: Move `next` → `current`, remove old from JWKS
5. **Day 14**: Generate new `next_private_key` for next rotation

### 8.2 AES Key Rotation (90-day cadence)

1. **Day 0**: Add new key to `/auth/aes/enc_keys`
2. **Day 0**: Update `/auth/aes/active_kid` to new key
3. **Day 0-2**: Support decryption with both keys
4. **Day 2**: Background job re-encrypts with new key
5. **Day 7**: Remove old key from `enc_keys`

## 9. Monitoring & Compliance

### 9.1 Key Metrics to Track

- JWT key age (warn at 50 days, critical at 55 days)
- AES key age (warn at 80 days, critical at 85 days)
- Failed rotation attempts
- Webhook delivery failures
- Change Request approval times

### 9.2 Audit Requirements

- Enable audit logs with 90-day retention
- Export critical events (`/auth/*` changes) to SIEM
- Alert on:
  - Unauthorized access attempts to private keys
  - Failed Change Request approvals
  - Service token expiration warnings (7 days before)

## 10. Implementation Checklist

- [ ] Create all `/auth/*` secret paths in Infisical
- [ ] Apply appropriate tags to all secrets
- [ ] Create Machine Identities (token-service, rotator, web)
- [ ] Configure access control policies
- [ ] Enable Change Requests for production
- [ ] Set up webhooks for key rotation events
- [ ] Create Service Tokens for CI/CD
- [ ] Generate and store initial key values
- [ ] Configure audit log retention and export
- [ ] Test rotation procedures in staging
- [ ] Document break-glass procedures
- [ ] Schedule first rotation (calendar reminder)

## 11. Break-Glass Procedure

In case of Infisical unavailability:

1. Use cached keys from Redis (5-minute TTL)
2. Fall back to encrypted backup in secure storage
3. Use Service Token to fetch via CLI (if API is down)
4. As last resort, use offline encrypted backup with HSM

## 12. Security Considerations

- Never log or print private key material
- Use Change Requests for all production key changes
- Rotate immediately if compromise suspected
- Monitor for reuse of old keys after rotation
- Alert on any direct write attempts to `/auth/*` in prod