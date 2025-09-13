"""RFC 8725 (JWT BCP) negative tests to harden verification."""

from __future__ import annotations

import base64
import json

from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest

from app.domain.auth.jwt_service import JWTService


# Use local security conftest fixtures (no DB/Redis)


@pytest.mark.asyncio()
class TestJWTBCP:
    async def test_reject_hs256_alg(self, jwt_service: JWTService) -> None:
        user_id = uuid4()
        # Header alg=HS256 with bogus signature over a valid payload
        now = int(datetime.now(UTC).timestamp())
        header = {"alg": "HS256", "typ": "at+jwt", "kid": "bogus"}
        payload = {
            "sub": str(user_id),
            "iss": "journal-api",
            "aud": ["journal-clients"],
            "iat": now,
            "exp": int((datetime.now(UTC) + timedelta(minutes=5)).timestamp()),
            "type": "access",
            "jti": "x",
        }
        h = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
        p = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
        tampered = f"{h}.{p}.sig"
        with pytest.raises(ValueError, match=r"Algorithm|allowed|HS256|not allowed"):
            await jwt_service.verify_jwt(tampered)

    async def test_reject_unknown_crit(self, jwt_service: JWTService) -> None:
        user_id = uuid4()
        token = await jwt_service.sign_jwt(user_id, "access")
        parts = token.split(".")
        header = json.loads(base64.urlsafe_b64decode(parts[0] + "=="))
        header["crit"] = ["unknown"]
        h = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
        bad = f"{h}.{parts[1]}.{parts[2]}"
        with pytest.raises(ValueError, match=r"Unsupported critical|critical"):
            await jwt_service.verify_jwt(bad)

    async def test_reject_remote_key_headers(self, jwt_service: JWTService) -> None:
        user_id = uuid4()
        token = await jwt_service.sign_jwt(user_id, "access")
        parts = token.split(".")
        header = json.loads(base64.urlsafe_b64decode(parts[0] + "=="))
        header["jku"] = "https://evil.example/jwks.json"
        h = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
        bad = f"{h}.{parts[1]}.{parts[2]}"
        with pytest.raises(ValueError, match=r"Forbidden header|Remote key"):
            await jwt_service.verify_jwt(bad)

    async def test_wrong_typ_rejected(self, jwt_service: JWTService) -> None:
        user_id = uuid4()
        token = await jwt_service.sign_jwt(user_id, "access")
        parts = token.split(".")
        header = json.loads(base64.urlsafe_b64decode(parts[0] + "=="))
        header["typ"] = "JWT"
        h = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
        bad = f"{h}.{parts[1]}.{parts[2]}"
        with pytest.raises(ValueError, match=r"Token type|not allowed|typ"):
            await jwt_service.verify_jwt(bad, expected_type="access")
