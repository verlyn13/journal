# Universal Auth Deployment Guide

Complete implementation guide for deploying the Journal API with Infisical Universal Auth and GitHub OIDC authentication.

## 🎯 Overview

This deployment uses:
- **Universal Auth** for runtime application authentication (token-service@journal)
- **Universal Auth** for key rotation operations (rotator@ops)  
- **GitHub OIDC** for CI/CD authentication (ci@github)
- **Change Requests** for production write protection
- **Path-level policies** for least-privilege access control

## 📋 Prerequisites

1. **Infisical Instance**: Access to `https://secrets.jefahnierocks.com`
2. **Organization Access**: Admin access to organization `admin-org-v-ybx` (ID: `fd347373-e19c-49d1-baf4-7577c245555a`)
3. **Project Access**: Admin access to project `journal` (ID: `d01f583a-d833-4375-b359-c702a726ac4d`)
4. **Infisical CLI**: Version 0.42.1+ installed

## 🚀 Deployment Steps

### Step 1: Create Organization Identities

Navigate to: `https://secrets.jefahnierocks.com` → Organization → Identities

#### Create token-service@journal
```yaml
Name: token-service@journal
Description: Runtime identity for Journal API to read keys and secrets
Organization Role: Member
Authentication Method: Universal Auth
Tags:
  - app: journal
  - purpose: token-service
  - owner: your-email@example.com
```

**Save these credentials securely** (use gopass or secure secret manager):
- `UA_CLIENT_ID_TOKEN_SERVICE`: `<generated-client-id>`
- `UA_CLIENT_SECRET_TOKEN_SERVICE`: `<generated-client-secret>`

#### Create rotator@ops
```yaml
Name: rotator@ops
Description: Operational identity for key rotation under Change Requests
Organization Role: Member
Authentication Method: Universal Auth
Tags:
  - app: journal
  - purpose: rotator
  - owner: your-email@example.com
```

**Save these credentials securely**:
- `UA_CLIENT_ID_ROTATOR`: `<generated-client-id>`
- `UA_CLIENT_SECRET_ROTATOR`: `<generated-client-secret>`

#### Create ci@github
```yaml
Name: ci@github
Description: GitHub Actions CI identity; read-only per environment
Organization Role: Member
Authentication Method: OIDC
OIDC Configuration:
  Issuer: https://token.actions.githubusercontent.com
  Discovery URL: https://token.actions.githubusercontent.com/.well-known/openid-configuration
  Subjects:
    - repo:verlyn13/journal:ref:refs/heads/main
    - repo:verlyn13/journal:pull_request
  Audiences:
    - https://github.com/verlyn13/journal
Tags:
  - app: journal
  - purpose: ci
  - provider: github
```

### Step 2: Add Identities to Project

Navigate to: Project → Access Control → Add Identities

```yaml
Project Role Assignments:
  - token-service@journal → role: viewer (read-only base)
  - rotator@ops → role: no-access (use policies for exact permissions)
  - ci@github → role: viewer (read-only base)
```

### Step 3: Configure Policies

Navigate to: Project → Change Management → Policies

Create these policies (see `docs/infisical-identities-manifest.yml` for complete specifications):

#### prod-auth-write-protection
- Environment: prod
- Path: /auth/*
- Action: write
- Effect: deny
- Condition: change_request=required

#### prod-private-key-protection  
- Environment: prod
- Path: /auth/jwt/private
- Action: read
- Effect: allow for token-service-journal, rotator-ops
- Effect: deny for all others

#### public-jwks-access
- Environment: all
- Path: /auth/jwt/public_jwks
- Action: read
- Effect: allow for all identities

### Step 4: Configure Change Requests

Navigate to: Project → Change Management → Change Requests

Enable Change Requests for production with:
```yaml
Required Paths:
  - /auth/jwt/current_private_key
  - /auth/jwt/next_private_key
  - /auth/aes/active_kid
  - /auth/aes/enc_keys

Reviewers:
  - Primary: Admin
  - Secondary: auth-operator (create custom role if needed)
```

### Step 5: Configure Webhooks (Optional)

Navigate to: Project → Settings → Webhooks

Create webhooks for key rotation notifications:
```yaml
auth-key-rollover:
  Path: /auth/jwt/*
  URL: https://api.journal.com/internal/keys/changed
  Method: POST
  Headers:
    Authorization: Bearer ${WEBHOOK_SECRET}
    Content-Type: application/json

aes-active-kid-changed:
  Path: /auth/aes/active_kid
  URL: https://api.journal.com/internal/aes/activekid
  Method: POST
  Headers:
    Authorization: Bearer ${WEBHOOK_SECRET}
    Content-Type: application/json
```

### Step 6: Update Environment Configuration

#### Production Application Servers

```bash
# Required Infisical configuration
export INFISICAL_PROJECT_ID="d01f583a-d833-4375-b359-c702a726ac4d"
export INFISICAL_SERVER_URL="https://secrets.jefahnierocks.com"
export INFISICAL_ENVIRONMENT="prod"

# Universal Auth credentials (store securely)
export UA_CLIENT_ID_TOKEN_SERVICE="<your-token-service-client-id>"
export UA_CLIENT_SECRET_TOKEN_SERVICE="<your-token-service-client-secret>"

# Optional configuration
export INFISICAL_CACHE_TTL=300
export INFISICAL_TIMEOUT=30.0
export INFISICAL_MAX_RETRIES=3
```

#### GitHub Repository Secrets

No GitHub secrets needed! OIDC authentication eliminates stored CI secrets.

The CI pipeline now uses GitHub's OIDC token to authenticate directly with Infisical.

### Step 7: Deploy Application Code

The application now includes:

1. **Universal Auth Client** (`app/infra/secrets/universal_auth_client.py`)
   - Handles Universal Auth login and token refresh
   - Automatic token management with configurable TTL
   - Comprehensive error handling and telemetry

2. **Authentication Bootstrap** (`app/infra/secrets/auth_bootstrap.py`)
   - Initializes authentication on application startup
   - Handles both Universal Auth and static token fallback
   - Integrated with FastAPI lifespan events

3. **Updated Infisical Client** (`app/infra/secrets/infisical_client.py`)
   - Compatible with both Universal Auth and static tokens
   - Automatic authentication detection and handling

### Step 8: Update Application Startup

Integrate authentication bootstrap into your FastAPI application:

```python
from app.infra.secrets.auth_bootstrap import auth_lifespan

app = FastAPI(lifespan=auth_lifespan)
```

Or manually ensure authentication:

```python
from app.infra.secrets.auth_bootstrap import ensure_authenticated

async def startup_event():
    success = await ensure_authenticated()
    if not success:
        logger.error("Failed to initialize authentication")
        # Handle as appropriate for your deployment
```

### Step 9: Validate Setup

Use the validation script to test your configuration:

```bash
# Set environment variables
export INFISICAL_PROJECT_ID="d01f583a-d833-4375-b359-c702a726ac4d"
export INFISICAL_SERVER_URL="https://secrets.jefahnierocks.com"
export INFISICAL_ENVIRONMENT="prod"
export UA_CLIENT_ID_TOKEN_SERVICE="your-client-id"
export UA_CLIENT_SECRET_TOKEN_SERVICE="your-client-secret"

# Run validation
./scripts/validate-infisical-setup.sh
```

### Step 10: Run Migration

After validation passes, run the migration to populate secrets:

```bash
# Dry run first
uv run python -m app.scripts.migrate_to_infisical migrate --dry-run

# Full migration
uv run python -m app.scripts.migrate_to_infisical migrate
```

## 🔐 Security Benefits

This setup provides:

1. **No Long-Lived Secrets**: Universal Auth and OIDC use short-lived tokens
2. **Least Privilege**: Path-level policies with exact permissions
3. **Change Control**: Production writes require Change Request approval
4. **Audit Trail**: Complete audit log of all authentication and secret access
5. **Zero CI Secrets**: GitHub OIDC eliminates stored CI/CD secrets
6. **Automatic Rotation**: Token refresh handled automatically by the application

## 🔄 Operational Procedures

### Key Rotation (Production)

1. **Create Change Request** for key rotation in Infisical
2. **Get Approval** from designated reviewers
3. **Use rotator@ops identity** during approved CR window:
   ```bash
   export UA_CLIENT_ID_ROTATOR="your-rotator-client-id"
   export UA_CLIENT_SECRET_ROTATOR="your-rotator-client-secret"
   
   # Authenticate for rotation
   infisical login --method universal-auth \
     --client-id "$UA_CLIENT_ID_ROTATOR" \
     --client-secret "$UA_CLIENT_SECRET_ROTATOR" \
     --silent --plain
   
   # Perform rotation operations
   uv run python -m app.scripts.rotate_keys
   ```

### Credential Rotation

- **Universal Auth credentials**: Rotate quarterly (90 days)
- **Application tokens**: Refresh automatically (daily/hourly)
- **Change Request approval**: Required for all production key changes

### Monitoring

Monitor these metrics:
- Authentication success/failure rates
- Token refresh frequency and success
- Change Request approval times
- Secret access patterns and anomalies

## 🆘 Troubleshooting

### Common Issues

1. **"OIDC login failed"** in CI:
   - Check GitHub OIDC subjects match your repository
   - Verify audiences include your repository URL
   - Ensure ci@github identity is added to project

2. **"Universal Auth login failed"** in runtime:
   - Verify client ID/secret are correct
   - Check token-service@journal identity permissions
   - Ensure identity is added to project with viewer role

3. **"Permission denied"** during secret access:
   - Check path-level policies match secret paths
   - Verify environment (prod/staging/dev) is correct
   - Review identity role assignments

### Debug Mode

Enable debug logging:
```bash
export LOG_LEVEL=DEBUG
export INFISICAL_LOG_LEVEL=debug
```

### Health Checks

Check authentication health:
```bash
curl http://localhost:8000/api/v1/monitoring/health
```

## 📞 Support

For issues:
1. Check validation script output: `./scripts/validate-infisical-setup.sh`
2. Review application logs with `LOG_LEVEL=DEBUG`
3. Consult Infisical documentation: https://infisical.com/docs
4. Review the complete manifest: `docs/infisical-identities-manifest.yml`