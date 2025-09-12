from __future__ import annotations

import hashlib
import math
import os
import struct
from typing import List

PROVIDER = os.getenv("JOURNAL_EMBED_PROVIDER", "fake").lower()
EMBED_DIM = int(os.getenv("JOURNAL_EMBED_DIM", "1536"))
OPENAI_MODEL = os.getenv("JOURNAL_EMBED_MODEL", "text-embedding-3-small")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


def _fake_embed(text: str, dim: int) -> List[float]:
    # Deterministic pseudo-embedding for local dev/tests (no network).
    h = hashlib.blake2b(text.encode("utf-8"), digest_size=dim // 2).digest()
    # Expand to dim floats in [-1,1]
    vals = []
    for i in range(0, len(h), 8):
        chunk = h[i : i + 8].ljust(8, b"\0")
        (u,) = struct.unpack(">Q", chunk)
        vals.append((u / (2**64 - 1)) * 2.0 - 1.0)
    # If needed, repeat pattern to reach dim
    while len(vals) < dim:
        vals.extend(vals[: dim - len(vals)])
    # L2 normalize
    norm = math.sqrt(sum(v * v for v in vals))
    if norm == 0:
        return [0.0] * dim
    return [v / norm for v in vals[:dim]]


def _openai_embed(text: str, dim: int) -> List[float]:
    try:
        from openai import OpenAI
    except Exception as e:
        raise RuntimeError(
            "openai package not installed; `pip install openai` or set JOURNAL_EMBED_PROVIDER=fake"
        ) from e
    if not OPENAI_API_KEY:
        raise RuntimeError("Set OPENAI_API_KEY for JOURNAL_EMBED_PROVIDER=openai")
    client = OpenAI(api_key=OPENAI_API_KEY)
    resp = client.embeddings.create(model=OPENAI_MODEL, input=text)
    vec = resp.data[0].embedding
    # If model dim differs, pad/trim
    if len(vec) < dim:
        vec = vec + [0.0] * (dim - len(vec))
    elif len(vec) > dim:
        vec = vec[:dim]
    # Normalize
    mag = sum(x * x for x in vec) ** 0.5 or 1.0
    return [x / mag for x in vec]


def get_embedding(text: str) -> List[float]:
    if PROVIDER == "openai":
        return _openai_embed(text, EMBED_DIM)
    return _fake_embed(text, EMBED_DIM)
