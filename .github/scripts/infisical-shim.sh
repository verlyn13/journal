#!/bin/bash
# Infisical CLI Shim for Deterministic CI Testing
# Emulates core Infisical CLI subcommands with predictable responses
set -euo pipefail

COMMAND="${1:-}"
shift || true

case "$COMMAND" in
    "auth" | "login")
        # Simulate successful Universal Auth
        echo "✅ Successfully logged in to Infisical"
        echo "User: test-user@example.com"
        echo "Organization: test-org"
        exit 0
        ;;

    "secrets" | "get")
        # Handle secret retrieval
        SECRET_NAME="${1:-}"
        case "$SECRET_NAME" in
            "JWT_PUBLIC_KEY")
                echo "-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4qiXjbHFrxgW...
-----END PUBLIC KEY-----"
                ;;
            "JWT_PRIVATE_KEY")
                echo "-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDiqJeN...
-----END PRIVATE KEY-----"
                ;;
            "OPENAI_API_KEY")
                echo "sk-test1234567890abcdef1234567890abcdef1234567890"
                ;;
            "DATABASE_URL")
                echo "postgresql+asyncpg://journal:journal@localhost:5433/journal_test"
                ;;
            *)
                echo "test-secret-value-$SECRET_NAME"
                ;;
        esac
        exit 0
        ;;

    "export" | "run")
        # Handle environment export or command execution
        echo "# Infisical environment variables"
        echo "export JWT_PUBLIC_KEY='-----BEGIN PUBLIC KEY-----'"
        echo "export JWT_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----'"
        echo "export OPENAI_API_KEY='sk-test1234567890abcdef'"
        echo "export DATABASE_URL='postgresql+asyncpg://journal:journal@localhost:5433/journal_test'"

        # If additional arguments, execute them with the mock environment
        if [ $# -gt 0 ]; then
            exec "$@"
        fi
        exit 0
        ;;

    "scan" | "check")
        # Simulate secret scanning
        echo "🔍 Scanning for secrets..."
        echo "✅ No secrets found in repository"
        exit 0
        ;;

    "projects" | "list")
        # List mock projects
        echo "Available projects:"
        echo "- journal-api (test-project-id)"
        echo "- journal-web (test-web-id)"
        exit 0
        ;;

    "status" | "whoami")
        # Show current status
        echo "Logged in as: test-user@example.com"
        echo "Organization: test-org"
        echo "Project: journal-api"
        echo "Environment: test"
        exit 0
        ;;

    "version" | "--version" | "-v")
        # Mock version info
        echo "Infisical CLI v0.42.1-shim"
        echo "Built for testing with deterministic responses"
        exit 0
        ;;

    "help" | "--help" | "-h" | "")
        # Show available commands
        cat << 'EOF'
Infisical CLI Shim - Deterministic Testing Mode

Available commands:
  auth/login    - Authenticate with Infisical
  secrets/get   - Retrieve secrets
  export/run    - Export environment or run command
  scan/check    - Scan for secrets
  projects/list - List available projects
  status/whoami - Show current user status
  version       - Show version information
  help          - Show this help message

This is a testing shim that provides predictable responses
for CI/CD environments without external network dependencies.
EOF
        exit 0
        ;;

    *)
        echo "Error: Unknown command '$COMMAND'"
        echo "Run 'infisical help' for available commands"
        exit 1
        ;;
esac