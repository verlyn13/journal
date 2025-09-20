# Setting Up Branch Rulesets for Contract CI

GitHub has modernized branch protection with **Rulesets**, which provide more flexible and powerful branch protection. This guide shows you how to configure rulesets for the Contract CI workflow.

## Step 1: Create a New Ruleset

1. Navigate to: https://github.com/verlyn13/journal/settings/rules
2. Click **"New branch ruleset"**

## Step 2: Configure Basic Settings

### Ruleset Name
```
main-protection
```

### Enforcement Status
Select: **Active** ✅

### Bypass List
Leave empty for now (or add specific admin users if needed)

## Step 3: Target Branches

### Branch Targeting Criteria
1. Click **"Add target"** → **"Include default branch"**
2. Or explicitly add:
   - Pattern: `main`
   - Pattern: `pre-deployment-prep` (if you want the same rules)

## Step 4: Configure Rules

Check and configure these rules:

### ✅ Restrict deletions
Prevents accidental branch deletion

### ✅ Require a pull request before merging
Configure with:
- **Required approvals**: `1`
- **Dismiss stale pull request approvals when new commits are pushed**: ✅
- **Require review from CODEOWNERS**: ✅ (if you have CODEOWNERS file)
- **Require approval of the most recent reviewable push**: ✅
- **Require conversation resolution before merging**: ✅

### ✅ Require status checks to pass
Configure with:
- **Require branches to be up to date before merging**: ✅
- **Required checks**: Add all Contract CI checks:
  ```
  lint
  docs
  api_tests
  db_smoke
  web_tests
  full_smoke
  ```

Click **"Add checks"** and search for each one. They may appear as:
- `CI Contract / lint`
- `CI Contract / docs`
- `CI Contract / api_tests`
- `CI Contract / db_smoke`
- `CI Contract / web_tests`
- `CI Contract / full_smoke`

### ✅ Block force pushes
Prevents history rewriting on protected branches

### Optional Rules (Recommended)

#### ✅ Require signed commits
Ensures all commits are GPG/SSH signed

#### ✅ Require linear history
Prevents merge commits (enforces rebase-only)

## Step 5: Create the Ruleset

1. Review all settings
2. Click **"Create"** button at the bottom

## Step 6: Create Additional Rulesets (Optional)

### Development Branch Ruleset
Create a less restrictive ruleset for development branches:

1. **Name**: `development-branches`
2. **Target**: Pattern `feature/*`, `fix/*`, `chore/*`
3. **Rules**:
   - ✅ Require status checks (only `lint` and `docs`)
   - ✅ Block force pushes

### Release Branch Ruleset
Create a stricter ruleset for release branches:

1. **Name**: `release-protection`
2. **Target**: Pattern `release/*`, `hotfix/*`
3. **Rules**: Same as main plus:
   - ✅ Require deployments to succeed
   - ✅ Require code scanning results

## Verification Steps

### 1. Create a Test PR
```bash
git checkout -b test/ruleset-verification
echo "# Ruleset Test" >> test-ruleset.md
git add test-ruleset.md
git commit -m "test: verify ruleset configuration"
git push origin test/ruleset-verification
```

### 2. Open PR and Verify
1. Go to https://github.com/verlyn13/journal/pulls
2. Create PR from `test/ruleset-verification` to `main`
3. Verify you see:
   - All 6 Contract CI checks running
   - Merge blocked until checks pass
   - Review required message

### 3. Check Enforcement
The PR page should show:
- **Merging is blocked**: "Failing required status checks"
- Required checks listed with status:
  - ⏳ `lint` - Pending/Running
  - ⏳ `docs` - Pending/Running
  - ⏳ `api_tests` - Pending/Running
  - ⏳ `db_smoke` - Pending/Running
  - ⏳ `web_tests` - Pending/Running
  - ⏳ `full_smoke` - Pending/Running

## CLI Configuration (Advanced)

Using GitHub CLI to create rulesets:

```bash
# Create ruleset via API
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  /repos/verlyn13/journal/rulesets \
  -f name='main-protection' \
  -f target='branch' \
  -f enforcement='active' \
  -f conditions='{"ref_name":{"include":["refs/heads/main"],"exclude":[]}}' \
  -f rules='[
    {
      "type": "deletion"
    },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": false,
        "require_last_push_approval": true,
        "required_review_thread_resolution": true
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [
          {"context": "lint"},
          {"context": "docs"},
          {"context": "api_tests"},
          {"context": "db_smoke"},
          {"context": "web_tests"},
          {"context": "full_smoke"}
        ]
      }
    },
    {
      "type": "non_fast_forward"
    }
  ]'
```

## Monitoring Ruleset Effectiveness

### View Ruleset Activity
1. Go to Settings → Rules → Click on your ruleset
2. View "Recent activity" tab to see:
   - Who bypassed rules
   - Failed check attempts
   - Rule violations

### Insights
1. Go to Insights → Rules
2. View metrics on:
   - Rule bypass frequency
   - Most commonly failed checks
   - PR merge time impact

## Troubleshooting

### Checks Not Appearing
If the Contract CI checks don't appear:
1. Ensure the workflow has run at least once on `main`
2. Check workflow file name matches: `.github/workflows/contract-ci.yml`
3. Verify job names in workflow match exactly

### Bypass for Emergency
If you need emergency bypass:
1. Go to Settings → Rules → Edit ruleset
2. Add yourself to "Bypass list" temporarily
3. Make necessary changes
4. Remove yourself from bypass list

### Check Names Mismatch
Find exact check names:
```bash
# List recent check runs
gh run list --workflow=contract-ci.yml --limit=1 --json jobs --jq '.[]|.jobs[]|.name'
```

## Benefits of Rulesets vs Legacy Branch Protection

1. **Granular Control**: Different rules for different branch patterns
2. **Bypass Management**: Temporary bypass for emergencies
3. **Better Insights**: Activity logs and metrics
4. **Inheritance**: Base rulesets that others extend
5. **API-First**: Easier automation and IaC management

## Next Steps

1. ✅ Create main-protection ruleset
2. ✅ Verify with test PR
3. ✅ Monitor first week of enforcement
4. Consider adding:
   - Security scanning requirements
   - Deployment success requirements
   - Custom merge queue rules

Your Contract CI is now fully enforced through modern GitHub Rulesets!