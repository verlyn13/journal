# Journal Deployment Infrastructure

**Status**: Phase 0 Complete ✅
**Next**: Phase 1 - Database Migration to Supabase
**Updated**: September 16, 2025

## Overview

This directory contains all deployment configuration and tooling for migrating the Journal application from a local development setup to a production-ready cloud deployment using **Vercel (Frontend) + Railway (Backend) + Supabase (Database)**.

## Phase 0 Completion Summary

### ✅ Completed Tasks

1. **Removed Bun Dependencies**
   - Replaced all `bun run` commands with `npm run`
   - Generated `package-lock.json` for frontend
   - Updated CI workflows to use Node.js

2. **Created Deployment Infrastructure**
   - Environment variable schema (`.env.schema`)
   - Deployment configurations (`vercel.json`, `railway.toml`)
   - Service templates (`upstash.env.template`)
   - Documentation (`supabase.branching.md`)

3. **Implemented Smoke Tests**
   - API health check (`smoke/healthcheck.sh`)
   - Database probe (`smoke/db_probe.py`)
   - Deployment readiness validation

4. **Added Automation**
   - Comprehensive Makefile with 30+ targets
   - GitHub Actions for PR validation
   - Phase gates for safe deployment

5. **Established Quality Gates**
   - Frontend build validation (bundle size limits)
   - API smoke tests (health endpoints)
   - Database connectivity (pgvector support)
   - Environment variable validation

### 🎯 Key Achievements

- **Zero Breaking Changes**: All existing functionality preserved
- **Vercel Ready**: Frontend builds and deploys without Bun
- **Automated Testing**: PR smoke tests catch issues early
- **Documentation**: Complete setup guides and troubleshooting
- **Rollback Safety**: Clear rollback procedures for each phase

## File Structure

```
deploy/
├── README.md                    # This file
├── vercel.json                 # Vercel deployment config
├── railway.toml                # Railway API/worker deployment
├── upstash.env.template        # Redis configuration template
├── supabase.branching.md       # Database branching setup guide
└── smoke/
    ├── healthcheck.sh          # API health validation
    └── db_probe.py             # Database connectivity test
```

## Quick Start

### 1. Validate Phase 0 Readiness

```bash
# Run all deployment checks
make -f Makefile.deploy gate-phase0

# Individual checks
make -f Makefile.deploy deploy-check
make -f Makefile.deploy build-web
```

### 2. Test Smoke Tests Locally

```bash
# Test API health (requires API running)
API_URL=http://localhost:5000 make -f Makefile.deploy smoke-api

# Test database (requires PostgreSQL)
DATABASE_URL=postgresql://... make -f Makefile.deploy smoke-db
```

### 3. Environment Setup

```bash
# Copy and configure environment variables
cp .env.schema .env.local
# Edit .env.local with your values

# Export environment template for deployment
make -f Makefile.deploy env-export
```

## Deployment Targets

### Makefile.deploy Targets

**Build & Development**
- `build-web` - Build frontend for production
- `build-api` - Prepare API dependencies
- `dev` - Start all services locally

**Testing & Quality**
- `test` - Run all tests (unit + integration)
- `smoke` - Run smoke tests (API + DB)
- `lint` - Run code linters
- `quality` - Full quality check pipeline

**Deployment Gates**
- `gate-phase0` - Readiness validation
- `gate-phase1` - Database operational
- `gate-phase2` - API health check
- `gate-phase3` - Frontend build ready

**Utilities**
- `clean` - Clean build artifacts
- `install-deps` - Install all dependencies
- `env-validate` - Check environment variables

## Phase Plan

### ✅ Phase 0: Infrastructure Setup (COMPLETE)
- Remove Bun dependencies
- Create deployment configurations
- Implement smoke tests
- Add automation and gates

### 🎯 Phase 1: Database Migration (NEXT)
- Create Supabase project
- Enable pgvector extension
- Run Alembic migrations
- Configure connection pooling
- Set up branching for previews

### 📋 Phase 2: Backend Deployment
- Deploy FastAPI to Railway
- Configure environment variables
- Set up background workers
- Test CRUD operations

### 📋 Phase 3: Frontend Deployment
- Deploy React app to Vercel
- Configure environment variables
- Set up preview deployments
- Test API integration

### 📋 Phase 4: External Services
- Set up Upstash Redis
- Configure NATS messaging
- Test cache and queue operations

### 📋 Phase 5: Production Optimization
- Enable monitoring
- Set up alerting
- Performance optimization
- Security hardening

## Environment Variables

See `.env.schema` for complete variable definitions. Key categories:

- **Frontend (`VITE_*`)**: Client-side configuration
- **Backend (`JOURNAL_*`)**: Server configuration
- **Database**: PostgreSQL connection strings
- **Services**: Redis, NATS, Infisical

## Smoke Test Status

| Test | Local | Preview | Production |
|------|-------|---------|------------|
| API Health | ✅ | ⏳ | ⏳ |
| Database | ✅ | ⏳ | ⏳ |
| Frontend Build | ✅ | ⏳ | ⏳ |
| Redis | ⏳ | ⏳ | ⏳ |
| NATS | ⏳ | ⏳ | ⏳ |

## Troubleshooting

### Common Issues

**Build Failures**
```bash
# Clean and rebuild
make -f Makefile.deploy clean
make -f Makefile.deploy install-deps
make -f Makefile.deploy build-web
```

**Smoke Test Failures**
```bash
# Check API logs
make -f Makefile.deploy logs-api

# Validate environment
make -f Makefile.deploy env-validate
```

**Permission Issues**
```bash
# Fix script permissions
chmod +x deploy/smoke/*.sh deploy/smoke/*.py
```

### Support

1. Check the deployment logs in GitHub Actions
2. Review environment variable schema
3. Run smoke tests locally first
4. Check service-specific documentation:
   - `deploy/supabase.branching.md`
   - `deploy/upstash.env.template`

## Next Steps

1. **Immediate**: Start Phase 1 by creating Supabase project
2. **This Week**: Complete database migration and testing
3. **Next Week**: Deploy backend to Railway
4. **Following**: Deploy frontend to Vercel with preview branches

## Security Notes

- Never commit actual environment variables
- Use different secrets per environment
- Rotate keys regularly
- Follow least privilege principle
- Monitor for secret exposure in builds

---

**Last Updated**: September 16, 2025
**Phase 0 Status**: ✅ Complete - Ready for Phase 1