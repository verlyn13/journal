# Vercel Deployment Configuration
**Last Updated**: 2025-01-18
**Project**: Journal Application
**Domain**: journal.thenash.group

## 🚀 Deployment Details

### Project Information
- **Project Name**: journal
- **Project ID**: `prj_hEKDwH40wWNzVTZnynNAdxNuu8yu`
- **Vercel Team**: Jeffrey Johnson's Projects
- **Team ID**: `4efd9acb`

### Deployment URLs
- **Production**: https://journal.thenash.group (custom domain)
- **Vercel Domain**: https://journal-alpha-six.vercel.app
- **Git Main Branch**: https://journal-git-main-jeffrey-johnsons-projects-4efd9acb.vercel.app
- **Current Deployment**: https://journal-p84xjhgek-jeffrey-johnsons-projects-4efd9acb.vercel.app

### Git Integration
- **Repository**: verlyn13/journal
- **Production Branch**: main
- **Last Deployed Commit**: `b1c6a68` - "Merge pull request #32 from verlyn13/feat/jwt-signing-verification"
- **Auto-deploy**: Enabled for main branch

## 📊 Analytics & Monitoring

### Vercel Speed Insights
Installed and configured in `apps/web/src/main.tsx`:
```typescript
import { SpeedInsights } from '@vercel/speed-insights/react';
```

Speed Insights automatically tracks:
- Core Web Vitals (LCP, FID, CLS)
- Page load performance
- Route transitions
- Real user metrics

### Accessing Analytics
1. Go to: https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal
2. Navigate to Analytics tab
3. View Speed Insights dashboard

## 🔧 Build Configuration

### Current Settings (in Vercel Dashboard)
```yaml
Framework Preset: Vite
Root Directory: ./
Build Command: cd apps/web && bun run build
Output Directory: apps/web/dist
Install Command: cd apps/web && bun install
```

### Environment Variables Status
✅ Configured in `.env.production.minimal`:
- `VITE_API_URL=/api`
- `VITE_APP_NAME=Journal`
- `VITE_APP_VERSION=1.0.0`
- `NODE_ENV=production`
- `JOURNAL_ENV=production`
- `JOURNAL_JWT_SECRET` (configured)
- `JOURNAL_WEBAUTHN_RP_ID=journal.thenash.group`
- `JOURNAL_WEBAUTHN_ORIGIN=https://journal.thenash.group`

⏳ Pending (need service setup):
- Supabase database credentials
- Upstash Redis credentials
- Infisical Universal Auth credentials

## 🌐 Domain Configuration

### Custom Domain: journal.thenash.group
- **DNS Provider**: Cloudflare
- **SSL**: Automatic via Vercel
- **CDN**: Cloudflare proxy enabled

### Cloudflare Settings
- Proxy Status: ✅ Enabled (orange cloud)
- SSL/TLS Mode: Full (strict)
- Auto Minify: HTML, CSS, JS
- Caching: Standard

### DNS Records (in Cloudflare)
```
Type: CNAME
Name: journal
Content: cname.vercel-dns.com
Proxy: ✅ Enabled
```

## 🔐 Security Configuration

### CORS Settings
Development-friendly configuration:
```env
CORS_ORIGINS=https://journal.thenash.group,https://journal-*.vercel.app,http://localhost:3000,http://localhost:5173
```

### Trusted Proxies
Configured for Vercel + Cloudflare:
- Vercel: `76.76.21.21`
- Cloudflare: Full IP range list in `.env.production`

### WebAuthn/Passkeys
```env
JOURNAL_WEBAUTHN_RP_ID=journal.thenash.group
JOURNAL_WEBAUTHN_RP_NAME=Journal App
JOURNAL_WEBAUTHN_ORIGIN=https://journal.thenash.group
```

## 📝 Deployment Commands

### Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Set environment variables
vercel env add VARIABLE_NAME production

# Pull environment variables
vercel env pull .env.local

# View deployment logs
vercel logs journal-p84xjhgek
```

### Using Git (Auto-deploy)
```bash
# Deploy to production
git push origin main

# Preview deployment (any branch)
git push origin feature/branch-name
```

## 🔄 Deployment Workflow

### Automatic Deployments
1. **Production**: Push to `main` branch
2. **Preview**: Push to any other branch
3. **Pull Request**: Automatic preview for PRs

### Manual Deployment
1. Run `vercel --prod` from project root
2. Or use Vercel Dashboard → Deployments → Redeploy

## 📊 Performance Targets

### Speed Insights Goals
- **LCP** (Largest Contentful Paint): <2.5s
- **FID** (First Input Delay): <100ms
- **CLS** (Cumulative Layout Shift): <0.1
- **FCP** (First Contentful Paint): <1.8s
- **TTFB** (Time to First Byte): <600ms

### Current Optimizations
- ✅ Code splitting with Vite
- ✅ Bundle optimization
- ✅ CDN via Cloudflare
- ✅ Brotli compression
- ✅ HTTP/3 support
- ✅ Speed Insights tracking

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build logs
vercel logs --output raw

# Test build locally
cd apps/web && bun run build
```

#### Environment Variable Issues
- No brackets or quotes in Vercel env vars
- Use comma-separated strings for arrays
- Check variable names match exactly

#### Domain Issues
- Verify DNS propagation: `nslookup journal.thenash.group`
- Check SSL certificate in Vercel Dashboard
- Ensure Cloudflare proxy is enabled

## 📋 Deployment Checklist

### Pre-deployment
- [x] Code committed and pushed
- [x] Tests passing locally
- [x] Environment variables configured
- [x] Build successful locally

### Post-deployment
- [x] Site accessible via custom domain
- [x] API endpoints responding
- [ ] Authentication working
- [ ] Database connected
- [x] Speed Insights collecting data

## 🔗 Quick Links

- **Vercel Dashboard**: https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal
- **Project Settings**: https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal/settings
- **Environment Variables**: https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal/settings/environment-variables
- **Deployments**: https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal/deployments
- **Analytics**: https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal/analytics
- **Speed Insights**: https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal/speed-insights

## 📚 Related Documentation

- [Vercel Documentation](https://vercel.com/docs)
- [Speed Insights Guide](https://vercel.com/docs/speed-insights)
- [Environment Variables](https://vercel.com/docs/environment-variables)
- [Custom Domains](https://vercel.com/docs/custom-domains)