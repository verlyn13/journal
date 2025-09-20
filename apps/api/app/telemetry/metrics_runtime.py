from __future__ import annotations

import threading


_lock = threading.Lock()
_counters: dict[tuple[str, tuple[tuple[str, str], ...]], float] = {}
_histograms: dict[str, list[float]] = {}


class Counter:
    """Simple counter metric."""

    def __init__(self, name: str) -> None:
        self.name = name

    def inc(self, value: float = 1.0, labels: dict[str, str] | None = None) -> None:
        """Increment counter."""
        inc(self.name, labels, value)


class Histogram:
    """Simple histogram metric for response times."""

    def __init__(self, name: str) -> None:
        self.name = name

    def observe(self, value: float, labels: dict[str, str] | None = None) -> None:
        """Observe a value."""
        with _lock:
            key = f"{self.name}:{labels or {}!s}"
            if key not in _histograms:
                _histograms[key] = []
            _histograms[key].append(value)


# JWKS Metrics
COUNTER_JWKS_REQUESTS = Counter("jwks_requests_total")
COUNTER_JWKS_CACHE_HIT = Counter("jwks_cache_hits_total")
COUNTER_JWKS_CACHE_MISS = Counter("jwks_cache_misses_total")
HISTOGRAM_JWKS_RESPONSE_TIME = Histogram("jwks_response_time_ms")


def _key(
    name: str, labels: dict[str, str] | None
) -> tuple[str, tuple[tuple[str, str], ...]]:
    items = tuple(sorted((labels or {}).items()))
    return (name, items)


def inc(name: str, labels: dict[str, str] | None = None, value: float = 1.0) -> None:
    with _lock:
        k = _key(name, labels)
        _counters[k] = _counters.get(k, 0.0) + value


def render_prom() -> str:
    lines: list[str] = []
    with _lock:
        # Render counters
        for (name, items), val in _counters.items():
            if items:
                lbl = ",".join(f'{k}="{v}"' for k, v in items)
                lines.append(f"{name}{{{lbl}}} {val}")
            else:
                lines.append(f"{name} {val}")

        # Render histograms (simplified - just show count and sum)
        for key, values in _histograms.items():
            if values:
                name = key.split(":")[0]
                count = len(values)
                total = sum(values)
                lines.extend([f"{name}_count {count}", f"{name}_sum {total}"])

    return "\n".join(lines) + "\n"
