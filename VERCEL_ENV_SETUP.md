# Vercel Environment Variables Setup Guide
**Domain**: journal.thenash.group
**CDN**: Cloudflare
**Secrets Manager**: Infisical (secrets.jefahnierocks.com)

## ⚠️ Important: Vercel Environment Variable Rules

1. **No square brackets** `[]` in values
2. **No quotes** around string values
3. **Arrays as comma-separated strings** (no brackets)
4. **No comments** in the value field

## 🚀 Quick Start: Minimal Variables

Add these to Vercel NOW to get started:

```bash
# Step 1: Generate JWT Secret locally
openssl rand -hex 32
# Copy the output for JOURNAL_JWT_SECRET
```

### In Vercel Dashboard → Settings → Environment Variables:

| Key | Value | Environment |
|-----|-------|-------------|
| VITE_API_URL | /api | Production |
| VITE_APP_NAME | Journal | Production |
| VITE_APP_VERSION | 1.0.0 | Production |
| NODE_ENV | production | Production |
| JOURNAL_ENV | production | Production |
| JOURNAL_JWT_SECRET | (your generated hex string) | Production |
| JOURNAL_JWT_ISS | journal-api | Production |
| JOURNAL_JWT_AUD | journal-clients | Production |
| JOURNAL_WEBAUTHN_RP_ID | journal.thenash.group | Production |
| JOURNAL_WEBAUTHN_RP_NAME | Journal App | Production |
| JOURNAL_WEBAUTHN_ORIGIN | https://journal.thenash.group | Production |

## 📋 After Setting Up Services

### Supabase Variables (Required)
After creating Supabase project, add:

| Key | Value | Note |
|-----|-------|------|
| JOURNAL_DB_URL | postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true | Use port 6543! |
| JOURNAL_DB_URL_ASYNC | (same as above) | Same pooled URL |
| JOURNAL_DATABASE_URL | (same as above) | Same pooled URL |
| SUPABASE_URL | https://xxxxx.supabase.co | Your project URL |
| SUPABASE_ANON_KEY | (your anon key) | Public key is OK |
| SUPABASE_SERVICE_KEY | (your service key) | Keep SECRET! |

### Upstash Redis Variables (Required)
After creating Upstash Redis:

| Key | Value |
|-----|-------|
| UPSTASH_REDIS_REST_URL | https://xxxxx.upstash.io |
| UPSTASH_REDIS_REST_TOKEN | (your token) |

### CORS Configuration (Development-Friendly)
**Important**: Enter as comma-separated string, NO brackets!

| Key | Value |
|-----|-------|
| CORS_ORIGINS | https://journal.thenash.group,https://journal-git-*.vercel.app,http://localhost:3000,http://localhost:5173 |

### Cloudflare + Vercel Trusted Proxies
**Important**: Enter as comma-separated string, NO brackets!

| Key | Value |
|-----|-------|
| JOURNAL_TRUSTED_PROXIES | 76.76.21.21,173.245.48.0/20,103.21.244.0/22,103.22.200.0/22,103.31.4.0/22,141.101.64.0/18,108.162.192.0/18,190.93.240.0/20,188.114.96.0/20,197.234.240.0/22,198.41.128.0/17,162.158.0.0/15,104.16.0.0/13,104.24.0.0/14,172.64.0.0/13,131.0.72.0/22 |

## 🔐 Infisical Configuration

Your codebase shows Infisical is already configured:

| Key | Value |
|-----|-------|
| JOURNAL_INFISICAL_ENABLED | true |
| JOURNAL_INFISICAL_PROJECT_ID | d01f583a-d833-4375-b359-c702a726ac4d |
| JOURNAL_INFISICAL_SERVER_URL | https://secrets.jefahnierocks.com |

To complete setup:
1. Get Universal Auth credentials from Infisical
2. Add these:

| Key | Value |
|-----|-------|
| INFISICAL_UNIVERSAL_AUTH_CLIENT_ID | (from Infisical) |
| INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET | (from Infisical) |

## 🌐 Domain Setup (journal.thenash.group)

### In Cloudflare:
1. DNS will be automatically configured when you add domain to Vercel
2. Make sure proxy (orange cloud) is ON for CDN benefits

### In Vercel:
1. Go to Settings → Domains
2. Add `journal.thenash.group`
3. Follow the DNS instructions (usually CNAME to `cname.vercel-dns.com`)

## ✅ Deployment Checklist

### Phase 1: Immediate Deploy
- [ ] Generate JWT secret with `openssl rand -hex 32`
- [ ] Add minimal env vars to Vercel (list above)
- [ ] Deploy to see frontend working

### Phase 2: Backend Services
- [ ] Create Supabase project
- [ ] Enable pgvector: `CREATE EXTENSION IF NOT EXISTS vector;`
- [ ] Add Supabase env vars (use port 6543 for pooled!)
- [ ] Create Upstash Redis
- [ ] Add Redis env vars

### Phase 3: Full Configuration
- [ ] Add CORS origins (comma-separated)
- [ ] Add trusted proxies (comma-separated)
- [ ] Configure Infisical Universal Auth
- [ ] Add domain to Vercel
- [ ] Update Cloudflare DNS

### Phase 4: Testing
- [ ] Test frontend loads
- [ ] Test API health endpoint
- [ ] Test authentication flow
- [ ] Verify WebAuthn works with your domain

## 🚨 Common Issues

### "Invalid Environment Variable Name"
- Remove any brackets `[]`
- Remove quotes from values
- Convert arrays to comma-separated strings

### CORS Errors
- Make sure CORS_ORIGINS includes your Vercel preview URLs
- Format: `https://journal-git-branch-name.vercel.app`

### Database Connection Errors
- **USE PORT 6543** for pooled connection, not 5432
- Format: `postgresql://postgres:password@db.ref.supabase.co:6543/postgres?pgbouncer=true`

### Redis/Session Errors
- Verify Upstash credentials are correct
- Check both REST URL and token are set

## 📝 Notes for Development

Since you need to develop frequently, the CORS settings are permissive:
- Allows localhost ports (3000, 5173, 5000)
- Allows all Vercel preview deployments
- Allows your production domain

You can tighten these later when moving to full production.