from __future__ import annotations

from app.telemetry.metrics_runtime import inc


def login_success(provider: str) -> None:
    inc("auth_login_success_total", {"provider": provider})


def login_fail(reason: str) -> None:
    inc("auth_login_fail_total", {"reason": reason})


def refresh_rotated() -> None:
    inc("auth_refresh_rotations_total")


def session_revoked() -> None:
    inc("auth_revocations_total")

