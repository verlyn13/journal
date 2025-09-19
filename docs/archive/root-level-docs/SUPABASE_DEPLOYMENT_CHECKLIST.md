# Supabase Deployment Checklist
**Last Updated**: 2025-01-19

## ✅ Completed

### 1. Supabase Project Creation
- **Project Name**: journal
- **Project ID**: ecmnzrtsuajatmuahooa
- **Region**: US West 1 (North California)
- **PostgreSQL Version**: 17.6
- **pgvector**: ✅ Enabled

### 2. Credentials Stored in gopass
```bash
# Database password
gopass show development/supabase/journal/db_password

# API Keys
gopass show development/supabase/journal/anon_key
gopass show development/supabase/journal/service_key

# URLs
gopass show development/supabase/journal/url
gopass show development/supabase/journal/pooler_host
```

### 3. Local Environment Configuration
- `.env` file created with session pooler URLs (IPv4 compatible)
- `.env.production.minimal` updated with transaction pooler URLs

### 4. Database Connectivity
- ✅ Session pooler (port 5432) tested and working
- ✅ Transaction pooler (port 6543) configured for Vercel
- ✅ pgvector extension enabled and verified

## 📋 External Systems Configuration

### Vercel Environment Variables
Add these to https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal/settings/environment-variables

```env
# Supabase Core
SUPABASE_URL=https://ecmnzrtsuajatmuahooa.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjbW56cnRzdWFqYXRtdWFob29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDY4OTAsImV4cCI6MjA3Mzg4Mjg5MH0.-98puJZrP8Zi55J9eswwsbX7SmXa-xUSJkHnwO0YQgw
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjbW56cnRzdWFqYXRtdWFob29hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMwNjg5MCwiZXhwIjoyMDczODgyODkwfQ.-QiS77O5vfZn4QD5iX1s12_qb7KKtoEw151zi7ZvPXM

# Database (Transaction pooler for serverless)
DATABASE_URL=postgresql://postgres.ecmnzrtsuajatmuahooa:ZRbtw8iwQS2rZj9ty986tzCK1yS4cDuQ@aws-1-us-west-1.pooler.supabase.com:6543/postgres
JOURNAL_DB_URL=postgresql://postgres.ecmnzrtsuajatmuahooa:ZRbtw8iwQS2rZj9ty986tzCK1yS4cDuQ@aws-1-us-west-1.pooler.supabase.com:6543/postgres
JOURNAL_DB_URL_ASYNC=postgresql://postgres.ecmnzrtsuajatmuahooa:ZRbtw8iwQS2rZj9ty986tzCK1yS4cDuQ@aws-1-us-west-1.pooler.supabase.com:6543/postgres

# JWT Configuration
JOURNAL_JWT_SECRET=0bb13dbcda9c942dd827a222d89ed94d974a56e102b804387d77d5e399399fec
JOURNAL_JWT_ISS=journal-api
JOURNAL_JWT_AUD=journal-clients

# WebAuthn/Passkeys
JOURNAL_WEBAUTHN_RP_ID=journal.thenash.group
JOURNAL_WEBAUTHN_RP_NAME=Journal App
JOURNAL_WEBAUTHN_ORIGIN=https://journal.thenash.group

# CORS
CORS_ORIGINS=https://journal.thenash.group,https://journal-*.vercel.app,http://localhost:3000,http://localhost:5173

# Environment
NODE_ENV=production
JOURNAL_ENV=production
VITE_API_URL=/api
VITE_APP_NAME=Journal
VITE_APP_VERSION=1.0.0
```

### GitHub Secrets (for GitHub Actions)
Add to https://github.com/verlyn13/journal/settings/secrets/actions

```yaml
# Database URLs
DATABASE_URL: postgresql://postgres.ecmnzrtsuajatmuahooa:ZRbtw8iwQS2rZj9ty986tzCK1yS4cDuQ@aws-1-us-west-1.pooler.supabase.com:6543/postgres

# Supabase
SUPABASE_URL: https://ecmnzrtsuajatmuahooa.supabase.co
SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjbW56cnRzdWFqYXRtdWFob29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDY4OTAsImV4cCI6MjA3Mzg4Mjg5MH0.-98puJZrP8Zi55J9eswwsbX7SmXa-xUSJkHnwO0YQgw
SUPABASE_SERVICE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjbW56cnRzdWFqYXRtdWFob29hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMwNjg5MCwiZXhwIjoyMDczODgyODkwfQ.-QiS77O5vfZn4QD5iX1s12_qb7KKtoEw151zi7ZvPXM

# JWT
JOURNAL_JWT_SECRET: 0bb13dbcda9c942dd827a222d89ed94d974a56e102b804387d77d5e399399fec
```

### Infisical (if using for secret management)
Path: `/production/journal/`

```json
{
  "SUPABASE_URL": "https://ecmnzrtsuajatmuahooa.supabase.co",
  "SUPABASE_ANON_KEY": "[anon_key]",
  "SUPABASE_SERVICE_KEY": "[service_key]",
  "DATABASE_URL": "postgresql://postgres.ecmnzrtsuajatmuahooa:[PASSWORD]@aws-1-us-west-1.pooler.supabase.com:6543/postgres",
  "JOURNAL_JWT_SECRET": "[jwt_secret]"
}
```

## 🔌 Connection Reference

### For Different Environments

| Environment | Connection Type | URL Format |
|------------|----------------|------------|
| **Local Dev** | Session Pooler (5432) | `postgresql://postgres.ecmnzrtsuajatmuahooa:[PASSWORD]@aws-1-us-west-1.pooler.supabase.com:5432/postgres` |
| **Vercel/Edge** | Transaction Pooler (6543) | `postgresql://postgres.ecmnzrtsuajatmuahooa:[PASSWORD]@aws-1-us-west-1.pooler.supabase.com:6543/postgres` |
| **Migrations** | Direct (5432) | `postgresql://postgres:[PASSWORD]@db.ecmnzrtsuajatmuahooa.supabase.co:5432/postgres` |

### Connection Parameters

| Parameter | Session Mode | Transaction Mode | Direct |
|-----------|-------------|-----------------|---------|
| **Host** | aws-1-us-west-1.pooler.supabase.com | aws-1-us-west-1.pooler.supabase.com | db.ecmnzrtsuajatmuahooa.supabase.co |
| **Port** | 5432 | 6543 | 5432 |
| **User** | postgres.ecmnzrtsuajatmuahooa | postgres.ecmnzrtsuajatmuahooa | postgres |
| **Database** | postgres | postgres | postgres |
| **SSL Mode** | require | require | require |
| **IPv4** | ✅ Yes | ✅ Yes | ❌ IPv6 only |

## 🚀 Next Steps

1. **Run Database Migrations**
   ```bash
   cd apps/api
   export DATABASE_URL="postgresql://postgres:ZRbtw8iwQS2rZj9ty986tzCK1yS4cDuQ@db.ecmnzrtsuajatmuahooa.supabase.co:5432/postgres"
   uv run alembic upgrade head
   ```

2. **Set Up Upstash Redis**
   - Create account at https://upstash.com
   - Create Redis database
   - Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to Vercel

3. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

4. **Verify Production**
   - Check https://journal.thenash.group
   - Test database connectivity
   - Verify Speed Insights are collecting data

## 📝 Notes

- The warning "No owner key found" from gopass is normal - we use age encryption with SSH keys, not GPG
- Always use pooler URLs for application connections (better performance and IPv4 support)
- Direct connection is only for migrations and requires IPv6 support
- pgvector is already enabled in the extensions schema
- All sensitive credentials are stored in gopass under `development/supabase/journal/`