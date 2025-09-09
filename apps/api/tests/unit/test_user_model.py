from __future__ import annotations

from app.infra.models import User


def test_user_defaults() -> None:
    u = User(email="x@example.com")
    assert u.is_active is True
    assert u.is_verified is False
    assert isinstance(u.roles, list)
    assert "user" in u.roles

