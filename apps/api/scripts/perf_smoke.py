from __future__ import annotations

import argparse
import asyncio
import statistics
import time
from typing import List

import httpx


async def fetch(client: httpx.AsyncClient, url: str) -> float:
    t0 = time.perf_counter()
    resp = await client.get(url, timeout=5.0)
    resp.raise_for_status()
    return (time.perf_counter() - t0) * 1000.0


async def run_load(url: str, total: int, concurrency: int) -> List[float]:
    latencies: List[float] = []
    sem = asyncio.Semaphore(concurrency)

    async with httpx.AsyncClient() as client:
        async def task() -> None:
            async with sem:
                ms = await fetch(client, url)
                latencies.append(ms)

        await asyncio.gather(*(task() for _ in range(total)))

    return latencies


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=True)
    parser.add_argument("--requests", type=int, default=60)
    parser.add_argument("--concurrency", type=int, default=6)
    parser.add_argument("--p95-threshold-ms", type=float, default=250.0)
    args = parser.parse_args()

    latencies = asyncio.run(run_load(args.url, args.requests, args.concurrency))
    latencies.sort()
    p95_idx = max(0, int(0.95 * len(latencies)) - 1)
    p95 = latencies[p95_idx]
    avg = statistics.mean(latencies) if latencies else 0.0
    print(f"Samples={len(latencies)} avg_ms={avg:.1f} p95_ms={p95:.1f}")
    if p95 > args.p95_threshold_ms:
        raise SystemExit(
            f"p95 {p95:.1f}ms exceeds threshold {args.p95_threshold_ms:.1f}ms"
        )


if __name__ == "__main__":
    main()

