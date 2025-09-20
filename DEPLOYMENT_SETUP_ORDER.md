# Deployment Setup Order & Environment Variables Guide
**Last Updated**: 2025-01-18

## 🔑 JWT Secret Placement

The generated JWT secret (from `openssl rand -hex 32`) goes in:
```env
JOURNAL_JWT_SECRET=<your-generated-32-byte-hex-string-here>
```

Example:
```env
JOURNAL_JWT_SECRET=a3f8b92d7e1c4a6f9b2e8d3c7a9f4e2b1d8c7a3f9e2b4d1c8a7f3e9b2d4c1a8f
```

## 📋 Setup Order (Critical Path)

### Phase 1: Domain & DNS (If using custom domain)
**Do this FIRST if you have a custom domain**

1. **Register/Configure Domain** (if not already done)
   - Buy domain from registrar (Namecheap, Cloudflare, etc.)
   - Point to Cloudflare nameservers (if using Cloudflare)

2. **Cloudflare Setup** (optional but recommended)
   - Add site to Cloudflare
   - Configure DNS records (will update after Vercel deployment)
   - Get these values:
     - Note your domain: `yourdomain.com`
     - Cloudflare is automatic, no env vars needed initially

### Phase 2: Vercel Project Setup
**Can do immediately, even without domain**

1. **Create Vercel Project**
   ```bash
   vercel
   ```
   - Link to GitHub repo
   - Choose production branch
   - Note your Vercel URL: `your-project.vercel.app`

2. **Initial Environment Variables** (minimal to get started):
   ```env
   # Can deploy with just these initially
   VITE_API_URL=/api
   VITE_APP_NAME=Journal
   NODE_ENV=production
   JOURNAL_ENV=production

   # Generate and add immediately
   JOURNAL_JWT_SECRET=<generate-with-openssl-rand-hex-32>
   ```

### Phase 3: Database Setup (Supabase)
**Required before API will work**

1. **Create Supabase Project**
   - Go to: https://supabase.com/dashboard
   - Create new project
   - Choose region close to your users
   - Set a strong database password (save it!)

2. **Get Supabase Credentials** (Settings → API):
   ```env
   # From Supabase Dashboard
   SUPABASE_URL=https://[your-project-ref].supabase.co
   SUPABASE_ANON_KEY=[your-anon-key]
   SUPABASE_SERVICE_KEY=[your-service-role-key]  # Keep this SECRET!
   ```

3. **Get Database URLs** (Settings → Database):
   ```env
   # Direct connection (for migrations only)
   DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

   # Pooled connection (for production app) - USE THIS ONE!
   JOURNAL_DB_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:6543/postgres?pgbouncer=true
   JOURNAL_DB_URL_ASYNC=postgresql://postgres:[password]@db.[project-ref].supabase.co:6543/postgres?pgbouncer=true
   JOURNAL_DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:6543/postgres?pgbouncer=true
   ```

4. **Enable pgvector Extension**:
   - In Supabase SQL Editor, run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

### Phase 4: Redis Setup (Upstash)
**Required for sessions/caching**

1. **Create Upstash Account**
   - Go to: https://upstash.com
   - Create Redis database
   - Choose region close to Vercel deployment

2. **Get Redis Credentials**:
   ```env
   # From Upstash Dashboard
   UPSTASH_REDIS_REST_URL=https://[your-endpoint].upstash.io
   UPSTASH_REDIS_REST_TOKEN=[your-token]

   # Also set this for backward compatibility
   JOURNAL_REDIS_URL=redis://default:[password]@[endpoint]:6379
   ```

### Phase 5: Update Domain-Specific Variables
**After deployment is working**

1. **Update for Your Domain**:
   ```env
   # If using custom domain
   JOURNAL_WEBAUTHN_RP_ID=yourdomain.com  # Without https://
   JOURNAL_WEBAUTHN_ORIGIN=https://yourdomain.com
   CORS_ORIGINS=["https://yourdomain.com"]

   # If using Vercel domain only
   JOURNAL_WEBAUTHN_RP_ID=your-project.vercel.app
   JOURNAL_WEBAUTHN_ORIGIN=https://your-project.vercel.app
   CORS_ORIGINS=["https://your-project.vercel.app"]
   ```

2. **Connect Custom Domain to Vercel**:
   - In Vercel Dashboard → Settings → Domains
   - Add your domain
   - Follow DNS configuration instructions

### Phase 6: Optional Services
**Add these after core deployment works**

1. **Sentry** (Error Tracking):
   ```env
   SENTRY_DSN=https://[your-key]@sentry.io/[project-id]
   SENTRY_ENVIRONMENT=production
   ```

2. **QStash** (Background Jobs):
   ```env
   QSTASH_URL=https://qstash.upstash.io/v2
   QSTASH_TOKEN=[your-token]
   ```

## 🎯 Minimum Required for First Deploy

You can deploy with just these:

```env
# Frontend
VITE_API_URL=/api
VITE_APP_NAME=Journal
NODE_ENV=production

# Backend
JOURNAL_ENV=production
JOURNAL_JWT_SECRET=[generate-with-openssl]

# Database (from Supabase)
JOURNAL_DB_URL=[pooled-connection-url]
SUPABASE_URL=[project-url]
SUPABASE_ANON_KEY=[anon-key]

# Redis (from Upstash)
UPSTASH_REDIS_REST_URL=[rest-url]
UPSTASH_REDIS_REST_TOKEN=[token]
```

## 🔄 Deployment Sequence

1. **Generate JWT Secret locally**:
   ```bash
   openssl rand -hex 32
   ```
   Copy this value for `JOURNAL_JWT_SECRET`

2. **Deploy Frontend First** (can work without backend):
   - Set minimal env vars in Vercel
   - Deploy
   - Verify frontend loads

3. **Setup Supabase**:
   - Create project
   - Get credentials
   - Run migrations

4. **Setup Upstash**:
   - Create Redis database
   - Get credentials

5. **Add All Environment Variables**:
   - Add to Vercel dashboard
   - Trigger redeploy

6. **Test Everything**:
   - Check frontend loads
   - Test API endpoints
   - Verify authentication works

7. **Add Custom Domain** (if applicable):
   - Configure in Vercel
   - Update DNS
   - Update domain-related env vars

## ⚠️ Important Security Notes

1. **NEVER commit these to Git**:
   - `JOURNAL_JWT_SECRET`
   - `SUPABASE_SERVICE_KEY`
   - Any tokens or passwords

2. **Use Different Secrets for Each Environment**:
   - Don't reuse dev secrets in production
   - Generate fresh values for production

3. **Pooled vs Direct Database Connections**:
   - Always use pooled connection (`port 6543`) for the app
   - Only use direct connection (`port 5432`) for migrations

## 🚀 Quick Start Commands

```bash
# 1. Generate JWT secret
openssl rand -hex 32

# 2. Create Supabase project (via web UI)
# 3. Create Upstash Redis (via web UI)

# 4. Deploy to Vercel with env vars
vercel --prod

# 5. Set environment variables in Vercel dashboard
# Go to: https://vercel.com/[your-username]/[project]/settings/environment-variables

# 6. Redeploy to apply env vars
vercel --prod --force
```

## 📝 Checklist

- [ ] JWT secret generated
- [ ] Supabase project created
- [ ] Database URLs obtained (use pooled!)
- [ ] Upstash Redis created
- [ ] Redis credentials obtained
- [ ] Minimal env vars added to Vercel
- [ ] First deployment successful
- [ ] All env vars added
- [ ] Authentication tested
- [ ] Custom domain configured (optional)
- [ ] Domain-specific vars updated (optional)

## 🆘 Troubleshooting

**Frontend loads but API fails**: Check database URLs and Redis credentials

**Authentication errors**: Verify JWT_SECRET is set correctly

**CORS errors**: Update CORS_ORIGINS and WebAuthn settings for your domain

**Connection pool errors**: Make sure you're using port 6543 (pooled) not 5432

**Rate limiting issues**: Check Redis is connected properly