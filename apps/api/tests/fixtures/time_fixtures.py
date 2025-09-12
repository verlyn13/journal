"""Time control fixtures for deterministic tests."""

from __future__ import annotations

import contextlib

from datetime import UTC, datetime

import pytest

from freezegun import freeze_time as _freeze_time


@pytest.fixture
def freeze_time():
    """Freeze time using freezegun.

    Usage:
        with freeze_time("2025-01-01T00:00:00Z"):
            ...
    Or as a decorator via pytest-freezegun.
    """

    @contextlib.contextmanager
    def _ctx(iso_timestamp: str | None = None):
        ts = iso_timestamp or datetime.now(UTC).isoformat()
        with _freeze_time(ts):
            yield

    return _ctx
