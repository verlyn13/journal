from __future__ import annotations

import threading



_lock = threading.Lock()
_counters: dict[tuple[str, tuple[tuple[str, str], ...]], float] = {}


def _key(name: str, labels: dict[str, str] | None) -> tuple[str, tuple[tuple[str, str], ...]]:
    items = tuple(sorted((labels or {}).items()))
    return (name, items)


def inc(name: str, labels: dict[str, str] | None = None, value: float = 1.0) -> None:
    with _lock:
        k = _key(name, labels)
        _counters[k] = _counters.get(k, 0.0) + value


def render_prom() -> str:
    lines: list[str] = []
    with _lock:
        for (name, items), val in _counters.items():
            if items:
                lbl = ",".join(f'{k}="{v}"' for k, v in items)
                lines.append(f"{name}{{{lbl}}} {val}")
            else:
                lines.append(f"{name} {val}")
    return "\n".join(lines) + "\n"
