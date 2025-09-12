"""JWT verification policy with RFC 8725 compliance."""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any, Literal

logger = logging.getLogger(__name__)

# Token type definitions per RFC 9068
TokenTyp = Literal["at+jwt", "JWT", "refresh+jwt", "id+jwt"]


@dataclass
class VerifierPolicy:
    """JWT verification policy enforcing RFC 8725 best practices.
    
    This class encapsulates all verification policies required for secure JWT
    validation according to RFC 8725 (JWT BCP), RFC 7519 (JWT), RFC 9068
    (OAuth JWT Access Token Profile), and OWASP ASVS guidelines.
    """
    
    # Algorithm restrictions (RFC 8725 Section 3.1)
    allowed_algorithms: set[str] = field(default_factory=lambda: {"EdDSA"})
    
    # Type header validation (RFC 9068 for access tokens)
    allowed_types: set[TokenTyp] = field(default_factory=lambda: {"at+jwt", "JWT"})
    require_typ: bool = True
    
    # Timing validation (RFC 7519 Section 4.1)
    leeway_seconds: int = 60  # Clock skew tolerance
    max_token_lifetime: int = 900  # 15 minutes max for access tokens
    
    # Required claims (RFC 7519 Section 4.1, RFC 8725 Section 3.7)
    required_claims: set[str] = field(
        default_factory=lambda: {"iss", "sub", "aud", "exp", "iat", "jti"}
    )
    
    # Issuer validation
    expected_issuer: str | None = None
    
    # Audience validation (RFC 7519 Section 4.1.3)
    expected_audiences: set[str] = field(default_factory=set)
    
    # Header restrictions (RFC 8725 Section 3.2)
    forbidden_headers: set[str] = field(
        default_factory=lambda: {"jku", "x5u", "x5t", "x5t#S256", "jwk"}
    )
    
    # Critical extensions (RFC 7515 Section 4.1.11)
    supported_critical: set[str] = field(default_factory=set)
    
    def validate_header(self, header: dict[str, Any]) -> None:
        """Validate JWT header according to RFC 8725.
        
        Args:
            header: JWT header dictionary
            
        Raises:
            ValueError: If header validation fails
        """
        # Algorithm validation (RFC 8725 Section 3.1)
        alg = header.get("alg")
        if not alg:
            raise ValueError("Missing 'alg' header")
        
        if alg == "none":
            raise ValueError("Algorithm 'none' is explicitly forbidden (RFC 8725)")
        
        if alg not in self.allowed_algorithms:
            raise ValueError(
                f"Algorithm '{alg}' not allowed. "
                f"Allowed: {self.allowed_algorithms}"
            )
        
        # Type validation (RFC 9068 for access tokens)
        if self.require_typ:
            typ = header.get("typ")
            if not typ:
                raise ValueError("Missing 'typ' header")
            
            if typ not in self.allowed_types:
                raise ValueError(
                    f"Token type '{typ}' not allowed. "
                    f"Allowed: {self.allowed_types}"
                )
        
        # Forbidden headers check (RFC 8725 Section 3.2)
        for forbidden in self.forbidden_headers:
            if forbidden in header:
                raise ValueError(
                    f"Forbidden header '{forbidden}' present. "
                    f"Remote key references not allowed (RFC 8725)"
                )
        
        # Critical extensions (RFC 7515 Section 4.1.11)
        crit = header.get("crit", [])
        if crit:
            if not isinstance(crit, list):
                raise ValueError("'crit' header must be an array")
            
            unsupported = set(crit) - self.supported_critical
            if unsupported:
                raise ValueError(
                    f"Unsupported critical extensions: {unsupported}"
                )
    
    def validate_claims(self, claims: dict[str, Any]) -> None:
        """Validate JWT claims according to RFC 7519 and RFC 8725.
        
        Args:
            claims: JWT payload claims
            
        Raises:
            ValueError: If claims validation fails
        """
        # Check required claims presence
        missing_claims = self.required_claims - set(claims.keys())
        if missing_claims:
            raise ValueError(f"Missing required claims: {missing_claims}")
        
        now = datetime.now(UTC).timestamp()
        
        # Validate expiration (RFC 7519 Section 4.1.4)
        exp = claims.get("exp")
        if not isinstance(exp, (int, float)):
            raise ValueError("'exp' claim must be a number")
        
        if now > exp + self.leeway_seconds:
            raise ValueError("Token has expired")
        
        # Check token not too far in future (policy)
        if exp > now + self.max_token_lifetime + self.leeway_seconds:
            raise ValueError(
                f"Token expiration too far in future "
                f"(max lifetime: {self.max_token_lifetime}s)"
            )
        
        # Validate not before (RFC 7519 Section 4.1.5)
        nbf = claims.get("nbf")
        if nbf is not None:
            if not isinstance(nbf, (int, float)):
                raise ValueError("'nbf' claim must be a number")
            
            if now < nbf - self.leeway_seconds:
                raise ValueError("Token not yet valid (nbf)")
        
        # Validate issued at (RFC 7519 Section 4.1.6)
        iat = claims.get("iat")
        if not isinstance(iat, (int, float)):
            raise ValueError("'iat' claim must be a number")
        
        # Check token lifetime
        token_lifetime = exp - iat
        if token_lifetime > self.max_token_lifetime:
            raise ValueError(
                f"Token lifetime ({token_lifetime}s) exceeds maximum "
                f"({self.max_token_lifetime}s)"
            )
        
        # Future token check
        if iat > now + self.leeway_seconds:
            raise ValueError("Token issued in the future")
        
        # Validate issuer (RFC 7519 Section 4.1.1)
        iss = claims.get("iss")
        if not isinstance(iss, str):
            raise ValueError("'iss' claim must be a string")
        
        if self.expected_issuer and iss != self.expected_issuer:
            raise ValueError(f"Invalid issuer. Expected: {self.expected_issuer}")
        
        # Validate subject (RFC 7519 Section 4.1.2)
        sub = claims.get("sub")
        if not isinstance(sub, str):
            raise ValueError("'sub' claim must be a string")
        
        # Validate audience (RFC 7519 Section 4.1.3)
        aud = claims.get("aud")
        if aud is not None:
            # Normalize to list
            if isinstance(aud, str):
                aud = [aud]
            elif not isinstance(aud, list):
                raise ValueError("'aud' claim must be string or array")
            
            if self.expected_audiences:
                # Check at least one audience matches
                if not any(a in self.expected_audiences for a in aud):
                    raise ValueError(
                        f"No matching audience. Token audiences: {aud}, "
                        f"Expected: {self.expected_audiences}"
                    )
        elif self.expected_audiences:
            raise ValueError("Token missing required audience")
        
        # Validate JTI (RFC 7519 Section 4.1.7)
        jti = claims.get("jti")
        if "jti" in self.required_claims:
            if not isinstance(jti, str):
                raise ValueError("'jti' claim must be a string")


# Pre-configured policies for different token types
ACCESS_TOKEN_POLICY = VerifierPolicy(
    allowed_types={"at+jwt"},
    max_token_lifetime=600,  # 10 minutes
    expected_issuer="https://journal.example.com",
)

REFRESH_TOKEN_POLICY = VerifierPolicy(
    allowed_types={"refresh+jwt", "JWT"},
    max_token_lifetime=1209600,  # 14 days
    required_claims={"iss", "sub", "exp", "iat", "jti"},  # aud optional for refresh
)

M2M_TOKEN_POLICY = VerifierPolicy(
    allowed_types={"at+jwt"},
    max_token_lifetime=1800,  # 30 minutes
    required_claims={"iss", "sub", "aud", "exp", "iat", "scope"},
)

ID_TOKEN_POLICY = VerifierPolicy(
    allowed_types={"id+jwt", "JWT"},
    max_token_lifetime=3600,  # 1 hour
    required_claims={"iss", "sub", "aud", "exp", "iat", "auth_time", "nonce"},
)