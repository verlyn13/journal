# Authentication Migration Guide: HS256 → EdDSA

This guide documents the migration from legacy HS256-based authentication to the enhanced EdDSA-based system with full security features.

## Overview of Changes

### Legacy System (v1)
- **Signing Algorithm**: HS256 (symmetric)
- **Token Storage**: Database sessions with `refresh_id`
- **Refresh Handling**: Simple rotation without reuse detection
- **Endpoints**: `/api/v1/auth/*`
- **Key Management**: Static JWT secret in environment

### Enhanced System (v2)
- **Signing Algorithm**: EdDSA/Ed25519 (asymmetric)
- **Token Storage**: Redis-backed with tamper detection
- **Refresh Handling**: One-time use with reuse detection and session revocation
- **Endpoints**: `/api/v2/auth/*`
- **Key Management**: Infisical with automatic rotation
- **Additional Features**: Session cookies, M2M tokens, security policies

## Migration Steps

### Phase 1: Parallel Operation

Both auth systems will run in parallel during migration:

```
/api/v1/auth/* → Legacy HS256 (existing clients)
/api/v2/auth/* → Enhanced EdDSA (new clients)
/.well-known/jwks.json → Publishes EdDSA public keys
```

### Phase 2: Client Migration

#### Web Frontend Migration

1. **Update login endpoint**:
```typescript
// Old
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  body: JSON.stringify({ username, password })
});

// New
const response = await fetch('/api/v2/auth/login', {
  method: 'POST',
  body: JSON.stringify({ 
    username, 
    password,
    use_session_cookie: true  // Enable secure session cookies
  })
});
```

2. **Update refresh logic**:
```typescript
// Old - No reuse detection
const refresh = await fetch('/api/v1/auth/refresh', {
  method: 'POST',
  body: JSON.stringify({ refresh_token })
});

// New - With reuse detection and CSRF
const csrfResponse = await fetch('/api/v2/auth/csrf');
const { csrf_token } = await csrfResponse.json();

const refresh = await fetch('/api/v2/auth/refresh', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrf_token  // Required for cookie-based refresh
  },
  credentials: 'include'  // Include cookies
});
```

3. **Handle security violations**:
```typescript
// New - Handle token reuse detection
if (refresh.status === 401 && refresh.body.includes('Security violation')) {
  // All sessions revoked due to token reuse
  // Force re-login
  window.location.href = '/login';
}
```

#### Mobile/API Client Migration

1. **Update token validation**:
```python
# Old - HS256 validation
import jwt
payload = jwt.decode(token, SECRET, algorithms=['HS256'])

# New - EdDSA validation via JWKS
from jwt import PyJWKClient
jwks_client = PyJWKClient('https://api.example.com/.well-known/jwks.json')
signing_key = jwks_client.get_signing_key_from_jwt(token)
payload = jwt.decode(token, signing_key.key, algorithms=['EdDSA'])
```

2. **Implement token refresh with rotation**:
```python
# Store refresh token hash for reuse detection
import hashlib
refresh_hash = hashlib.sha256(refresh_token.encode()).hexdigest()

# Check if we've used this token before
if refresh_hash in used_tokens:
    # SECURITY: Don't attempt refresh, get new login
    raise SecurityError("Token reuse detected")

# Proceed with refresh
response = requests.post('/api/v2/auth/refresh', 
                         json={'refresh_token': refresh_token})

if response.status_code == 401:
    # All tokens revoked, force re-login
    clear_all_tokens()
    redirect_to_login()
```

### Phase 3: Service-to-Service Migration

#### Configure Machine Identities

1. **Create Machine Identity in Infisical**:
```yaml
# /services/payment-service/identity
{
  "scopes": ["api.payments.read", "api.payments.write"],
  "allowed_ips": ["10.0.1.50", "10.0.1.51"],
  "metadata": {
    "team": "payments",
    "owner": "payment-team@example.com"
  }
}
```

2. **Exchange for M2M token**:
```python
# Get M2M token
response = requests.post('/api/v2/auth/m2m/token', json={
    'identity_token': 'mi_payment-service_prod_xxxxx',
    'requested_scopes': ['api.payments.write'],
    'ttl_seconds': 1800  # 30 minutes
})

m2m_token = response.json()['access_token']

# Use M2M token for service calls
headers = {'Authorization': f'Bearer {m2m_token}'}
```

### Phase 4: Database Migration

Run the migration script to update existing sessions:

```bash
# Dry run first
python -m app.scripts.migrate_auth_sessions --dry-run

# Execute migration
python -m app.scripts.migrate_auth_sessions --execute

# Verify
python -m app.scripts.migrate_auth_sessions --verify
```

### Phase 5: Monitoring Setup

1. **Enable metrics collection**:
```python
# Track migration progress
from app.telemetry.metrics_runtime import inc

inc("auth_migration_v1_requests")  # Legacy requests
inc("auth_migration_v2_requests")  # Enhanced requests
inc("auth_migration_errors", {"type": "reuse_detection"})
```

2. **Set up alerts**:
```yaml
# Prometheus alert rules
- alert: HighTokenReuseRate
  expr: rate(auth_token_reuse_detected_total[5m]) > 0.01
  annotations:
    summary: "High rate of token reuse detection"
    
- alert: LegacyAuthStillActive
  expr: rate(auth_migration_v1_requests[1h]) > 100
  annotations:
    summary: "Legacy auth still receiving significant traffic"
```

## Security Considerations

### During Migration

1. **Don't mix token types**: v1 tokens won't work with v2 endpoints
2. **Monitor for anomalies**: Track reuse detection rates
3. **Gradual rollout**: Migrate internal services first, then external clients
4. **Maintain audit logs**: Keep detailed logs during migration

### Post-Migration

1. **Deprecate v1 endpoints**: After all clients migrated
2. **Remove HS256 support**: Clean up legacy code
3. **Rotate all keys**: Force key rotation after migration
4. **Update documentation**: Remove references to legacy auth

## Rollback Plan

If issues arise during migration:

1. **Client rollback**: Point clients back to v1 endpoints
2. **Token compatibility**: v1 endpoints remain functional
3. **Database compatibility**: Sessions work with both systems
4. **Key preservation**: Keep HS256 secret until fully migrated

## Timeline

- **Week 1-2**: Deploy enhanced auth in parallel
- **Week 3-4**: Migrate internal services
- **Week 5-6**: Migrate web frontend
- **Week 7-8**: Migrate mobile clients
- **Week 9-10**: Migrate third-party integrations
- **Week 11-12**: Monitor and optimize
- **Week 13**: Deprecate v1 endpoints
- **Week 14**: Remove legacy code

## Validation Checklist

- [ ] JWKS endpoint returns current + next keys
- [ ] EdDSA tokens validate via JWKS
- [ ] Refresh reuse triggers session revocation
- [ ] Session cookies have proper security flags
- [ ] M2M tokens work for service auth
- [ ] Monitoring shows migration progress
- [ ] No increase in auth failures
- [ ] Performance metrics acceptable
- [ ] Security policies enforced
- [ ] Audit logs capturing all events

## Support

For issues during migration:

1. Check monitoring dashboard for auth metrics
2. Review audit logs for security events
3. Test with `/api/v2/auth/verify` endpoint
4. Validate JWKS at `/.well-known/jwks.json`
5. Check Infisical key rotation status

## Conclusion

The migration provides significant security improvements:

- **Asymmetric signing** prevents token forgery
- **Reuse detection** stops token replay attacks
- **Session management** improves user experience
- **M2M tokens** secure service communication
- **Automatic rotation** maintains security posture

Follow this guide carefully and monitor each phase before proceeding to the next.