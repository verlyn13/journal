#!/bin/bash

echo "Fixing markdown lint issues..."

# Fix list indentation in all markdown files (change various indents to 2-space)
echo "Fixing list indentation..."
find . -name "*.md" -type f ! -path "./node_modules/*" ! -path "./docs/_generated/*" ! -path "./docs/biome/*" ! -path "./docs/bun/*" ! -path "./docs/code-mirror/*" ! -path "./docs/external/*" ! -path "./docs/third-party/*" | while read file; do
  # Fix nested list indentation to 2-space increments
  sed -i 's/^   -/  -/g' "$file"
  sed -i 's/^    -/  -/g' "$file"
  sed -i 's/^     -/    -/g' "$file"
  sed -i 's/^      -/    -/g' "$file"
  sed -i 's/^       -/      -/g' "$file"
  sed -i 's/^        -/      -/g' "$file"
  
  # Fix numbered lists too
  sed -i 's/^   \([0-9]\)/  \1/g' "$file"
  sed -i 's/^    \([0-9]\)/  \1/g' "$file"
  sed -i 's/^     \([0-9]\)/    \1/g' "$file"
  sed -i 's/^      \([0-9]\)/    \1/g' "$file"
done

# Run markdownlint auto-fixer
echo "Running markdownlint auto-fixer..."
npx markdownlint --fix "**/*.md" --ignore "node_modules/**" --ignore "docs/_generated/**" --ignore "docs/biome/**" --ignore "docs/bun/**" --ignore "docs/code-mirror/**" --ignore "docs/external/**" --ignore "docs/third-party/**"

echo "Markdown lint fixes applied!"
echo "Note: Line length issues (MD013) need manual review."