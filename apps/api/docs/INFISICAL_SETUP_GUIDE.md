# Infisical Setup Guide for Production

This guide walks you through setting up Infisical secret management for the Journal API in production.

## 🎯 Overview

The Journal API uses Infisical for centralized secret management with these features:
- **EdDSA JWT signing keys** with automatic rotation
- **AES encryption keys** for sensitive data
- **Database credentials** and API keys
- **Webhook secrets** and third-party tokens
- **Machine-to-Machine authentication** for service communication

## 📋 Prerequisites

1. **Infisical Account**: Sign up at [https://app.infisical.com](https://app.infisical.com)
2. **Infisical CLI**: Install version 0.42.1 or later
3. **Project Access**: Admin access to create Machine Identities

## 🔧 Step 1: Create Infisical Project

1. **Create Project**:
   ```bash
   # In Infisical Dashboard
   1. Click "New Project"
   2. Name: "journal-api-production"
   3. Choose your organization
   ```

2. **Note Project ID**:
   - Copy the Project ID from the URL: `https://app.infisical.com/project/PROJECT_ID_HERE/overview`
   - You'll need this for `INFISICAL_PROJECT_ID`

## 🔐 Step 2: Create Machine Identity

Machine Identities provide secure, token-based authentication for services.

1. **Navigate to Machine Identities**:
   ```
   Project Dashboard → Settings → Access Control → Machine Identities
   ```

2. **Create New Machine Identity**:
   - **Name**: `journal-api-production`
   - **Description**: `Journal API service authentication`
   - **Role**: `Admin` (or create custom role with required permissions)

3. **Configure Access**:
   - **Environments**: Add `dev`, `staging`, `prod` as needed
   - **Secret Path**: `/` (full access) or specific paths like `/api/`, `/jwt/`
   - **IP Allowlist**: Add your server IPs for additional security

4. **Generate Token**:
   - Click "Generate Token"
   - **Copy and securely store** the token - you won't see it again!
   - This is your `INFISICAL_TOKEN` value

## 📁 Step 3: Organize Secret Paths

Create this folder structure in your Infisical project:

```
/
├── api/
│   ├── database/
│   │   ├── DATABASE_URL
│   │   ├── DATABASE_URL_SYNC
│   │   └── DATABASE_PASSWORD
│   ├── redis/
│   │   └── REDIS_URL
│   ├── external/
│   │   ├── OPENAI_API_KEY
│   │   └── SENTRY_DSN
│   └── webhooks/
│       └── INFISICAL_WEBHOOK_SECRET
├── jwt/
│   ├── keys/
│   │   ├── JWT_PRIVATE_KEY_ED25519
│   │   ├── JWT_PUBLIC_KEY_ED25519
│   │   └── JWT_KEY_ID
│   └── config/
│       ├── JWT_ISS
│       ├── JWT_AUD
│       ├── ACCESS_TOKEN_TTL
│       └── REFRESH_TOKEN_TTL
└── encryption/
    ├── aes/
    │   ├── AES_KEY_CURRENT
    │   ├── AES_KEY_PREVIOUS
    │   └── AES_KEY_ID
    └── cipher/
        └── TOKEN_CIPHER_KEY
```

## 🔑 Step 4: Generate and Store Secrets

### JWT EdDSA Keys

```bash
# Generate EdDSA key pair
ssh-keygen -t ed25519 -f jwt_key -N ""

# Extract private key (base64 encoded)
cat jwt_key | base64 -w 0

# Extract public key (base64 encoded) 
ssh-keygen -f jwt_key.pub -e -m pkcs8 | base64 -w 0

# Generate key ID
openssl rand -hex 16
```

Store in Infisical:
- `JWT_PRIVATE_KEY_ED25519`: Private key (base64)
- `JWT_PUBLIC_KEY_ED25519`: Public key (base64)  
- `JWT_KEY_ID`: Generated key ID

### AES Encryption Keys

```bash
# Generate AES-256 keys
openssl rand -base64 32  # Current key
openssl rand -base64 32  # Previous key (for rotation)
openssl rand -hex 16     # Key ID
```

Store in Infisical:
- `AES_KEY_CURRENT`: Current AES key
- `AES_KEY_PREVIOUS`: Previous AES key
- `AES_KEY_ID`: Key identifier

### Database & Service Credentials

Store your actual production values:
- `DATABASE_URL`: PostgreSQL connection string
- `DATABASE_URL_SYNC`: Synchronous PostgreSQL connection
- `REDIS_URL`: Redis connection string
- `OPENAI_API_KEY`: OpenAI API key for embeddings

## 🌍 Step 5: Environment Configuration

Set these environment variables in your production environment:

```bash
# Required Infisical configuration
export INFISICAL_PROJECT_ID="your-project-id-from-step-1"
export INFISICAL_SERVER_URL="https://app.infisical.com"
export INFISICAL_TOKEN="your-machine-identity-token-from-step-2"
export INFISICAL_ENVIRONMENT="prod"

# Optional configuration
export INFISICAL_CACHE_TTL=300
export INFISICAL_TIMEOUT=30.0
export INFISICAL_MAX_RETRIES=3
```

### Docker Compose Example

```yaml
services:
  journal-api:
    image: journal-api:latest
    environment:
      INFISICAL_PROJECT_ID: "${INFISICAL_PROJECT_ID}"
      INFISICAL_SERVER_URL: "https://app.infisical.com"
      INFISICAL_TOKEN: "${INFISICAL_TOKEN}"
      INFISICAL_ENVIRONMENT: "prod"
    secrets:
      - infisical_token

secrets:
  infisical_token:
    file: ./secrets/infisical_token.txt
```

### Kubernetes Example

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: infisical-config
type: Opaque
data:
  INFISICAL_TOKEN: <base64-encoded-token>
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: journal-api
spec:
  template:
    spec:
      containers:
      - name: api
        env:
        - name: INFISICAL_PROJECT_ID
          value: "your-project-id"
        - name: INFISICAL_SERVER_URL
          value: "https://app.infisical.com"
        - name: INFISICAL_TOKEN
          valueFrom:
            secretKeyRef:
              name: infisical-config
              key: INFISICAL_TOKEN
```

## 🧪 Step 6: Test the Configuration

1. **Install Infisical CLI**:
   ```bash
   curl -1sLf https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh | sudo bash
   sudo apt-get install infisical
   ```

2. **Test Authentication**:
   ```bash
   # Set environment variables
   export INFISICAL_TOKEN="your-token"
   export INFISICAL_PROJECT_ID="your-project-id"
   
   # Test secret retrieval
   infisical secrets list --env=prod
   ```

3. **Test Migration Script**:
   ```bash
   cd apps/api
   uv run python -m app.scripts.migrate_to_infisical status
   ```

## 🔄 Step 7: Migration Process

1. **Dry Run**:
   ```bash
   uv run python -m app.scripts.migrate_to_infisical migrate --dry-run
   ```

2. **Backup Current Secrets**:
   ```bash
   uv run python -m app.scripts.migrate_to_infisical backup
   ```

3. **Perform Migration**:
   ```bash
   uv run python -m app.scripts.migrate_to_infisical migrate
   ```

4. **Verify Migration**:
   ```bash
   uv run python -m app.scripts.migrate_to_infisical status
   ```

## 🔐 Security Best Practices

### Machine Identity Security

1. **Token Rotation**:
   - Rotate Machine Identity tokens every 30-90 days
   - Use short-lived tokens where possible
   - Monitor token usage in Infisical audit logs

2. **Access Controls**:
   - Use least-privilege principle for Machine Identity roles
   - Restrict IP access where possible
   - Enable audit logging

3. **Storage Security**:
   - Never log Machine Identity tokens
   - Store tokens in secure secret management (K8s secrets, HashiCorp Vault, etc.)
   - Use environment variables, not configuration files

### Network Security

1. **TLS/SSL**:
   - Always use HTTPS for Infisical server communication
   - Validate SSL certificates in production

2. **Firewall Rules**:
   - Restrict outbound access to Infisical servers only
   - Use IP allowlists in Infisical for additional security

3. **VPN/Private Networks**:
   - Consider running Infisical traffic over VPN
   - Use private networks where available

## 🔧 Troubleshooting

### Common Issues

1. **"INFISICAL_TOKEN not found"**:
   - Verify token is set in environment
   - Check token hasn't expired
   - Ensure Machine Identity has correct permissions

2. **"Project not found"**:
   - Verify `INFISICAL_PROJECT_ID` is correct
   - Check Machine Identity has access to the project

3. **"Permission denied"**:
   - Verify Machine Identity role permissions
   - Check secret path access rules
   - Ensure environment access is granted

### Debug Mode

Enable debug logging:
```bash
export LOG_LEVEL=DEBUG
export INFISICAL_LOG_LEVEL=debug
```

### Health Checks

Monitor Infisical integration health:
```bash
curl http://localhost:8000/api/v1/monitoring/health
```

## 📊 Monitoring & Alerts

Set up monitoring for:
- **Secret retrieval failures**
- **Token expiration warnings**  
- **Key rotation events**
- **Webhook delivery failures**
- **Cache hit rates**

Use the monitoring endpoints:
- `/api/v1/monitoring/health` - Health status
- `/api/v1/monitoring/metrics` - Performance metrics
- `/api/v1/monitoring/dashboard` - Comprehensive view

## 🔄 Maintenance

### Regular Tasks

1. **Weekly**:
   - Review audit logs in Infisical
   - Check monitoring dashboards
   - Verify backup integrity

2. **Monthly**:
   - Rotate Machine Identity tokens
   - Review and update secret access rules
   - Test disaster recovery procedures

3. **Quarterly**:
   - Audit all secrets and remove unused ones
   - Review and update security policies
   - Performance optimization review

---

## 📞 Support

For issues with this setup:
1. Check the [Infisical Documentation](https://infisical.com/docs)
2. Review application logs with `LOG_LEVEL=DEBUG`
3. Test with the migration script's dry-run mode
4. Check the monitoring dashboard for specific errors

Remember: Never share Machine Identity tokens or include them in version control!