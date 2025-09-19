# Environment Files Organization
**Last Updated**: 2025-01-19

## File Structure

### 1. `.env` (Local Development)
- **Purpose**: Active configuration for local development
- **Contains**: Real values for local dev, including Supabase session pooler URLs
- **Git**: ❌ NEVER commit (in .gitignore)
- **Location**: Project root

### 2. `.env.example` (Template)
- **Purpose**: Template showing all required variables without sensitive values
- **Contains**: Placeholder values and comments
- **Git**: ✅ Committed
- **Location**: Project root

### 3. `.env.production` (Production Reference)
- **Purpose**: Documentation of production configuration
- **Contains**: Real non-sensitive values, placeholders for secrets
- **Git**: ✅ Committed (with placeholders for secrets)
- **Location**: Project root

### 4. `.env.production.minimal` (Quick Deploy)
- **Purpose**: Minimal set of variables for initial deployment
- **Contains**: Essential variables only, real values where safe
- **Git**: ✅ Committed (with placeholders for secrets)
- **Location**: Project root

### 5. `.env.schema` (Documentation)
- **Purpose**: Complete documentation of all environment variables
- **Contains**: Variable names, scopes, descriptions, example values
- **Git**: ✅ Committed
- **Location**: Project root

## Supabase Configuration

### Connection Types

| Type | Port | Use Case | IPv4 Support |
|------|------|----------|--------------|
| **Direct** | 5432 | Migrations only | ❌ IPv6 only |
| **Session Pooler** | 5432 | Local dev, long-lived | ✅ Yes |
| **Transaction Pooler** | 6543 | Vercel/serverless | ✅ Yes |

### Project Details
- **Project ID**: ecmnzrtsuajatmuahooa
- **Region**: US West 1 (aws-1-us-west-1)
- **Pooler Host**: aws-1-us-west-1.pooler.supabase.com
- **Direct Host**: db.ecmnzrtsuajatmuahooa.supabase.co

## Secret Storage

### Local (gopass)
```bash
# Database
gopass show development/supabase/journal/db_password
gopass show development/supabase/journal/anon_key
gopass show development/supabase/journal/service_key

# JWT
gopass show development/journal/jwt_secret
```

### Vercel Dashboard
- Add via: https://vercel.com/jeffrey-johnsons-projects-4efd9acb/journal/settings/environment-variables
- Use values from `.env.production.minimal` (replace [PASSWORD])

### GitHub Actions
- Add via: https://github.com/verlyn13/journal/settings/secrets/actions
- Required for CI/CD workflows

## Variable Naming Convention

### Prefixes
- `VITE_*` - Frontend variables (exposed to browser)
- `JOURNAL_*` - Application-specific backend
- `SUPABASE_*` - Supabase SDK configuration
- `DATABASE_*` - Database connection strings
- `UPSTASH_*` - Upstash Redis/QStash

### Scopes
- `[FE]` - Frontend only
- `[BE]` - Backend only
- `[DB]` - Database
- `[SHARED]` - Used by both FE and BE

## Usage by Environment

### Local Development
```bash
# Uses .env file
bun run dev        # Frontend
uv run dev        # Backend API
```

### Vercel Production
- Reads from Vercel Dashboard environment variables
- Uses transaction pooler (port 6543) for database
- Frontend gets VITE_* variables at build time

### GitHub Actions CI
- Reads from GitHub Secrets
- Uses for testing and deployment workflows

## Best Practices

1. **Never commit real secrets** - Use placeholders like [PASSWORD]
2. **Keep .env.production.minimal updated** - It's the deployment reference
3. **Store all secrets in gopass** - Single source of truth locally
4. **Use appropriate pooler** - Session for dev, Transaction for production
5. **Document new variables** - Update .env.schema when adding
6. **Use consistent naming** - Follow prefix conventions

## Quick Reference

### Add New Variable
1. Add to `.env.schema` with documentation
2. Add to `.env.example` with placeholder
3. Add to `.env` with real value for local dev
4. Add to `.env.production` with production format
5. If critical, add to `.env.production.minimal`
6. Store secret in gopass if sensitive
7. Add to Vercel/GitHub as needed

### Deploy to Vercel
1. Copy values from `.env.production.minimal`
2. Replace [PASSWORD] with value from gopass
3. Add via Vercel Dashboard
4. Deploy with `vercel --prod`

### Common Issues
- **IPv6 Network Error**: Use pooler URLs (port 5432/6543) not direct
- **Tenant not found**: Check username format (postgres.PROJECT_REF for pooler)
- **Connection refused**: Ensure PGSSLMODE=require is set