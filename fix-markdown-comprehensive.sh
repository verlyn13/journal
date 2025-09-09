#!/bin/bash

echo "=== Comprehensive Markdown Normalization ==="
echo "Phase 1: Pandoc normalization (GFM, wrap, ATX headers, fenced code)"

# Get list of markdown files, excluding ignored directories
MD_FILES=$(git ls-files '*.md' | grep -v -E "(node_modules|docs/_generated|docs/biome|docs/bun|docs/code-mirror|docs/external|docs/third-party|playwright-report|test-results)")

# Process each file with pandoc
for f in $MD_FILES; do
  if [ -f "$f" ]; then
    echo "  Processing: $f"
    pandoc --from=gfm --to=gfm \
      --atx-headers \
      --wrap=auto --columns=100 \
      --output "$f.pdc" "$f" 2>/dev/null
    if [ -f "$f.pdc" ]; then
      mv "$f.pdc" "$f"
    fi
  fi
done

echo "Phase 2: Remark normalization (list renumbering, bullet consistency)"
npx remark . --quiet --output

echo "Phase 3: Markdownlint auto-fixes"
npx markdownlint-cli2-fix "**/*.md"

echo "Phase 4: Final validation"
npx markdownlint-cli2 "**/*.md" 2>&1 | head -20

echo "=== Complete ==="
echo "Run 'npx markdownlint-cli2 \"**/*.md\"' to see all remaining issues"