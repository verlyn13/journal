# Enabling Contract CI in GitHub Branch Protection Rules

This guide walks you through enabling the new Contract CI workflow as required checks for your protected branches.

## Step 1: Navigate to Branch Protection Settings

1. Open your browser and go to: https://github.com/verlyn13/journal
2. Click on **Settings** tab (you need admin access)
3. In the left sidebar, click **Branches** under the "Code and automation" section
4. You should see your branch protection rules listed

## Step 2: Edit or Create Branch Protection Rule

### If you have an existing rule for `main`:
1. Click the **Edit** button next to the `main` branch rule

### If you need to create a new rule:
1. Click **Add rule** or **Add branch protection rule**
2. In "Branch name pattern", enter: `main`

## Step 3: Configure Required Status Checks

Scroll down to the **"Require status checks to pass before merging"** section:

1. ✅ Check the box to enable this setting
2. ✅ Check **"Require branches to be up to date before merging"**

## Step 4: Add Contract CI Jobs as Required Checks

In the search box under "Status checks that are required", search for and add these checks:

### Core Contract CI Jobs (from contract-ci.yml):
Search for and add each of these:
- `lint`
- `docs`
- `api_tests`
- `db_smoke`
- `web_tests`
- `full_smoke`

**Note**: These job names might appear with a workflow prefix like "CI Contract / lint". Add them as they appear.

### Existing Critical Checks to Keep:
If you already have these, keep them enabled:
- `build`
- `Vercel`
- Any deployment checks

## Step 5: Configure Additional Protection Settings

While you're here, consider enabling these recommended settings:

### Essential Settings:
- ✅ **Require a pull request before merging**
  - ✅ **Require approvals** (set to 1 minimum)
  - ✅ **Dismiss stale pull request approvals when new commits are pushed**
  - ✅ **Require review from CODEOWNERS** (if you have a CODEOWNERS file)

### Recommended Settings:
- ✅ **Require conversation resolution before merging**
- ✅ **Require signed commits** (optional but recommended)
- ✅ **Include administrators** (enforce rules even for admins)
- ✅ **Restrict who can dismiss pull request reviews**

### For Main Branch:
- ✅ **Lock branch** (if you want to prevent direct pushes entirely)
- ✅ **Do not allow bypassing the above settings**

## Step 6: Save Your Changes

1. Scroll to the bottom of the page
2. Click **Save changes** (green button)

## Step 7: Verify the Configuration

### Test with a Pull Request:
1. Create a test branch:
   ```bash
   git checkout -b test/ci-contract-verification
   echo "# CI Test" >> test-ci.md
   git add test-ci.md
   git commit -m "test: verify contract CI is required"
   git push origin test/ci-contract-verification
   ```

2. Open a pull request from this branch to `main`

3. Check the PR page - you should see:
   - All contract CI checks listed as required
   - The merge button disabled until all checks pass
   - Status indicators for each job:
     - `lint` - Running/Passed/Failed
     - `docs` - Running/Passed/Failed
     - `api_tests` - Running/Passed/Failed
     - `db_smoke` - Running/Passed/Failed
     - `web_tests` - Running/Passed/Failed
     - `full_smoke` - Running/Passed/Failed

### What to Look For:
- ✅ All checks should be listed as "Required"
- ✅ The merge button should say "Merge blocked" until checks pass
- ✅ Once all checks pass, the merge button turns green

## Step 8: Update for Pre-deployment Branch (Optional)

If you want the same protection for your `pre-deployment-prep` branch:

1. Go back to Settings → Branches
2. Click **Add rule**
3. Branch name pattern: `pre-deployment-prep`
4. Repeat steps 3-6 with the same settings

## Troubleshooting

### If checks don't appear in the search:
1. The workflow needs to run at least once on the default branch
2. Push a small change to `main` to trigger the workflow:
   ```bash
   git checkout main
   git pull origin main
   echo "" >> README.md
   git add README.md
   git commit -m "chore: trigger CI for branch protection setup"
   git push origin main
   ```

### If checks have different names:
The actual check names might include the workflow name. Look for patterns like:
- `CI Contract / lint`
- `CI Contract / docs`
- `CI Contract / api_tests`
- etc.

Add them exactly as they appear in the search results.

### To see current check names:
1. Go to the **Actions** tab
2. Click on a recent "CI Contract" workflow run
3. The job names shown there are what you need to add

## Quick Checklist

- [ ] Navigated to Settings → Branches
- [ ] Edited/created rule for `main` branch
- [ ] Enabled "Require status checks to pass"
- [ ] Added all 6 contract CI jobs as required
- [ ] Enabled "Require branches to be up to date"
- [ ] Configured PR requirements
- [ ] Saved changes
- [ ] Tested with a new PR
- [ ] All checks showing as required
- [ ] Merge blocked until checks pass

## CLI Alternative (using GitHub CLI)

You can also update branch protection using the GitHub CLI:

```bash
# First, check current protection
gh api repos/verlyn13/journal/branches/main/protection

# Update protection with required checks
gh api repos/verlyn13/journal/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["lint","docs","api_tests","db_smoke","web_tests","full_smoke"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null
```

## Next Steps

Once enabled, every PR to `main` will:
1. Run all Contract CI checks automatically
2. Block merging until all checks pass
3. Require branches to be up-to-date with `main`
4. Enforce consistent quality gates

This ensures code quality, security, and stability for your main branch!