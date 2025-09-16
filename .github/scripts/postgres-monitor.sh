#!/bin/bash
# Postgres Connection Monitor for CI/CD
# Detects and logs connection issues including root user problems
set -euo pipefail

# Check for help first
if [[ "${1:-}" == "help" || "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
    echo "Usage: $0 [command] [db_url] [max_retries] [interval]"
    echo "Commands:"
    echo "  wait     - Wait for database to become available (default)"
    echo "  monitor  - Continuously monitor connections"
    echo "  check    - Single connection test"
    echo "  diagnose - Diagnose connection issues"
    echo ""
    echo "Examples:"
    echo "  $0 wait postgresql://user:pass@host:port/db"
    echo "  $0 check postgresql://user:pass@host:port/db"
    echo "  $0 diagnose postgresql://user:pass@host:port/db"
    exit 0
fi

# Parse arguments properly - first arg is command, second is DB URL
COMMAND="${1:-wait}"
DB_URL="${2:-postgresql://journal:journal@localhost:5433/journal_test}"
MAX_RETRIES="${3:-30}"
CHECK_INTERVAL="${4:-2}"

echo "🔍 Monitoring Postgres connections for issues..."
echo "Database URL: $DB_URL"
echo "Max retries: $MAX_RETRIES"
echo "Check interval: ${CHECK_INTERVAL}s"

# Parse connection details from URL
if [[ "$DB_URL" =~ postgresql://([^:]+):([^@]+)@([^:]+):([0-9]+)/(.+) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASS="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
else
    echo "❌ Unable to parse database URL: $DB_URL"
    exit 1
fi

echo "Parsed connection: user=$DB_USER host=$DB_HOST port=$DB_PORT db=$DB_NAME"

# Function to check database connection
check_connection() {
    local attempt=$1
    echo "Attempt $attempt/$MAX_RETRIES: Testing connection..."

    # Basic connection test
    if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" >/dev/null 2>&1; then
        echo "⚠️ pg_isready failed for user $DB_USER"
        return 1
    fi

    # Test actual query execution
    if ! PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
        echo "❌ Query execution failed for user $DB_USER"

        # Check for common issues
        check_connection_issues
        return 1
    fi

    echo "✅ Connection successful"
    return 0
}

# Function to diagnose connection issues with forensic detail
check_connection_issues() {
    echo "🔍 FORENSIC DATABASE ANALYSIS - Security Contract Validation"
    echo "=================================================="

    # Validate expected database setup
    echo "📋 EXPECTED SETUP VALIDATION:"
    local expected_user="journal"
    local expected_databases=("journal_infisical_test" "journal_e2e_test")

    # Check if target database exists
    echo "🎯 Target Database: $DB_NAME"
    if PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        echo "✅ Target database '$DB_NAME' exists"
    else
        echo "❌ VIOLATION: Target database '$DB_NAME' does not exist"
        echo "📝 Available databases:"
        PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt 2>/dev/null | cut -d \| -f 1 | sed 's/^ */  - /' || echo "  Unable to list databases"
    fi

    # Check if journal user exists and has correct permissions
    echo "👤 Expected User: $expected_user"
    local user_exists=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -t -c "
        SELECT COUNT(*) FROM pg_user WHERE usename = '$expected_user';
    " 2>/dev/null || echo "0")

    if [[ "$user_exists" -gt 0 ]]; then
        echo "✅ User '$expected_user' exists"
    else
        echo "❌ VIOLATION: User '$expected_user' does not exist"
    fi

    echo ""
    echo "🚨 PRIVILEGE VIOLATION AUDIT:"
    echo "========================================="

    # Check for ANY non-journal connections (security violations)
    echo "📊 Current connection audit (ALL USERS):"
    PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "
        SELECT
            usename as \"User (MUST be journal)\",
            datname as \"Database\",
            application_name as \"Application\",
            client_addr as \"Client\",
            state as \"State\",
            query_start as \"Started\",
            left(query, 60) as \"Query Preview\"
        FROM pg_stat_activity
        WHERE state != 'idle' OR usename != 'journal'
        ORDER BY usename, datname;
    " 2>/dev/null || echo "❌ Unable to query pg_stat_activity - this itself is a violation!"

    # Specific audit for privilege escalation attempts
    local violating_users=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -t -c "
        SELECT string_agg(DISTINCT usename, ', ')
        FROM pg_stat_activity
        WHERE usename NOT IN ('journal');
    " 2>/dev/null | tr -d ' ')

    if [[ -n "$violating_users" && "$violating_users" != "" ]]; then
        echo "🚨 CRITICAL SECURITY VIOLATION: Unauthorized users detected!"
        echo "Violating users: $violating_users"
        echo ""
        echo "🔍 DETAILED VIOLATION ANALYSIS:"

        # Root user violations (most common)
        local root_connections=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -t -c "
            SELECT count(*) FROM pg_stat_activity WHERE usename = 'root';
        " 2>/dev/null || echo "0")

        if [[ "$root_connections" -gt 0 ]]; then
            echo "  ❌ ROOT USER VIOLATIONS ($root_connections connections):"
            PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "
                SELECT
                    pid,
                    datname as \"Target DB\",
                    application_name as \"App/Tool\",
                    client_addr,
                    state,
                    query_start,
                    query as \"Full Query\"
                FROM pg_stat_activity
                WHERE usename = 'root';
            " 2>/dev/null || echo "    Unable to get root connection details"
        fi

        # Postgres user violations
        local postgres_connections=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -t -c "
            SELECT count(*) FROM pg_stat_activity WHERE usename = 'postgres';
        " 2>/dev/null || echo "0")

        if [[ "$postgres_connections" -gt 0 ]]; then
            echo "  ❌ POSTGRES USER VIOLATIONS ($postgres_connections connections):"
            PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "
                SELECT
                    pid,
                    datname as \"Target DB\",
                    application_name as \"App/Tool\",
                    client_addr,
                    state,
                    query_start,
                    query as \"Full Query\"
                FROM pg_stat_activity
                WHERE usename = 'postgres';
            " 2>/dev/null || echo "    Unable to get postgres connection details"
        fi

        echo ""
        echo "💡 REMEDIATION COMMANDS:"
        echo "  Terminate violating connections:"
        echo "  SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE usename != 'journal';"

    else
        echo "✅ SECURITY COMPLIANCE: Only journal user connections detected"
    fi

    echo ""
    echo "🔐 PERMISSION VALIDATION:"
    echo "========================="
    if PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "CREATE TEMP TABLE test_perms (id int);" >/dev/null 2>&1; then
        echo "✅ User '$DB_USER' has required CREATE permissions on '$DB_NAME'"
    else
        echo "❌ PERMISSION VIOLATION: User '$DB_USER' lacks CREATE permissions on '$DB_NAME'"
        echo "This suggests database setup or user privileges are incorrect"
    fi

    echo ""
    echo "📝 ENVIRONMENT AUDIT:"
    echo "====================="
    echo "Current environment variables that affect database connections:"
    echo "  PGUSER: ${PGUSER:-<not set>}"
    echo "  PGPASSWORD: ${PGPASSWORD:-<not set>} (${#PGPASSWORD} chars)"
    echo "  PGHOST: ${PGHOST:-<not set>}"
    echo "  PGPORT: ${PGPORT:-<not set>}"
    echo "  PGDATABASE: ${PGDATABASE:-<not set>}"
    echo "  DATABASE_URL: ${DATABASE_URL:-<not set>}"
    echo "  DATABASE_URL_SYNC: ${DATABASE_URL_SYNC:-<not set>}"

    echo ""
    echo "🎯 FRAMEWORK COMPLIANCE SUMMARY:"
    echo "================================"
    echo "Expected: ONLY 'journal' user connecting to test databases"
    echo "Reality:  $(echo "$violating_users" | wc -w) unauthorized user types detected"
    if [[ -z "$violating_users" || "$violating_users" == "" ]]; then
        echo "✅ COMPLIANT: Framework security contract honored"
    else
        echo "❌ NON-COMPLIANT: Security contract violated - unauthorized privilege escalation detected"
    fi
}

# Function to wait for database to become available
wait_for_database() {
    echo "⏳ Waiting for database to become available..."

    for attempt in $(seq 1 "$MAX_RETRIES"); do
        if check_connection "$attempt"; then
            echo "🎉 Database is ready after $attempt attempts"
            return 0
        fi

        if [[ $attempt -lt $MAX_RETRIES ]]; then
            echo "⏸️ Waiting ${CHECK_INTERVAL}s before retry..."
            sleep "$CHECK_INTERVAL"
        fi
    done

    echo "💥 Database failed to become available after $MAX_RETRIES attempts"
    return 1
}

# Function to monitor ongoing connections
monitor_connections() {
    echo "👁️ Monitoring database connections (Ctrl+C to stop)..."

    while true; do
        echo "--- $(date) ---"

        # Quick connection check
        if check_connection "monitor"; then
            # Show connection stats
            PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c "
                SELECT state, count(*) as connections
                FROM pg_stat_activity
                WHERE datname = '$DB_NAME'
                GROUP BY state
                ORDER BY state;
            " 2>/dev/null || echo "Unable to query connection stats"
        fi

        sleep "$CHECK_INTERVAL"
    done
}

# Main execution
case "$COMMAND" in
    "wait")
        wait_for_database
        ;;
    "monitor")
        monitor_connections
        ;;
    "check")
        check_connection "1"
        ;;
    "diagnose")
        check_connection_issues
        ;;
    *)
        echo "Error: Unknown command '$COMMAND'"
        echo "Usage: $0 [wait|monitor|check|diagnose] [db_url] [max_retries] [interval]"
        echo "  wait     - Wait for database to become available (default)"
        echo "  monitor  - Continuously monitor connections"
        echo "  check    - Single connection test"
        echo "  diagnose - Diagnose connection issues"
        exit 1
        ;;
esac