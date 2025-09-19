---
id: environment-variables
title: Environment Variables Configuration
category: deployment
type: reference
status: current
created: 2025-01-19
updated: 2025-01-19
dependencies:
  - supabase-configuration
  - vercel-deployment
tags:
  - environment
  - configuration
  - deployment
  - security
description: Complete environment variables reference and organization for Journal application
---

# Environment Variables Configuration

## File Organization

### Project Structure

```
journal/
├── .env                      # Local development (git-ignored)
├── .env.example              # Template with placeholders
├── .env.production           # Production reference
├── .env.production.minimal   # Quick deploy essentials
└── .env.schema               # Complete documentation
```

### File Purposes

| File | Purpose | Git Status | Contains Secrets |
|------|---------|------------|------------------|
| `.env` | Active local development config | ❌ Ignored | ✅ Yes |
| `.env.example` | Template for new developers | ✅ Committed | ❌ No |
| `.env.production` | Production configuration reference | ✅ Committed | ⚠️ Placeholders |
| `.env.production.minimal` | Essential vars for quick deploy | ✅ Committed | ⚠️ Placeholders |
| `.env.schema` | Documentation of all variables | ✅ Committed | ❌ No |

## Variable Categories

### Frontend Variables (VITE_*)

```env
# API Configuration
VITE_API_URL=/api                    # Production: /api, Dev: http://localhost:8000
VITE_APP_NAME=Journal                 # Application name
VITE_APP_VERSION=1.0.0                # Version for display

# Feature Flags
VITE_ENABLE_DEBUG=false               # Debug mode
VITE_ENABLE_MOCKS=false               # Mock data
```

### Database Variables

```env
# Connection Types (see Supabase Configuration for details)
DATABASE_URL                          # Primary connection (transaction pooler for prod)
DATABASE_URL_SESSION                  # Session pooler for long-lived connections
DIRECT_URL                            # Direct connection for migrations only
JOURNAL_DB_URL                        # Application primary connection
JOURNAL_DB_URL_ASYNC                  # Application async connection
```

### Supabase SDK Variables

```env
SUPABASE_URL                          # Project URL (https://[ref].supabase.co)
SUPABASE_ANON_KEY                     # Public key for client-side
SUPABASE_SERVICE_KEY                  # Service key for server-side (SECRET!)
```

### Authentication Variables

```env
# JWT Configuration
JOURNAL_JWT_SECRET                    # 64-char hex secret
JOURNAL_JWT_ISS=journal-api           # Token issuer
JOURNAL_JWT_AUD=journal-clients       # Token audience
JOURNAL_JWT_ALGORITHM=EdDSA           # Signing algorithm
JOURNAL_ACCESS_TOKEN_MINUTES=15       # Access token expiry
JOURNAL_REFRESH_TOKEN_DAYS=30         # Refresh token expiry

# WebAuthn/Passkeys
JOURNAL_WEBAUTHN_RP_ID                # Relying party ID (domain)
JOURNAL_WEBAUTHN_RP_NAME              # Display name
JOURNAL_WEBAUTHN_ORIGIN               # Origin URL (https://domain)
```

### Application Configuration

```env
# Environment
NODE_ENV                              # development | production
JOURNAL_ENV                           # development | staging | production

# Server
API_HOST=0.0.0.0                      # Bind host
API_PORT=8000                         # API port

# CORS
CORS_ORIGINS                          # Comma-separated allowed origins
```

## Environment-Specific Configurations

### Local Development (.env)

```env
NODE_ENV=development
JOURNAL_ENV=development
VITE_API_URL=http://localhost:8000
DATABASE_URL=postgresql://postgres.ecmnzrtsuajatmuahooa:[PASSWORD]@aws-1-us-west-1.pooler.supabase.com:5432/postgres
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8000
JOURNAL_WEBAUTHN_RP_ID=localhost
JOURNAL_WEBAUTHN_ORIGIN=http://localhost:5173
```

### Production (Vercel)

```env
NODE_ENV=production
JOURNAL_ENV=production
VITE_API_URL=/api
DATABASE_URL=postgresql://postgres.ecmnzrtsuajatmuahooa:[PASSWORD]@aws-1-us-west-1.pooler.supabase.com:6543/postgres
CORS_ORIGINS=https://journal.thenash.group,https://journal-*.vercel.app
JOURNAL_WEBAUTHN_RP_ID=journal.thenash.group
JOURNAL_WEBAUTHN_ORIGIN=https://journal.thenash.group
```

## Secret Management

### Local Storage (gopass)

```bash
# Store secrets
gopass insert development/supabase/journal/db_password
gopass insert development/journal/jwt_secret

# Retrieve for use
export DB_PASSWORD=$(gopass show development/supabase/journal/db_password)
export JWT_SECRET=$(gopass show development/journal/jwt_secret)
```

### Vercel Dashboard

1. Navigate to: https://vercel.com/[team]/[project]/settings/environment-variables
2. Add each variable individually
3. Select appropriate environments (Production, Preview, Development)
4. No quotes or brackets in values

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## Variable Naming Conventions

### Prefixes

| Prefix | Purpose | Example |
|--------|---------|---------|
| `VITE_` | Frontend build-time variables | `VITE_API_URL` |
| `JOURNAL_` | Application-specific | `JOURNAL_JWT_SECRET` |
| `SUPABASE_` | Supabase SDK config | `SUPABASE_URL` |
| `DATABASE_` | Database connections | `DATABASE_URL` |
| `UPSTASH_` | Upstash services | `UPSTASH_REDIS_URL` |
| `NEXT_PUBLIC_` | Next.js public vars (if migrating) | `NEXT_PUBLIC_API_URL` |

### Scopes

- `[FE]` - Frontend only (typically VITE_* vars)
- `[BE]` - Backend only (server-side secrets)
- `[DB]` - Database specific
- `[SHARED]` - Used by both frontend and backend

## Security Best Practices

1. **Never commit real secrets**
   - Use placeholders: `[PASSWORD]`, `[SECRET]`
   - Keep real values in gopass or secure vaults

2. **Separate public and private keys**
   - Frontend: Only VITE_* and public keys
   - Backend: All keys including service/secret keys

3. **Use appropriate connection strings**
   - Development: Session pooler (port 5432)
   - Production: Transaction pooler (port 6543)
   - Migrations: Direct connection (requires IPv6)

4. **Rotate secrets regularly**
   - JWT secrets: Every 60-90 days
   - Database passwords: Per security policy
   - API keys: Monitor for exposure

5. **Validate environment on startup**
   ```python
   # apps/api/app/settings.py
   if not settings.JOURNAL_JWT_SECRET:
       raise ValueError("JOURNAL_JWT_SECRET not set")
   ```

## Adding New Variables

### Checklist

- [ ] Add to `.env.schema` with documentation
- [ ] Add to `.env.example` with placeholder
- [ ] Add to `.env` with dev value
- [ ] Add to `.env.production` with prod format
- [ ] Add to `.env.production.minimal` if essential
- [ ] Store secret in gopass if sensitive
- [ ] Add to Vercel Dashboard for production
- [ ] Add to GitHub Secrets if needed for CI
- [ ] Update this documentation
- [ ] Test in all environments

### Example: Adding Redis Configuration

1. **Update .env.schema**
   ```env
   UPSTASH_REDIS_REST_URL=https://[id].upstash.io # [BE] Redis REST endpoint
   UPSTASH_REDIS_REST_TOKEN=AcASA... # [BE] Redis auth token
   ```

2. **Update .env.example**
   ```env
   UPSTASH_REDIS_REST_URL=YOUR_REDIS_URL_HERE
   UPSTASH_REDIS_REST_TOKEN=YOUR_REDIS_TOKEN_HERE
   ```

3. **Store in gopass**
   ```bash
   gopass insert development/upstash/redis_url
   gopass insert development/upstash/redis_token
   ```

4. **Add to Vercel Dashboard**
   - Name: `UPSTASH_REDIS_REST_URL`
   - Value: `[actual URL from Upstash]`
   - Environments: Production, Preview

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Environment variable not found" | Not set in deployment | Check Vercel Dashboard |
| "Invalid URI query parameter" | Using `?pgbouncer=true` | Remove parameter, use correct port |
| "Tenant or user not found" | Wrong username format | Use `postgres.PROJECT_REF` for pooler |
| "Network is unreachable" | IPv6 connection on IPv4 network | Use pooler URLs instead |
| Variables not updating | Build cache | Clear cache and redeploy |

### Debugging Commands

```bash
# Check local environment
env | grep JOURNAL

# Verify gopass secrets
gopass ls development/

# Test database connection
psql $DATABASE_URL -c "SELECT 1"

# Validate Vercel deployment
vercel env ls
```

## Related Documentation

- [Supabase Configuration](./supabase-configuration.md)
- [Vercel Deployment](./vercel-deployment.md)
- [Infisical Architecture](../infrastructure/INFISICAL_ARCHITECTURE.md)
- [Error Handling and Logging](../infrastructure/error-handling-logging.md)