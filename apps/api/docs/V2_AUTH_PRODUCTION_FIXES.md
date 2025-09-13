# V2 Authentication System - Production Fixes

## Overview

This document details the production-critical fixes applied to the v2 authentication system to ensure it is truly deployment-ready with comprehensive test coverage.

## Fixed Issues

### 1. ✅ Logout Request Body Parsing

**Problem**: The logout endpoint used `revoke_all: bool = False` as a function parameter, which FastAPI doesn't bind from JSON body.

**Solution**: 
- Created `LogoutRequest` Pydantic model for request body
- Modified endpoint signature to accept `body: LogoutRequest | None = None`
- Extract `revoke_all` from body when provided

**Files Modified**:
- `app/api/v1/auth_enhanced.py`

```python
class LogoutRequest(BaseModel):
    """Request body for logout endpoint."""
    revoke_all: bool = Field(default=False, description="Revoke all user sessions")

@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    body: LogoutRequest | None = None,
    ...
) -> dict[str, str]:
    revoke_all = body.revoke_all if body else False
```

### 2. ✅ Token Validation Test Expectations

**Problem**: Tests expected `claims["typ"] == "access"`, but header typ is `"at+jwt"` per RFC 9068.

**Solution**:
- Tests now check `claims["type"] == "access"` for logical type
- Separately verify `claims["typ"] == "at+jwt"` for header typ

**Files Modified**:
- `tests/test_auth_v2.py`

```python
# Check logical token type in payload
assert claims.get("type") == "access"
# Header typ should be RFC 9068 compliant
assert claims.get("typ") == "at+jwt"
```

### 3. ✅ V2 Verify Endpoint Scopes Parsing

**Problem**: `/api/v2/auth/verify` returned `claims.get("scopes", [])` but tokens store scope as space-delimited string.

**Solution**:
- Parse OAuth2 standard `scope` claim (space-delimited string)
- Split into array for response
- Include full claims for debugging

**Files Modified**:
- `app/api/v1/auth_enhanced.py`

```python
# Parse scopes from OAuth2 standard "scope" claim
scope_claim = claims.get("scope", "")
scopes = scope_claim.split() if scope_claim else []

return {
    "valid": True,
    "user_id": claims["sub"],
    "scopes": scopes,
    "claims": claims,  # Include full claims for debugging
}
```

### 4. ✅ Trusted Proxy IP Extraction

**Problem**: M2M endpoint used `request.client.host`, ignoring `X-Forwarded-For` headers from reverse proxies.

**Solution**:
- Created comprehensive IP extraction utility with proxy support
- Configurable trusted proxy list (prevents IP spoofing)
- Supports `X-Real-IP`, `X-Forwarded-For`, and RFC 7239 `Forwarded` headers
- Safe defaults for common deployments (Docker, Kubernetes)
- Test mode fallback for X-Forwarded-For

**Files Created**:
- `app/infra/ip_extraction.py`

**Files Modified**:
- `app/api/v1/auth_enhanced.py` (use `get_client_ip()`)
- `app/main.py` (configure on startup)

**Configuration**:
```bash
# Environment variables
TRUSTED_PROXIES="10.0.0.0/8,172.16.0.0/12"  # Explicit proxy list
ENABLE_PROXY_HEADERS="true"                   # Use defaults
```

### 5. ✅ Monitoring Tests with Proper Scopes

**Problem**: Monitoring endpoints now require `admin.monitor` scope, breaking existing tests.

**Solution**:
- Created test helpers for generating tokens with specific scopes
- Added comprehensive monitoring endpoint tests
- Verify authorization failures with clear error messages

**Files Created**:
- `tests/helpers/auth_helpers.py`
- `tests/test_monitoring_api.py`

**Helper Functions**:
```python
# Generate tokens with specific scopes
create_test_token_with_scopes(session, redis, scopes=["admin.monitor"])
create_admin_token(session, redis)  # All admin scopes
create_monitoring_token(session, redis)  # Just monitor scope
```

## Security Improvements

### IP Address Validation

The new IP extraction system provides defense-in-depth:

1. **Trust Boundary**: Only accepts proxy headers from configured trusted proxies
2. **IP Validation**: Validates and normalizes all IP addresses
3. **Attack Prevention**: Prevents IP spoofing from untrusted sources
4. **Logging**: Warns on suspicious activity

### Scope Enforcement

All admin and monitoring endpoints now properly enforce scopes:

- `/api/v2/admin/*` requires `admin.read` or `admin.write`
- `/api/v1/monitoring/*` requires `admin.monitor`
- Clear error messages with required scopes
- RFC 6750 compliant `WWW-Authenticate` headers

## Testing Improvements

### Test Coverage

- **Logout**: Tests for both single and all-session revocation
- **Token Validation**: Proper RFC 9068 header typ verification
- **Scopes**: Verify parsing and enforcement
- **IP Extraction**: Test mode support for X-Forwarded-For
- **Monitoring**: Full authorization test suite

### Test Helpers

New test utilities make it easy to test authorized endpoints:

```python
# Test with proper authorization
monitor_token = await create_monitoring_token(db_session, redis_client)
response = await client.get(
    "/api/v1/monitoring/health",
    headers={"Authorization": f"Bearer {monitor_token}"}
)
assert response.status_code == 200
```

## Deployment Checklist

### Environment Configuration

```bash
# Required
DATABASE_URL="postgresql+asyncpg://..."
REDIS_URL="redis://..."
JWT_SECRET="..."  # For v1 compatibility
JWT_ISS="https://api.example.com"
JWT_AUD="https://api.example.com"

# Proxy Support (if behind reverse proxy)
TRUSTED_PROXIES="10.0.0.0/8,172.16.0.0/12"
# OR
ENABLE_PROXY_HEADERS="true"  # Use defaults

# Optional
INFISICAL_ENABLED="true"
INFISICAL_PROJECT_ID="..."
INFISICAL_SERVER_URL="..."
```

### Migration Path

1. **Deploy v2 endpoints** alongside v1
2. **Configure proxy support** if needed
3. **Update client tokens** to include required scopes
4. **Monitor adoption** via metrics
5. **Deprecate v1** after migration

### Required Scopes

Ensure tokens are issued with appropriate scopes:

- **Admin Operations**: `admin.read`, `admin.write`
- **Monitoring**: `admin.monitor`
- **API Access**: `api.read`, `api.write`
- **M2M Services**: Service-specific scopes

## Validation Commands

```bash
# Run v2 auth tests
uv run pytest tests/test_auth_v2.py -xvs

# Run monitoring tests
uv run pytest tests/test_monitoring_api.py -xvs

# Verify imports
uv run python -c "from app.main import app; print('OK')"

# Check API startup
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Summary

All critical issues have been resolved:

- ✅ Request body parsing works correctly
- ✅ Test assertions match actual token format
- ✅ Scopes are properly parsed and returned
- ✅ IP extraction handles proxies safely
- ✅ Tests include proper authorization

The v2 authentication system is now production-ready with:
- EdDSA/Ed25519 signing
- Refresh token rotation with reuse detection
- M2M authentication
- Scope-based authorization
- Comprehensive test coverage
- Safe proxy support