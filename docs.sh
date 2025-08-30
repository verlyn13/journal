#!/bin/bash

# Documentation Management Script for Biome and Bun
# Provides utilities for fetching, searching, serving, and managing documentation

set -e

DOCS_DIR="docs"
BACKUP_DIR="docs-backup"
HTML_DIR="docs-html"
PORT=3000

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Show help message
show_help() {
    cat << EOF
📚 Documentation Management Script

Usage: $0 [command] [options]

Commands:
    fetch       - Fetch latest documentation from Biome and Bun
    update      - Backup current docs and fetch latest
    backup      - Create a backup of current documentation
    restore     - Restore documentation from backup
    search      - Search for terms in documentation
    serve       - Start local documentation server
    convert     - Convert markdown to HTML (requires pandoc)
    check       - Check documentation integrity
    clean       - Remove all documentation files
    help        - Show this help message

Examples:
    $0 fetch                    # Fetch all documentation
    $0 search "biome config"    # Search for terms
    $0 serve                    # Start local server
    $0 update                   # Backup and update docs

EOF
}

# Fetch documentation using bun
fetch_docs() {
    print_info "Fetching documentation..."
    
    if [ ! -f "fetch-docs.ts" ]; then
        print_error "fetch-docs.ts not found!"
        exit 1
    fi
    
    # Make script executable
    chmod +x fetch-docs.ts
    
    # Run the fetcher
    if command -v bun &> /dev/null; then
        # Ensure bun is at least 1.2.21
        BUN_VER=$(bun --version | head -n1)
        REQUIRED="1.2.21"
        if [ "$(printf '%s\n' "$REQUIRED" "$BUN_VER" | sort -V | head -n1)" != "$REQUIRED" ]; then
            print_warning "Bun $BUN_VER detected. Recommended >= $REQUIRED for best compatibility."
        fi
        bun run fetch-docs.ts
    else
        print_error "Bun is not installed. Please install Bun first."
        print_info "Visit: https://bun.sh"
        exit 1
    fi
    
    print_success "Documentation fetched successfully!"
}

# Create backup of current documentation
backup_docs() {
    if [ ! -d "$DOCS_DIR" ]; then
        print_warning "No documentation to backup"
        return
    fi
    
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    # Create timestamped backup
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_NAME="${BACKUP_DIR}/docs_${TIMESTAMP}.tar.gz"
    
    print_info "Creating backup: $BACKUP_NAME"
    tar -czf "$BACKUP_NAME" "$DOCS_DIR"
    
    # Keep only last 5 backups
    BACKUP_COUNT=$(ls -1 ${BACKUP_DIR}/docs_*.tar.gz 2>/dev/null | wc -l)
    if [ "$BACKUP_COUNT" -gt 5 ]; then
        print_info "Cleaning old backups (keeping last 5)..."
        ls -1t ${BACKUP_DIR}/docs_*.tar.gz | tail -n +6 | xargs rm -f
    fi
    
    print_success "Backup created: $BACKUP_NAME"
}

# Restore documentation from backup
restore_docs() {
    if [ ! -d "$BACKUP_DIR" ]; then
        print_error "No backups found"
        exit 1
    fi
    
    # Get latest backup
    LATEST_BACKUP=$(ls -1t ${BACKUP_DIR}/docs_*.tar.gz 2>/dev/null | head -n 1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        print_error "No backup files found"
        exit 1
    fi
    
    print_info "Restoring from: $LATEST_BACKUP"
    
    # Remove current docs
    if [ -d "$DOCS_DIR" ]; then
        rm -rf "$DOCS_DIR"
    fi
    
    # Extract backup
    tar -xzf "$LATEST_BACKUP"
    
    print_success "Documentation restored successfully!"
}

# Update documentation (backup + fetch)
update_docs() {
    print_info "Updating documentation..."
    
    # Backup first
    backup_docs
    
    # Then fetch new
    fetch_docs
    
    print_success "Documentation updated!"
}

# Search documentation
search_docs() {
    if [ $# -eq 0 ]; then
        print_error "Please provide a search term"
        echo "Usage: $0 search <term>"
        exit 1
    fi
    
    if [ ! -d "$DOCS_DIR" ]; then
        print_error "Documentation not found. Run '$0 fetch' first."
        exit 1
    fi
    
    SEARCH_TERM="$1"
    print_info "Searching for: $SEARCH_TERM"
    echo ""
    
    # Use grep with context
    grep -r -i -n --color=always -C 2 "$SEARCH_TERM" "$DOCS_DIR" 2>/dev/null || {
        print_warning "No matches found for: $SEARCH_TERM"
    }
}

# Serve documentation locally
serve_docs() {
    if [ ! -d "$DOCS_DIR" ]; then
        print_error "Documentation not found. Run '$0 fetch' first."
        exit 1
    fi
    
    print_info "Starting documentation server on http://localhost:$PORT"
    print_info "Press Ctrl+C to stop"
    
    # Check for available servers
    if command -v python3 &> /dev/null; then
        cd "$DOCS_DIR" && python3 -m http.server $PORT
    elif command -v python &> /dev/null; then
        cd "$DOCS_DIR" && python -m SimpleHTTPServer $PORT
    elif command -v bun &> /dev/null; then
        cd "$DOCS_DIR" && bun --hot -p $PORT
    else
        print_error "No suitable server found (python3, python, or bun required)"
        exit 1
    fi
}

# Convert markdown to HTML
convert_to_html() {
    if ! command -v pandoc &> /dev/null; then
        print_error "Pandoc is not installed"
        print_info "Install with: brew install pandoc (macOS) or apt-get install pandoc (Linux)"
        exit 1
    fi
    
    if [ ! -d "$DOCS_DIR" ]; then
        print_error "Documentation not found. Run '$0 fetch' first."
        exit 1
    fi
    
    print_info "Converting documentation to HTML..."
    
    # Create HTML directory
    mkdir -p "$HTML_DIR"
    
    # Convert each markdown file
    find "$DOCS_DIR" -name "*.md" | while read -r file; do
        # Calculate relative path and create HTML path
        REL_PATH="${file#$DOCS_DIR/}"
        HTML_FILE="${HTML_DIR}/${REL_PATH%.md}.html"
        HTML_FILE_DIR=$(dirname "$HTML_FILE")
        
        # Create directory if needed
        mkdir -p "$HTML_FILE_DIR"
        
        # Convert to HTML with table of contents
        pandoc "$file" \
            -f markdown \
            -t html \
            --standalone \
            --toc \
            --toc-depth=3 \
            --metadata title="$(basename "${file%.md}")" \
            -o "$HTML_FILE"
        
        echo "  📄 Converted: ${REL_PATH}"
    done
    
    # Create index HTML
    cat > "${HTML_DIR}/index.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Documentation Index</title>
    <style>
        body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        ul { line-height: 1.8; }
        a { color: #0066cc; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>📚 Documentation Index</h1>
    <h2>Biome</h2>
    <ul>
        <li><a href="biome/guides/getting-started.html">Getting Started</a></li>
        <li><a href="biome/guides/configure-biome.html">Configuration</a></li>
        <li><a href="biome/reference/linter-rules.html">Linter Rules</a></li>
        <li><a href="biome/reference/formatter.html">Formatter</a></li>
    </ul>
    <h2>Bun</h2>
    <ul>
        <li><a href="bun/getting-started/installation.html">Installation</a></li>
        <li><a href="bun/configuration/bunfig.html">bunfig.toml</a></li>
        <li><a href="bun/features/testing.html">Testing</a></li>
        <li><a href="bun/api/http-server.html">HTTP Server</a></li>
    </ul>
</body>
</html>
EOF
    
    print_success "HTML documentation created in: $HTML_DIR/"
    print_info "View at: ${HTML_DIR}/index.html"
}

# Check documentation integrity
check_docs() {
    if [ ! -d "$DOCS_DIR" ]; then
        print_error "Documentation not found. Run '$0 fetch' first."
        exit 1
    fi
    
    print_info "Checking documentation integrity..."
    
    ISSUES=0
    
    # Check for empty files
    EMPTY_FILES=$(find "$DOCS_DIR" -type f -empty)
    if [ -n "$EMPTY_FILES" ]; then
        print_warning "Empty files found:"
        echo "$EMPTY_FILES"
        ISSUES=$((ISSUES + 1))
    fi
    
    # Check for broken internal links
    print_info "Checking internal links..."
    find "$DOCS_DIR" -name "*.md" -exec grep -l "\[.*\](.*.md)" {} \; | while read -r file; do
        grep -o "\[.*\]([^)]*\.md)" "$file" | sed 's/.*(\(.*\))/\1/' | while read -r link; do
            # Convert relative link to absolute path
            LINK_DIR=$(dirname "$file")
            FULL_LINK="$LINK_DIR/$link"
            
            if [ ! -f "$FULL_LINK" ]; then
                print_warning "Broken link in $file: $link"
                ISSUES=$((ISSUES + 1))
            fi
        done
    done
    
    # Check directory structure
    EXPECTED_DIRS=(
        "$DOCS_DIR/biome/guides"
        "$DOCS_DIR/biome/reference"
        "$DOCS_DIR/biome/recipes"
        "$DOCS_DIR/bun/getting-started"
        "$DOCS_DIR/bun/configuration"
        "$DOCS_DIR/bun/features"
        "$DOCS_DIR/bun/api"
    )
    
    for dir in "${EXPECTED_DIRS[@]}"; do
        if [ ! -d "$dir" ]; then
            print_warning "Missing directory: $dir"
            ISSUES=$((ISSUES + 1))
        fi
    done
    
    # Check for INDEX.md
    if [ ! -f "$DOCS_DIR/INDEX.md" ]; then
        print_warning "Missing INDEX.md"
        ISSUES=$((ISSUES + 1))
    fi
    
    if [ $ISSUES -eq 0 ]; then
        print_success "Documentation integrity check passed!"
    else
        print_warning "Found $ISSUES issue(s)"
    fi
}

# Clean all documentation
clean_docs() {
    print_warning "This will remove all documentation files!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning documentation..."
        
        [ -d "$DOCS_DIR" ] && rm -rf "$DOCS_DIR"
        [ -d "$HTML_DIR" ] && rm -rf "$HTML_DIR"
        
        print_success "Documentation cleaned"
    else
        print_info "Cancelled"
    fi
}

# Main script logic
case "${1:-help}" in
    fetch)
        fetch_docs
        ;;
    update)
        update_docs
        ;;
    backup)
        backup_docs
        ;;
    restore)
        restore_docs
        ;;
    search)
        shift
        search_docs "$@"
        ;;
    serve)
        serve_docs
        ;;
    convert)
        convert_to_html
        ;;
    check)
        check_docs
        ;;
    clean)
        clean_docs
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
