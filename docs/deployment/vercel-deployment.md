---
id: vercel-deployment
title: Vercel Deployment Configuration
category: deployment
type: guide
status: current
created: 2025-01-18
updated: 2025-01-19
author: Journal Team
dependencies:
  - supabase-configuration
  - environment-variables
tags:
  - vercel
  - deployment
  - hosting
  - cdn
  - monitoring
description: Complete Vercel deployment configuration and management guide
---

# Vercel Deployment Configuration

## Project Information

| Field | Value |
|-------|-------|
| **Project Name** | journal |
| **Project ID** | `prj_hEKDwH40wWNzVTZnynNAdxNuu8yu` |
| **Team** | Jeffrey Johnson's Projects |
| **Team ID** | `4efd9acb` |
| **Framework** | Vite |
| **Custom Domain** | https://journal.thenash.group |

## Deployment URLs

- **Production**: https://journal.thenash.group
- **Vercel Domain**: https://journal-alpha-six.vercel.app
- **Git Main Branch**: https://journal-git-main-jeffrey-johnsons-projects-4efd9acb.vercel.app
- **Preview Deployments**: https://journal-[branch]-jeffrey-johnsons-projects-4efd9acb.vercel.app

## Build Configuration

### Vercel Settings

```yaml
Framework Preset: Vite
Root Directory: ./
Build Command: cd apps/web && bun run build
Output Directory: apps/web/dist
Install Command: cd apps/web && bun install
```

### Package Manager

Vercel natively supports Bun (as of 2025). No need to convert to npm.

## Environment Variables

### Required for Production

See [Environment Variables Configuration](./environment-variables.md) for complete list.

### Critical Variables

```env
# Database (Transaction pooler for serverless)
DATABASE_URL=postgresql://postgres.ecmnzrtsuajatmuahooa:[PASSWORD]@aws-1-us-west-1.pooler.supabase.com:6543/postgres

# Supabase
SUPABASE_URL=https://ecmnzrtsuajatmuahooa.supabase.co
SUPABASE_ANON_KEY=[anon_key]
SUPABASE_SERVICE_KEY=[service_key]

# JWT
JOURNAL_JWT_SECRET=[jwt_secret]

# WebAuthn
JOURNAL_WEBAUTHN_RP_ID=journal.thenash.group
JOURNAL_WEBAUTHN_ORIGIN=https://journal.thenash.group

# Frontend
VITE_API_URL=/api
VITE_APP_NAME=Journal
```

### Adding Variables

1. Go to: https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal/settings/environment-variables
2. Click "Add New"
3. Enter name and value (no quotes or brackets)
4. Select environments (Production/Preview/Development)
5. Click "Save"

## Domain Configuration

### Custom Domain Setup

- **Domain**: journal.thenash.group
- **DNS Provider**: Cloudflare
- **SSL**: Automatic via Vercel
- **CDN**: Cloudflare proxy enabled

### Cloudflare DNS

```
Type: CNAME
Name: journal
Content: cname.vercel-dns.com
Proxy: ✅ Enabled (orange cloud)
```

### Cloudflare Settings

- **SSL/TLS Mode**: Full (strict)
- **Auto Minify**: HTML, CSS, JS
- **Caching**: Standard
- **HTTP/3**: Enabled

## Monitoring & Analytics

### Vercel Speed Insights

Installed in `apps/web/src/main.tsx`:

```typescript
import { SpeedInsights } from '@vercel/speed-insights/react';

// In component tree
<SpeedInsights />
```

### Metrics Tracked

- **Core Web Vitals**
  - LCP (Largest Contentful Paint): Target <2.5s
  - FID (First Input Delay): Target <100ms
  - CLS (Cumulative Layout Shift): Target <0.1

- **Additional Metrics**
  - FCP (First Contentful Paint): Target <1.8s
  - TTFB (Time to First Byte): Target <600ms

### Accessing Analytics

1. Dashboard: https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal/analytics
2. Speed Insights: https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal/speed-insights

## Deployment Process

### Automatic Deployments

| Event | Action | URL Pattern |
|-------|--------|-------------|
| Push to `main` | Deploy to production | journal.thenash.group |
| Push to other branch | Create preview | journal-[branch].vercel.app |
| Open PR | Create preview with comment | Unique preview URL |

### Manual Deployment

#### Via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# With specific environment
vercel --prod --env NODE_ENV=production
```

#### Via Dashboard

1. Go to: https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal/deployments
2. Click on any deployment
3. Click "Redeploy" → "Redeploy to Production"

### Deployment Commands

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]

# Rollback to previous deployment
vercel rollback [deployment-url]

# Set environment variable
vercel env add VARIABLE_NAME production

# Pull environment variables locally
vercel env pull .env.local
```

## Security Configuration

### CORS Settings

```env
CORS_ORIGINS=https://journal.thenash.group,https://journal-*.vercel.app,http://localhost:5173,http://localhost:5000
```

### Trusted Proxies

Configured for Vercel + Cloudflare:
- Vercel: `76.76.21.21`
- Cloudflare: [IP ranges](https://www.cloudflare.com/ips/)

### Security Headers

Automatically applied by Vercel:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: origin-when-cross-origin

## Performance Optimization

### Current Optimizations

- ✅ Code splitting with Vite
- ✅ Bundle optimization
- ✅ CDN via Cloudflare
- ✅ Brotli compression
- ✅ HTTP/3 support
- ✅ Speed Insights tracking
- ✅ Image optimization (Vercel automatic)

### Build Optimizations

```json
// vite.config.ts recommendations
{
  "build": {
    "rollupOptions": {
      "output": {
        "manualChunks": {
          "vendor": ["react", "react-dom"],
          "editor": ["@codemirror/core"]
        }
      }
    },
    "minify": "esbuild",
    "target": "es2020"
  }
}
```

## Troubleshooting

### Build Failures

```bash
# Check build logs
vercel logs --output raw

# Test build locally
cd apps/web && bun run build

# Clear cache and rebuild
vercel --force
```

### Environment Variable Issues

- No brackets or quotes in Vercel Dashboard
- Use comma-separated strings for arrays
- Check exact variable names (case-sensitive)
- Verify in Function logs: `console.log(process.env.VARIABLE_NAME)`

### Domain Issues

```bash
# Check DNS propagation
nslookup journal.thenash.group

# Verify SSL certificate
curl -I https://journal.thenash.group

# Check Cloudflare proxy
dig journal.thenash.group
```

### Database Connection Issues

- Ensure using transaction pooler (port 6543) for Vercel
- Check password is correct (no special characters that need escaping)
- Verify Supabase project is active
- Test connection locally first

## Deployment Checklist

### Pre-deployment

- [ ] Code committed and pushed
- [ ] Tests passing locally (`bun test`)
- [ ] Linting clean (`bun run lint`)
- [ ] Build successful locally (`bun run build`)
- [ ] Environment variables configured in Vercel
- [ ] Database migrations run

### Post-deployment

- [ ] Site accessible via custom domain
- [ ] API endpoints responding (`/api/health`)
- [ ] Authentication working
- [ ] Database queries successful
- [ ] Speed Insights collecting data
- [ ] No console errors in production

## Quick Links

- **Dashboard**: https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal
- **Settings**: https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal/settings
- **Environment Variables**: https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal/settings/environment-variables
- **Deployments**: https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal/deployments
- **Analytics**: https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal/analytics
- **Speed Insights**: https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal/speed-insights
- **Domains**: https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal/settings/domains
- **Functions**: https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal/functions

## Related Documentation

- [Supabase Configuration](./supabase-configuration.md)
- [Environment Variables](./environment-variables.md)
- [Vercel Documentation](https://vercel.com/docs)
- [Speed Insights Guide](https://vercel.com/docs/speed-insights)
