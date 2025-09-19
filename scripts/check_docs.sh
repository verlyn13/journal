#!/bin/bash
# Simple documentation health check

echo "📋 Documentation Quick Health Check"
echo "===================================="

# Build file list excluding backups, archives, and generated
FILE_LIST=$(mktemp)
find docs \
  -path 'docs/.backups' -prune -o \
  -path 'docs/archive' -prune -o \
  -path 'docs/_generated' -prune -o \
  -name "*.md" -print > "$FILE_LIST"

# Count files
TOTAL_DOCS=$(wc -l < "$FILE_LIST")
WITH_FM=$(
  count=0
  while IFS= read -r f; do
    first_line=$(head -n1 "$f" 2>/dev/null)
    if [ "$first_line" = "---" ]; then
      count=$((count+1))
    fi
  done < "$FILE_LIST"
  echo $count
)
ORGANIZED=$(awk -F/ '{if (NF>2) c++} END{print c+0}' "$FILE_LIST")

# Check for common issues
OLD_TOOLS=$(xargs -a "$FILE_LIST" -r grep -l -E "(npm install|pip install|prettier|eslint|black|isort|flake8)" 2>/dev/null | wc -l)
SQLITE_REFS=$(xargs -a "$FILE_LIST" -r grep -l -i "sqlite" 2>/dev/null | grep -v migration | wc -l)

# Calculate score
SCORE=100
[ $OLD_TOOLS -gt 0 ] && SCORE=$((SCORE - 20))
[ $SQLITE_REFS -gt 0 ] && SCORE=$((SCORE - 10))
[ "$TOTAL_DOCS" -gt 0 ] && FM_PERCENT=$((WITH_FM * 100 / TOTAL_DOCS)) || FM_PERCENT=0
[ $FM_PERCENT -lt 90 ] && SCORE=$((SCORE - 20))

# Display results
echo "📊 Statistics:"
echo "  • Total documentation files: $TOTAL_DOCS"
echo "  • Files with frontmatter: $WITH_FM ($FM_PERCENT%)"
echo "  • Files organized in folders: $ORGANIZED"
echo "  • Files with outdated tools: $OLD_TOOLS"
echo "  • Files with SQLite references: $SQLITE_REFS"
echo ""

# Overall health
if [ $SCORE -ge 80 ]; then
    echo "✅ Documentation Health: GOOD ($SCORE/100)"
elif [ $SCORE -ge 60 ]; then
    echo "⚠️  Documentation Health: FAIR ($SCORE/100)"
else
    echo "❌ Documentation Health: NEEDS WORK ($SCORE/100)"
fi

echo ""
echo "Run 'python scripts/validate_documentation.py --json --quiet' for authoritative counts"
echo "(Quick counts use simple heuristics; validator is the source of truth)"

# Cleanup
rm -f "$FILE_LIST"
