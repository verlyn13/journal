# Infisical CLI Shim Usage Guide

## Quick Reference

The Infisical CLI shim provides deterministic responses for CI/CD testing without network dependencies.

## Location

```bash
.github/scripts/infisical-shim.sh
```

## Key Features

✅ **Zero network calls** - No downloads, no API calls, no timeouts
✅ **Deterministic outputs** - Same input always produces same output
✅ **Fast execution** - Instant responses for all commands
✅ **Version compatible** - Returns `v0.42.1-shim` to identify shim mode

## Supported Commands

### Version Check
```bash
infisical --version
# Output: Infisical CLI v0.42.1-shim
#         Built for testing with deterministic responses
```

### Authentication (always succeeds)
```bash
infisical auth
# Output: ✅ Successfully logged in to Infisical
```

### Secret Retrieval
```bash
infisical secrets get JWT_PUBLIC_KEY
# Returns: Test RSA public key

infisical secrets get JWT_PRIVATE_KEY
# Returns: Test RSA private key

infisical secrets get OPENAI_API_KEY
# Returns: sk-test1234567890abcdef
```

### Environment Export
```bash
infisical export
# Returns: Mock environment variables in export format
```

## When to Use

| Scenario | Use Shim? | Reason |
|----------|-----------|---------|
| GitHub Actions CI | ✅ Yes | Eliminates flaky network downloads |
| Unit Tests | ✅ Yes | Fast, predictable results |
| Integration Tests | ✅ Yes | Controlled test environment |
| Local Development | ❌ No | Use real CLI for actual secrets |
| Production | ❌ No | Must use real CLI with auth |
| E2E Tests | ❌ No | Test real integration |

## CI/CD Setup

### In GitHub Workflows

Always use the composite action with shim enabled:

```yaml
- name: Setup Infisical CLI for Testing
  uses: ./.github/actions/setup-infisical-testing
  with:
    use-shim: "true"  # Always true for CI
```

### Environment Variables

The shim ignores these but they should be set for consistency:

```yaml
env:
  INFISICAL_SERVER_URL: http://localhost:8080
  INFISICAL_PROJECT_ID: test-project-id
  INFISICAL_ENVIRONMENT: test
  INFISICAL_TOKEN: test-token
```

## Adding New Secrets

To add a new test secret to the shim:

1. Edit `.github/scripts/infisical-shim.sh`
2. Add case in the secrets section:

```bash
"YOUR_NEW_SECRET")
    echo "test-value-for-your-secret"
    ;;
```

3. Test locally:
```bash
./.github/scripts/infisical-shim.sh secrets get YOUR_NEW_SECRET
```

## Debugging

### Verify Shim Installation
```bash
which infisical
# Should show: /path/to/.github/scripts/infisical-shim.sh
```

### Check Version Output
```bash
infisical --version | head -1
# Should show: Infisical CLI v0.42.1-shim
```

### Test Secret Retrieval
```bash
infisical secrets get JWT_PUBLIC_KEY
# Should return test RSA key
```

## Common Issues

### Issue: "Infisical CLI not found"
**Solution**: Ensure shim is in PATH via composite action

### Issue: "Unexpected version format"
**Solution**: Shim outputs multi-line - parser handles first line only

### Issue: Network timeout in CI
**Solution**: You're using real CLI instead of shim - check workflow setup

## Security Notes

⚠️ **Never use shim in production** - It returns test data only
⚠️ **Test secrets are not secure** - They're hardcoded for testing
⚠️ **Shim accepts any auth** - No actual authentication performed

## Maintenance

The shim version should match the expected CLI version:
- Current: `v0.42.1-shim`
- Update both shim output and `app/infra/secrets/version.py` together

---

*Remember: The shim is for CI/CD testing only. Always use the real Infisical CLI for actual secret management.*