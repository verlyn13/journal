# Deployment Documentation Reference
**Updated**: 2025-01-19

## 📍 Documentation has been moved to proper locations

All deployment and configuration documentation is now properly organized in the `docs/` directory structure and validated by our documentation system.

## Key Documentation Locations

### 🚀 Deployment Configuration
- **Supabase Configuration**: [`docs/deployment/supabase-configuration.md`](docs/deployment/supabase-configuration.md)
- **Environment Variables**: [`docs/deployment/environment-variables.md`](docs/deployment/environment-variables.md)
- **Vercel Deployment**: [`docs/deployment/vercel-deployment.md`](docs/deployment/vercel-deployment.md)

### 🔧 Infrastructure
- **Infisical Architecture**: [`docs/infrastructure/INFISICAL_ARCHITECTURE.md`](docs/infrastructure/INFISICAL_ARCHITECTURE.md)
- **Error Handling**: [`docs/infrastructure/error-handling-logging.md`](docs/infrastructure/error-handling-logging.md)

### 📦 Quick Reference

#### Database Connection (Supabase)
- **Project ID**: `ecmnzrtsuajatmuahooa`
- **Region**: US West 1
- **Session Pooler** (local dev): Port 5432
- **Transaction Pooler** (Vercel): Port 6543

#### Environment Files
- `.env` - Local development (git-ignored)
- `.env.production` - Production reference
- `.env.production.minimal` - Quick deploy essentials
- `.env.schema` - Complete documentation

#### Secret Storage
```bash
# Retrieve from gopass
gopass show development/supabase/journal/db_password
gopass show development/journal/jwt_secret
```

## Quick Commands

### Test Database Connection
```bash
cd apps/api
uv run python healthcheck_db.py
```

### Deploy to Vercel
```bash
vercel --prod
```

### Run Migrations
```bash
cd apps/api
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.ecmnzrtsuajatmuahooa.supabase.co:5432/postgres"
uv run alembic upgrade head
```

## Dashboard Links
- [Vercel Dashboard](https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal)
- [Supabase Dashboard](https://supabase.com/dashboard/project/ecmnzrtsuajatmuahooa)

---

**Note**: Old documentation files have been archived to `docs/archive/root-level-docs/` for reference.