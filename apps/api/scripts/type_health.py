"""Type Safety Health Metrics Dashboard.

Generates comprehensive type safety metrics for the codebase.
Run weekly to track type health trends.

Usage:
    python scripts/type_health.py [--json]
"""

import json
import subprocess  # noqa: S404
import sys

from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Literal


@dataclass
class TypeHealth:
    """Type safety health metrics."""

    timestamp: str
    error_count: int
    error_trend: Literal["improving", "stable", "degrading"]
    files_checked: int
    files_with_errors: int
    coverage_percent: float
    type_ignore_count: int
    any_usage_count: int
    cast_usage_count: int
    protocol_count: int
    typeguard_count: int
    last_error_messages: list[str]

    @property
    def health_score(self) -> int:
        """Calculate overall health score (0-100)."""
        score = 100

        # Deduct for errors (max -30)
        score -= min(30, self.error_count * 3)

        # Deduct for ignores (max -20)
        score -= min(20, self.type_ignore_count)

        # Deduct for Any usage (max -10)
        score -= min(10, self.any_usage_count // 5)

        # Deduct for casts (max -10)
        score -= min(10, self.cast_usage_count // 3)

        # Bonus for patterns (+10)
        score += min(10, self.protocol_count + self.typeguard_count)

        return max(0, score)

    @property
    def health_grade(self) -> str:  # noqa: PLR0911
        """Letter grade based on health score."""
        score = self.health_score
        if score >= 95:
            return "A+"
        if score >= 90:
            return "A"
        if score >= 85:
            return "B+"
        if score >= 80:
            return "B"
        if score >= 75:
            return "C+"
        if score >= 70:
            return "C"
        return "D"


def run_mypy() -> tuple[int, list[str], int, int]:
    """Run mypy and parse results."""
    result = subprocess.run(
        ["uv", "run", "mypy", "app", "--show-error-codes"],  # noqa: S607
        capture_output=True,
        text=True,
        cwd=Path(__file__).parent.parent,
        check=False
    )

    lines = result.stdout.strip().split("\n")
    error_lines = [line for line in lines if ": error:" in line]

    # Parse summary line
    summary = lines[-1] if lines else ""
    files_checked = 0
    files_with_errors = 0

    if "Found" in summary:
        # Found X errors in Y files (checked Z source files)
        parts = summary.split()
        error_count = int(parts[1])
        files_with_errors = int(parts[4])
        files_checked = int(parts[7].strip("("))
    else:
        error_count = 0

    return error_count, error_lines[-5:], files_checked, files_with_errors


def count_pattern(pattern: str, file_pattern: str = "*.py") -> int:
    """Count occurrences of a pattern in Python files."""
    result = subprocess.run(  # noqa: S603
        ["grep", "-r", "--include", file_pattern, "-c", pattern, "app/"],  # noqa: S607
        capture_output=True,
        text=True,
        cwd=Path(__file__).parent.parent,
        check=False
    )

    total = 0
    for line in result.stdout.strip().split("\n"):
        if ":" in line:
            count = int(line.split(":")[-1])
            total += count

    return total


def get_trend(current: int, previous_file: Path) -> Literal["improving", "stable", "degrading"]:
    """Determine trend based on previous metrics."""
    if not previous_file.exists():
        return "stable"

    with previous_file.open(encoding="utf-8") as f:
        previous = json.load(f)
        prev_errors = previous.get("error_count", current)

    if current < prev_errors:
        return "improving"
    if current > prev_errors:
        return "degrading"
    return "stable"


def generate_report() -> TypeHealth:
    """Generate comprehensive type health report."""
    # Run mypy
    error_count, last_errors, files_checked, files_with_errors = run_mypy()

    # Count patterns
    type_ignore_count = count_pattern("type: ignore")
    any_usage_count = count_pattern(": Any")
    cast_usage_count = count_pattern("cast(")
    protocol_count = count_pattern("Protocol")
    typeguard_count = count_pattern("TypeGuard")

    # Calculate coverage
    coverage_percent = ((files_checked - files_with_errors) / files_checked * 100) if files_checked else 0

    # Determine trend
    metrics_file = Path(__file__).parent / ".type_metrics.json"
    trend = get_trend(error_count, metrics_file)

    health = TypeHealth(
        timestamp=datetime.now(tz=None).isoformat(),  # noqa: DTZ005
        error_count=error_count,
        error_trend=trend,
        files_checked=files_checked,
        files_with_errors=files_with_errors,
        coverage_percent=round(coverage_percent, 2),
        type_ignore_count=type_ignore_count,
        any_usage_count=any_usage_count,
        cast_usage_count=cast_usage_count,
        protocol_count=protocol_count,
        typeguard_count=typeguard_count,
        last_error_messages=last_errors,
    )

    # Save current metrics
    with metrics_file.open("w", encoding="utf-8") as f:
        json.dump(asdict(health), f, indent=2)

    return health


def print_report(health: TypeHealth) -> None:
    """Print formatted health report."""
    print("\n" + "=" * 60)  # noqa: T201
    print(" TYPE SAFETY HEALTH REPORT ".center(60))  # noqa: T201
    print("=" * 60)  # noqa: T201

    print(f"\n📊 Overall Health Score: {health.health_score}/100 (Grade: {health.health_grade})")  # noqa: T201
    print(f"📈 Trend: {health.error_trend.upper()}")  # noqa: T201

    print("\n🔍 Coverage Metrics:")  # noqa: T201
    print(f"  Files Checked: {health.files_checked}")  # noqa: T201
    print(f"  Files with Errors: {health.files_with_errors}")  # noqa: T201
    print(f"  Coverage: {health.coverage_percent}%")  # noqa: T201

    print("\n❌ Error Metrics:")  # noqa: T201
    print(f"  Total Errors: {health.error_count}")  # noqa: T201
    print(f"  Type Ignores: {health.type_ignore_count}")  # noqa: T201
    print(f"  Any Usage: {health.any_usage_count}")  # noqa: T201
    print(f"  Cast Usage: {health.cast_usage_count}")  # noqa: T201

    print("\n✅ Pattern Adoption:")  # noqa: T201
    print(f"  Protocols: {health.protocol_count}")  # noqa: T201
    print(f"  Type Guards: {health.typeguard_count}")  # noqa: T201

    if health.last_error_messages:
        print("\n🔴 Recent Errors:")  # noqa: T201
        for error in health.last_error_messages:
            if error.strip():
                print(f"  {error[:80]}...")  # noqa: T201

    print("\n" + "=" * 60)  # noqa: T201

    # Recommendations
    print("\n💡 Recommendations:")  # noqa: T201
    if health.error_count > 5:
        print("  ⚠️  Error count above threshold - review new changes")  # noqa: T201
    if health.type_ignore_count > 10:
        print("  ⚠️  High number of ignores - review and document each")  # noqa: T201
    if health.any_usage_count > 20:
        print("  ⚠️  Excessive Any usage - add specific types")  # noqa: T201
    if health.error_trend == "degrading":
        print("  ⚠️  Type safety degrading - review recent commits")  # noqa: T201
    if health.health_score >= 95:
        print("  ✅ Excellent type health - maintain standards!")  # noqa: T201

    print()  # noqa: T201


def main() -> None:
    """Run type health check."""
    json_output = "--json" in sys.argv

    print("🔍 Analyzing type safety health...")  # noqa: T201
    health = generate_report()

    if json_output:
        print(json.dumps(asdict(health), indent=2))  # noqa: T201
    else:
        print_report(health)

        # Exit code based on health
        if health.health_score < 70:
            sys.exit(1)  # Fail CI if health is poor


if __name__ == "__main__":
    main()
