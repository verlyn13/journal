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

# Function to diagnose connection issues
check_connection_issues() {
    echo "🔍 Diagnosing connection issues..."

    # Check if database exists
    if PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        echo "✅ Database '$DB_NAME' exists"
    else
        echo "❌ Database '$DB_NAME' does not exist"
    fi

    # Check active connections
    echo "📊 Current database connections:"
    PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c "
        SELECT datname, usename, application_name, state, count(*)
        FROM pg_stat_activity
        WHERE datname IS NOT NULL
        GROUP BY datname, usename, application_name, state
        ORDER BY datname, usename;
    " 2>/dev/null || echo "Unable to query pg_stat_activity"

    # Check for root user connections (common CI issue)
    local root_connections
    root_connections=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -t -c "
        SELECT count(*) FROM pg_stat_activity WHERE usename = 'root';
    " 2>/dev/null || echo "0")

    if [[ "$root_connections" -gt 0 ]]; then
        echo "🚨 CRITICAL: Found $root_connections active 'root' user connections!"
        echo "This is a common CI issue. Active root connections:"
        PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c "
            SELECT pid, usename, datname, application_name, state, query_start, query
            FROM pg_stat_activity
            WHERE usename = 'root';
        " 2>/dev/null || echo "Unable to query root connections"

        echo "💡 Consider terminating root connections:"
        echo "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE usename = 'root';"
    fi

    # Check for permission issues
    echo "🔐 Testing user permissions:"
    if PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "CREATE TEMP TABLE test_perms (id int);" >/dev/null 2>&1; then
        echo "✅ User '$DB_USER' has CREATE permissions"
    else
        echo "❌ User '$DB_USER' lacks CREATE permissions"
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