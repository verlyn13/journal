#!/bin/bash
# Infisical Setup Validation Script
# Validates Universal Auth and OIDC authentication setup

set -euo pipefail

echo "🔐 Infisical Setup Validation"
echo "============================"

# Check if Infisical CLI is installed
if ! command -v infisical &> /dev/null; then
    echo "❌ Infisical CLI not found. Please install it first:"
    echo "   curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash"
    echo "   sudo apt-get update && sudo apt-get install infisical"
    exit 1
fi

echo "✅ Infisical CLI found: $(infisical --version)"

# Check environment variables
echo ""
echo "📋 Environment Variables:"
echo "========================"

check_env_var() {
    local var_name="$1"
    local required="$2"
    
    if [[ -n "${!var_name:-}" ]]; then
        if [[ "$var_name" == *"SECRET"* ]]; then
            echo "✅ $var_name: [REDACTED]"
        else
            echo "✅ $var_name: ${!var_name}"
        fi
    else
        if [[ "$required" == "true" ]]; then
            echo "❌ $var_name: NOT SET (required)"
        else
            echo "⚠️  $var_name: NOT SET (optional)"
        fi
    fi
}

# Required variables
check_env_var "INFISICAL_PROJECT_ID" true
check_env_var "INFISICAL_SERVER_URL" true
check_env_var "INFISICAL_ENVIRONMENT" true

# Universal Auth variables
echo ""
echo "🔑 Universal Auth Configuration:"
echo "==============================="
check_env_var "UA_CLIENT_ID_TOKEN_SERVICE" false
check_env_var "UA_CLIENT_SECRET_TOKEN_SERVICE" false
check_env_var "UA_CLIENT_ID_ROTATOR" false
check_env_var "UA_CLIENT_SECRET_ROTATOR" false

# Optional variables
echo ""
echo "⚙️  Optional Configuration:"
echo "=========================="
check_env_var "INFISICAL_CACHE_TTL" false
check_env_var "INFISICAL_TIMEOUT" false
check_env_var "INFISICAL_MAX_RETRIES" false

# Test authentication methods
echo ""
echo "🧪 Authentication Tests:"
echo "========================"

test_universal_auth() {
    echo "Testing Universal Auth (token-service@journal)..."
    
    if [[ -z "${UA_CLIENT_ID_TOKEN_SERVICE:-}" ]] || [[ -z "${UA_CLIENT_SECRET_TOKEN_SERVICE:-}" ]]; then
        echo "⚠️  Skipping Universal Auth test - credentials not set"
        return
    fi
    
    echo "Attempting Universal Auth login..."
    if infisical login --method universal-auth \
        --client-id "$UA_CLIENT_ID_TOKEN_SERVICE" \
        --client-secret "$UA_CLIENT_SECRET_TOKEN_SERVICE" \
        --silent --plain > /tmp/infisical_token 2>&1; then
        
        echo "✅ Universal Auth login successful"
        
        # Test basic operations
        if infisical secrets list --project-id "$INFISICAL_PROJECT_ID" > /dev/null 2>&1; then
            echo "✅ Secret list operation successful"
        else
            echo "❌ Secret list operation failed"
        fi
        
        # Clean up token file
        rm -f /tmp/infisical_token
        
    else
        echo "❌ Universal Auth login failed"
        if [[ -f /tmp/infisical_token ]]; then
            echo "Error: $(cat /tmp/infisical_token)"
            rm -f /tmp/infisical_token
        fi
    fi
}

test_oidc_auth() {
    echo ""
    echo "Testing GitHub OIDC Authentication..."
    
    if [[ "${GITHUB_ACTIONS:-}" == "true" ]]; then
        echo "Running in GitHub Actions - attempting OIDC login..."
        
        if infisical login --method=oidc --silent --plain > /tmp/infisical_oidc_token 2>&1; then
            echo "✅ GitHub OIDC login successful"
            
            # Test basic operations
            if infisical secrets list --project-id "$INFISICAL_PROJECT_ID" > /dev/null 2>&1; then
                echo "✅ OIDC secret list operation successful"
            else
                echo "❌ OIDC secret list operation failed"
            fi
            
        else
            echo "❌ GitHub OIDC login failed"
            if [[ -f /tmp/infisical_oidc_token ]]; then
                echo "Error: $(cat /tmp/infisical_oidc_token)"
            fi
        fi
        
        rm -f /tmp/infisical_oidc_token
        
    else
        echo "⚠️  Not running in GitHub Actions - skipping OIDC test"
        echo "   OIDC authentication only works in GitHub Actions environment"
    fi
}

test_fallback_token() {
    echo ""
    echo "Testing Static Token (deprecated fallback)..."
    
    if [[ -n "${INFISICAL_TOKEN:-}" ]]; then
        echo "⚠️  Static INFISICAL_TOKEN detected (deprecated)"
        
        if infisical secrets list --project-id "$INFISICAL_PROJECT_ID" > /dev/null 2>&1; then
            echo "✅ Static token works but should migrate to Universal Auth"
        else
            echo "❌ Static token authentication failed"
        fi
    else
        echo "✅ No static token found (good - using modern auth methods)"
    fi
}

# Run tests
test_universal_auth
test_oidc_auth
test_fallback_token

# Test secret structure validation
echo ""
echo "📁 Secret Structure Validation:"
echo "==============================="

validate_secret_structure() {
    local required_paths=(
        "/auth/jwt/current_private_key"
        "/auth/jwt/current_public_key"
        "/auth/aes/active_kid"
        "/auth/aes/enc_keys"
    )
    
    echo "Checking required secret paths..."
    
    for path in "${required_paths[@]}"; do
        # Extract secret key from path
        secret_key=$(basename "$path")
        
        if infisical secrets get "$secret_key" --project-id "$INFISICAL_PROJECT_ID" --env "$INFISICAL_ENVIRONMENT" > /dev/null 2>&1; then
            echo "✅ $path exists"
        else
            echo "⚠️  $path not found (may need migration)"
        fi
    done
}

if command -v infisical &> /dev/null && [[ -n "${INFISICAL_PROJECT_ID:-}" ]]; then
    validate_secret_structure
else
    echo "⚠️  Skipping secret structure validation - authentication not available"
fi

# Summary
echo ""
echo "📊 Validation Summary:"
echo "====================="

if [[ -n "${UA_CLIENT_ID_TOKEN_SERVICE:-}" ]] && [[ -n "${UA_CLIENT_SECRET_TOKEN_SERVICE:-}" ]]; then
    echo "✅ Universal Auth configured for runtime (token-service@journal)"
else
    echo "❌ Universal Auth not configured for runtime"
    echo "   Set UA_CLIENT_ID_TOKEN_SERVICE and UA_CLIENT_SECRET_TOKEN_SERVICE"
fi

if [[ -n "${UA_CLIENT_ID_ROTATOR:-}" ]] && [[ -n "${UA_CLIENT_SECRET_ROTATOR:-}" ]]; then
    echo "✅ Universal Auth configured for rotation (rotator@ops)"
else
    echo "⚠️  Universal Auth not configured for rotation"
    echo "   Set UA_CLIENT_ID_ROTATOR and UA_CLIENT_SECRET_ROTATOR for key rotation"
fi

if [[ "${GITHUB_ACTIONS:-}" == "true" ]]; then
    echo "✅ GitHub OIDC environment detected (ci@github identity)"
else
    echo "ℹ️  Not in GitHub Actions (OIDC not applicable)"
fi

echo ""
echo "🎯 Next Steps:"
echo "============="
echo "1. Create identities in Infisical Organization → Identities:"
echo "   - token-service@journal (Universal Auth)"
echo "   - rotator@ops (Universal Auth)"  
echo "   - ci@github (OIDC)"
echo ""
echo "2. Add identities to project with appropriate roles:"
echo "   - token-service@journal → viewer"
echo "   - rotator@ops → no-access"
echo "   - ci@github → viewer"
echo ""
echo "3. Configure policies and Change Requests per manifest"
echo ""
echo "4. Run migration: python -m app.scripts.migrate_to_infisical migrate"
echo ""
echo "For complete setup instructions, see:"
echo "📖 docs/infisical-identities-manifest.yml"
echo "📖 docs/INFISICAL_SETUP_GUIDE.md"