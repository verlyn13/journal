# Gopass Integration with Infisical Universal Auth

Complete guide for using gopass to securely manage Infisical Universal Auth credentials and other secrets for the Journal API.

## 🔐 Overview

The Journal API integrates with gopass for local secret management, providing:

- **Secure credential storage** using age encryption
- **Context-aware access control** (personal vs agent vs CI)
- **Automated environment setup** from gopass secrets
- **Credential rotation tracking** with audit trail
- **Git-backed version history** for all changes

## 📁 Secret Organization

Secrets are organized in gopass under `projects/journal/`:

```
projects/journal/
├── infisical/
│   ├── ua-client-id-token-service      # Runtime identity client ID
│   ├── ua-client-secret-token-service  # Runtime identity client secret
│   ├── ua-client-id-rotator           # Rotator identity client ID
│   ├── ua-client-secret-rotator       # Rotator identity client secret
│   ├── project-id                     # Infisical project ID
│   ├── server-url                     # Infisical server URL
│   ├── org-id                         # Organization ID
│   ├── org-slug                       # Organization slug
│   └── archive/                       # Old/rotated credentials
├── database/
│   ├── url                            # Async database URL
│   └── url-sync                       # Sync database URL
├── redis/
│   └── url                            # Redis connection URL
└── api-keys/
    ├── openai                         # OpenAI API key
    └── sentry-dsn                     # Sentry error tracking
```

## 🚀 Quick Start

### 1. Initial Setup

Store your Infisical Universal Auth credentials:

```bash
# Interactive setup
./scripts/setup-infisical-auth.sh setup

# You'll be prompted for:
# - token-service@journal client ID and secret
# - rotator@ops client ID and secret (optional)
```

### 2. Retrieve Credentials

View stored credentials (safely):

```bash
# Display credential status
./scripts/setup-infisical-auth.sh retrieve

# Get raw values for scripts
gopass show -o projects/journal/infisical/ua-client-id-token-service
```

### 3. Export to Environment

Generate environment variables:

```bash
# Generate export commands
./scripts/setup-infisical-auth.sh export

# Apply immediately to current shell
eval "$(./scripts/setup-infisical-auth.sh export)"
```

### 4. Test Authentication

Verify the credentials work:

```bash
# Test Universal Auth login
./scripts/setup-infisical-auth.sh test
```

## 🔄 Development Workflow

### Complete Environment Setup

The development environment script automatically loads all secrets from gopass:

```bash
# Generate .env file from gopass
./scripts/dev-environment.sh

# This creates/updates .env with:
# - Database URLs
# - Redis URL
# - Infisical configuration
# - Universal Auth credentials
# - API keys (if configured)
```

### Starting Development

```bash
# 1. Set up environment from gopass
./scripts/dev-environment.sh

# 2. Source the environment
source .env

# 3. Start services
docker-compose up -d postgres redis

# 4. Run the API
uv run uvicorn app.main:app --reload

# Or use the all-in-one script:
./scripts/run-dev.sh
```

## 🔐 Credential Management

### Storing New Secrets

```bash
# Store a new API key
gopass insert projects/journal/api-keys/new-service

# Store with specific value
echo "secret-value" | gopass insert -f projects/journal/database/password
```

### Rotating Credentials

When rotating Universal Auth credentials:

```bash
# Archive old and store new credentials
./scripts/setup-infisical-auth.sh rotate

# This will:
# 1. Archive existing credentials with timestamp
# 2. Prompt for new credentials
# 3. Store new credentials in standard location
```

### Checking Secret Age

```bash
# Audit all secrets
gopass audit

# Check specific secret history
gopass show projects/journal/infisical/ua-client-id-token-service
gopass history projects/journal/infisical/ua-client-id-token-service
```

## 🔒 Security Best Practices

### 1. Context-Aware Access

Gopass automatically detects your context:

- **Personal (verlyn13)**: Full access to all secrets
- **Agent (Claude/AI)**: Limited to `projects/`, `development/`, `agent/` paths
- **CI**: Read-only access to specific paths
- **Remote**: Limited read-only access

### 2. Automated Sync

Gopass is configured for automatic GitHub sync:

```yaml
# .gopass.yml
autosync: true
autopush: true
```

Every change is automatically:
1. Committed to local git
2. Pushed to GitHub repository
3. Backed up locally

### 3. Emergency Recovery

If you need to recover secrets:

```bash
# Clone from GitHub
git clone git@github.com:verlyn13/gopass-secrets.git \
  ~/.local/share/gopass/stores/root

# Configure gopass
gopass config backend.crypto age
gopass config mounts.path ~/.local/share/gopass/stores/root

# Verify
gopass ls projects/journal
```

## 🔄 CI/CD Integration

### GitHub Actions

Since we use OIDC authentication for CI, no secrets need to be stored in GitHub. However, if you need fallback:

```bash
# Generate static token for CI fallback (temporary)
gopass show -o projects/journal/infisical/ci-token-fallback

# Add to GitHub Secrets as INFISICAL_TOKEN_CI
# Remove once OIDC is fully working
```

### Local CI Testing

```bash
# Export CI environment
export CI=true
export GITHUB_ACTIONS=true

# Test with stored credentials
eval "$(./scripts/setup-infisical-auth.sh export)"

# Run CI-like tests
./scripts/test-auth-flow.sh
```

## 📊 Monitoring & Audit

### Check Secret Usage

```bash
# View secret access log
gopass history projects/journal/infisical/ua-client-secret-token-service

# Check git history
cd ~/.local/share/gopass/stores/root
git log --oneline projects/journal/
```

### Verify Sync Status

```bash
# Check sync status
cd ~/.local/share/gopass/stores/root
git status

# Force sync if needed
gopass sync

# Or use the sync script
~/Projects/verlyn13/gopass-secrets/gopass-sync-backup.sh
```

## 🆘 Troubleshooting

### Common Issues

1. **"gopass: secret not found"**
   ```bash
   # Check if secret exists
   gopass ls projects/journal
   
   # Ensure you're in the right context
   gopass config
   ```

2. **"Permission denied" when accessing secrets**
   - Check your context (personal vs agent)
   - Verify gopass mount configuration
   - Ensure SSH key is loaded for age decryption

3. **"Universal Auth login failed"**
   ```bash
   # Re-enter credentials
   ./scripts/setup-infisical-auth.sh setup
   
   # Test with Infisical CLI directly
   infisical login --method universal-auth \
     --client-id "$(gopass show -o projects/journal/infisical/ua-client-id-token-service)" \
     --client-secret "$(gopass show -o projects/journal/infisical/ua-client-secret-token-service)"
   ```

### Debug Mode

Enable debug output:

```bash
# Gopass debug
export GOPASS_DEBUG=true
gopass show projects/journal/infisical/ua-client-id-token-service

# Script debug
bash -x ./scripts/setup-infisical-auth.sh test
```

## 📚 Reference

### Scripts

| Script | Purpose |
|--------|---------|
| `setup-infisical-auth.sh` | Manage Infisical UA credentials in gopass |
| `dev-environment.sh` | Generate .env from gopass secrets |
| `test-auth-flow.sh` | Test complete authentication flow |
| `validate-infisical-setup.sh` | Validate Infisical configuration |
| `run-dev.sh` | Start development environment |

### Gopass Paths

| Path | Description |
|------|-------------|
| `projects/journal/infisical/*` | Infisical Universal Auth credentials |
| `projects/journal/database/*` | Database connection strings |
| `projects/journal/redis/*` | Redis configuration |
| `projects/journal/api-keys/*` | Third-party API keys |

### Environment Variables

Generated from gopass:

- `UA_CLIENT_ID_TOKEN_SERVICE` - Runtime identity client ID
- `UA_CLIENT_SECRET_TOKEN_SERVICE` - Runtime identity secret
- `UA_CLIENT_ID_ROTATOR` - Rotator identity client ID
- `UA_CLIENT_SECRET_ROTATOR` - Rotator identity secret
- `INFISICAL_PROJECT_ID` - Project identifier
- `INFISICAL_SERVER_URL` - Server endpoint
- `DATABASE_URL` - PostgreSQL connection
- `JOURNAL_REDIS_URL` - Redis connection

## 🔗 Related Documentation

- [Gopass Secrets Repository](../../../gopass-secrets/README.md)
- [Infisical Identities Manifest](./infisical-identities-manifest.yml)
- [Universal Auth Deployment Guide](./UNIVERSAL_AUTH_DEPLOYMENT.md)
- [Infisical Setup Guide](./INFISICAL_SETUP_GUIDE.md)