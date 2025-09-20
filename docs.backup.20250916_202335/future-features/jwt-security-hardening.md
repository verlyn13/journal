# JWT Security Hardening - Future Feature

## Intent & Purpose

The `feat/jwt-security-hardening` branch introduced enterprise-grade JWT security patterns to prevent common vulnerabilities and ensure RFC compliance. The core intent was to move beyond basic JWT validation to implement defense-in-depth security with policy-driven verification.

### Key Security Goals
- **RFC 8725 Compliance**: Implement JWT Best Current Practices to prevent algorithm confusion, key confusion, and other JWT-specific attacks
- **RFC 9068 Compliance**: Support OAuth 2.0 JWT Access Token Profile with proper `typ` header validation
- **Policy-Based Validation**: Centralize security rules in configurable policies rather than scattered validation logic
- **Secrets Abstraction**: Decouple secret management from application logic for easier testing and deployment flexibility

## Valuable Patterns

### 1. VerifierPolicy Pattern (`jwt_verifier_policy.py`)

**Purpose**: Encapsulate all JWT validation rules in a single, configurable policy object.

**Key Features**:
- Algorithm allowlisting (prevents algorithm confusion attacks)
- Token type validation (`at+jwt`, `refresh+jwt`, `id+jwt`)
- Forbidden header detection (`jku`, `x5u` - prevents key confusion)
- Strict timing validation with configurable leeway
- Maximum token lifetime enforcement
- Required claims validation
- Critical extensions support

**Pre-configured Policies**:
```python
ACCESS_TOKEN_POLICY   # 10-minute max, at+jwt type
REFRESH_TOKEN_POLICY  # 14-day max, refresh+jwt type
M2M_TOKEN_POLICY      # 30-minute max, requires scope
ID_TOKEN_POLICY       # 1-hour max, requires nonce
```

### 2. SecretsProvider Protocol (`secrets_provider.py`)

**Purpose**: Abstract secret storage behind a protocol for testing and deployment flexibility.

**Implementations**:
- `InMemorySecretsProvider`: Testing without external dependencies
- `FileSecretsProvider`: Local development with file-based secrets
- `InfisicalSecretsProvider`: Production integration with Infisical
- `CachedSecretsProvider`: Performance wrapper with TTL-based caching

**Benefits**:
- Easy mocking in tests
- Environment-specific implementations
- Consistent async interface
- Built-in caching layer

## Integration with Current System

### Where It Would Fit

1. **Replace/Enhance `app/infra/auth.py`**:
   - Current: Direct JWT validation in auth functions
   - Future: Inject VerifierPolicy into auth layer
   - Benefit: Centralized security policy management

2. **Enhance `app/domain/auth/key_manager.py`**:
   - Current: Key rotation and management
   - Future: Use SecretsProvider for key storage
   - Benefit: Consistent secret handling across all auth components

3. **Improve `app/api/v1/auth.py`**:
   - Current: Inline token generation
   - Future: Policy-driven token creation and validation
   - Benefit: Different policies for different token types

4. **Testing Enhancement**:
   - Current: Mock Infisical in tests
   - Future: Use InMemorySecretsProvider
   - Benefit: Faster, more reliable tests

### Implementation Approach

```python
# In app/infra/auth.py
from app.domain.auth.jwt_verifier_policy import ACCESS_TOKEN_POLICY

async def verify_token(token: str, policy: VerifierPolicy = ACCESS_TOKEN_POLICY):
    # Decode header without verification
    header = jwt.get_unverified_header(token)
    policy.validate_header(header)

    # Get signing key through existing key_manager
    key = await key_manager.get_current_key()

    # Decode and validate claims
    claims = jwt.decode(token, key, algorithms=policy.allowed_algorithms)
    policy.validate_claims(claims)

    return claims
```

### Migration Strategy

1. **Phase 1**: Introduce VerifierPolicy alongside existing validation
2. **Phase 2**: Migrate endpoints to use policy-based validation
3. **Phase 3**: Add SecretsProvider abstraction for Infisical
4. **Phase 4**: Implement specialized policies for different token types

## Security Benefits

1. **Algorithm Confusion Prevention**: Explicit algorithm allowlisting
2. **Key Confusion Prevention**: Block remote key references (`jku`, `x5u`)
3. **Token Lifetime Management**: Enforce maximum lifetimes per token type
4. **Type Safety**: Validate token types to prevent token substitution
5. **Timing Attack Mitigation**: Consistent leeway handling
6. **Audit Trail**: Centralized validation points for logging

## Testing Benefits

1. **Policy Testing**: Test security rules in isolation
2. **Mock Secrets**: Use InMemorySecretsProvider for unit tests
3. **Scenario Testing**: Easy to test different token types
4. **Error Cases**: Comprehensive error validation testing

## Future Enhancements

1. **Token Binding**: Add support for DPoP or mTLS binding
2. **Revocation**: Integrate with token revocation lists
3. **Rate Limiting**: Per-policy rate limit configurations
4. **Metrics**: Policy-specific validation metrics
5. **Dynamic Policies**: Runtime policy updates without restart

## Conclusion

The JWT security hardening patterns provide valuable security enhancements that would strengthen the Journal API's authentication system. While the branch itself is too outdated to merge, these patterns should be reimplemented in a fresh branch when JWT security improvements become a priority. The policy-based approach and secrets abstraction are particularly valuable for maintaining security standards across different deployment environments.