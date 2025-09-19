---
id: environment-variables
title: Environment Variables Configuration
type: api
version: 1.0.0
created: '2025-09-16'
updated: '2025-09-16'
author: Journal Team
tags:
- api
- fastapi
priority: critical
status: approved
visibility: internal
schema_version: v1
---

# Environment Variables Configuration

**Last Updated**: September 16, 2025
**Purpose**: Complete mapping of environment variables for Vercel + Supabase deployment

## Variable Categories

### 1. Frontend Variables (Vercel)

These variables are exposed to the client build and must use `VITE_` prefix.

| Variable | Development | Preview | Production | Description |
|----------|------------|---------|------------|-------------|
| `VITE_API_URL` | `http://localhost:5000` | `https://api-preview.journal.com` | `https://api.journal.com` | Backend API endpoint |
| `VITE_SUPABASE_URL` | `http://localhost:54321` | Per-branch URL | `https://xxxxx.supabase.co` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Local key | Per-branch key | Production anon key | Public Supabase key |
| `VITE_ENABLE_AUTH` | `false` | `true` | `true` | Feature flag for auth |
| `VITE_ENABLE_ANALYTICS` | `false` | `false` | `true` | Analytics tracking |

### 2. Build Variables (Vercel)

Used during build time only, not exposed to client.

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Build environment |
| `CI` | `true` | Indicates CI environment |
| `VERCEL` | `1` | Auto-set by Vercel |
| `VERCEL_ENV` | `production`/`preview`/`development` | Auto-set |
| `VERCEL_URL` | Dynamic | Auto-set deployment URL |
| `VERCEL_GIT_COMMIT_SHA` | Dynamic | Git commit hash |

### 3. Backend Variables (Railway/Render)

Server-side only variables for FastAPI and workers.

#### Database
| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@db.supabase.co:5432/postgres` | Primary connection |
| `JOURNAL_DB_URL_ASYNC` | `postgresql+asyncpg://...` | Async SQLAlchemy |
| `JOURNAL_DB_URL_SYNC` | `postgresql+psycopg://...` | Sync operations |
| `DATABASE_POOL_SIZE` | `20` | Connection pool size |
| `DATABASE_MAX_OVERFLOW` | `40` | Max overflow connections |

#### Redis
| Variable | Example | Description |
|----------|---------|-------------|
| `REDIS_URL` | `rediss://default:pass@redis.upstash.io:6379` | Redis connection |
| `REDIS_MAX_CONNECTIONS` | `50` | Connection limit |
| `REDIS_DECODE_RESPONSES` | `true` | Auto-decode strings |

#### NATS
| Variable | Example | Description |
|----------|---------|-------------|
| `NATS_URL` | `nats://nats.journal.local:4222` | NATS server |
| `NATS_USER` | `journal` | NATS username |
| `NATS_PASSWORD` | `xxxxx` | NATS password |
| `NATS_CLUSTER_ID` | `journal-cluster` | Cluster ID |

#### Authentication
| Variable | Example | Description |
|----------|---------|-------------|
| `JOURNAL_JWT_SECRET` | 32-char random | JWT signing key |
| `JOURNAL_JWT_ISS` | `journal-api` | JWT issuer |
| `JOURNAL_JWT_AUD` | `journal-clients` | JWT audience |
| `JOURNAL_ACCESS_TOKEN_MINUTES` | `15` | Access token TTL |
| `JOURNAL_REFRESH_TOKEN_DAYS` | `30` | Refresh token TTL |

#### Infisical (Optional)
| Variable | Example | Description |
|----------|---------|-------------|
| `INFISICAL_ENABLED` | `true` | Enable Infisical |
| `INFISICAL_PROJECT_ID` | `d01f583a-d833-4375-b359-c702a726ac4d` | Project ID |
| `INFISICAL_SERVER_URL` | `https://secrets.jefahnierocks.com` | Server URL |
| `INFISICAL_CACHE_TTL` | `300` | Cache TTL seconds |

#### Application
| Variable | Example | Description |
|----------|---------|-------------|
| `JOURNAL_ENV` | `production` | Environment name |
| `PORT` | `5000` | Server port |
| `HOST` | `0.0.0.0` | Bind host |
| `WORKERS` | `4` | Uvicorn workers |
| `LOG_LEVEL` | `info` | Logging level |
| `CORS_ORIGINS` | `https://journal.com,https://www.journal.com` | CORS origins |

### 4. Supabase Variables

Automatically provided when using Supabase integration.

| Variable | Source | Description |
|----------|--------|-------------|
| `SUPABASE_URL` | Supabase | Project URL |
| `SUPABASE_ANON_KEY` | Supabase | Anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Service role key (backend only) |
| `SUPABASE_JWT_SECRET` | Supabase | JWT secret |
| `SUPABASE_DB_URL` | Supabase | Direct DB connection |

## Environment-Specific Values

### Development (Local)
```env
# .env.local
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=local-anon-key
VITE_ENABLE_AUTH=false
```

### Preview (Vercel)
```env
# Set in Vercel Dashboard - Preview scope
VITE_API_URL=https://api-staging.journal.com
# Supabase branch values auto-populated via integration
VITE_ENABLE_AUTH=true
```

### Production (Vercel)
```env
# Set in Vercel Dashboard - Production scope
VITE_API_URL=https://api.journal.com
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=production-anon-key
VITE_ENABLE_AUTH=true
VITE_ENABLE_ANALYTICS=true
```

## Migration Steps

### 1. Export Current Values
```bash
# Export current .env for reference
cat apps/api/.env > env-backup.txt
cat apps/web/.env >> env-backup.txt
```

### 2. Vercel Configuration
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add each `VITE_` variable with appropriate scope
3. Set different values for Development/Preview/Production

### 3. Railway/Render Configuration
1. Create service in Railway/Render
2. Add environment variables in service settings
3. Use secrets management for sensitive values

### 4. Supabase Integration
1. Install Supabase Vercel Integration
2. Link project to Vercel
3. Enable branching for preview environments
4. Variables auto-populate on PR open

## Security Considerations

### DO NOT Commit
- JWT secrets
- Database passwords
- API keys
- Service role keys

### Safe to Commit
- Public URLs
- Feature flags
- Non-sensitive configuration

### Best Practices
1. Use different secrets per environment
2. Rotate secrets regularly
3. Use Vercel's encrypted env storage
4. Limit service role key to backend only
5. Use connection pooling for database

## Validation Script

```bash
#!/bin/bash
# validate-env.sh

# Check required frontend vars
required_frontend=(
  "VITE_API_URL"
  "VITE_SUPABASE_URL"
  "VITE_SUPABASE_ANON_KEY"
)

# Check required backend vars
required_backend=(
  "DATABASE_URL"
  "REDIS_URL"
  "NATS_URL"
  "JOURNAL_JWT_SECRET"
)

echo "Checking frontend variables..."
for var in "${required_frontend[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing: $var"
  else
    echo "✅ Found: $var"
  fi
done

echo "Checking backend variables..."
for var in "${required_backend[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing: $var"
  else
    echo "✅ Found: $var"
  fi
done
```

## Troubleshooting

### Common Issues

1. **CORS errors**: Check `CORS_ORIGINS` includes frontend URL
2. **Database connection**: Verify connection string format
3. **Auth failures**: Ensure JWT secrets match
4. **Preview broken**: Check Supabase branch variables
5. **Build failures**: Verify all `VITE_` vars are set

### Debug Commands

```bash
# Vercel: List env vars
vercel env ls

# Railway: Check service vars
railway variables

# Supabase: Test connection
psql $DATABASE_URL -c "SELECT 1"

# Redis: Test connection
redis-cli -u $REDIS_URL ping
```

## Notes

- Vercel auto-injects system variables (`VERCEL_*`)
- Supabase branch URLs change per PR
- Use `.env.local` for local development only
- Backend requires all database connection variants
- Consider using secrets manager for production