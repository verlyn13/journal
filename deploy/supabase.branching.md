# Supabase Branching Configuration

## Overview

Supabase Branching provides isolated database environments for each pull request, enabling safe testing of schema changes and migrations.

## Setup Instructions

### 1. Enable Branching in Supabase Dashboard

1. Navigate to your project in [Supabase Dashboard](https://app.supabase.com)
2. Go to Settings → Branching
3. Click "Enable Branching"
4. Select branching strategy:
   - **Per-PR branches** (recommended): New DB for each PR
   - **Persistent branches**: Long-lived staging environments

### 2. Install Vercel Integration

1. Go to [Vercel Integrations](https://vercel.com/integrations/supabase)
2. Click "Add Integration"
3. Select your Vercel project
4. Authorize Supabase access
5. Map your Supabase project to Vercel project

### 3. Environment Variable Sync

The integration automatically sets these variables when a PR opens:

```env
# Preview environment (per-PR)
NEXT_PUBLIC_SUPABASE_URL=https://[preview-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[preview-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[preview-service-key]
DATABASE_URL=postgresql://postgres:[password]@db.[preview-id].supabase.co:5432/postgres

# Production (main branch)
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[production-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[production-service-key]
DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
```

### 4. Migration Strategy

#### Option A: Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Link to project
supabase link --project-ref [project-id]

# Create migration
supabase migration new [migration_name]

# Apply to preview branch
supabase db push --db-url $DATABASE_URL

# Apply to production
supabase db push --db-url $PRODUCTION_DATABASE_URL
```

#### Option B: Keep Alembic

```bash
# In CI/CD for preview branches
DATABASE_URL_SYNC=$DATABASE_URL \
  alembic -x sqlalchemy.url=$DATABASE_URL_SYNC upgrade head

# For production
DATABASE_URL_SYNC=$PRODUCTION_DATABASE_URL \
  alembic -x sqlalchemy.url=$DATABASE_URL_SYNC upgrade head
```

### 5. Branch Lifecycle

1. **PR Opened**:
   - Supabase creates preview branch
   - Copies schema from production
   - Sets environment variables in Vercel

2. **PR Updated**:
   - Migrations run automatically
   - Schema changes applied to preview

3. **PR Merged**:
   - Schema changes queued for production
   - Apply manually or auto-deploy

4. **PR Closed**:
   - Preview branch deleted after 7 days
   - Environment variables removed

## GitHub Action for Branch Validation

```yaml
# .github/workflows/supabase-branch.yml
name: Validate Supabase Branch

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Wait for Supabase branch
        run: |
          # Wait up to 60 seconds for branch creation
          for i in {1..12}; do
            if curl -f "${{ secrets.PREVIEW_SUPABASE_URL }}/rest/v1/" \
                 -H "apikey: ${{ secrets.PREVIEW_SUPABASE_ANON_KEY }}" \
                 -H "Authorization: Bearer ${{ secrets.PREVIEW_SUPABASE_ANON_KEY }}"; then
              echo "✓ Supabase branch is ready"
              exit 0
            fi
            echo "Waiting for Supabase branch... ($i/12)"
            sleep 5
          done
          echo "✗ Supabase branch not ready after 60 seconds"
          exit 1

      - name: Run migrations
        env:
          DATABASE_URL: ${{ secrets.PREVIEW_DATABASE_URL }}
        run: |
          cd apps/api
          alembic -x sqlalchemy.url=$DATABASE_URL upgrade head

      - name: Validate schema
        run: |
          python deploy/smoke/db_probe.py
```

## Troubleshooting

### Branch Not Created

1. Check integration status in Vercel dashboard
2. Verify Supabase project has branching enabled
3. Check GitHub App permissions

### Environment Variables Missing

1. Re-sync integration: Vercel → Settings → Integrations → Supabase → Re-sync
2. Check PR was opened after integration installed
3. Manually trigger: Close and reopen PR

### Migration Failures

1. Check preview branch logs in Supabase dashboard
2. Validate migration SQL locally first
3. Ensure pgvector extension enabled on preview

### Connection Issues

1. Use connection pooler for serverless:
   ```
   postgresql://postgres:[password]@db.[preview-id].supabase.co:6543/postgres?pgbouncer=true
   ```

2. Direct connection for long-running:
   ```
   postgresql://postgres:[password]@db.[preview-id].supabase.co:5432/postgres
   ```

## Best Practices

1. **Test migrations locally first**
   ```bash
   supabase start
   supabase migration up
   ```

2. **Use seed data for previews**
   ```sql
   -- supabase/seed.sql
   INSERT INTO users (email, role)
   VALUES ('test@example.com', 'admin');
   ```

3. **Add branch protection**
   - Require preview deployment success
   - Block merge if migrations fail

4. **Monitor branch usage**
   - Branches count toward project limits
   - Clean up old branches regularly

5. **Document schema changes**
   ```sql
   -- migrations/YYYYMMDD_description.sql
   -- Purpose: Add user preferences table
   -- Breaking: No
   -- Rollback: DROP TABLE user_preferences;
   ```

## Commands Reference

```bash
# List branches
supabase branches list

# Create branch manually
supabase branches create feature-xyz

# Switch branch
supabase branches switch feature-xyz

# Delete branch
supabase branches delete feature-xyz

# Get branch database URL
supabase branches get-connection-string feature-xyz
```

## Integration Status Check

```bash
# Check if variables are set (in Vercel function or preview)
node -e "
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'DATABASE_URL'
  ];

  const missing = required.filter(v => !process.env[v]);

  if (missing.length > 0) {
    console.error('Missing variables:', missing);
    process.exit(1);
  }

  console.log('✓ All Supabase variables present');
  console.log('Preview URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
"
```