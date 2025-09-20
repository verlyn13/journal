# Deployment Readiness Checklist
**Date**: 2025-01-19
**Branch**: `pre-deployment-prep`
**Target**: Vercel + Supabase

## ✅ Infrastructure Setup

### Vercel Configuration
- ✅ Project linked (`prj_hEKDwH40wWNzVTZnynNAdxNuu8yu`)
- ✅ Team configured (`team_gvgzBkX242v2UQMCiWa9iyam`)
- ✅ Custom domain ready (journal.thenash.group)
- ✅ Build settings configured (Vite preset, Bun support)
- ✅ Speed Insights integrated
- ⏳ Environment variables need to be added to dashboard

### Supabase Database
- ✅ Project created (`ecmnzrtsuajatmuahooa`)
- ✅ Region: US West 1
- ✅ Database connectivity verified (PostgreSQL 17.6)
- ✅ pgvector extension enabled (v0.8.0)
- ✅ Connection strings documented
- ✅ Credentials stored in gopass
- ⏳ Migrations need to be run

### Environment Configuration
- ✅ `.env` - Local development configured
- ✅ `.env.production` - Production reference updated
- ✅ `.env.production.minimal` - Quick deploy ready
- ✅ `.env.schema` - Documentation complete
- ✅ All Supabase URLs use correct 2025 patterns

## 📋 Pre-Deployment Tasks

### Critical Environment Variables for Vercel

Add these to Vercel Dashboard before deployment:

```env
# Database (Transaction pooler for serverless)
DATABASE_URL=postgresql://postgres.ecmnzrtsuajatmuahooa:[PASSWORD]@aws-1-us-west-1.pooler.supabase.com:6543/postgres
JOURNAL_DB_URL=postgresql://postgres.ecmnzrtsuajatmuahooa:[PASSWORD]@aws-1-us-west-1.pooler.supabase.com:6543/postgres
JOURNAL_DB_URL_ASYNC=postgresql://postgres.ecmnzrtsuajatmuahooa:[PASSWORD]@aws-1-us-west-1.pooler.supabase.com:6543/postgres

# Supabase SDK
SUPABASE_URL=https://ecmnzrtsuajatmuahooa.supabase.co
SUPABASE_ANON_KEY=[from gopass: development/supabase/journal/anon_key]
SUPABASE_SERVICE_KEY=[from gopass: development/supabase/journal/service_key]

# JWT Secret
JOURNAL_JWT_SECRET=[from gopass: development/journal/jwt_secret]
JOURNAL_JWT_ISS=journal-api
JOURNAL_JWT_AUD=journal-clients

# WebAuthn
JOURNAL_WEBAUTHN_RP_ID=journal.thenash.group
JOURNAL_WEBAUTHN_RP_NAME=Journal App
JOURNAL_WEBAUTHN_ORIGIN=https://journal.thenash.group

# CORS
CORS_ORIGINS=https://journal.thenash.group,https://journal-*.vercel.app

# Environment
NODE_ENV=production
JOURNAL_ENV=production
VITE_API_URL=/api
VITE_APP_NAME=Journal
VITE_APP_VERSION=1.0.0
```

### Database Migrations

```bash
# 1. Set connection to direct URL (requires IPv6)
cd apps/api
export DATABASE_URL="postgresql://postgres:$(gopass show development/supabase/journal/db_password)@db.ecmnzrtsuajatmuahooa.supabase.co:5432/postgres"

# 2. Run migrations
uv run alembic upgrade head

# 3. Verify tables created
psql $DATABASE_URL -c "\dt"
```

### Build Verification

```bash
# Test frontend build
cd apps/web
bun run build

# Test with production env
NODE_ENV=production bun run build

# Check bundle size
du -sh dist/
```

## 🚀 Deployment Steps

### 1. Add Environment Variables to Vercel
```bash
# Option A: Via Dashboard (Recommended)
# https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal/settings/environment-variables

# Option B: Via CLI
vercel env add DATABASE_URL production
# (paste value when prompted)
```

### 2. Deploy to Production
```bash
# Deploy from current branch
vercel --prod

# Or push to main for auto-deploy
git checkout main
git merge pre-deployment-prep
git push origin main
```

### 3. Post-Deployment Verification
- [ ] Visit https://journal.thenash.group
- [ ] Check API health: https://journal.thenash.group/api/health
- [ ] Test authentication flow
- [ ] Verify database connectivity
- [ ] Check Speed Insights dashboard

## 📊 Current Status

### What's Working
- ✅ Supabase database connected and tested
- ✅ pgvector extension enabled
- ✅ Vercel project linked
- ✅ Environment files properly organized
- ✅ Documentation moved to validated system
- ✅ Secrets stored in gopass

### What Needs Attention
- ⏳ Add environment variables to Vercel Dashboard
- ⏳ Run database migrations
- ⏳ Set up Upstash Redis (optional for now)
- ⏳ Configure Infisical for production secrets (optional)
- ⚠️ Ensure API endpoints are properly configured for Vercel Functions

### Known Issues to Address
- FastAPI needs adaptation for Vercel Functions format
- Need to verify CORS configuration works with production domain
- WebAuthn might need additional configuration for production

## 🔄 PR Summary for `pre-deployment-prep`

### Changes Made
1. **Supabase Integration**
   - Configured project with proper 2025 connection patterns
   - Enabled pgvector for semantic search
   - Set up pooler connections for IPv4 compatibility

2. **Environment Configuration**
   - Reorganized all .env files with clear purposes
   - Updated to use correct Supabase URLs
   - Documented all variables in .env.schema

3. **Documentation**
   - Created comprehensive deployment docs in `docs/deployment/`
   - Added Supabase configuration guide
   - Updated environment variables reference
   - Moved all docs to validated structure

4. **Testing & Validation**
   - Added database health check script
   - Verified connections work with current setup
   - Validated documentation with scripts

### Files Changed
- Modified: `.env.production`, `.env.production.minimal`, `.env.schema`
- Added: `docs/deployment/supabase-configuration.md`
- Added: `docs/deployment/environment-variables.md`
- Updated: `docs/deployment/vercel-deployment.md`
- Added: `apps/api/healthcheck_db.py`
- Added: Various helper scripts for testing

### Next Steps After PR Merge
1. Add all environment variables to Vercel Dashboard
2. Run database migrations
3. Deploy to production
4. Monitor initial deployment
5. Set up Redis caching (Phase 2)

## 🔗 Quick Links

- [Vercel Dashboard](https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal)
- [Environment Variables](https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal/settings/environment-variables)
- [Supabase Dashboard](https://supabase.com/dashboard/project/ecmnzrtsuajatmuahooa)
- [Database Settings](https://supabase.com/dashboard/project/ecmnzrtsuajatmuahooa/settings/database)

## 📝 Notes

- Password is stored in gopass: `development/supabase/journal/db_password`
- JWT secret is in gopass: `development/journal/jwt_secret`
- Use transaction pooler (6543) for Vercel, not session pooler
- Direct connection only works with IPv6 support