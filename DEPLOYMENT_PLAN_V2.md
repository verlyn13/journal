# Deployment Plan V2 - Updated Strategy
**Date**: 2025-01-18
**Based On**: Codebase Assessment Results
**Target**: Vercel (Frontend + Functions) + Supabase (Database + Auth)

## 🎯 Deployment Strategy Change

### Original Plan:
- Frontend: Vercel
- Backend: Railway
- Database: Supabase

### Updated Plan:
- Frontend: Vercel (Static Site)
- Backend: Vercel Functions (Serverless)
- Database: Supabase (PostgreSQL + Auth + Storage)
- Cache: Upstash Redis (Serverless)
- Queue: Upstash QStash (for background tasks)

## 📋 Phase 1: Foundation Setup (Week 1)

### 1.1 Vercel Project Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Initialize project
vercel

# Link to GitHub repo
vercel link
```

### 1.2 Supabase Project Setup
- [ ] Create Supabase project
- [ ] Note connection strings
- [ ] Enable pgvector extension
- [ ] Configure auth providers
- [ ] Set up storage buckets

### 1.3 Environment Configuration
Create `.env.production`:
```env
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
DATABASE_URL=

# Upstash Redis
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# Auth
JWT_SECRET=
JWT_ISS=
JWT_AUD=

# API
VITE_API_URL=/api
```

## 📋 Phase 2: Backend Adaptation (Week 1-2)

### 2.1 Create Vercel Functions Structure
```
api/
├── auth/
│   ├── login.py
│   ├── logout.py
│   ├── refresh.py
│   └── register.py
├── entries/
│   ├── index.py      # GET list, POST create
│   ├── [id].py       # GET, PUT, DELETE single
│   └── search.py     # Search endpoint
├── health.py
└── _lib/
    ├── db.py         # Database connection
    ├── auth.py       # Auth middleware
    └── cors.py       # CORS configuration
```

### 2.2 FastAPI to Vercel Functions Adapter
Create `api/_lib/handler.py`:
```python
from fastapi import FastAPI
from mangum import Mangum

def create_handler(app: FastAPI):
    return Mangum(app, lifespan="off")
```

### 2.3 Database Connection Management
- Use connection pooling via Supabase
- Implement connection reuse pattern
- Add connection timeout handling

### 2.4 Session Storage Migration
- Replace Redis sessions with Upstash
- Implement serverless-compatible session handling
- Update auth flow for stateless operations

## 📋 Phase 3: Database Migration (Week 2)

### 3.1 Export Current Schema
```bash
pg_dump --schema-only journal > schema.sql
```

### 3.2 Create Supabase Migrations
```bash
supabase migration new initial_schema
# Copy and adapt schema.sql
```

### 3.3 Data Migration
- [ ] Export existing data
- [ ] Transform for Supabase format
- [ ] Import to Supabase
- [ ] Verify data integrity

### 3.4 Update Connection Strings
- [ ] Update all database URLs
- [ ] Configure connection pooling
- [ ] Test pgvector functionality

## 📋 Phase 4: Frontend Deployment (Week 2)

### 4.1 Update Build Configuration
```json
// vercel.json
{
  "buildCommand": "cd apps/web && npm run build",
  "outputDirectory": "apps/web/dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" }
  ]
}
```

### 4.2 Environment Variables
- [ ] Configure in Vercel dashboard
- [ ] Set up preview environments
- [ ] Configure production secrets

### 4.3 Deploy Frontend
```bash
vercel --prod
```

## 📋 Phase 5: API Migration (Week 3)

### 5.1 Deploy Functions Incrementally
Priority order:
1. Health check endpoint
2. Authentication endpoints
3. CRUD operations
4. Search functionality
5. Admin endpoints

### 5.2 Testing Each Function
```bash
# Test locally
vercel dev

# Deploy to preview
vercel

# Test preview deployment
curl https://preview-url.vercel.app/api/health
```

### 5.3 Update Frontend API Client
- [ ] Update base URLs
- [ ] Add retry logic
- [ ] Handle serverless cold starts

## 📋 Phase 6: Background Tasks (Week 3)

### 6.1 Replace NATS with QStash
- [ ] Set up Upstash QStash
- [ ] Convert event handlers to webhooks
- [ ] Implement retry logic

### 6.2 Scheduled Tasks
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/cleanup",
    "schedule": "0 2 * * *"
  }]
}
```

## 📋 Phase 7: Testing & Optimization (Week 4)

### 7.1 End-to-End Testing
- [ ] Authentication flow
- [ ] CRUD operations
- [ ] Search functionality
- [ ] File uploads
- [ ] WebAuthn

### 7.2 Performance Optimization
- [ ] Implement caching strategies
- [ ] Optimize bundle size
- [ ] Configure CDN headers
- [ ] Database query optimization

### 7.3 Security Audit
- [ ] CORS configuration
- [ ] Rate limiting
- [ ] Input validation
- [ ] Secret rotation

## 📋 Phase 8: Production Deployment (Week 4)

### 8.1 Pre-Production Checklist
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Documentation updated
- [ ] Rollback plan ready

### 8.2 Deploy to Production
```bash
# Final deployment
vercel --prod

# Verify deployment
./deploy/smoke/healthcheck.sh
```

### 8.3 Post-Deployment
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify all features
- [ ] Update DNS records

## 🚨 Risk Mitigation

### Serverless Limitations
**Risk**: 10-second execution limit
**Mitigation**:
- Break long operations into chunks
- Use background jobs for heavy processing
- Implement progress tracking

### Cold Starts
**Risk**: Slow initial response
**Mitigation**:
- Keep functions warm with cron
- Optimize import statements
- Use edge functions where possible

### Database Connections
**Risk**: Connection pool exhaustion
**Mitigation**:
- Use Supabase connection pooler
- Implement connection reuse
- Add connection timeout

## 📊 Success Metrics

### Performance Targets
- API response time: <200ms (p50)
- Page load time: <3s
- Lighthouse score: >90
- Core Web Vitals: Pass

### Availability Targets
- Uptime: 99.9%
- Error rate: <0.1%
- Success rate: >99%

## 🔄 Rollback Plan

### Immediate Rollback
```bash
# Revert Vercel deployment
vercel rollback

# Restore database backup
supabase db reset
```

### Gradual Rollback
1. Route traffic to old system
2. Fix issues in staging
3. Re-deploy when ready

## 📅 Timeline Summary

**Week 1**: Foundation & Backend Adaptation
**Week 2**: Database Migration & Frontend Deploy
**Week 3**: API Migration & Background Tasks
**Week 4**: Testing & Production Deployment

## 🎯 Next Immediate Actions

1. **Today**: Create Vercel account and project
2. **Tomorrow**: Set up Supabase and migrate schema
3. **Day 3**: Deploy frontend to Vercel
4. **Day 4**: Create first Vercel Function
5. **Day 5**: Test end-to-end flow

## 📚 Required Documentation Updates

1. Create `docs/deployment/vercel-functions-guide.md`
2. Update `docs/deployment/database-migration.md`
3. Create `docs/deployment/serverless-patterns.md`
4. Update environment variable documentation
5. Create troubleshooting guide

## ✅ Definition of Done

The deployment is complete when:
1. All endpoints migrated to Vercel Functions
2. Database fully migrated to Supabase
3. All tests passing in production
4. Monitoring and alerts configured
5. Documentation updated
6. Team trained on new infrastructure

---

**Note**: This plan prioritizes incremental migration with the ability to rollback at each phase. The serverless architecture will provide better scalability and lower operational overhead compared to the original Railway deployment.