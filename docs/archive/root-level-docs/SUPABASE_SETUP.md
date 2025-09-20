# Supabase Project Configuration
**Created**: 2025-01-19
**Updated**: 2025-01-19
**Project**: Journal Application

## Project Details
- **Project Name**: journal
- **Project ID**: `ecmnzrtsuajatmuahooa`
- **Project URL**: https://ecmnzrtsuajatmuahooa.supabase.co
- **Region**: US West 1 (North California)
- **Pooler Host**: `aws-1-us-west-1.pooler.supabase.com`

## API Keys (Stored in gopass)
```bash
# Retrieve keys from gopass:
gopass show development/supabase/journal/anon_key
gopass show development/supabase/journal/service_key
gopass show development/supabase/journal/url
```

## Database Connection Strings

### ⚠️ IMPORTANT: Get your database password from Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/ecmnzrtsuajatmuahooa/settings/database
2. Copy your database password
3. Store it securely:
```bash
gopass insert development/supabase/journal/db_password
```

## Connection Types (September 2025 Configuration)

### 1. Direct Connection (IPv6 only)
**For migrations only** - Requires IPv6 support
```
postgresql://postgres:[YOUR-PASSWORD]@db.ecmnzrtsuajatmuahooa.supabase.co:5432/postgres
```
- Host: `db.ecmnzrtsuajatmuahooa.supabase.co`
- Port: `5432`
- User: `postgres`

### 2. Transaction Pooler (IPv4 compatible)
**For serverless/edge (Vercel)** - Recommended for production
```
postgresql://postgres.ecmnzrtsuajatmuahooa:[YOUR-PASSWORD]@aws-1-us-west-1.pooler.supabase.com:6543/postgres
```
- Host: `aws-1-us-west-1.pooler.supabase.com`
- Port: `6543`
- User: `postgres.ecmnzrtsuajatmuahooa`
- Pool Mode: `transaction`

### 3. Session Pooler (IPv4 compatible)
**For local development** - Alternative to direct connection
```
postgresql://postgres.ecmnzrtsuajatmuahooa:[YOUR-PASSWORD]@aws-1-us-west-1.pooler.supabase.com:5432/postgres
```
- Host: `aws-1-us-west-1.pooler.supabase.com`
- Port: `5432`
- User: `postgres.ecmnzrtsuajatmuahooa`
- Pool Mode: `session`

## Enable pgvector Extension

### Option 1: Via Dashboard (Recommended)
1. Go to Dashboard → Database → Extensions
2. Search for "vector"
3. Click "Enable"

### Option 2: Via SQL Editor
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

## Update Environment Variables

### For Local Development (.env)
```bash
# Supabase Configuration
SUPABASE_URL=https://ecmnzrtsuajatmuahooa.supabase.co
SUPABASE_ANON_KEY=$(gopass show development/supabase/journal/anon_key)
SUPABASE_SERVICE_KEY=$(gopass show development/supabase/journal/service_key)

# Database (use pooled connection)
JOURNAL_DB_URL=postgresql://postgres:$(gopass show development/supabase/journal/db_password)@db.ecmnzrtsuajatmuahooa.supabase.co:6543/postgres?pgbouncer=true
JOURNAL_DB_URL_ASYNC=postgresql://postgres:$(gopass show development/supabase/journal/db_password)@db.ecmnzrtsuajatmuahooa.supabase.co:6543/postgres?pgbouncer=true
DATABASE_URL=postgresql://postgres:$(gopass show development/supabase/journal/db_password)@db.ecmnzrtsuajatmuahooa.supabase.co:6543/postgres?pgbouncer=true
```

### For Vercel Production
Add these in Vercel Dashboard → Environment Variables:

| Variable | Value |
|----------|-------|
| SUPABASE_URL | https://ecmnzrtsuajatmuahooa.supabase.co |
| SUPABASE_ANON_KEY | (anon key from gopass) |
| SUPABASE_SERVICE_KEY | (service key from gopass - keep SECRET!) |
| JOURNAL_DB_URL | postgresql://postgres:[PASSWORD]@db.ecmnzrtsuajatmuahooa.supabase.co:6543/postgres?pgbouncer=true |
| JOURNAL_DB_URL_ASYNC | (same as above) |
| DATABASE_URL | (same as above) |

## Quick Test Connection

```bash
# Test Session Pooler (IPv4, for local dev)
PGSSLMODE=require psql "postgresql://postgres.ecmnzrtsuajatmuahooa:$(gopass show development/supabase/journal/db_password)@aws-1-us-west-1.pooler.supabase.com:5432/postgres" -c "SELECT version();"

# Test Transaction Pooler (for production verification)
PGSSLMODE=require psql "postgresql://postgres.ecmnzrtsuajatmuahooa:$(gopass show development/supabase/journal/db_password)@aws-1-us-west-1.pooler.supabase.com:6543/postgres" -c "SELECT version();"

# Test with Python (from apps/api directory)
cd apps/api && uv run python -c "
import asyncpg
import asyncio
import os

async def test():
    # Get password from gopass
    password = os.popen('gopass show development/supabase/journal/db_password').read().strip()
    conn_str = f'postgresql://postgres.ecmnzrtsuajatmuahooa:{password}@aws-1-us-west-1.pooler.supabase.com:5432/postgres?sslmode=require'

    conn = await asyncpg.connect(conn_str)
    version = await conn.fetchval('SELECT version()')
    print(f'✅ Connected! PostgreSQL {version}')
    await conn.close()

asyncio.run(test())
"
```

## Database Migration

After setting up connection strings:

```bash
cd apps/api

# Set environment variable
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.ecmnzrtsuajatmuahooa.supabase.co:5432/postgres"

# Run migrations
uv run alembic upgrade head
```

## Security Notes

1. **NEVER commit passwords** to git
2. **Use pooled connection** (port 6543) for the app
3. **Use direct connection** (port 5432) only for migrations
4. **Keep service_role key SECRET** - it bypasses Row Level Security
5. **Use anon key** for client-side operations

## Troubleshooting

### Connection Issues
- Verify password is correct
- Check if IP is whitelisted (if restrictions enabled)
- Use pooled connection (6543) not direct (5432)

### pgvector Not Working
- Run CREATE EXTENSION command above
- Check extension is in correct schema
- Verify with: `SELECT * FROM pg_extension WHERE extname = 'vector';`

### Permission Errors
- Ensure using correct role (postgres)
- Check RLS policies if enabled
- Verify service key for admin operations

## Next Steps

1. ✅ Store database password in gopass
2. ✅ Enable pgvector extension
3. ✅ Update local .env file
4. ✅ Add environment variables to Vercel
5. ⏳ Run database migrations
6. ⏳ Test connection from app
7. ⏳ Set up Upstash Redis