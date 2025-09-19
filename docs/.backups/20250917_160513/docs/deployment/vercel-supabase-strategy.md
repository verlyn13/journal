---
id: vercel-supabase-strategy
title: Vercel + Supabase Deployment Strategy
type: deployment
version: 1.0.0
created: '2025-09-16'
updated: '2025-09-16'
author: Journal Team
tags:
- python
- fastapi
- docker
- react
- deployment
priority: critical
status: approved
visibility: internal
schema_version: v1
---

# Vercel + Supabase Deployment Strategy

**Date**: September 16, 2025
**Branch**: pre-deployment-prep
**Status**: IN PROGRESS

## Executive Summary

Based on comprehensive assessment, we're pursuing a **hybrid deployment strategy**:
- **Frontend (React/Vite)** → Vercel (static + Edge Functions)
- **Backend (FastAPI/Workers)** → Traditional hosting (Railway/Render)
- **Database** → Supabase PostgreSQL with pgvector
- **Cache/Queue** → External services (Upstash Redis, NATS Cloud)

## Migration Phases

### Phase 1: Remove Bun Dependencies (COMPLETED)
✅ Updated package.json scripts to use bun ✅ Generated package-lock.json for frontend
✅ Updated CI workflows to use Node.js

### Phase 2: Environment Configuration (IN PROGRESS)
- Map all environment variables for Vercel
- Configure Supabase project
- Set up external services (Redis, NATS)

### Phase 3: Database Migration
- Export current PostgreSQL schema
- Set up Supabase with pgvector extension
- Migrate using Alembic with Supabase connection strings
- Test embeddings functionality

### Phase 4: Frontend Deployment
- Deploy React/Vite app to Vercel
- Configure environment-aware API URLs
- Set up preview deployments

### Phase 5: Backend Adaptation
- Keep FastAPI on Railway/Render
- Configure cross-origin requests
- Maintain worker processes externally

## Technical Decisions

### Why Hybrid Architecture?

1. **Vercel Limitations**:
   - No support for long-running processes (NATS workers)
   - Function timeout limits (max 300s with Fluid)
   - No native Redis/NATS services

2. **Cost Optimization**:
   - Static frontend hosting is free/cheap on Vercel
   - Backend on Railway/Render is predictable
   - Supabase provides managed PostgreSQL

3. **Developer Experience**:
   - Vercel preview deployments for frontend
   - Supabase branching for database previews
   - Traditional hosting for complex backend

## Environment Variables Mapping

### Vercel Environment Variables

```env
# Frontend (VITE_ prefix for client access)
VITE_API_URL=https://api.journal.journal.local  # Your backend host
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx

# Build-time
NODE_ENV=production
```

### Backend Environment Variables (Railway/Render)

```env
# Database
DATABASE_URL=postgresql://...@db.xxxxx.supabase.co:5432/postgres
JOURNAL_DB_URL_ASYNC=postgresql+asyncpg://...
JOURNAL_DB_URL_SYNC=postgresql+psycopg://...

# Redis (Upstash)
REDIS_URL=rediss://...@...upstash.io:6379

# NATS (NATS Cloud or self-hosted)
NATS_URL=nats://...

# Auth
JOURNAL_JWT_SECRET=xxxxx
JOURNAL_JWT_ISS=journal-api
JOURNAL_JWT_AUD=journal-clients

# Infisical (if keeping)
INFISICAL_PROJECT_ID=xxxxx
INFISICAL_SERVER_URL=https://secrets.jefahnierocks.com
```

## Supabase Configuration

### Required Extensions
- `pgvector` - For embeddings (Pro plan required)
- `pg_trgm` - For full-text search
- `uuid-ossp` - For UUID generation

### Database Setup Script
```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgvector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Run Alembic migrations after extensions
```

### Connection Pooling
- Use Supabase connection pooler for serverless
- Direct connection for backend servers
- PgBouncer mode: `session` for FastAPI

## Vercel Project Configuration

### vercel.json
```json
{
  "buildCommand": "cd apps/web && bun run build",
  "outputDirectory": "apps/web/dist",
  "installCommand": "cd apps/web && bun ci --legacy-peer-deps",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.journal.journal.local/api/:path*"
    }
  ]
}
```

### Preview Configuration
- Branch: All branches except `main`
- Environment Variables: Scoped per environment
- Supabase Branching: Enabled with Vercel integration

## Backend Hosting Options

### Railway (Recommended)
```yaml
# railway.toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "apps/api/Dockerfile"

[deploy]
startCommand = "fastapi run app/main.py --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
restartPolicyType = "ON_FAILURE"

[[services]]
name = "worker"
startCommand = "python -m app.workers.embedding_consumer"
```

### Render
```yaml
# render.yaml
services:
  - type: web
    name: journal-api
    env: docker
    dockerfilePath: ./apps/api/Dockerfile
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: journal-db
          property: connectionString

  - type: worker
    name: embedding-worker
    env: docker
    dockerCommand: python -m app.workers.embedding_consumer
```

## Migration Checklist

### Pre-deployment
- [x] Remove Bun from package.json
- [x] Generate bun lockfile
- [x] Update CI workflows
- [ ] Create Supabase project
- [ ] Configure pgvector extension
- [ ] Set up Upstash Redis
- [ ] Deploy backend to Railway/Render
- [ ] Configure CORS for cross-origin

### Vercel Setup
- [ ] Import repository
- [ ] Configure build settings
- [ ] Add environment variables
- [ ] Set up preview deployments
- [ ] Configure custom domain

### Supabase Setup
- [ ] Create project
- [ ] Enable extensions
- [ ] Run migrations
- [ ] Configure connection pooling
- [ ] Set up branching

### Testing
- [ ] Test database connectivity
- [ ] Verify embeddings work
- [ ] Check auth flows
- [ ] Validate CORS
- [ ] Test preview deployments

## Rollback Plan

If issues arise:
1. Frontend: Revert Vercel deployment
2. Database: Restore from Supabase backup
3. Backend: Rollback Railway/Render deployment
4. Emergency: Full revert to local hosting

## Next Steps

1. **Immediate**: Complete environment variable mapping
2. **This Week**: Set up Supabase project and test migrations
3. **Next Week**: Deploy backend to Railway and test integration
4. **Following Week**: Deploy frontend to Vercel with preview branches

## Notes

- Bun removal was necessary for Vercel compatibility
- pgvector requires Supabase Pro plan ($25/month minimum)
- NATS workers must run externally (not serverless)
- Consider migrating to Supabase Auth in future (major rewrite)
- Infisical can coexist with Vercel env management

## Resources

- [Vercel Vite Guide](https://vercel.com/docs/frameworks/vite)
- [Supabase pgvector](https://supabase.com/docs/guides/database/extensions/pgvector)
- [Railway FastAPI](https://docs.railway.app/guides/fastapi)
- [Upstash Redis](https://upstash.com/docs/redis)