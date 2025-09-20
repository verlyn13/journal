---
id: phase-5-enhancement-plan
title: 'Phase 5 Enhancement Plan: Production-Grade Token System'
type: api
version: 1.0.0
created: '2025-09-11'
updated: '2025-09-11'
author: Journal Team
tags:
- api
- python
priority: high
status: approved
visibility: internal
schema_version: v1
last_verified: '2025-09-11'
---

# Phase 5 Enhancement Plan: Production-Grade Token System

## Executive Summary

This document outlines how to enhance our Phase 5 authentication implementation to align with production best practices WITHOUT requiring painful refactors. All enhancements are **additive** and maintain backward compatibility.

## Current State Analysis

### ✅ What We Have (Strengths)

1. **Token Rotation Detection** 
   - Refresh token reuse detection (RFC 9700)
   - Immediate session revocation on reuse
   - Comprehensive audit trail

2. **Step-Up Authentication**
   - WebAuthn for sensitive actions
   - Fresh authentication windows (5 min)
   - Challenge-based verification

3. **Advanced Rate Limiting**
   - Per-action configurations
   - IP + User tracking
   - Failure pattern detection

4. **Audit Infrastructure**
   - Hash-chained integrity
   - Tamper detection
   - Privacy dashboard integration

### ❌ Critical Gaps

1. **No Key Rotation** - Static signing keys are a security risk
2. **No JWKS Endpoint** - Can't support external token verification
3. **No M2M Tokens** - Services can't authenticate with each other
4. **No Secrets Management** - Manual secret rotation
5. **Basic Sessions** - Not optimized for web (cookie-based)

## Enhanced Architecture (Non-Breaking)

### Token Hierarchy (Aligned with token-enhancement.md)

```
┌─────────────────────────────────────────────────────────┐
│                    Token Classes                         │
├─────────────────────────────────────────────────────────┤
│ 1. Session Cookie (Primary for Web)                      │
│    - TTL: 30 min idle, 12h absolute                     │
│    - Storage: Redis                                      │
│    - Rotation: On privilege change                       │
├─────────────────────────────────────────────────────────┤
│ 2. Access JWT (API Calls)                               │
│    - TTL: 10 minutes                                    │
│    - Signed: RS256/EdDSA                                │
│    - Audience: api                                      │
├─────────────────────────────────────────────────────────┤
│ 3. Refresh Token (One-Time Use)                         │
│    - TTL: 14 days sliding                               │
│    - Storage: AES-GCM encrypted                         │
│    - Detection: Reuse → Revoke all                      │
├─────────────────────────────────────────────────────────┤
│ 4. M2M Token (Service-to-Service)                       │
│    - TTL: 5-30 minutes                                  │
│    - Scoped: Fine-grained claims                        │
│    - Auth: Machine Identity                             │
└─────────────────────────────────────────────────────────┘
```

## Implementation Plan

### Phase 5.1: Key Management Foundation (Priority: HIGH)

#### 1. Key Rotation Service

```python
# apps/api/app/domain/auth/key_rotation_service.py
class KeyRotationService:
    """Manages JWT signing keys with overlap windows."""
    
    async def get_current_key(self) -> JWK:
        """Get current signing key from Infisical."""
        
    async def get_next_key(self) -> JWK:
        """Get next signing key for pre-publication."""
        
    async def rotate_keys(self) -> None:
        """Perform key rotation with overlap window."""
        
    async def get_jwks(self) -> dict:
        """Generate JWKS with current+next keys."""
```

**Integration Points:**
- Uses existing AuditService for logging
- Triggers webhook on rotation
- Caches keys in Redis with TTL

#### 2. JWKS Endpoint

```python
# apps/api/app/api/jwks.py
@router.get("/.well-known/jwks.json")
async def get_jwks():
    """Public endpoint for key distribution."""
    return {
        "keys": [
            current_public_key,
            next_public_key  # During overlap
        ]
    }
```

**Features:**
- Cache-Control headers
- CORS enabled
- No authentication required

#### 3. Infisical Client

```python
# apps/api/app/infra/infisical_client.py
class InfisicalClient:
    """Runtime secret management."""
    
    async def fetch_secret(self, path: str) -> str:
        """Fetch secret from Infisical."""
        
    async def handle_webhook(self, event: dict) -> None:
        """Process rotation events."""
        
    async def authenticate_machine_identity(self) -> str:
        """Get access token via machine identity."""
```

**Configuration:**
- Machine identity for production
- Service token for development
- Webhook handlers for rotation events

### Phase 5.2: Token Enhancement (Priority: MEDIUM)

#### 4. Enhanced Token Service

```python
# apps/api/app/domain/auth/enhanced_token_service.py
class EnhancedTokenService:
    """Multi-class token management."""
    
    async def issue_m2m_token(
        self, 
        service_id: str,
        scopes: list[str]
    ) -> str:
        """Issue service-to-service token."""
        
    async def classify_token(self, token: str) -> TokenClass:
        """Determine token type and validate."""
        
    async def enforce_ttl(self, token_class: str) -> int:
        """Get TTL for token class."""
```

**Token Classes:**
- SESSION: 30 min idle, 12h max
- ACCESS: 10 min
- REFRESH: 14 days
- M2M: 5-30 min

#### 5. Session Service

```python
# apps/api/app/domain/auth/session_service.py
class SessionService:
    """Cookie-based session management."""
    
    async def create_session(self, user_id: UUID) -> str:
        """Create primary web session."""
        
    async def rotate_session(self, reason: str) -> str:
        """Rotate on privilege change."""
        
    def set_cookie(self, response: Response, sid: str):
        """Set secure cookie with proper flags."""
```

**Cookie Configuration:**
- HttpOnly: True
- Secure: True
- SameSite: Lax
- Path: /
- Max-Age: 1800 (30 min)

### Phase 5.3: Rotation Cadences

| Component | Rotation Period | Overlap Window | Mechanism |
|-----------|----------------|----------------|-----------|
| JWT Keys | 60 days | 20 minutes | Infisical + Webhook |
| AES Keys | 90 days | 48 hours | Infisical + Webhook |
| Refresh Tokens | Per use | N/A | Single-use |
| M2M Tokens | 5-30 min | None | Auto-refresh |
| Sessions | On privilege | N/A | Immediate |

## Migration Strategy (Zero Downtime)

### Step 1: Deploy New Services (No Breaking Changes)
```bash
# Add new services alongside existing
- KeyRotationService
- InfisicalClient
- EnhancedTokenService
- SessionService
```

### Step 2: Gradual Secret Migration
```bash
# Start with non-critical secrets
/auth/jwt/public_jwks        # Public keys
/auth/oauth/*/client_id      # OAuth config

# Then critical secrets
/auth/jwt/current_private_key # Signing key
/auth/aes/enc_keys           # Encryption keys
```

### Step 3: Enable Rotation
```bash
# Enable webhooks
POST /internal/keys/changed
POST /internal/aes/activekid

# Start rotation schedule
JWT keys: Every 60 days
AES keys: Every 90 days
```

### Step 4: Monitor & Verify
```bash
# Check JWKS endpoint
curl /.well-known/jwks.json

# Verify rotation in audit log
SELECT * FROM audit_log WHERE event_type = 'key_rotated'

# Monitor token metrics
- M2M token issuance rate
- Session rotation frequency
- Key rotation success rate
```

## Testing Requirements

### Unit Tests
```python
# New test files needed
tests/unit/test_key_rotation_service.py
tests/unit/test_enhanced_token_service.py
tests/unit/test_session_service.py
tests/unit/test_infisical_client.py
```

### Integration Tests
```python
# Rotation flows
- JWT key rotation with overlap
- AES key rotation with re-encryption
- Session rotation on privilege change
- M2M token issuance and verification
```

### Security Tests
```python
# Critical validations
- Verify JWKS serves both keys during overlap
- Confirm old tokens valid during overlap
- Test token classification accuracy
- Validate cookie security flags
```

## Environment Configuration

### Development (.env)
```bash
# Existing config remains
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Add Infisical (optional in dev)
INFISICAL_API_URL=https://your-instance.com/api
INFISICAL_PROJECT_ID=proj_xxx
INFISICAL_TOKEN=st.xxx  # Service token for dev
```

### Production (Infisical)
```bash
# Secrets in Infisical
/auth/jwt/current_private_key
/auth/jwt/next_private_key
/auth/jwt/public_jwks
/auth/aes/enc_keys
/auth/aes/active_kid
/auth/oauth/github/client_id
/auth/oauth/github/client_secret
```

## Security Improvements

### Before Enhancement
- Static keys (security risk)
- Manual rotation (error-prone)
- No M2M auth (service vulnerability)
- Basic sessions (limited control)

### After Enhancement
- Automatic key rotation with overlap
- Centralized secret management
- Service-to-service authentication
- Cookie-based sessions with TTLs
- Complete audit trail
- Zero-downtime rotation

## Rollback Plan

If issues arise, the system can be rolled back without data loss:

1. **Disable Rotation**: Stop webhook processing
2. **Revert Keys**: Use previous key version from Infisical
3. **Clear Cache**: Flush Redis key cache
4. **Restore Static**: Fall back to env-based config

All enhancements are additive, so the existing authentication continues to work.

## Success Metrics

### Technical Metrics
- Zero authentication downtime during rotation
- < 10ms JWKS endpoint response time
- 100% token classification accuracy
- < 1% token verification failures

### Security Metrics
- All keys rotated within schedule
- No static keys in codebase
- Complete audit trail for rotations
- Zero security incidents from key compromise

## Next Steps

1. **Review & Approve**: Team review of enhancement plan
2. **Create Branch**: `feat/token-enhancement`
3. **Implement Phase 5.1**: Key management foundation
4. **Test Thoroughly**: Unit, integration, security tests
5. **Deploy to Staging**: Validate rotation flows
6. **Production Rollout**: Gradual with monitoring

## Conclusion

This enhancement plan strengthens our authentication system to production standards WITHOUT requiring painful refactors. All changes are additive, maintain backward compatibility, and provide a clear migration path. The system will be more secure, more maintainable, and ready for scale.