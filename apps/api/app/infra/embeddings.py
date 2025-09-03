from __future__ import annotations

import hashlib
import math
import os
import random


PROVIDER = os.getenv("JOURNAL_EMBED_PROVIDER", "fake").lower()
EMBED_DIM = int(os.getenv("JOURNAL_EMBED_DIM", "1536"))
OPENAI_MODEL = os.getenv("JOURNAL_EMBED_MODEL", "text-embedding-3-small")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


def _fake_embed(text: str, dim: int) -> list[float]:
    """Deterministic pseudo-embedding without external deps.

    Uses SHA-256(seed) to seed a PRNG and generates dim floats in [-1, 1],
    then L2-normalizes the vector.
    """
    seed = int.from_bytes(hashlib.sha256(text.encode("utf-8")).digest(), "big")
    rng = random.Random(seed)
    vals = [(rng.random() * 2.0 - 1.0) for _ in range(dim)]
    norm = math.sqrt(sum(v * v for v in vals)) or 1.0
    return [v / norm for v in vals]


def _openai_embed(text: str, dim: int) -> list[float]:
    from openai import OpenAI

    if not OPENAI_API_KEY:
        raise RuntimeError("Set OPENAI_API_KEY for JOURNAL_EMBED_PROVIDER=openai")
    client = OpenAI(api_key=OPENAI_API_KEY)
    resp = client.embeddings.create(model=OPENAI_MODEL, input=text)
    vec = resp.data[0].embedding
    if len(vec) < dim:
        vec = vec + [0.0] * (dim - len(vec))
    elif len(vec) > dim:
        vec = vec[:dim]
    mag = sum(x * x for x in vec) ** 0.5 or 1.0
    return [x / mag for x in vec]


def get_embedding(text: str) -> list[float]:
    if PROVIDER == "openai":
        return _openai_embed(text, EMBED_DIM)
    return _fake_embed(text, EMBED_DIM)
