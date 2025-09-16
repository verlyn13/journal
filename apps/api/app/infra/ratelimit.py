from __future__ import annotations

from collections import defaultdict
import time


_state: dict[str, tuple[float, int]] = defaultdict(lambda: (0.0, 0))


def allow(key: str, max_attempts: int, window_seconds: int) -> bool:
    now = time.time()
    win_start, count = _state[key]
    if now - win_start > window_seconds:
        _state[key] = (now, 1)
        return True
    if count < max_attempts:
        _state[key] = (win_start, count + 1)
        return True
    return False
