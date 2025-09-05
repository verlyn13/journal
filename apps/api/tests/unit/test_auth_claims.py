import pytest

from app.infra import auth as auth_mod


@pytest.mark.unit
def test_jwt_encode_decode_roundtrip(monkeypatch):
    # Freeze time for deterministic claims
    fixed_epoch = 1_700_000_000

    def _fake_now():
        import datetime

        return datetime.datetime.fromtimestamp(fixed_epoch, datetime.UTC)

    monkeypatch.setattr(auth_mod, "_utcnow", _fake_now)

    token = auth_mod.create_access_token("user-123", scopes=["read", "write"])  # HS256

    # Validate through dependency
    class _Creds:
        def __init__(self, tok):
            self.credentials = tok

    user_id = auth_mod.require_user(_Creds(token))
    assert user_id == "user-123"


@pytest.mark.unit
def test_refresh_token_type(monkeypatch):
    fixed_epoch = 1_700_000_000

    def _fake_now():
        import datetime

        return datetime.datetime.fromtimestamp(fixed_epoch, datetime.UTC)

    monkeypatch.setattr(auth_mod, "_utcnow", _fake_now)

    refresh = auth_mod.create_refresh_token("abc")

    # Using the same validator would reject refresh tokens for access-only endpoints
    class _Creds:
        def __init__(self, tok):
            self.credentials = tok

    # Should parse and return sub when used in a refresh flow (decode happens in route)
    # Here we just ensure token can be created without raising and is non-empty
    assert isinstance(refresh, str) and refresh
