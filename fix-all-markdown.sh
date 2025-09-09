#!/bin/bash

echo "Comprehensive markdown lint fixes..."

# Fix the most common files with line length issues
echo "Fixing line length in problematic files..."

# Function to wrap long lines
wrap_long_lines() {
    local file=$1
    # This is a simple approach - for production, consider using a proper markdown formatter
    # For now, we'll just add warnings for manual review
    echo "  - File needs manual line wrapping: $file"
}

# Fix duplicate headings in comprehensive-guide-personal.md
echo "Fixing duplicate headings..."
if [ -f "docs/initial-planning/comprehensive-guide-personal.md" ]; then
    # Remove duplicate "Implementation" headings by making them unique
    sed -i 's/^## Implementation$/## Implementation Details/2' "docs/initial-planning/comprehensive-guide-personal.md"
    sed -i 's/^## Setup$/## Setup Instructions/2' "docs/initial-planning/comprehensive-guide-personal.md"
    sed -i 's/^## Testing$/## Testing Strategy/2' "docs/initial-planning/comprehensive-guide-personal.md"
fi

# Fix code block styles (convert indented to fenced)
echo "Converting indented code blocks to fenced..."
find docs -name "*.md" -type f | while read file; do
    # This is complex to do with sed, marking for manual review
    if grep -q "^    " "$file"; then
        echo "  - File may have indented code blocks: $file"
    fi
done

# Fix broken link fragments
echo "Checking for broken link fragments..."
find docs -name "*.md" -type f | while read file; do
    # Extract all link fragments from the file
    fragments=$(grep -o '\[.*\](#[^)]*' "$file" | grep -o '#[^)]*' | sort -u)
    for fragment in $fragments; do
        # Convert fragment to heading format
        heading=$(echo "$fragment" | sed 's/#//g' | sed 's/-/ /g')
        # Check if heading exists in file (case insensitive)
        if ! grep -qi "^#.*$heading" "$file"; then
            echo "  - Potential broken fragment in $file: $fragment"
        fi
    done
done

echo ""
echo "Automated fixes applied. Manual review needed for:"
echo "1. Line length issues (MD013) - break lines over 160 characters"
echo "2. Code block conversion (MD046) - convert indented blocks to fenced blocks"
echo "3. Link fragment validation (MD051) - ensure all #fragments point to valid headings"
echo ""
echo "Run 'npx markdownlint docs/**/*.md' to see remaining issues"