---
id: supabase-configuration
title: Supabase Configuration
category: deployment
type: guide
status: current
created: 2025-01-19
updated: 2025-01-19
author: Journal Team
dependencies:
  - vercel-supabase-strategy
  - environment-variables
tags:
  - supabase
  - database
  - postgresql
  - deployment
  - configuration
description: Complete Supabase project configuration for Journal application
---

# Supabase Configuration

## Project Details

| Field | Value |
|-------|-------|
| **Project Name** | journal |
| **Project ID** | `ecmnzrtsuajatmuahooa` |
| **Project URL** | https://ecmnzrtsuajatmuahooa.supabase.co |
| **Region** | US West 1 (North California) |
| **Pooler Host** | `aws-1-us-west-1.pooler.supabase.com` |
| **PostgreSQL Version** | 17.6 |
| **pgvector** | ✅ Enabled (extensions schema) |

## Connection Types (September 2025 Configuration)

### 1. Direct Connection (IPv6 only)
**For migrations only** - Requires IPv6 support

```
postgresql://postgres:[PASSWORD]@db.ecmnzrtsuajatmuahooa.supabase.co:5432/postgres
```

- **Host**: `db.ecmnzrtsuajatmuahooa.supabase.co`
- **Port**: `5432`
- **User**: `postgres`
- **SSL Mode**: `require`
- **IPv4 Support**: ❌ No (IPv6 only)
- **Use Case**: Database migrations via Alembic

### 2. Transaction Pooler (IPv4 compatible)
**For serverless/edge (Vercel)** - Recommended for production

```
postgresql://postgres.ecmnzrtsuajatmuahooa:[PASSWORD]@aws-1-us-west-1.pooler.supabase.com:6543/postgres
```

- **Host**: `aws-1-us-west-1.pooler.supabase.com`
- **Port**: `6543`
- **User**: `postgres.ecmnzrtsuajatmuahooa` (note the format!)
- **Pool Mode**: `transaction`
- **SSL Mode**: `require`
- **IPv4 Support**: ✅ Yes
- **Use Case**: Vercel Functions, serverless deployments

### 3. Session Pooler (IPv4 compatible)
**For local development** - Alternative to direct connection

```
postgresql://postgres.ecmnzrtsuajatmuahooa:[PASSWORD]@aws-1-us-west-1.pooler.supabase.com:5432/postgres
```

- **Host**: `aws-1-us-west-1.pooler.supabase.com`
- **Port**: `5432`
- **User**: `postgres.ecmnzrtsuajatmuahooa`
- **Pool Mode**: `session`
- **SSL Mode**: `require`
- **IPv4 Support**: ✅ Yes
- **Use Case**: Local development, long-lived connections

## API Keys

### Public Keys (Safe to expose in frontend)

```env
SUPABASE_URL=https://ecmnzrtsuajatmuahooa.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjbW56cnRzdWFqYXRtdWFob29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDY4OTAsImV4cCI6MjA3Mzg4Mjg5MH0.-98puJZrP8Zi55J9eswwsbX7SmXa-xUSJkHnwO0YQgw
```

### Service Keys (KEEP SECRET - Backend only)

```env
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjbW56cnRzdWFqYXRtdWFob29hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMwNjg5MCwiZXhwIjoyMDczODgyODkwfQ.-QiS77O5vfZn4QD5iX1s12_qb7KKtoEw151zi7ZvPXM
```

## pgvector Extension

### Enable via Dashboard (Recommended)
1. Go to [Dashboard → Database → Extensions](https://supabase.com/dashboard/project/ecmnzrtsuajatmuahooa/database/extensions)
2. Search for "vector"
3. Click "Enable"

### Enable via SQL
```sql
-- Enable pgvector using extensions schema (2025 best practice)
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Grant usage on extensions schema
GRANT USAGE ON SCHEMA extensions TO authenticated;

-- Verify it's enabled
SELECT extname, extversion, extnamespace::regnamespace AS schema
FROM pg_extension
WHERE extname = 'vector';
```

## Secret Storage

### Local Development (gopass)

```bash
# Store credentials
gopass insert development/supabase/journal/db_password
gopass insert development/supabase/journal/anon_key
gopass insert development/supabase/journal/service_key
gopass insert development/supabase/journal/url
gopass insert development/supabase/journal/pooler_host

# Retrieve credentials
gopass show development/supabase/journal/db_password
```

### Vercel Environment Variables

Add these via [Vercel Dashboard](https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal/settings/environment-variables):

```env
# Database (Transaction pooler for serverless)
DATABASE_URL=postgresql://postgres.ecmnzrtsuajatmuahooa:[PASSWORD]@aws-1-us-west-1.pooler.supabase.com:6543/postgres
JOURNAL_DB_URL=postgresql://postgres.ecmnzrtsuajatmuahooa:[PASSWORD]@aws-1-us-west-1.pooler.supabase.com:6543/postgres
JOURNAL_DB_URL_ASYNC=postgresql://postgres.ecmnzrtsuajatmuahooa:[PASSWORD]@aws-1-us-west-1.pooler.supabase.com:6543/postgres

# Supabase SDK
SUPABASE_URL=https://ecmnzrtsuajatmuahooa.supabase.co
SUPABASE_ANON_KEY=[anon_key_from_gopass]
SUPABASE_SERVICE_KEY=[service_key_from_gopass]
```

### GitHub Actions Secrets

Add via [GitHub Settings](https://github.com/verlyn13/journal/settings/secrets/actions):

```yaml
DATABASE_URL: [transaction_pooler_url]
SUPABASE_URL: https://ecmnzrtsuajatmuahooa.supabase.co
SUPABASE_ANON_KEY: [anon_key]
SUPABASE_SERVICE_KEY: [service_key]
```

## Testing Connections

### Using psql

```bash
# Session Pooler (IPv4, for local dev)
PGSSLMODE=require psql "postgresql://postgres.ecmnzrtsuajatmuahooa:$(gopass show development/supabase/journal/db_password)@aws-1-us-west-1.pooler.supabase.com:5432/postgres" -c "SELECT version();"

# Transaction Pooler (for production verification)
PGSSLMODE=require psql "postgresql://postgres.ecmnzrtsuajatmuahooa:$(gopass show development/supabase/journal/db_password)@aws-1-us-west-1.pooler.supabase.com:6543/postgres" -c "SELECT version();"
```

### Using Python (from apps/api)

```bash
cd apps/api && uv run python -c "
import asyncpg, asyncio
async def test():
    conn = await asyncpg.connect('postgresql://postgres.ecmnzrtsuajatmuahooa:PASSWORD@aws-1-us-west-1.pooler.supabase.com:5432/postgres?sslmode=require')
    version = await conn.fetchval('SELECT version()')
    print(f'✅ Connected! {version}')
    await conn.close()
asyncio.run(test())"
```

## Database Migrations

```bash
cd apps/api

# Use direct connection for migrations (requires IPv6)
export DATABASE_URL="postgresql://postgres:$(gopass show development/supabase/journal/db_password)@db.ecmnzrtsuajatmuahooa.supabase.co:5432/postgres"

# Run migrations
uv run alembic upgrade head

# Create new migration
uv run alembic revision --autogenerate -m "description"
```

## Common Issues

### IPv6 Network Error
- **Problem**: "Network is unreachable" when using direct connection
- **Solution**: Use pooler URLs (port 5432/6543) instead of direct connection

### Tenant or User Not Found
- **Problem**: "Tenant or user not found" error
- **Solution**: Check username format - use `postgres.PROJECT_REF` for pooler connections

### Invalid URI Query Parameter
- **Problem**: psql rejects `?pgbouncer=true`
- **Solution**: Don't use this parameter - use correct pooler host and port instead

### Connection Refused
- **Problem**: Connection fails even with correct credentials
- **Solution**: Ensure `PGSSLMODE=require` is set or add `?sslmode=require` to connection string

## Security Notes

1. **Never commit passwords** to git - use placeholders like `[PASSWORD]`
2. **Service key is sensitive** - it bypasses Row Level Security
3. **Use anon key for frontend** - it respects RLS policies
4. **Always use SSL** - Set `sslmode=require` for all connections
5. **Use pooler for apps** - Direct connection only for migrations
6. **Store secrets in gopass** locally, Vercel Dashboard for production

## Related Documentation

- [Environment Variables Configuration](./environment-variables.md)
- [Vercel Deployment](./vercel-deployment.md)
- [Vercel-Supabase Strategy](./vercel-supabase-strategy.md)
- [Data Policy](./data-policy.md)
