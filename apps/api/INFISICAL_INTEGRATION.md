# Infisical CLI v0.42.1 Integration Guide

This document provides a comprehensive guide for the production-ready Infisical CLI v0.42.1 integration in the Journal FastAPI application.

## Overview

The Infisical integration provides secure secret management with the following capabilities:

- **Secrets Management**: Store and retrieve secrets using Infisical CLI v0.42.1
- **Key Rotation**: Automated JWT and AES key rotation with webhook support
- **Caching**: Redis-based caching for performance optimization
- **Error Handling**: Comprehensive error handling with retries and fallbacks
- **Telemetry**: Metrics and logging for monitoring and debugging
- **Migration**: Tools for migrating from environment-based secrets

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   FastAPI App  │    │ InfisicalClient  │    │ Infisical CLI   │
│                 │────│                  │────│     v0.42.1     │
│ KeyManager      │    │ Redis Cache      │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         v                       v                       v
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Database      │    │     Redis        │    │    Infisical    │
│   (Audit Logs)  │    │   (Cache)        │    │    Server       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Components

### 1. InfisicalSecretsClient

The core client for interacting with Infisical CLI v0.42.1:

```python
from app.infra.secrets import InfisicalSecretsClient

# Initialize from environment
client = InfisicalSecretsClient.from_env(redis_client)

# Fetch secrets
secret_value = await client.fetch_secret("/auth/jwt/current_private_key")

# Store secrets
await client.store_secret("/auth/jwt/new_key", key_material)
```

**Features:**
- CLI v0.42.1 command patterns
- Automatic retries with exponential backoff
- Redis-based caching with TTL
- Comprehensive error handling
- Telemetry integration

### 2. InfisicalKeyManager

Enhanced KeyManager with Infisical integration:

```python
from app.infra.secrets.enhanced_key_manager import InfisicalKeyManager

# Initialize
key_manager = InfisicalKeyManager(session, redis, infisical_client)

# Get JWT signing key
signing_key = await key_manager.get_current_signing_key()

# Get AES cipher
cipher = await key_manager.get_token_cipher()

# Rotate keys
result = await key_manager.rotate_keys(force=True)
```

**Features:**
- JWT and AES key management
- Automated key rotation
- Webhook-triggered rotation
- Backward compatibility
- Health monitoring

### 3. Webhook Handlers

RESTful endpoints for Infisical webhook integration:

```bash
# Health check
curl http://localhost:8000/api/v1/infisical/health

# Manual key rotation
curl -X POST http://localhost:8000/api/v1/infisical/rotate \
  -H "Content-Type: application/json" \
  -d '{"rotation_type": "jwt", "force": false}'

# Cache invalidation
curl -X POST http://localhost:8000/api/v1/infisical/cache/invalidate
```

## Configuration

### Environment Variables

```bash
# Core Infisical configuration
JOURNAL_INFISICAL_ENABLED=true
JOURNAL_INFISICAL_PROJECT_ID=d01f583a-d833-4375-b359-c702a726ac4d
JOURNAL_INFISICAL_SERVER_URL=https://secrets.jefahnierocks.com
JOURNAL_INFISICAL_CACHE_TTL=300
JOURNAL_INFISICAL_WEBHOOK_SECRET=your_webhook_secret
JOURNAL_INFISICAL_TIMEOUT=30.0
JOURNAL_INFISICAL_MAX_RETRIES=3
JOURNAL_INFISICAL_RETRY_DELAY=1.0

# Infisical CLI environment variables
INFISICAL_API_URL=https://secrets.jefahnierocks.com
INFISICAL_PROJECT_ID=d01f583a-d833-4375-b359-c702a726ac4d
# INFISICAL_TOKEN=your_machine_identity_token_here
```

### Secret Paths

The integration uses structured secret paths:

```
/auth/jwt/
├── current_private_key    # Current JWT signing key
├── next_private_key       # Next JWT key (for rotation)
├── current_public_key     # Current JWT public key
└── next_public_key        # Next JWT public key

/auth/aes/
├── current_key           # Current AES key
├── next_key             # Next AES key
├── active_kid           # Active key ID
└── keys_map             # JSON map of all keys

/auth/webhooks/
└── infisical_secret     # Webhook HMAC secret

/database/
├── db_url_async         # Async database URL
└── db_url_sync          # Sync database URL

/infrastructure/
├── redis_url            # Redis connection URL
├── nats_url             # NATS connection URL
└── otlp_endpoint        # OpenTelemetry endpoint
```

## Installation & Setup

### 1. Install Infisical CLI

```bash
# Download and install Infisical CLI v0.42.1
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get update && sudo apt-get install -y infisical
```

### 2. Authenticate with Infisical

```bash
# Authenticate with your Infisical instance
infisical login --domain=https://secrets.jefahnierocks.com

# Or use machine identity token
export INFISICAL_TOKEN=your_machine_identity_token
```

### 3. Initialize Project

```bash
# Navigate to API directory
cd apps/api

# Initialize Infisical project
infisical init --project-id=d01f583a-d833-4375-b359-c702a726ac4d

# Verify connection
infisical secrets list --project-id=d01f583a-d833-4375-b359-c702a726ac4d
```

## Migration from Environment Variables

Use the migration script to move from environment-based secrets:

### 1. Check Prerequisites

```bash
cd apps/api
uv run python -m app.scripts.migrate_to_infisical check-prerequisites
```

### 2. Perform Migration

```bash
# Dry run first
uv run python -m app.scripts.migrate_to_infisical migrate --dry-run

# Actual migration
uv run python -m app.scripts.migrate_to_infisical migrate

# Check status
uv run python -m app.scripts.migrate_to_infisical status
```

### 3. Manual Migration

You can also migrate manually using Makefile targets:

```bash
# Set up Infisical development environment
make infisical-dev-setup

# Check health
make infisical-health

# Migrate keys
make infisical-migrate

# Test rotation
make infisical-rotate-jwt
make infisical-rotate-aes
```

## Development Workflow

### Daily Development

```bash
# Check Infisical health
make infisical-health

# List all secrets
make infisical-secrets-list

# Get specific secret
make infisical-secrets-get SECRET_NAME=current_private_key

# Set secret
make infisical-secrets-set SECRET_NAME=test_secret SECRET_VALUE=test_value
```

### Testing

```bash
# Run Infisical-specific tests
make test-infisical

# Full workflow test
make infisical-workflow-test

# Integration tests (requires real Infisical)
uv run pytest tests/integration/test_infisical_integration.py -v
```

### Key Rotation

```bash
# Manual JWT rotation
make infisical-rotate-jwt

# Manual AES rotation
make infisical-rotate-aes

# Rotate both
make infisical-rotate-all

# Clear cache
make infisical-cache-clear
```

## API Endpoints

### Health Check

```http
GET /api/v1/infisical/health
```

Response:
```json
{
  "overall_status": "healthy",
  "jwt_system": {"status": "healthy"},
  "aes_system": {"status": "healthy", "active_kid": "aes_abc123"},
  "infisical_connection": {"status": "healthy"},
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Manual Key Rotation

```http
POST /api/v1/infisical/rotate
Content-Type: application/json

{
  "rotation_type": "jwt|aes|both",
  "force": false,
  "reason": "Manual rotation"
}
```

### Cache Invalidation

```http
POST /api/v1/infisical/cache/invalidate?pattern=/auth/*
```

### Webhook Handler

```http
POST /api/v1/infisical/webhook
X-Infisical-Signature: sha256=...
Content-Type: application/json

{
  "id": "event-id",
  "event": "secret.updated",
  "project_id": "d01f583a-d833-4375-b359-c702a726ac4d",
  "environment": "dev",
  "secret_path": "/auth/jwt/current_private_key",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Monitoring & Observability

### Metrics

The integration exposes the following metrics:

- `infisical_fetch_total{source,path}` - Secret fetch attempts
- `infisical_fetch_errors_total{path,error}` - Fetch errors
- `infisical_fetch_duration_seconds{path}` - Fetch duration
- `infisical_cache_hit_total{path}` - Cache hits
- `infisical_cache_miss_total{path}` - Cache misses
- `infisical_webhook_events_total{event,status}` - Webhook events
- `aes_key_rotation_total{method}` - AES key rotations
- `jwt_key_rotation_total{method}` - JWT key rotations

### Logging

Structured logging with context:

```python
import logging
logger = logging.getLogger("app.infra.secrets")

# Log levels:
# DEBUG: Cache operations, retry attempts
# INFO: Successful operations, key rotations
# WARNING: Fallbacks, validation issues
# ERROR: Operation failures, authentication errors
```

### Health Monitoring

```bash
# Check overall health
curl http://localhost:8000/api/v1/infisical/health

# Detailed health check
curl http://localhost:8000/api/v1/infisical/health | jq '.jwt_system'
```

## Security Considerations

### 1. Access Control

- Use machine identity tokens for production
- Rotate tokens regularly
- Implement least-privilege access
- Monitor secret access logs

### 2. Network Security

- Use HTTPS for all Infisical communication
- Implement proper certificate validation
- Consider network-level restrictions

### 3. Webhook Security

- Verify HMAC signatures on all webhooks
- Use unique webhook secrets per environment
- Implement rate limiting on webhook endpoints

### 4. Cache Security

- Use separate Redis databases for different environments
- Implement cache encryption for sensitive data
- Set appropriate TTL values

## Troubleshooting

### Common Issues

#### 1. CLI Authentication Errors

```bash
# Check CLI status
infisical --version

# Re-authenticate
infisical login --domain=https://secrets.jefahnierocks.com

# Check project access
infisical secrets list --project-id=d01f583a-d833-4375-b359-c702a726ac4d
```

#### 2. Connection Timeouts

```bash
# Check network connectivity
curl -I https://secrets.jefahnierocks.com

# Test with longer timeout
JOURNAL_INFISICAL_TIMEOUT=60.0 make infisical-health
```

#### 3. Cache Issues

```bash
# Clear all caches
make infisical-cache-clear

# Check Redis connectivity
redis-cli -h localhost -p 6380 ping
```

#### 4. Key Rotation Failures

```bash
# Check key system health
make infisical-health

# Force regenerate keys
make infisical-rotate-all

# Verify key integrity
curl http://localhost:8000/api/v1/infisical/health | jq '.jwt_system'
```

### Debug Mode

Enable debug logging:

```bash
export JOURNAL_LOG_LEVEL=DEBUG
uv run python -c "
import asyncio
from app.infra.secrets import InfisicalSecretsClient
client = InfisicalSecretsClient.from_env()
asyncio.run(client.health_check())
"
```

### Performance Issues

Monitor performance metrics:

```bash
# Check cache hit rates
curl http://localhost:8000/metrics | grep infisical_cache

# Monitor response times
curl http://localhost:8000/metrics | grep infisical_fetch_duration
```

## Backup & Recovery

### 1. Create Backups

```bash
# Run migration script backup
uv run python -m app.scripts.migrate_to_infisical migrate --backup-only

# Manual backup
infisical secrets list --format=json > secrets_backup.json
```

### 2. Recovery Procedures

```bash
# Rollback migration
uv run python -m app.scripts.migrate_to_infisical rollback backup_file.json

# Restore individual secrets
infisical secrets set secret_name secret_value --project-id=d01f583a-d833-4375-b359-c702a726ac4d
```

## Production Deployment

### 1. Environment Setup

```bash
# Production environment variables
JOURNAL_INFISICAL_ENABLED=true
JOURNAL_INFISICAL_PROJECT_ID=d01f583a-d833-4375-b359-c702a726ac4d
JOURNAL_INFISICAL_SERVER_URL=https://secrets.jefahnierocks.com
JOURNAL_INFISICAL_CACHE_TTL=600  # Longer cache in production
JOURNAL_INFISICAL_WEBHOOK_SECRET=${WEBHOOK_SECRET}
INFISICAL_TOKEN=${MACHINE_IDENTITY_TOKEN}
```

### 2. Deployment Checklist

- [ ] Infisical CLI v0.42.1 installed
- [ ] Machine identity token configured
- [ ] Network connectivity to Infisical server
- [ ] Redis cache available
- [ ] Webhook endpoint accessible
- [ ] Monitoring and alerting configured
- [ ] Backup procedures tested
- [ ] Rollback procedures documented

### 3. Monitoring Setup

```bash
# Health check endpoint
curl http://localhost:8000/api/v1/infisical/health

# Prometheus metrics
curl http://localhost:8000/metrics | grep infisical

# Log aggregation
tail -f /var/log/journal/infisical.log
```

## Support & Maintenance

### Regular Maintenance

1. **Weekly**: Review key rotation logs
2. **Monthly**: Update Infisical CLI if needed
3. **Quarterly**: Review and rotate webhook secrets
4. **Annually**: Full security audit

### Support Contacts

- **Infisical Documentation**: https://infisical.com/docs
- **CLI Issues**: https://github.com/Infisical/infisical
- **Project Issues**: Create GitHub issue in journal repository

### Version Compatibility

- **Infisical CLI**: v0.42.1 (recommended)
- **Python**: 3.11+
- **FastAPI**: 0.115+
- **Redis**: 5.0+
- **PostgreSQL**: 14+

---

## Appendix

### A. Complete Environment Template

```bash
# Copy to .env and update values
cp .env.infisical.template .env
```

### B. Testing Checklist

- [ ] Unit tests pass
- [ ] Integration tests pass (with real Infisical)
- [ ] Health check returns healthy
- [ ] Key rotation works
- [ ] Webhook handling works
- [ ] Cache invalidation works
- [ ] Error handling works
- [ ] Metrics are collected

### C. Security Audit Checklist

- [ ] No secrets in environment variables
- [ ] Webhook signatures verified
- [ ] Cache encryption enabled
- [ ] Network traffic encrypted
- [ ] Access logs monitored
- [ ] Token rotation scheduled
- [ ] Backup encryption verified
- [ ] Incident response tested