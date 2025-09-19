# Vercel + Supabase Migration Assessment - Journal App

**Assessment Date**: September 16, 2025
**Repository**: verlyn13/journal
**Current Stack**: React (Vite) + FastAPI + PostgreSQL + Redis + NATS

## Executive Summary

The Journal application requires significant architectural changes for Vercel + Supabase deployment. The primary blockers are **extensive Bun usage in frontend tooling** and **complex backend services** that don't map cleanly to serverless functions.

---

## 0) Baseline Versions & Platform Assumptions

### Current Status
- ❌ **Supabase CLI**: Not installed or used
- ❌ **Supabase Branching**: No strategy defined
- ❌ **Edge Functions**: No Deno code present
- ⚠️ **Vercel Environments**: Not configured
- ❌ **Bun Runtime**: Heavily used but NOT supported by Vercel

### Evidence
- No `supabase` directory or configuration files found
- No Deno imports or Edge Function definitions
- **171 files** reference Bun across documentation and tooling

---

## 1) Repository Audit (Structure & Package Management)

### Current Status
- ❌ **Package Manager**: Bun is PRIMARY for frontend (`bun.lock`, `bunfig.toml`)
- ⚠️ **Build Commands**: Mix of `bun run` and standard commands
- ✅ **Server Code**: FastAPI (Python) - separate from frontend

### Key Files
```
apps/web/package.json - Lines 22-24:
  "quality:all": "bun run quality:types && bun run quality:lint && bun run quality:test && bun run quality:bundle",
  "precommit": "bun run quality:all"

apps/web/bun.lock - 26,835 lines of Bun-specific lockfile
bunfig.toml - Bun configuration at root
```

### Required Changes
1. Replace ALL `bun run` with `npm run` or `pnpm run`
2. Generate `package-lock.json` or `pnpm-lock.yaml`
3. Remove Bun-specific configurations
4. Update CI/CD workflows (currently use Bun)

---

## 2) Environment Variables & Secrets

### Current Status
- ⚠️ **Infisical Integration**: Complex Universal Auth setup
- ❌ **Vercel Env Vars**: None configured
- ⚠️ **Multiple DB URLs**: Async and sync variants

### Key Variables Found
```python
# apps/api/app/settings.py
db_url_async: str = "postgresql+asyncpg://journal:journal@localhost:5433/journal"
db_url_sync: str = "postgresql+psycopg://journal:journal@localhost:5433/journal"
redis_url: str = "redis://localhost:6380/0"
nats_url: str = "nats://localhost:4222"
jwt_secret: str = "change_me"
infisical_project_id: str = "d01f583a-d833-4375-b359-c702a726ac4d"
```

### Migration Requirements
- Map 20+ environment variables to Vercel dashboard
- Replace Infisical with Vercel's env management OR maintain hybrid
- Update all `JOURNAL_` prefixed vars

---

## 3) Database Migration (PostgreSQL → Supabase Postgres)

### Current Status
- ✅ **Migrations**: Alembic with 13 migration files
- ⚠️ **Extensions**: Uses `pgvector` (requires Supabase Pro)
- ❌ **RLS**: Not implemented (uses service-level auth)

### Database Features Used
```sql
-- From migrations
- pgvector extension (0001_enable_pgvector.py)
- Full-text search with GIN indexes (0002_add_fts_and_indexes.py)
- JSONB columns for metrics (0005_add_content_metrics.py)
- Outbox pattern tables (0007_add_processed_events.py)
- WebAuthn tables (0010_add_webauthn_tables.py)
```

### Migration Complexity: **HIGH**
- Requires pgvector support (Supabase Pro plan)
- Complex schema with 10+ tables
- No Row Level Security policies
- Multiple async/sync connection patterns

---

## 4) Auth Integration

### Current Status
- ✅ **Custom JWT**: Complete implementation with HS256
- ⚠️ **WebAuthn**: Tables present but implementation incomplete
- ❌ **Supabase Auth**: Would require full rewrite

### Auth Components
```python
# apps/api/app/infra/auth.py
- create_access_token() - Custom JWT with 15min expiry
- create_refresh_token() - 30-day refresh tokens
- Bearer authentication scheme
- Session management in PostgreSQL
```

### Migration Path
- Option A: Keep custom auth, ignore Supabase Auth
- Option B: Full rewrite to Supabase Auth (major effort)

---

## 5) Storage, Edge Functions, Background Work

### Current Status
- ❌ **File Storage**: No file uploads found
- ⚠️ **Background Workers**: NATS-based embedding worker
- ❌ **Edge Functions**: None (all Python FastAPI)

### Background Services
```python
# apps/api/app/workers/embedding_consumer.py
- NATS consumer for async embedding generation
- PostgreSQL outbox pattern for reliability
- Would need conversion to Edge Functions or external service
```

---

## 6) HTTP Surface & Integrations

### Current Status
- ✅ **API Structure**: RESTful with `/api/v1/*` prefix
- ⚠️ **CORS**: Configured but needs multi-env support
- ❌ **Webhooks**: Infisical webhooks configured

### API Endpoints
```
/api/v1/auth/* - Authentication flows
/api/v1/entries/* - CRUD operations
/api/v1/search/* - Vector similarity search
/api/v1/jwks - JWKS endpoint
```

---

## 7) Application Code Refactors

### Critical Issues

#### Frontend (React/Vite)
- ❌ **Build Tool**: Vite + Bun (Vercel uses Node)
- ⚠️ **API Calls**: Hardcoded localhost URLs
- ✅ **No File I/O**: Pure client-side

#### Backend (FastAPI)
- ❌ **Long-running**: Embedding worker incompatible with serverless
- ❌ **NATS Dependency**: Not available on Vercel
- ❌ **Redis Dependency**: Needs external service
- ⚠️ **Database Pools**: Async patterns need adjustment

### Required Refactors
1. Convert embedding worker to Edge Function or external service
2. Replace NATS with Supabase Realtime or webhooks
3. External Redis (Upstash/Redis Cloud)
4. Connection pooling strategy for serverless

---

## 8) CI/CD & Preview Strategy

### Current Status
- ✅ **GitHub Actions**: Comprehensive CI
- ❌ **Preview Deployments**: Not configured
- ⚠️ **Database Seeding**: Basic fixtures only

### Current CI Uses
- PostgreSQL service containers
- Redis service containers
- Infisical CLI shims
- Bun for frontend tests

---

## 9) Observability & Ops

### Current Status
- ⚠️ **OpenTelemetry**: Configured but needs new endpoint
- ✅ **Structured Logging**: Python logging configured
- ❌ **Vercel Analytics**: Not integrated

---

## 10) Migration Blockers

### HIGH Priority Blockers
1. **Bun Dependency**: 171 files reference Bun, core build tool
2. **NATS Message Queue**: No Vercel equivalent
3. **Background Workers**: Incompatible with serverless
4. **pgvector Extension**: Requires Supabase Pro

### MEDIUM Priority Issues
1. **Redis Requirement**: Need external service
2. **Infisical Integration**: Complex to maintain
3. **Multiple DB Connections**: Async/sync patterns
4. **Custom Auth System**: Not using Supabase Auth

### LOW Priority Issues
1. **No file storage needs**: Positive for migration
2. **Clean API structure**: Easy to convert to Edge Functions
3. **No server-side rendering**: Simpler deployment

---

## Feasibility Assessment

### Vercel Deployment: **NOT RECOMMENDED** ❌
- **Bun tooling** is deeply integrated and unsupported
- FastAPI backend doesn't fit serverless model
- Background workers need major rearchitecture

### Supabase Integration: **PARTIALLY FEASIBLE** ⚠️
- Database migration possible with Pro plan
- Auth system would need complete rewrite
- Could use Realtime instead of NATS

---

## Recommended Path Forward

### Option 1: Traditional Deployment (Recommended)
Deploy to traditional hosting (AWS ECS, Railway, Render) that supports:
- Long-running Python processes
- Redis and NATS services
- Direct PostgreSQL access

### Option 2: Partial Migration
1. Keep backend on traditional hosting
2. Deploy only frontend to Vercel
3. Use Supabase for database only
4. Maintain existing auth system

### Option 3: Full Rewrite (Not Recommended)
1. Convert backend to Next.js API routes
2. Replace NATS with Supabase Realtime
3. Rewrite auth using Supabase Auth
4. Convert workers to Edge Functions
5. Estimated effort: 4-6 weeks

---

## Quick Decision Matrix

| Requirement | Current State | Vercel Ready? | Effort |
|------------|--------------|---------------|---------|
| Package Manager | Bun | ❌ No | HIGH |
| Frontend Build | Vite + Bun | ❌ No | HIGH |
| Backend Runtime | Python/FastAPI | ⚠️ Partial | HIGH |
| Database | PostgreSQL + pgvector | ⚠️ With Pro | MEDIUM |
| Message Queue | NATS | ❌ No | HIGH |
| Cache | Redis | ⚠️ External | LOW |
| Auth | Custom JWT | ✅ Yes | LOW |
| File Storage | None | ✅ Yes | NONE |
| Background Jobs | NATS Workers | ❌ No | HIGH |

**Overall Migration Complexity: VERY HIGH** 🔴

---

## Next Steps if Proceeding

1. **Immediate**: Replace Bun with pnpm/npm throughout
2. **Week 1**: Prototype Edge Function for one endpoint
3. **Week 2**: Test Supabase database migration with pgvector
4. **Week 3**: Evaluate background worker alternatives
5. **Week 4**: Make final go/no-go decision

---

## Alternative Recommendations

Given the complexity, consider:

1. **Railway.app**: Supports Python, Redis, PostgreSQL natively
2. **Render.com**: Background workers, private networking
3. **Fly.io**: Edge deployment with persistent services
4. **AWS Copilot**: If you need AWS scale

These platforms would require **minimal code changes** versus the **major rewrite** needed for Vercel + Supabase.