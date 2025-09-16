from __future__ import annotations

from collections import deque
import hashlib
import math
import os
import random
import time

from app.telemetry.metrics_runtime import inc as metrics_inc


class RateLimitedError(Exception):
    """Raised when the embedding provider is rate-limited or circuit is open."""


PROVIDER = os.getenv("JOURNAL_EMBED_PROVIDER", "fake").lower()
EMBED_DIM = int(os.getenv("JOURNAL_EMBED_DIM", "1536"))
OPENAI_MODEL = os.getenv("JOURNAL_EMBED_MODEL", "text-embedding-3-small")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Simple in-process circuit breaker (optional)
_CB_ENABLED = os.getenv("EMBED_CB_ENABLED", "0") == "1"
_CB_OPEN_SECS = float(os.getenv("EMBED_CB_OPEN_SECS", "60"))
_CB_BUDGET_PER_MIN = int(os.getenv("EMBED_CB_ERROR_BUDGET_PER_MIN", "50"))
_CB_ERRORS: deque[float] = deque()  # timestamps of recent failures (seconds)
_CB_STATE = {"open_until": 0.0}


def _cb_now() -> float:
    return time.time()


def _cb_maybe_open() -> None:
    """Open CB if error budget exceeded within last minute."""
    now = _cb_now()
    # purge older than 60s
    while _CB_ERRORS and now - _CB_ERRORS[0] > 60.0:
        _CB_ERRORS.popleft()
    if len(_CB_ERRORS) >= _CB_BUDGET_PER_MIN:
        _CB_STATE["open_until"] = max(_CB_STATE["open_until"], now + _CB_OPEN_SECS)


def _cb_before_call() -> None:
    if not _CB_ENABLED:
        return
    now = _cb_now()
    if now < _CB_STATE["open_until"]:
        raise RateLimitedError("circuit open")


def _cb_on_failure() -> None:
    if not _CB_ENABLED:
        return
    _CB_ERRORS.append(_cb_now())
    _cb_maybe_open()


def _fake_embed(text: str, dim: int) -> list[float]:
    """Deterministic pseudo-embedding without external deps.

    Uses SHA-256(seed) to seed a PRNG and generates dim floats in [-1, 1],
    then L2-normalizes the vector.
    """
    seed = int.from_bytes(hashlib.sha256(text.encode("utf-8")).digest(), "big")
    rng = random.Random(seed)  # noqa: S311 - non-crypto PRNG for test/deterministic embeddings
    vals = [(rng.random() * 2.0 - 1.0) for _ in range(dim)]
    norm = math.sqrt(sum(v * v for v in vals)) or 1.0
    return [v / norm for v in vals]


def _openai_embed(text: str, dim: int) -> list[float]:
    from openai import OpenAI  # noqa: PLC0415

    if not OPENAI_API_KEY:
        raise RuntimeError("Set OPENAI_API_KEY for JOURNAL_EMBED_PROVIDER=openai")
    client = OpenAI(api_key=OPENAI_API_KEY)
    resp = client.embeddings.create(model=OPENAI_MODEL, input=text)
    vec = resp.data[0].embedding
    if len(vec) < dim:
        vec += [0.0] * (dim - len(vec))
    elif len(vec) > dim:
        vec = vec[:dim]
    mag = sum(x * x for x in vec) ** 0.5 or 1.0
    return [x / mag for x in vec]


def get_embedding(text: str) -> list[float]:
    # Circuit breaker fast-fail
    _cb_before_call()
    try:
        if PROVIDER == "openai":
            vec = _openai_embed(text, EMBED_DIM)
            metrics_inc("provider_calls_total", {"provider": "openai", "result": "ok"})
        else:
            vec = _fake_embed(text, EMBED_DIM)
            metrics_inc("provider_calls_total", {"provider": "fake", "result": "ok"})
    except Exception:
        # Track error for breaker and re-raise
        _cb_on_failure()
        prov = "openai" if PROVIDER == "openai" else "fake"
        metrics_inc("provider_errors_total", {"provider": prov})
        raise
    else:
        return vec
