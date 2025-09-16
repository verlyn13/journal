#!/bin/bash
# Database Snapshot Script for Journal Application
# Creates timestamped database dumps for backup and rollback

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups/db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default settings
SNAPSHOT_TYPE="full"
COMPRESS=true
INCLUDE_DATA=true
INCLUDE_SCHEMA=true
VERBOSE=false

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

show_help() {
    cat << EOF
Database Snapshot Script

Usage: $0 [OPTIONS]

OPTIONS:
    -t, --type TYPE        Snapshot type: full|schema|data (default: full)
    -o, --output DIR       Output directory (default: $BACKUP_DIR)
    -n, --name NAME        Custom snapshot name (default: timestamp-based)
    -c, --compress         Enable compression (default: true)
    --no-compress          Disable compression
    --schema-only          Include only schema (no data)
    --data-only            Include only data (no schema)
    -v, --verbose          Verbose output
    -h, --help             Show this help

ENVIRONMENT VARIABLES:
    DATABASE_URL           Database connection string (required)
    PGPASSWORD            Database password (optional)

EXAMPLES:
    # Full snapshot with default settings
    $0

    # Schema-only snapshot
    $0 --schema-only

    # Custom named snapshot
    $0 --name "pre-migration-backup"

    # Uncompressed data-only snapshot
    $0 --data-only --no-compress

    # Verbose full snapshot to custom directory
    $0 --verbose --output /tmp/my-backups
EOF
}

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -t|--type)
                SNAPSHOT_TYPE="$2"
                shift 2
                ;;
            -o|--output)
                BACKUP_DIR="$2"
                shift 2
                ;;
            -n|--name)
                CUSTOM_NAME="$2"
                shift 2
                ;;
            -c|--compress)
                COMPRESS=true
                shift
                ;;
            --no-compress)
                COMPRESS=false
                shift
                ;;
            --schema-only)
                INCLUDE_DATA=false
                INCLUDE_SCHEMA=true
                SNAPSHOT_TYPE="schema"
                shift
                ;;
            --data-only)
                INCLUDE_DATA=true
                INCLUDE_SCHEMA=false
                SNAPSHOT_TYPE="data"
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

validate_environment() {
    log_info "Validating environment..."

    # Check for required tools
    for cmd in pg_dump psql gzip; do
        if ! command -v $cmd &> /dev/null; then
            log_error "$cmd is required but not installed"
            exit 1
        fi
    done

    # Check database connection
    if [[ -z "${DATABASE_URL:-}" ]]; then
        log_error "DATABASE_URL environment variable is required"
        exit 1
    fi

    # Test database connection
    if ! psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
        log_error "Cannot connect to database. Check DATABASE_URL and credentials."
        exit 1
    fi

    log_success "Environment validation passed"
}

create_backup_directory() {
    log_info "Setting up backup directory..."

    mkdir -p "$BACKUP_DIR"

    if [[ ! -w "$BACKUP_DIR" ]]; then
        log_error "Backup directory is not writable: $BACKUP_DIR"
        exit 1
    fi

    log_success "Backup directory ready: $BACKUP_DIR"
}

generate_filename() {
    local base_name
    if [[ -n "${CUSTOM_NAME:-}" ]]; then
        base_name="${CUSTOM_NAME}"
    else
        base_name="journal_${SNAPSHOT_TYPE}_${TIMESTAMP}"
    fi

    local extension="sql"
    if [[ "$COMPRESS" == "true" ]]; then
        extension="sql.gz"
    fi

    echo "${BACKUP_DIR}/${base_name}.${extension}"
}

get_database_info() {
    log_info "Gathering database information..."

    # Extract database details
    DB_NAME=$(psql "$DATABASE_URL" -t -c "SELECT current_database();" | xargs)
    DB_SIZE=$(psql "$DATABASE_URL" -t -c "SELECT pg_size_pretty(pg_database_size(current_database()));" | xargs)

    # Get table count
    TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)

    # Get extension list
    EXTENSIONS=$(psql "$DATABASE_URL" -t -c "SELECT string_agg(extname, ', ') FROM pg_extension WHERE extname != 'plpgsql';" | xargs)

    if [[ "$VERBOSE" == "true" ]]; then
        echo "Database: $DB_NAME"
        echo "Size: $DB_SIZE"
        echo "Tables: $TABLE_COUNT"
        echo "Extensions: ${EXTENSIONS:-none}"
    fi
}

create_snapshot() {
    local output_file="$1"
    local temp_file="${output_file}.tmp"

    log_info "Creating $SNAPSHOT_TYPE snapshot..."

    # Build pg_dump command
    local pg_dump_cmd="pg_dump \"$DATABASE_URL\""
    local pg_dump_options=""

    # Configure options based on snapshot type
    case "$SNAPSHOT_TYPE" in
        "schema")
            pg_dump_options="--schema-only --no-owner --no-privileges"
            ;;
        "data")
            pg_dump_options="--data-only --no-owner --no-privileges --disable-triggers"
            ;;
        "full")
            pg_dump_options="--no-owner --no-privileges"
            ;;
        *)
            log_error "Invalid snapshot type: $SNAPSHOT_TYPE"
            exit 1
            ;;
    esac

    # Add verbose option if requested
    if [[ "$VERBOSE" == "true" ]]; then
        pg_dump_options="$pg_dump_options --verbose"
    fi

    # Create header comment
    {
        echo "-- Journal Application Database Snapshot"
        echo "-- Created: $(date -Iseconds)"
        echo "-- Type: $SNAPSHOT_TYPE"
        echo "-- Database: $DB_NAME"
        echo "-- Size: $DB_SIZE"
        echo "-- Tables: $TABLE_COUNT"
        echo "-- Extensions: ${EXTENSIONS:-none}"
        echo "-- Generator: deploy/db/snapshot.sh"
        echo ""
    } > "$temp_file"

    # Execute pg_dump
    if [[ "$COMPRESS" == "true" ]]; then
        if eval "$pg_dump_cmd $pg_dump_options" >> "$temp_file" 2>/dev/null; then
            gzip < "$temp_file" > "$output_file"
            rm "$temp_file"
        else
            rm -f "$temp_file"
            log_error "pg_dump failed"
            return 1
        fi
    else
        if eval "$pg_dump_cmd $pg_dump_options" >> "$temp_file" 2>/dev/null; then
            mv "$temp_file" "$output_file"
        else
            rm -f "$temp_file"
            log_error "pg_dump failed"
            return 1
        fi
    fi

    return 0
}

verify_snapshot() {
    local output_file="$1"

    log_info "Verifying snapshot..."

    # Check file exists and has content
    if [[ ! -f "$output_file" ]]; then
        log_error "Snapshot file not found: $output_file"
        return 1
    fi

    # Check file size
    local file_size
    if [[ "$COMPRESS" == "true" ]]; then
        file_size=$(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file" 2>/dev/null)
    else
        file_size=$(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file" 2>/dev/null)
    fi

    if [[ "$file_size" -lt 100 ]]; then
        log_error "Snapshot file is too small (${file_size} bytes), probably empty or corrupted"
        return 1
    fi

    # Test decompression if compressed
    if [[ "$COMPRESS" == "true" ]]; then
        if ! gzip -t "$output_file" 2>/dev/null; then
            log_error "Compressed snapshot file is corrupted"
            return 1
        fi
    fi

    log_success "Snapshot verification passed"
    return 0
}

generate_metadata() {
    local output_file="$1"
    local metadata_file="${output_file}.metadata.json"

    log_info "Generating metadata..."

    cat > "$metadata_file" << EOF
{
    "snapshot": {
        "created_at": "$(date -Iseconds)",
        "type": "$SNAPSHOT_TYPE",
        "compressed": $COMPRESS,
        "include_schema": $INCLUDE_SCHEMA,
        "include_data": $INCLUDE_DATA,
        "file": "$(basename "$output_file")",
        "size_bytes": $(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file" 2>/dev/null)
    },
    "database": {
        "name": "$DB_NAME",
        "size": "$DB_SIZE",
        "table_count": $TABLE_COUNT,
        "extensions": "${EXTENSIONS:-}"
    },
    "environment": {
        "hostname": "$(hostname)",
        "user": "$(whoami)",
        "script_version": "1.0",
        "pg_dump_version": "$(pg_dump --version | head -1)"
    }
}
EOF

    log_success "Metadata saved: $metadata_file"
}

cleanup_old_snapshots() {
    log_info "Cleaning up old snapshots..."

    # Keep last 5 snapshots of each type
    for type in full schema data; do
        local count
        count=$(find "$BACKUP_DIR" -name "journal_${type}_*.sql*" -type f | wc -l)

        if [[ "$count" -gt 5 ]]; then
            local to_remove=$((count - 5))
            find "$BACKUP_DIR" -name "journal_${type}_*.sql*" -type f -exec ls -t {} + | tail -n "$to_remove" | xargs rm -f
            log_info "Removed $to_remove old $type snapshots"
        fi
    done
}

print_summary() {
    local output_file="$1"
    local file_size_human

    if command -v numfmt &> /dev/null; then
        local file_size
        file_size=$(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file" 2>/dev/null)
        file_size_human=$(numfmt --to=iec "$file_size")
    else
        file_size_human="$(du -h "$output_file" | cut -f1)"
    fi

    echo ""
    echo "=========================="
    echo "SNAPSHOT SUMMARY"
    echo "=========================="
    echo "Type: $SNAPSHOT_TYPE"
    echo "File: $output_file"
    echo "Size: $file_size_human"
    echo "Compressed: $COMPRESS"
    echo "Database: $DB_NAME ($DB_SIZE)"
    echo "Created: $(date)"
    echo ""

    log_success "Snapshot completed successfully!"

    # Provide restore hints
    echo "To restore this snapshot:"
    if [[ "$COMPRESS" == "true" ]]; then
        echo "  gunzip -c \"$output_file\" | psql \"\$DATABASE_URL\""
    else
        echo "  psql \"\$DATABASE_URL\" < \"$output_file\""
    fi
}

main() {
    log_info "Starting database snapshot process..."

    parse_arguments "$@"
    validate_environment
    create_backup_directory
    get_database_info

    local output_file
    output_file=$(generate_filename)

    if create_snapshot "$output_file"; then
        if verify_snapshot "$output_file"; then
            generate_metadata "$output_file"
            cleanup_old_snapshots
            print_summary "$output_file"
        else
            log_error "Snapshot verification failed"
            rm -f "$output_file"
            exit 1
        fi
    else
        log_error "Snapshot creation failed"
        exit 1
    fi
}

# Run main function with all arguments
main "$@"