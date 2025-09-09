#!/bin/bash

# Production Rollout Script for React 19 Migration
# Usage: ./scripts/deploy-with-rollout.sh <stage> [options]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Show usage
show_usage() {
    echo "Usage: $0 <stage> [options]"
    echo ""
    echo "Stages:"
    echo "  dev          - Development deployment (React Compiler ON)"
    echo "  staging      - Staging deployment (React Compiler OFF)"
    echo "  staging-opt  - Staging with React Compiler testing"
    echo "  prod-0       - Production Phase 0 (0% React Compiler)"
    echo "  prod-10      - Production Phase 1 (10% React Compiler)"
    echo "  prod-50      - Production Phase 2 (50% React Compiler)"
    echo "  prod-100     - Production Phase 3 (100% React Compiler)"
    echo ""
    echo "Options:"
    echo "  --dry-run    - Show what would be deployed without actually deploying"
    echo "  --metrics    - Capture performance metrics after deployment"
    echo "  --rollback   - Rollback to previous version"
    echo ""
    echo "Examples:"
    echo "  $0 dev                    # Deploy to development"
    echo "  $0 prod-10 --metrics     # Deploy 10% rollout with metrics"
    echo "  $0 prod-100 --dry-run    # Preview full rollout"
}

# Deployment configurations
configure_deployment() {
    local stage=$1
    
    case $stage in
        dev)
            ENV_FILE=".env.development"
            ENABLE_REACT_COMPILER="true"
            REACT_COMPILER_ROLLOUT_PERCENT="100"
            DISABLE_REACT_COMPILER="false"
            TARGET="development"
            ;;
        staging)
            ENV_FILE=".env.staging"
            ENABLE_REACT_COMPILER="false"
            REACT_COMPILER_ROLLOUT_PERCENT="0"
            DISABLE_REACT_COMPILER="true"
            TARGET="staging"
            ;;
        staging-opt)
            ENV_FILE=".env.staging"
            ENABLE_REACT_COMPILER="true"
            REACT_COMPILER_ROLLOUT_PERCENT="100"
            DISABLE_REACT_COMPILER="false"
            TARGET="staging"
            ;;
        prod-0)
            ENV_FILE=".env.production"
            ENABLE_REACT_COMPILER="false"
            REACT_COMPILER_ROLLOUT_PERCENT="0"
            DISABLE_REACT_COMPILER="true"
            TARGET="production"
            ;;
        prod-10)
            ENV_FILE=".env.production"
            ENABLE_REACT_COMPILER="false"
            REACT_COMPILER_ROLLOUT_PERCENT="10"
            DISABLE_REACT_COMPILER="false"
            TARGET="production"
            ;;
        prod-50)
            ENV_FILE=".env.production"
            ENABLE_REACT_COMPILER="false"
            REACT_COMPILER_ROLLOUT_PERCENT="50"
            DISABLE_REACT_COMPILER="false"
            TARGET="production"
            ;;
        prod-100)
            ENV_FILE=".env.production"
            ENABLE_REACT_COMPILER="false"
            REACT_COMPILER_ROLLOUT_PERCENT="100"
            DISABLE_REACT_COMPILER="false"
            TARGET="production"
            ;;
        *)
            error "Unknown stage: $stage"
            ;;
    esac
}

# Pre-deployment checks
run_pre_checks() {
    log "Running pre-deployment checks..."
    
    # Check if we're on the right branch
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    if [[ "$TARGET" == "production" && "$current_branch" != "react-19-stable" && "$current_branch" != "main" ]]; then
        error "Production deployments must be from 'react-19-stable' or 'main' branch, currently on: $current_branch"
    fi
    
    # Check for uncommitted changes
    if ! git diff --quiet; then
        error "Uncommitted changes detected. Please commit or stash changes before deployment."
    fi
    
    # Run tests
    log "Running test suite..."
    if ! bun run test --run; then
        error "Test suite failed. Deployment aborted."
    fi
    
    # Check build without React Compiler
    log "Testing build without React Compiler..."
    if ! ENABLE_REACT_COMPILER=false bun run build > /dev/null 2>&1; then
        error "Build failed without React Compiler. Deployment aborted."
    fi
    
    # Check build with React Compiler (if being used)
    if [[ "$REACT_COMPILER_ROLLOUT_PERCENT" != "0" || "$ENABLE_REACT_COMPILER" == "true" ]]; then
        log "Testing build with React Compiler..."
        if ! ENABLE_REACT_COMPILER=true bun run build > /dev/null 2>&1; then
            error "Build failed with React Compiler. Deployment aborted."
        fi
    fi
    
    log "✅ Pre-deployment checks passed"
}

# Build application
build_application() {
    log "Building application for $STAGE deployment..."
    
    # Set environment variables for build
    export ENABLE_REACT_COMPILER="$ENABLE_REACT_COMPILER"
    export REACT_COMPILER_ROLLOUT_PERCENT="$REACT_COMPILER_ROLLOUT_PERCENT"
    export DISABLE_REACT_COMPILER="$DISABLE_REACT_COMPILER"
    export NODE_ENV="production"
    
    # Build the application
    if ! bun run build; then
        error "Build failed. Deployment aborted."
    fi
    
    log "✅ Build completed successfully"
    
    # Show build summary
    echo ""
    log "Build Configuration:"
    echo "  React Compiler Enabled: $ENABLE_REACT_COMPILER"
    echo "  Rollout Percentage: $REACT_COMPILER_ROLLOUT_PERCENT%"
    echo "  Force Disabled: $DISABLE_REACT_COMPILER"
    echo "  Target Environment: $TARGET"
    echo ""
}

# Capture metrics
capture_metrics() {
    if [[ "$CAPTURE_METRICS" == "true" ]]; then
        log "Capturing deployment metrics..."
        
        # Bundle size analysis
        echo "Bundle Sizes:" > deployment-metrics.txt
        ls -lh dist/assets/*.js | awk '{print $9 ": " $5}' >> deployment-metrics.txt
        
        # Build time (would need to be captured during build)
        echo "Build Time: Captured during build process" >> deployment-metrics.txt
        
        log "📊 Metrics captured in deployment-metrics.txt"
    fi
}

# Main deployment function
deploy() {
    local stage=$1
    
    log "🚀 Starting deployment to $stage..."
    
    configure_deployment "$stage"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "🔍 DRY RUN - Would deploy with configuration:"
        echo "  Stage: $stage"
        echo "  React Compiler: $ENABLE_REACT_COMPILER"
        echo "  Rollout Percentage: $REACT_COMPILER_ROLLOUT_PERCENT%"
        echo "  Environment: $TARGET"
        return 0
    fi
    
    run_pre_checks
    build_application
    capture_metrics
    
    # Here you would add actual deployment commands for your infrastructure
    # Examples:
    # - Docker: docker build && docker push && kubectl apply
    # - Vercel: vercel deploy --prod
    # - Netlify: netlify deploy --prod
    # - AWS: aws s3 sync dist/ s3://your-bucket/ && aws cloudfront create-invalidation
    
    log "🚀 Deployment would execute here for $TARGET environment"
    log "✅ Deployment to $stage completed successfully"
}

# Parse command line arguments
STAGE=""
DRY_RUN="false"
CAPTURE_METRICS="false"
ROLLBACK="false"

while [[ $# -gt 0 ]]; do
    case $1 in
        dev|staging|staging-opt|prod-0|prod-10|prod-50|prod-100)
            STAGE="$1"
            shift
            ;;
        --dry-run)
            DRY_RUN="true"
            shift
            ;;
        --metrics)
            CAPTURE_METRICS="true"
            shift
            ;;
        --rollback)
            ROLLBACK="true"
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            ;;
    esac
done

# Validate arguments
if [[ -z "$STAGE" ]]; then
    error "Stage is required"
fi

if [[ "$ROLLBACK" == "true" ]]; then
    error "Rollback functionality not implemented yet"
fi

# Change to project root
cd "$PROJECT_ROOT"

# Run deployment
deploy "$STAGE"

log "🎉 Deployment process completed!"