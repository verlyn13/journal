#!/usr/bin/env bash
# Ruff Discovery Mode: Analyze unsafe fixes without applying them
# Part of progressive autofixing strategy per September 2025 best practices

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
API_DIR="$PROJECT_ROOT/apps/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Ruff Discovery Mode: Analyzing unsafe fixes${NC}"
echo "Working directory: $API_DIR"
echo

cd "$API_DIR"

# Create reports directory
REPORTS_DIR="$API_DIR/.ruff_reports"
mkdir -p "$REPORTS_DIR"

# Generate reports
echo -e "${YELLOW}📊 Generating unsafe fixes analysis...${NC}"

# 1. Discover all unsafe fixes (don't apply)
echo "Analyzing unsafe fixes without applying..."
uv run ruff check . --unsafe-fixes --diff --fix-only --output-format=json > "$REPORTS_DIR/unsafe-fixes.json" || true

# 2. Current safe fixes analysis
echo "Analyzing current safe fixes..."
uv run ruff check . --diff --fix-only --output-format=json > "$REPORTS_DIR/safe-fixes.json" || true

# 3. All violations summary
echo "Generating violations summary..."
uv run ruff check . --output-format=json > "$REPORTS_DIR/all-violations.json" || true

# 4. Configuration analysis
echo "Analyzing effective configuration..."
uv run ruff check . --show-settings > "$REPORTS_DIR/effective-config.txt" 2>&1 || true

# Process results with Python script
echo -e "${YELLOW}📈 Processing analysis results...${NC}"

cat > "$REPORTS_DIR/analyze_fixes.py" << 'EOF'
#!/usr/bin/env python3
"""Analyze Ruff discovery mode results for progressive autofixing."""

import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

def load_json_report(path):
    """Load JSON report, handling empty files."""
    try:
        with open(path) as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []

def analyze_fixes(unsafe_fixes, safe_fixes):
    """Analyze fix patterns and safety."""
    print("📊 Fix Analysis Summary")
    print("=" * 50)

    # Count by rule code
    unsafe_by_code = Counter()
    safe_by_code = Counter()

    for item in unsafe_fixes:
        if 'rule' in item:
            unsafe_by_code[item['rule']['code']] += 1

    for item in safe_fixes:
        if 'rule' in item:
            safe_by_code[item['rule']['code']] += 1

    print(f"🔥 Unsafe fixes available: {len(unsafe_fixes)}")
    print(f"✅ Safe fixes available: {len(safe_fixes)}")
    print()

    if unsafe_by_code:
        print("🔥 Top unsafe fix opportunities:")
        for code, count in unsafe_by_code.most_common(10):
            print(f"  {code}: {count} fixes")
        print()

    if safe_by_code:
        print("✅ Top safe fix opportunities:")
        for code, count in safe_by_code.most_common(10):
            print(f"  {code}: {count} fixes")
        print()

    # Recommendations for extend-safe-fixes
    candidates = []
    for code, count in unsafe_by_code.most_common():
        if count >= 3 and code in ['I001', 'UP032', 'UP006', 'UP007']:
            candidates.append(code)

    if candidates:
        print("💡 Recommended for extend-safe-fixes (high volume, low risk):")
        for code in candidates:
            print(f"  {code}")
        print()
        print("Add these to pyproject.toml:")
        print(f'extend-safe-fixes = {candidates}')

    return candidates

def main():
    reports_dir = Path(".")

    unsafe_fixes = load_json_report(reports_dir / "unsafe-fixes.json")
    safe_fixes = load_json_report(reports_dir / "safe-fixes.json")
    all_violations = load_json_report(reports_dir / "all-violations.json")

    print("🔍 Ruff Discovery Mode Analysis")
    print("=" * 50)
    print()

    candidates = analyze_fixes(unsafe_fixes, safe_fixes)

    print("📋 Total violations by severity:")
    violation_counts = Counter()
    for item in all_violations:
        if 'rule' in item:
            violation_counts[item['rule']['code']] += 1

    for code, count in violation_counts.most_common(15):
        print(f"  {code}: {count}")

    print()
    print("📝 Next steps:")
    print("1. Review unsafe fixes in .ruff_reports/unsafe-fixes.json")
    print("2. Test recommended extend-safe-fixes in development")
    print("3. Gradually expand fixable list with proven safe rules")
    print("4. Monitor CI for any regressions")

if __name__ == "__main__":
    main()
EOF

# Run analysis
echo "Running Python analysis..."
cd "$REPORTS_DIR"
python3 analyze_fixes.py

echo
echo -e "${GREEN}✅ Discovery mode analysis complete!${NC}"
echo "Reports saved to: $REPORTS_DIR"
echo
echo "📁 Generated files:"
echo "  - unsafe-fixes.json    (unsafe fixes available)"
echo "  - safe-fixes.json      (safe fixes available)"
echo "  - all-violations.json  (all current violations)"
echo "  - effective-config.txt (current Ruff settings)"
echo "  - analyze_fixes.py     (analysis script)"
echo
echo -e "${BLUE}💡 To apply safe fixes: cd apps/api && uv run ruff check . --fix${NC}"
echo -e "${BLUE}💡 To apply specific unsafe fix: cd apps/api && uv run ruff check . --unsafe-fixes --select RULE_CODE --fix${NC}"