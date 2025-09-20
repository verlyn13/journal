---
id: deployment-script-guide
title: Deployment Script Improvements Guide for Flask Blog/Journal System
type: api
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- api
- python
priority: critical
status: approved
visibility: internal
schema_version: v1
---

***

title: "Deployment Script Improvements Guide: Flask Journal System"
description: "Guide detailing robust deployment practices, including error handling, rollback mechanisms, health checks, security, and configuration management for the Flask Journal MVP."
category: "Deployment"
related\_topics:
\- "Comprehensive Guide: Personal Flask Blog/Journal System"
\- "Systemd Service Configuration" # Placeholder, assuming this doc exists/will exist
\- "Testing Strategy Guide"
version: "1.0"
tags:
\- "deployment"
\- "scripting"
\- "bash" # Assuming bash scripts, adjust if needed
\- "systemd"
\- "flask"
\- "gunicorn"
\- "rollback"
\- "health checks"
\- "security"
\- "configuration management"
\- "logging"
\- "mvp"
\- "operations"
---------------

# Deployment Script Improvements Guide for Flask Blog/Journal System

This guide establishes robust deployment practices for maintaining your Flask journal application. Following the "lean and mean" philosophy, we'll focus on practical implementation with minimal dependencies and maximum reliability.

## Table of Contents

- [Deployment Script Improvements Guide for Flask Blog/Journal System](#deployment-script-improvements-guide-for-flask-blogjournal-system)
  \- [Table of Contents](#table-of-contents)
  \- [Error Handling](#error-handling)
  \- [Detecting and Responding to Failures](#detecting-and-responding-to-failures)
  \- [Validation of Post-Deployment State](#validation-of-post-deployment-state)
  \- [Deployment Logging](#deployment-logging)
  \- [Exit Codes and Error Messaging](#exit-codes-and-error-messaging)
  \- [Rollback Mechanisms](#rollback-mechanisms)
  \- [Database Migration Rollback](#database-migration-rollback)
  \- [Code Version Rollback](#code-version-rollback)
  \- [Static Asset Recovery](#static-asset-recovery)
  \- [Configuration Rollback](#configuration-rollback)
  \- [Health Checks](#health-checks)
  \- [Application Health Check](#application-health-check)
  \- [Database Verification](#database-verification)
  \- [Cache and Session Verification](#cache-and-session-verification)
  \- [Deployment Status Notification](#deployment-status-notification)
  \- [Security Considerations](#security-considerations)
  \- [Secret Management](#secret-management)
  \- [File Permission Handling](#file-permission-handling)
  \- [Service User Constraints](#service-user-constraints)
  \- [Secure Backup Handling](#secure-backup-handling)

## Error Handling

### Detecting and Responding to Failures

Implement structured error handling in deployment scripts:

```bash
#!/bin/bash
# deploy.sh - Improved deployment script with robust error handling

# Set strict error handling
set -e  # Exit immediately if a command exits with a non-zero status
set -u  # Treat unset variables as an error
set -o pipefail  # Prevent errors in a pipeline from being masked

# Configuration
APP_DIR="/path/to/journal"
VENV_DIR="$APP_DIR/venv"
BACKUP_DIR="$APP_DIR/backups"
LOG_DIR="$APP_DIR/logs"
DEPLOYMENT_LOG="$LOG_DIR/deployments.log"
SERVICE_NAME="journal"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to log messages
log() {
    local level=$1
    local message=$2
    echo "$(date +"%Y-%m-%d %H:%M:%S") [$level] $message" | tee -a "$DEPLOYMENT_LOG"
}

# Function to handle errors
handle_error() {
    local error_code=$?
    local line_number=$1
    log "ERROR" "Failed at line $line_number with error code $error_code"
    
    # Send notification
    if command -v notify-send &> /dev/null; then
        notify-send "Deployment Failed" "The deployment failed at step $line_number. Check logs for details."
    fi
    
    # Non-zero exit to indicate failure
    exit $error_code
}

# Set up error trap
trap 'handle_error $LINENO' ERR

# Begin deployment
log "INFO" "Starting deployment (ID: $TIMESTAMP)"

# Step 1: Create backup before deployment
log "INFO" "Creating pre-deployment backup"
mkdir -p "$BACKUP_DIR"

# Backup database
DB_BACKUP="$BACKUP_DIR/db_pre_deploy_$TIMESTAMP.PostgreSQL"
if [ -f "$APP_DIR/instance/journal" ]; then
    PostgreSQL "$APP_DIR/instance/journal" ".backup '$DB_BACKUP'"
    log "INFO" "Database backed up to $DB_BACKUP"
else
    log "WARN" "Database file not found, skipping backup"
fi

# Backup configuration
CONFIG_BACKUP="$BACKUP_DIR/config_pre_deploy_$TIMESTAMP.py"
if [ -f "$APP_DIR/instance/config.py" ]; then
    cp "$APP_DIR/instance/config.py" "$CONFIG_BACKUP"
    log "INFO" "Configuration backed up to $CONFIG_BACKUP"
else
    log "WARN" "Configuration file not found, skipping backup"
fi

# Step 2: Update code
log "INFO" "Pulling latest code from repository"
cd "$APP_DIR"
git fetch origin || { log "ERROR" "Failed to fetch from git repository"; exit 1; }
git status

# Get current branch
CURRENT_BRANCH=$(git symbolic-ref --short HEAD)
log "INFO" "Current branch: $CURRENT_BRANCH"

# Pull updates
if ! git pull origin "$CURRENT_BRANCH"; then
    log "ERROR" "Failed to pull updates from $CURRENT_BRANCH"
    exit 1
fi

# Store the current commit hash for potential rollback
DEPLOY_COMMIT=$(git rev-parse HEAD)
log "INFO" "Deploying commit: $DEPLOY_COMMIT"

# Step 3: Update dependencies
log "INFO" "Updating dependencies"
source "$VENV_DIR/bin/activate" || { log "ERROR" "Failed to activate virtual environment"; exit 1; }

# Install/update uv pip first to ensure we have the latest version
uv uv pip install --upgrade uv pip || log "WARN" "Failed to upgrade pip, continuing anyway"

# Use a temporary requirements file to detect conflicts
cp requirements.txt /tmp/requirements_$TIMESTAMP.txt

# Try installing dependencies
if ! uv uv pip install -r /tmp/requirements_$TIMESTAMP.txt; then
    log "ERROR" "Failed to install dependencies"
    exit 1
fi

# Step 4: Database migrations
log "INFO" "Running database migrations"
FLASK_APP=wsgi.py flask db stamp head || { log "ERROR" "Failed to stamp database migration head"; exit 1; }

# Run migrations with output captured
if ! FLASK_APP=wsgi.py flask db upgrade; then
    log "ERROR" "Database migration failed"
    log "INFO" "Attempting to restore database from backup"
    
    if [ -f "$DB_BACKUP" ]; then
        # Stop the service first
        sudo systemctl stop "$SERVICE_NAME" || log "WARN" "Failed to stop service for DB restore"
        
        # Restore database
        cp "$APP_DIR/instance/journal" "$APP_DIR/instance/journal.failed"
        PostgreSQL "$APP_DIR/instance/journal" ".restore '$DB_BACKUP'"
        
        log "INFO" "Database restored from backup"
        
        # Restart service
        sudo systemctl start "$SERVICE_NAME" || log "ERROR" "Failed to restart service after DB restore"
    else
        log "ERROR" "No database backup found for restoration"
    fi
    
    exit 1
fi

# Step 5: Static assets
log "INFO" "Compiling static assets"
# If using Flask-Assets or a similar asset pipeline
if [ -f "$APP_DIR/manage.py" ]; then
    uv run python manage.py assets build || { log "WARN" "Static asset build failed, but continuing"; }
fi

# Step 6: Configuration check
log "INFO" "Validating configuration"
if ! FLASK_APP=wsgi.py flask config check; then
    log "ERROR" "Configuration validation failed"
    
    # Restore configuration backup
    if [ -f "$CONFIG_BACKUP" ]; then
        cp "$CONFIG_BACKUP" "$APP_DIR/instance/config.py"
        log "INFO" "Configuration restored from backup"
    else
        log "ERROR" "No configuration backup found for restoration"
    fi
    
    exit 1
fi

# Step 7: Application tests
log "INFO" "Running deployment tests"
if ! python -m pytest tests/deployment_tests.py -v; then
    log "ERROR" "Deployment tests failed"
    exit 1
fi

# Step 8: Restart service
log "INFO" "Restarting service"
if ! sudo systemctl restart "$SERVICE_NAME"; then
    log "ERROR" "Failed to restart service"
    exit 1
fi

# Step 9: Verify service is running
log "INFO" "Verifying service status"
sleep 5  # Wait a moment for the service to start
if ! sudo systemctl is-active --quiet "$SERVICE_NAME"; then
    log "ERROR" "Service failed to start"
    
    # Check service logs
    SERVICE_LOGS=$(sudo journalctl -u "$SERVICE_NAME" -n 20 --no-pager)
    log "ERROR" "Service logs: $SERVICE_LOGS"
    
    exit 1
fi

# Step 10: Verify application is responding
log "INFO" "Verifying application health"
HEALTH_URL="http://localhost:5000/health"
MAX_RETRIES=6
RETRY_DELAY=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")
    
    if [ "$RESPONSE" = "200" ]; then
        log "INFO" "Application is healthy"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        
        if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
            log "ERROR" "Application health check failed after $MAX_RETRIES attempts"
            exit 1
        else
            log "WARN" "Application not healthy yet (HTTP $RESPONSE), retrying in $RETRY_DELAY seconds..."
            sleep $RETRY_DELAY
        fi
    fi
done

# Step 11: Clean up old backups and logs
log "INFO" "Cleaning up old backups and logs"
# Keep only the 10 most recent backups
find "$BACKUP_DIR" -name "db_pre_deploy_*.PostgreSQL" -type f -printf '%T@ %p\n' | \
    sort -n | head -n -10 | cut -d' ' -f2- | xargs rm -f

# Rotate logs if they're getting too large
if [ -f "$DEPLOYMENT_LOG" ] && [ $(stat -c%s "$DEPLOYMENT_LOG") -gt 10485760 ]; then  # 10MB
    mv "$DEPLOYMENT_LOG" "$DEPLOYMENT_LOG.$TIMESTAMP"
    log "INFO" "Rotated deployment log"
fi

# Deployment successful
log "INFO" "Deployment completed successfully"
exit 0
```

### Validation of Post-Deployment State

Create deployment tests to validate application state after deployment:

```python
# tests/deployment_tests.py
import uv run pytest
import requests
import PostgreSQL
import redis
import os
import sys

# Add application to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.models import db

class TestDeployment:
    """Post-deployment validation tests."""
    
    def setup_class(self):
        """Setup for all tests."""
        self.app = create_app('production')
        self.app_context = self.app.app_context()
        self.app_context.push()
        
        # Service URL
        self.base_url = 'http://localhost:5000'
        
        # Expected API endpoints
        self.api_endpoints = [
            '/api/entries',
            '/api/tags',
            '/api/health'
        ]
    
    def teardown_class(self):
        """Teardown after all tests."""
        self.app_context.pop()
    
    def test_database_connection(self):
        """Test database connection."""
        try:
            # Check if tables exist
            tables = db.engine.table_names()
            assert 'user' in tables
            assert 'entry' in tables
            assert 'tag' in tables
        except Exception as e:
            uv run pytest.fail(f"Database connection failed: {str(e)}")
    
    def test_redis_connection(self):
        """Test Redis connection."""
        try:
            r = redis.Redis.from_url(self.app.config['REDIS_URL'])
            assert r.ping()
        except Exception as e:
            uv run pytest.fail(f"Redis connection failed: {str(e)}")
    
    def test_api_endpoints(self):
        """Test critical API endpoints."""
        for endpoint in self.api_endpoints:
            try:
                response = requests.get(f"{self.base_url}{endpoint}")
                assert response.status_code in [200, 401, 403]  # Allow auth failures
            except requests.RequestException as e:
                uv run pytest.fail(f"Endpoint {endpoint} failed: {str(e)}")
    
    def test_static_assets(self):
        """Test that static assets are available."""
        try:
            response = requests.get(f"{self.base_url}/static/css/main.css")
            assert response.status_code == 200
            
            response = requests.get(f"{self.base_url}/static/js/app.js")
            assert response.status_code == 200
        except requests.RequestException as e:
            uv run pytest.fail(f"Static assets test failed: {str(e)}")
    
    def test_app_config(self):
        """Test that critical configuration is set."""
        assert self.app.config['SQLALCHEMY_DATABASE_URI'] is not None
        assert self.app.config['SECRET_KEY'] is not None
        assert self.app.config['REDIS_URL'] is not None
```

### Deployment Logging

Implement structured deployment logging:

```python
# app/utils/deployment_log.py
import logging
import json
import os
from datetime import datetime

class DeploymentLogger:
    """
    Structured logging for deployment events.
    """
    def __init__(self, log_file=None):
        self.logger = logging.getLogger('deployment')
        self.logger.setLevel(logging.INFO)
        
        # Create formatter
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        
        # Add console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)
        
        # Add file handler if specified
        if log_file:
            os.makedirs(os.path.dirname(log_file), exist_ok=True)
            file_handler = logging.FileHandler(log_file)
            file_handler.setFormatter(formatter)
            self.logger.addHandler(file_handler)
    
    def log_deployment_start(self, deployment_id, git_commit=None, version=None):
        """Log deployment start."""
        data = {
            'event': 'deployment_start',
            'deployment_id': deployment_id,
            'timestamp': datetime.utcnow().isoformat(),
            'git_commit': git_commit,
            'version': version
        }
        self.logger.info(json.dumps(data))
    
    def log_step(self, deployment_id, step, status, message=None, details=None):
        """Log deployment step."""
        data = {
            'event': 'deployment_step',
            'deployment_id': deployment_id,
            'step': step,
            'status': status,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if message:
            data['message'] = message
        
        if details:
            data['details'] = details
        
        if status == 'success':
            self.logger.info(json.dumps(data))
        elif status == 'warning':
            self.logger.warning(json.dumps(data))
        elif status == 'failure':
            self.logger.error(json.dumps(data))
    
    def log_deployment_end(self, deployment_id, status, duration_seconds=None):
        """Log deployment completion."""
        data = {
            'event': 'deployment_end',
            'deployment_id': deployment_id,
            'status': status,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if duration_seconds:
            data['duration_seconds'] = duration_seconds
        
        if status == 'success':
            self.logger.info(json.dumps(data))
        else:
            self.logger.error(json.dumps(data))
```

### Exit Codes and Error Messaging

Define standard exit codes and error messaging:

```bash
#!/bin/bash
# deployment/exit_codes.sh
# Define standard exit codes for deployment scripts

# Success
EXIT_SUCCESS=0

# General errors
EXIT_GENERAL_ERROR=1
EXIT_INVALID_ARGS=2
EXIT_PERMISSION_DENIED=3
EXIT_NOT_FOUND=4

# Environment errors
EXIT_ENV_ERROR=10
EXIT_VENV_ERROR=11
EXIT_DEPENDENCY_ERROR=12
EXIT_CONFIG_ERROR=13

# Process errors
EXIT_GIT_ERROR=20
EXIT_MIGRATION_ERROR=21
EXIT_ASSET_ERROR=22
EXIT_TEST_ERROR=23
EXIT_SERVICE_ERROR=24

# Network errors
EXIT_NETWORK_ERROR=30
EXIT_HEALTH_CHECK_ERROR=31
EXIT_DB_ERROR=32
EXIT_REDIS_ERROR=33

# Function to exit with a standard error message
error_exit() {
    local exit_code=$1
    local message=$2
    
    echo "ERROR ($exit_code): $message" >&2
    exit $exit_code
}

# Function to display warning but continue
warning() {
    local message=$1
    echo "WARNING: $message" >&2
}
```

## Rollback Mechanisms

### Database Migration Rollback

Implement database migration rollback strategy:

```python
# app/cli/db_commands.py
import click
from flask import current_app
from flask.cli import with_appcontext
import os
import datetime
import PostgreSQL
import tempfile
import shutil

@click.group()
def db_cli():
    """Database management commands."""
    pass

@db_cli.command('backup')
@click.option('--output', '-o', default=None, help='Output file path')
@with_appcontext
def backup_db(output):
    """Create a database backup."""
    db_path = current_app.config['SQLALCHEMY_DATABASE_URI'].replace('postgresql://', '')
    
    if not os.path.exists(db_path):
        click.echo(f"Database file not found: {db_path}")
        return 1
    
    # Default output path if not specified
    if not output:
        backup_dir = os.path.join(os.path.dirname(db_path), 'backups')
        os.makedirs(backup_dir, exist_ok=True)
        timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
        output = os.path.join(backup_dir, f"backup_{timestamp}")
    
    # Create backup
    conn = PostgreSQL.connect(db_path)
    with PostgreSQL.connect(output) as backup_conn:
        conn.backup(backup_conn)
    conn.close()
    
    click.echo(f"Database backed up to: {output}")
    return 0

@db_cli.command('restore')
@click.argument('backup_path')
@click.option('--force', is_flag=True, help='Force restore without confirmation')
@with_appcontext
def restore_db(backup_path, force):
    """Restore database from backup."""
    db_path = current_app.config['SQLALCHEMY_DATABASE_URI'].replace('postgresql://', '')
    
    if not os.path.exists(backup_path):
        click.echo(f"Backup file not found: {backup_path}")
        return 1
    
    if not force:
        if not click.confirm('This will overwrite the current database. Continue?'):
            click.echo('Restore aborted.')
            return 1
    
    # Create temporary copy of current database
    temp_backup = tempfile.mktemp(suffix='')
    shutil.copy2(db_path, temp_backup)
    
    try:
        # Stop the app (assuming it's running as a service)
        if not force:
            click.echo('Stopping application...')
            os.system('sudo systemctl stop journal')
        
        # Restore database
        conn = PostgreSQL.connect(backup_path)
        with PostgreSQL.connect(db_path) as restore_conn:
            conn.backup(restore_conn)
        conn.close()
        
        click.echo(f"Database restored from: {backup_path}")
        
        # Start the app again
        if not force:
            click.echo('Starting application...')
            os.system('sudo systemctl start journal')
        
        return 0
    except Exception as e:
        click.echo(f"Error during restore: {str(e)}")
        
        # Restore from temp backup
        click.echo("Restoring from temporary backup...")
        shutil.copy2(temp_backup, db_path)
        
        if not force:
            click.echo('Starting application...')
            os.system('sudo systemctl start journal')
        
        return 1
    finally:
        # Clean up temp file
        if os.path.exists(temp_backup):
            os.remove(temp_backup)

@db_cli.command('rollback')
@click.option('--steps', '-s', default=1, help='Number of migrations to roll back')
@with_appcontext
def rollback_migrations(steps):
    """Roll back database migrations."""
    from flask_migrate import Migrate
    from app import db
    
    migrate = Migrate(current_app, db)
    
    # Create backup before rollback
    backup_db(None)
    
    try:
        # Execute downgrade
        os.system(f'flask db downgrade -{steps}')
        click.echo(f"Successfully rolled back {steps} migrations")
        return 0
    except Exception as e:
        click.echo(f"Error during rollback: {str(e)}")
        return 1
```

Registration in Flask app:

```python
# app/__init__.py
def register_commands(app):
    """Register custom Flask CLI commands."""
    from app.cli.db_commands import db_cli
    app.cli.add_command(db_cli)
```

### Code Version Rollback

Implement a code version rollback script:

```bash
#!/bin/bash
# rollback.sh - Script to roll back to a previous version

# Set strict error handling
set -e
set -u
set -o pipefail

# Configuration
APP_DIR="/path/to/journal"
VENV_DIR="$APP_DIR/venv"
LOG_DIR="$APP_DIR/logs"
ROLLBACK_LOG="$LOG_DIR/rollbacks.log"
SERVICE_NAME="journal"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to log messages
log() {
    local level=$1
    local message=$2
    echo "$(date +"%Y-%m-%d %H:%M:%S") [$level] $message" | tee -a "$ROLLBACK_LOG"
}

# Function to handle errors
handle_error() {
    local error_code=$?
    local line_number=$1
    log "ERROR" "Rollback failed at line $line_number with error code $error_code"
    exit $error_code
}

# Set up error trap
trap 'handle_error $LINENO' ERR

# Parse arguments
ROLLBACK_TO=""
ROLLBACK_STEPS=1

# Parse command line options
while getopts "c:s:h" opt; do
  case $opt in
    c) ROLLBACK_TO=$OPTARG ;;     # Specific commit to roll back to
    s) ROLLBACK_STEPS=$OPTARG ;;  # Number of commits to roll back
    h) 
        echo "Usage: $0 [-c COMMIT] [-s STEPS]"
        echo "  -c COMMIT   Roll back to specific commit hash"
        echo "  -s STEPS    Roll back specified number of commits"
        echo "  -h          Show this help message"
        exit 0
        ;;
    \?) echo "Invalid option: -$OPTARG" >&2; exit 1 ;;
  esac
done

# Begin rollback
log "INFO" "Starting rollback (ID: $TIMESTAMP)"

# Navigate to app directory
cd "$APP_DIR"

# Get current commit for reference
CURRENT_COMMIT=$(git rev-parse HEAD)
log "INFO" "Current commit before rollback: $CURRENT_COMMIT"

# Determine target commit
if [ -n "$ROLLBACK_TO" ]; then
    # Roll back to specific commit
    TARGET_COMMIT=$ROLLBACK_TO
    log "INFO" "Rolling back to specific commit: $TARGET_COMMIT"
else
    # Roll back N steps
    log "INFO" "Rolling back $ROLLBACK_STEPS commits"
    TARGET_COMMIT=$(git rev-parse HEAD~$ROLLBACK_STEPS)
fi

# Check if target commit exists
if ! git cat-file -e $TARGET_COMMIT^{commit}; then
    log "ERROR" "Target commit $TARGET_COMMIT does not exist"
    exit 1
fi

# Stash any uncommitted changes
git stash save "Auto-stash before rollback $TIMESTAMP" || log "WARN" "Nothing to stash"

# Perform the checkout
log "INFO" "Checking out commit: $TARGET_COMMIT"
if ! git checkout $TARGET_COMMIT; then
    log "ERROR" "Failed to checkout commit $TARGET_COMMIT"
    git checkout $CURRENT_COMMIT  # Try to return to previous state
    exit 1
fi

# Update dependencies
log "INFO" "Updating dependencies for the rolled-back version"
source "$VENV_DIR/bin/activate" || { log "ERROR" "Failed to activate virtual environment"; exit 1; }

# Install appropriate requirements version
if ! uv uv pip install -r requirements.txt; then
    log "ERROR" "Failed to install dependencies for rolled-back version"
    git checkout $CURRENT_COMMIT  # Return to previous state
    uv uv pip install -r requirements.txt  # Restore previous dependencies
    exit 1
fi

# Run database migrations
log "INFO" "Running database migrations for rolled-back version"

# First, create a backup
FLASK_APP=wsgi.py flask db backup || log "WARN" "Failed to backup database before migration rollback"

# Run migration
if ! FLASK_APP=wsgi.py flask db upgrade; then
    log "ERROR" "Database migration failed for rolled-back version"
    
    # Try to restore database
    log "INFO" "Attempting to restore database from backup"
    FLASK_APP=wsgi.py flask db restore --force || log "ERROR" "Failed to restore database backup"
    
    # Return to previous code state
    git checkout $CURRENT_COMMIT
    uv uv pip install -r requirements.txt
    exit 1
fi

# Restart service
log "INFO" "Restarting service"
if ! sudo systemctl restart "$SERVICE_NAME"; then
    log "ERROR" "Failed to restart service after rollback"
    exit 1
fi

# Verify service is running
log "INFO" "Verifying service status"
sleep 5  # Wait a moment for the service to start
if ! sudo systemctl is-active --quiet "$SERVICE_NAME"; then
    log "ERROR" "Service failed to start after rollback"
    
    # Emergency rollback to original state
    log "INFO" "Emergency rollback to original state"
    git checkout $CURRENT_COMMIT
    uv uv pip install -r requirements.txt
    FLASK_APP=wsgi.py flask db upgrade
    sudo systemctl restart "$SERVICE_NAME"
    
    exit 1
fi

# Verify application is responding
log "INFO" "Verifying application health"
HEALTH_URL="http://localhost:5000/health"
MAX_RETRIES=6
RETRY_DELAY=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")
    
    if [ "$RESPONSE" = "200" ]; then
        log "INFO" "Application is healthy after rollback"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        
        if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
            log "ERROR" "Application health check failed after rollback"
            
            # Emergency rollback to original state
            log "INFO" "Emergency rollback to original state"
            git checkout $CURRENT_COMMIT
            uv uv pip install -r requirements.txt
            FLASK_APP=wsgi.py flask db upgrade
            sudo systemctl restart "$SERVICE_NAME"
            
            exit 1
        else
            log "WARN" "Application not healthy yet (HTTP $RESPONSE), retrying in $RETRY_DELAY seconds..."
            sleep $RETRY_DELAY
        fi
    fi
done

# Rollback successful
log "INFO" "Rollback completed successfully to commit $TARGET_COMMIT"
log "INFO" "Previous commit was $CURRENT_COMMIT"

exit 0
```

### Static Asset Recovery

Create a script to recover static assets:

```bash
#!/bin/bash
# recover_assets.sh - Recover static assets from backup

# Configuration
APP_DIR="/path/to/journal"
ASSETS_DIR="$APP_DIR/static"
BACKUP_DIR="$APP_DIR/backups/assets"
LOG_DIR="$APP_DIR/logs"
ASSET_LOG="$LOG_DIR/asset_operations.log"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

# Create directories if they don't exist
mkdir -p "$BACKUP_DIR"
mkdir -p "$LOG_DIR"

# Function to log messages
log() {
    local level=$1
    local message=$2
    echo "$(date +"%Y-%m-%d %H:%M:%S") [$level] $message" | tee -a "$ASSET_LOG"
}

# Check if a backup version is specified
if [ $# -ne 1 ]; then
    log "ERROR" "Usage: $0 BACKUP_VERSION"
    log "ERROR" "Available backups:"
    ls -la "$BACKUP_DIR"
    exit 1
fi

BACKUP_VERSION=$1
BACKUP_PATH="$BACKUP_DIR/$BACKUP_VERSION"

# Check if the specified backup exists
if [ ! -d "$BACKUP_PATH" ]; then
    log "ERROR" "Backup version $BACKUP_VERSION not found in $BACKUP_DIR"
    log "ERROR" "Available backups:"
    ls -la "$BACKUP_DIR"
    exit 1
fi

log "INFO" "Starting static asset recovery from $BACKUP_VERSION"

# Create a backup of current assets first
CURRENT_BACKUP="$BACKUP_DIR/pre_recovery_$TIMESTAMP"
log "INFO" "Backing up current assets to $CURRENT_BACKUP"
mkdir -p "$CURRENT_BACKUP"
cp -r "$ASSETS_DIR"/* "$CURRENT_BACKUP/" || { log "ERROR" "Failed to backup current assets"; exit 1; }

# Recover assets from backup
log "INFO" "Recovering assets from $BACKUP_PATH"
cp -r "$BACKUP_PATH"/* "$ASSETS_DIR/" || { log "ERROR" "Failed to recover assets"; exit 1; }

log "INFO" "Asset recovery completed successfully"
log "INFO" "If needed, you can revert to previous state using: $0 pre_recovery_$TIMESTAMP"

exit 0
```

Backup script for assets:

```bash
#!/bin/bash
# backup_assets.sh - Backup static assets

# Configuration
APP_DIR="/path/to/journal"
ASSETS_DIR="$APP_DIR/static"
BACKUP_DIR="$APP_DIR/backups/assets"
LOG_DIR="$APP_DIR/logs"
ASSET_LOG="$LOG_DIR/asset_operations.log"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

# Create directories if they don't exist
mkdir -p "$BACKUP_DIR"
mkdir -p "$LOG_DIR"

# Function to log messages
log() {
    local level=$1
    local message=$2
    echo "$(date +"%Y-%m-%d %H:%M:%S") [$level] $message" | tee -a "$ASSET_LOG"
}

# Create backup directory for this version
BACKUP_PATH="$BACKUP_DIR/$TIMESTAMP"
mkdir -p "$BACKUP_PATH"

log "INFO" "Starting static asset backup to $BACKUP_PATH"

# Copy assets to backup directory
cp -r "$ASSETS_DIR"/* "$BACKUP_PATH/" || { log "ERROR" "Failed to backup assets"; exit 1; }

log "INFO" "Asset backup completed successfully"
log "INFO" "To recover these assets, use: ./recover_assets.sh $TIMESTAMP"

# Clean up old backups - keep only last 10
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR" | wc -l)
if [ $BACKUP_COUNT -gt 10 ]; then
    log "INFO" "Cleaning up old asset backups"
    ls -1t "$BACKUP_DIR" | tail -n +11 | xargs -I {} rm -rf "$BACKUP_DIR/{}"
fi

exit 0
```

### Configuration Rollback

Implement configuration rollback support:

```bash
#!/bin/bash
# config_tools.sh - Configuration management utilities

# Configuration
APP_DIR="/path/to/journal"
CONFIG_DIR="$APP_DIR/instance"
BACKUP_DIR="$APP_DIR/backups/config"
LOG_DIR="$APP_DIR/logs"
CONFIG_LOG="$LOG_DIR/config_operations.log"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

# Create directories if they don't exist
mkdir -p "$BACKUP_DIR"
mkdir -p "$LOG_DIR"

# Function to log messages
log() {
    local level=$1
    local message=$2
    echo "$(date +"%Y-%m-%d %H:%M:%S") [$level] $message" | tee -a "$CONFIG_LOG"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 COMMAND [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  backup         Create a backup of current configuration"
    echo "  restore ID     Restore configuration from backup ID"
    echo "  list           List available configuration backups"
    echo "  validate       Validate current configuration"
    echo ""
    echo "Options:"
    echo "  -f, --force    Force action without prompting"
}

# Parse command
if [ $# -lt 1 ]; then
    show_usage
    exit 1
fi

COMMAND=$1
shift

case $COMMAND in
    backup)
        # Create backup directory for this version
        BACKUP_PATH="$BACKUP_DIR/$TIMESTAMP"
        mkdir -p "$BACKUP_PATH"
        
        log "INFO" "Starting configuration backup to $BACKUP_PATH"
        
        # Copy configuration files
        cp "$CONFIG_DIR/config.py" "$BACKUP_PATH/config.py" || { log "ERROR" "Failed to backup main config"; exit 1; }
        
        # Copy other configuration files if they exist
        if [ -f "$CONFIG_DIR/.env" ]; then
            cp "$CONFIG_DIR/.env" "$BACKUP_PATH/.env" || log "WARN" "Failed to backup .env file"
        fi
        
        if [ -f "$CONFIG_DIR/logging.conf" ]; then
            cp "$CONFIG_DIR/logging.conf" "$BACKUP_PATH/logging.conf" || log "WARN" "Failed to backup logging.conf"
        fi
        
        log "INFO" "Configuration backup completed successfully"
        log "INFO" "To restore this configuration, use: $0 restore $TIMESTAMP"
        
        # Clean up old backups - keep only last 10
        BACKUP_COUNT=$(ls -1 "$BACKUP_DIR" | wc -l)
        if [ $BACKUP_COUNT -gt 10 ]; then
            log "INFO" "Cleaning up old configuration backups"
            ls -1t "$BACKUP_DIR" | tail -n +11 | xargs -I {} rm -rf "$BACKUP_DIR/{}"
        fi
        ;;
        
    restore)
        if [ $# -lt 1 ]; then
            log "ERROR" "Backup ID required for restore"
            echo "Usage: $0 restore BACKUP_ID [--force]"
            exit 1
        fi
        
        BACKUP_ID=$1
        shift
        
        # Check for force flag
        FORCE=0
        while [ $# -gt 0 ]; do
            case $1 in
                -f|--force) FORCE=1 ;;
                *) log "WARN" "Unknown option: $1" ;;
            esac
            shift
        done
        
        BACKUP_PATH="$BACKUP_DIR/$BACKUP_ID"
        
        # Check if the specified backup exists
        if [ ! -d "$BACKUP_PATH" ]; then
            log "ERROR" "Backup ID $BACKUP_ID not found in $BACKUP_DIR"
            log "ERROR" "Available backups:"
            ls -la "$BACKUP_DIR"
            exit 1
        fi
        
        log "INFO" "Starting configuration restore from $BACKUP_ID"
        
        # Confirm restore unless forced
        if [ $FORCE -eq 0 ]; then
            read -p "This will overwrite current configuration. Continue? [y/N] " CONFIRM
            if [[ ! $CONFIRM =~ ^[Yy] ]]; then
                log "INFO" "Configuration restore aborted by user"
                exit 0
            fi
        fi
        
        # Backup current configuration first
        CURRENT_BACKUP="$BACKUP_DIR/pre_restore_$TIMESTAMP"
        mkdir -p "$CURRENT_BACKUP"
        cp "$CONFIG_DIR/config.py" "$CURRENT_BACKUP/config.py" || log "WARN" "Failed to backup current config before restore"
        
        # Restore configuration files
        cp "$BACKUP_PATH/config.py" "$CONFIG_DIR/config.py" || { log "ERROR" "Failed to restore main config"; exit 1; }
        
        # Restore other configuration files if they exist in the backup
        if [ -f "$BACKUP_PATH/.env" ]; then
            cp "$BACKUP_PATH/.env" "$CONFIG_DIR/.env" || log "WARN" "Failed to restore .env file"
        fi
        
        if [ -f "$BACKUP_PATH/logging.conf" ]; then
            cp "$BACKUP_PATH/logging.conf" "$CONFIG_DIR/logging.conf" || log "WARN" "Failed to restore logging.conf"
        fi
        
        log "INFO" "Configuration restore completed successfully"
        log "INFO" "If needed, you can revert to previous configuration using: $0 restore pre_restore_$TIMESTAMP"
        ;;
        
    list)
        log "INFO" "Listing available configuration backups"
        echo "Available configuration backups:"
        echo "ID                     Date"
        echo "---------------------- ----------------------------"
        for backup in $(ls -1 "$BACKUP_DIR"); do
            # Extract date from backup ID if possible
            if [[ $backup =~ ^[0-9]{14}$ ]]; then
                DATE=$(date -d "$(echo $backup | sed 's/\([0-9]\{4\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)/\1-\2-\3 \4:\5:\6/')" '+%Y-%m-%d %H:%M:%S')
            else
                DATE="Unknown"
            fi
            echo "$backup        $DATE"
        done
        ;;
        
    validate)
        log "INFO" "Validating current configuration"
        
        # Check if config file exists
        if [ ! -f "$CONFIG_DIR/config.py" ]; then
            log "ERROR" "Configuration file not found: $CONFIG_DIR/config.py"
            exit 1
        fi
        
        # Basic syntax check
        python3 -c "exec(open('$CONFIG_DIR/config.py').read())" 2>/dev/null
        if [ $? -ne 0 ]; then
            log "ERROR" "Configuration file contains syntax errors"
            python3 -c "exec(open('$CONFIG_DIR/config.py').read())"  # Show the actual error
            exit 1
        fi
        
        # Use Flask validation command if available
        cd "$APP_DIR"
        export FLASK_APP=wsgi.py
        flask config validate 2>/dev/null
        if [ $? -ne 0 ]; then
            log "ERROR" "Configuration validation failed"
            flask config validate  # Show the actual error
            exit 1
        fi
        
        log "INFO" "Configuration validation passed"
        ;;
        
    *)
        log "ERROR" "Unknown command: $COMMAND"
        show_usage
        exit 1
        ;;
esac

exit 0
```

## Health Checks

### Application Health Check

Implement a health check endpoint in the Flask application:

```python
# app/routes/health.py
from flask import Blueprint, jsonify, current_app
import time
import psutil
import os
import platform
from sqlalchemy.exc import SQLAlchemyError
import redis

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint.
    Returns status of application and its dependencies.
    """
    health_data = {
        'status': 'ok',
        'timestamp': time.time(),
        'version': current_app.config.get('VERSION', 'unknown'),
        'components': {}
    }
    
    # Check database connection
    try:
        from app import db
        # Execute a simple query
        db.session.execute('SELECT 1').fetchall()
        health_data['components']['database'] = {
            'status': 'ok'
        }
    except SQLAlchemyError as e:
        health_data['components']['database'] = {
            'status': 'error',
            'message': str(e)
        }
        health_data['status'] = 'degraded'
    
    # Check Redis connection
    try:
        redis_client = redis.from_url(current_app.config.get('REDIS_URL'))
        redis_client.ping()
        health_data['components']['redis'] = {
            'status': 'ok'
        }
    except Exception as e:
        health_data['components']['redis'] = {
            'status': 'error',
            'message': str(e)
        }
        health_data['status'] = 'degraded'
    
    # Check filesystem access
    try:
        # Check write access to instance directory
        instance_path = current_app.instance_path
        test_file = os.path.join(instance_path, '.health_check')
        with open(test_file, 'w') as f:
            f.write('test')
        os.remove(test_file)
        
        health_data['components']['filesystem'] = {
            'status': 'ok'
        }
    except Exception as e:
        health_data['components']['filesystem'] = {
            'status': 'error',
            'message': str(e)
        }
        health_data['status'] = 'degraded'
    
    # Add system info
    health_data['system'] = {
        'python_version': platform.python_version(),
        'platform': platform.platform(),
        'memory_usage_percent': psutil.virtual_memory().percent,
        'cpu_usage_percent': psutil.cpu_percent(interval=0.1)
    }
    
    # Determine overall status
    if any(c['status'] == 'error' for c in health_data['components'].values()):
        health_data['status'] = 'error'
    
    return jsonify(health_data)

# Register the blueprint in app/__init__.py
def register_blueprints(app):
    from app.routes.health import health_bp
    app.register_blueprint(health_bp)
```

### Database Verification

Implement a database verification command:

```python
# app/cli/verify_commands.py
import click
from flask import current_app
from flask.cli import with_appcontext
from sqlalchemy import inspect, text
import time

@click.group()
def verify_cli():
    """Verification commands."""
    pass

@verify_cli.command('db')
@click.option('--repair', is_flag=True, help='Attempt to repair detected issues')
@with_appcontext
def verify_db(repair):
    """Verify database structure and integrity."""
    from app import db
    
    click.echo("Starting database verification...")
    start_time = time.time()
    
    issues_found = False
    
    # Get SQLAlchemy inspector
    inspector = inspect(db.engine)
    
    # Check tables
    tables = inspector.get_table_names()
    expected_tables = ['user', 'entry', 'tag', 'entry_tags', 'profile']
    
    click.echo(f"Found {len(tables)} tables: {', '.join(tables)}")
    
    # Check for missing tables
    missing_tables = [table for table in expected_tables if table not in tables]
    if missing_tables:
        issues_found = True
        click.echo(f"ERROR: Missing tables: {', '.join(missing_tables)}")
        
        if repair:
            click.echo("Attempting to repair missing tables...")
            # Generate schemas for missing tables
            db.metadata.tables = {k: v for k, v in db.metadata.tables.items() if k in missing_tables}
            db.create_all()
            click.echo("Schema creation attempted.")
    
    # Check columns in each table
    for table in tables:
        if table in ['alembic_version']:  # Skip alembic table
            continue
            
        columns = {c['name']: c for c in inspector.get_columns(table)}
        click.echo(f"Checking table '{table}' - found {len(columns)} columns")
        
        # Verify based on model schema
        model = None
        if table == 'user':
            from app.models.user import User
            model = User
        elif table == 'entry':
            from app.models.content import Entry
            model = Entry
        elif table == 'tag':
            from app.models.content import Tag
            model = Tag
        
        if model:
            for column_attr in model.__table__.columns:
                column_name = column_attr.name
                if column_name not in columns:
                    issues_found = True
                    click.echo(f"ERROR: Missing column '{column_name}' in table '{table}'")
    
    # Run PRAGMA integrity_check on PostgreSQL
    if 'PostgreSQL' in current_app.config['SQLALCHEMY_DATABASE_URI']:
        result = db.session.execute(text('PRAGMA integrity_check')).scalar()
        if result != 'ok':
            issues_found = True
            click.echo(f"ERROR: Database integrity check failed: {result}")
    
    # Check for orphaned records in relationship tables
    if 'entry_tags' in tables:
        orphaned = db.session.execute(text('''
            SELECT COUNT(*) FROM entry_tags 
            WHERE entry_id NOT IN (SELECT id FROM entry) 
            OR tag_id NOT IN (SELECT id FROM tag)
        ''')).scalar()
        
        if orphaned > 0:
            issues_found = True
            click.echo(f"ERROR: Found {orphaned} orphaned records in entry_tags table")
            
            if repair:
                click.echo("Attempting to remove orphaned records...")
                db.session.execute(text('''
                    DELETE FROM entry_tags 
                    WHERE entry_id NOT IN (SELECT id FROM entry) 
                    OR tag_id NOT IN (SELECT id FROM tag)
                '''))
                db.session.commit()
                click.echo("Orphaned records removed.")
    
    # Summary
    elapsed_time = time.time() - start_time
    click.echo(f"Database verification completed in {elapsed_time:.2f} seconds")
    
    if issues_found:
        click.echo("RESULT: Issues were found in the database")
        return 1
    else:
        click.echo("RESULT: Database verification passed")
        return 0
```

### Cache and Session Verification

Implement Redis verification:

```python
# app/cli/verify_commands.py (continued)
@verify_cli.command('redis')
@click.option('--flush', is_flag=True, help='Flush cache if issues are found')
@with_appcontext
def verify_redis(flush):
    """Verify Redis cache and session storage."""
    import redis
    
    redis_url = current_app.config.get('REDIS_URL', 'redis://localhost:6379/0')
    click.echo(f"Verifying Redis at {redis_url}...")
    
    try:
        # Connect to Redis
        r = redis.from_url(redis_url)
        
        # Check connection
        if not r.ping():
            click.echo("ERROR: Redis ping failed")
            return 1
        
        # Check memory usage
        info = r.info('memory')
        used_memory = info.get('used_memory_human', 'unknown')
        max_memory = info.get('maxmemory_human', 'unlimited')
        
        click.echo(f"Redis memory usage: {used_memory} (max: {max_memory})")
        
        # Check key count
        key_count = r.dbsize()
        click.echo(f"Redis key count: {key_count}")
        
        # Check session keys
        session_prefix = current_app.config.get('SESSION_KEY_PREFIX', 'session:')
        session_keys = r.keys(f"{session_prefix}*")
        click.echo(f"Session key count: {len(session_keys)}")
        
        # Check for expired sessions
        expired_sessions = 0
        for key in session_keys:
            if not r.exists(key):
                expired_sessions += 1
        
        if expired_sessions > 0:
            click.echo(f"WARNING: Found {expired_sessions} expired session keys")
            
            if flush:
                for key in session_keys:
                    if not r.exists(key):
                        r.delete(key)
                click.echo("Expired sessions deleted")
        
        # Check cache keys
        cache_keys = r.keys("cache:*")
        click.echo(f"Cache key count: {len(cache_keys)}")
        
        # If there are too many keys, it might indicate a memory leak
        if key_count > 100000:  # Arbitrary threshold, adjust based on your app
            click.echo("WARNING: Large number of keys detected. Possible memory leak.")
            
            if flush:
                click.echo("Flushing cache keys...")
                for key in cache_keys:
                    r.delete(key)
                click.echo("Cache flushed")
        
        click.echo("Redis verification passed")
        return 0
    except Exception as e:
        click.echo(f"ERROR: Redis verification failed: {str(e)}")
        return 1
```

### Deployment Status Notification

Create a notification system for deployment status:

```python
# app/utils/notify.py
import requests
import socket
import json
import platform
import os
from datetime import datetime
from flask import current_app

class DeploymentNotifier:
    """Send notifications about deployment status."""
    
    def __init__(self, app=None):
        self.app = app
        self.config = {}
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        self.app = app
        self.config = {
            'slack_webhook': app.config.get('DEPLOYMENT_SLACK_WEBHOOK'),
            'email_to': app.config.get('DEPLOYMENT_EMAIL_TO'),
            'notification_enabled': app.config.get('DEPLOYMENT_NOTIFICATION_ENABLED', True)
        }
    
    def _get_system_info(self):
        """Get system information for notifications."""
        return {
            'hostname': socket.gethostname(),
            'platform': platform.platform(),
            'python_version': platform.python_version(),
            'timestamp': datetime.now().isoformat()
        }
    
    def send_slack_notification(self, status, details=None):
        """Send deployment notification to Slack."""
        if not self.config.get('notification_enabled'):
            return
        
        if not self.config.get('slack_webhook'):
            current_app.logger.warning("Slack webhook not configured, notification not sent")
            return
        
        system_info = self._get_system_info()
        
        # Determine color based on status
        color = "#36a64f"  # Green for success
        if status.lower() == 'failure':
            color = "#ff0000"  # Red for failure
        elif status.lower() == 'warning':
            color = "#ffcc00"  # Yellow for warning
        
        # Create Slack message payload
        payload = {
            "attachments": [
                {
                    "fallback": f"Deployment {status} on {system_info['hostname']}",
                    "color": color,
                    "title": f"Deployment {status.capitalize()}",
                    "fields": [
                        {
                            "title": "Environment",
                            "value": self.app.config.get('ENV', 'production'),
                            "short": True
                        },
                        {
                            "title": "Host",
                            "value": system_info['hostname'],
                            "short": True
                        },
                        {
                            "title": "Time",
                            "value": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                            "short": True
                        },
                        {
                            "title": "Version",
                            "value": self.app.config.get('VERSION', 'unknown'),
                            "short": True
                        }
                    ],
                    "footer": f"Python {system_info['python_version']} on {system_info['platform']}"
                }
            ]
        }
        
        # Add details field if provided
        if details:
            payload["attachments"][0]["fields"].append({
                "title": "Details",
                "value": details,
                "short": False
            })
        
        try:
            response = requests.post(
                self.config['slack_webhook'],
                data=json.dumps(payload),
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code != 200:
                current_app.logger.error(f"Slack notification failed: {response.status_code} {response.text}")
        except Exception as e:
            current_app.logger.error(f"Failed to send Slack notification: {str(e)}")
    
    def send_email_notification(self, status, details=None):
        """Send deployment notification email."""
        if not self.config.get('notification_enabled'):
            return
        
        if not self.config.get('email_to'):
            current_app.logger.warning("Email notification not configured, notification not sent")
            return
        
        # This is a simplified implementation. In a real app, you might use Flask-Mail
        # or another email service. For this example, we'll just output to the logger.
        system_info = self._get_system_info()
        current_app.logger.info(f"Email notification: Deployment {status} on {system_info['hostname']}")
        current_app.logger.info(f"Would send email to: {self.config['email_to']}")
    
    def notify_deployment_start(self, details=None):
        """Send notification that deployment has started."""
        self.send_slack_notification("started", details)
        self.send_email_notification("started", details)
    
    def notify_deployment_success(self, details=None):
        """Send notification that deployment was successful."""
        self.send_slack_notification("success", details)
        self.send_email_notification("success", details)
    
    def notify_deployment_failure(self, details=None):
        """Send notification that deployment failed."""
        self.send_slack_notification("failure", details)
        self.send_email_notification("failure", details)
```

Usage in a Flask command:

```python
# app/cli/deploy_commands.py
import click
from flask import current_app
from flask.cli import with_appcontext
import time
import os
import subprocess

@click.command('deploy')
@click.option('--version', help='Version or git reference to deploy')
@with_appcontext
def deploy_command(version):
    """Deploy the application."""
    from app.utils.notify import DeploymentNotifier
    
    notifier = DeploymentNotifier(current_app)
    
    click.echo("Starting deployment process...")
    start_time = time.time()
    
    try:
        # Notify deployment start
        notifier.notify_deployment_start(f"Deploying version: {version or 'latest'}")
        
        # Run deployment script
        script_path = os.path.join(current_app.root_path, '..', 'scripts', 'deploy.sh')
        
        cmd = [script_path]
        if version:
            cmd.extend(['-c', version])
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            click.echo(f"Deployment failed with code {result.returncode}")
            click.echo(result.stderr)
            
            # Notify failure
            notifier.notify_deployment_failure(f"Exit code: {result.returncode}\n\nError: {result.stderr}")
            return 1
        
        # Deployment succeeded
        elapsed_time = time.time() - start_time
        click.echo(f"Deployment completed successfully in {elapsed_time:.2f} seconds")
        click.echo(result.stdout)
        
        # Notify success
        notifier.notify_deployment_success(f"Deployed in {elapsed_time:.2f} seconds")
        return 0
    except Exception as e:
        # Handle unexpected errors
        click.echo(f"Deployment failed with exception: {str(e)}")
        
        # Notify failure
        notifier.notify_deployment_failure(f"Exception: {str(e)}")
        return 1
```

## Security Considerations

### Secret Management

Implement secure secret handling:

```python
# app/utils/secrets.py
import os
import json
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from flask import current_app

class SecretManager:
    """
    Manage sensitive configuration data with encryption.
    """
    
    def __init__(self, app=None):
        self.app = app
        self.key = None
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        self.app = app
        
        # Initialize encryption key
        self._setup_key()
    
    def _setup_key(self):
        """Set up encryption key from environment or derive from app secret."""
        # Try to get key from environment
        env_key = os.environ.get('SECRET_ENCRYPTION_KEY')
        
        if env_key:
            # Key is provided via environment
            try:
                self.key = base64.urlsafe_b64decode(env_key)
                return
            except Exception:
                self.app.logger.warning("Invalid SECRET_ENCRYPTION_KEY format in environment")
        
        # Derive key from app secret key
        if self.app.secret_key:
            salt = b'journal_app_salt'  # Should be a random value stored securely
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt,
                iterations=100000
            )
            self.key = base64.urlsafe_b64encode(kdf.derive(self.app.secret_key.encode()))
        else:
            self.app.logger.error("No secret key configured. Secrets will not be encrypted!")
            self.key = None
    
    def encrypt(self, data):
        """
        Encrypt sensitive data.
        
        Args:
            data: String or dict to encrypt
        
        Returns:
            Encrypted data as a base64 string
        """
        if not self.key:
            return None
        
        # Convert dict to JSON if necessary
        if isinstance(data, dict):
            data = json.dumps(data)
        
        # Encrypt
        f = Fernet(self.key)
        encrypted = f.encrypt(data.encode())
        
        # Return as base64 string
        return base64.urlsafe_b64encode(encrypted).decode()
    
    def decrypt(self, encrypted_data):
        """
        Decrypt sensitive data.
        
        Args:
            encrypted_data: Encrypted base64 string
        
        Returns:
            Decrypted data
        """
        if not self.key or not encrypted_data:
            return None
        
        try:
            # Decode base64
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_data)
            
            # Decrypt
            f = Fernet(self.key)
            decrypted = f.decrypt(encrypted_bytes).decode()
            
            # Try to parse as JSON
            try:
                return json.loads(decrypted)
            except json.JSONDecodeError:
                # Return as string if not valid JSON
                return decrypted
        except Exception as e:
            self.app.logger.error(f"Failed to decrypt data: {str(e)}")
            return None
    
    def load_secrets_file(self, path):
        """
        Load secrets from an encrypted file.
        
        Args:
            path: Path to secrets file
        
        Returns:
            Decrypted secrets as dict
        """
        if not os.path.exists(path):
            return {}
        
        try:
            with open(path, 'r') as f:
                encrypted_data = f.read().strip()
            
            return self.decrypt(encrypted_data) or {}
        except Exception as e:
            self.app.logger.error(f"Failed to load secrets file: {str(e)}")
            return {}
    
    def save_secrets_file(self, path, secrets):
        """
        Save secrets to an encrypted file.
        
        Args:
            path: Path to secrets file
            secrets: Dict of secrets to save
        """
        try:
            encrypted_data = self.encrypt(secrets)
            
            if encrypted_data:
                # Create directory if it doesn't exist
                os.makedirs(os.path.dirname(path), exist_ok=True)
                
                # Save with minimal permissions
                with open(path, 'w') as f:
                    f.write(encrypted_data)
                
                # Set secure permissions (readable only by owner)
                os.chmod(path, 0o600)
            else:
                self.app.logger.error("Failed to encrypt secrets for saving")
        except Exception as e:
            self.app.logger.error(f"Failed to save secrets file: {str(e)}")
```

CLI tool for secrets management:

```bash
#!/bin/bash
# secrets_manager.sh - Manage application secrets

# Configuration
APP_DIR="/path/to/journal"
CONFIG_DIR="$APP_DIR/instance"
SECRETS_FILE="$CONFIG_DIR/secrets.enc"
LOG_DIR="$APP_DIR/logs"
SECRETS_LOG="$LOG_DIR/secrets_operations.log"

# Check environment
if [ -z "$SECRET_ENCRYPTION_KEY" ]; then
    echo "ERROR: SECRET_ENCRYPTION_KEY environment variable not set"
    exit 1
fi

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to log messages
log() {
    local level=$1
    local message=$2
    echo "$(date +"%Y-%m-%d %H:%M:%S") [$level] $message" | tee -a "$SECRETS_LOG"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 COMMAND [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  set KEY VALUE    Set a secret value"
    echo "  get KEY          Get a secret value"
    echo "  list             List all secret keys (without values)"
    echo "  delete KEY       Delete a secret"
    echo "  rotate           Rotate encryption key"
    echo ""
    echo "Examples:"
    echo "  $0 set DATABASE_PASSWORD mySecurePassword"
    echo "  $0 get API_KEY"
    echo "  $0 list"
    echo "  $0 delete OLD_KEY"
}

# Parse command
if [ $# -lt 1 ]; then
    show_usage
    exit 1
fi

COMMAND=$1
shift

# Use Flask CLI to delegate to Python
cd "$APP_DIR"
export FLASK_APP=wsgi.py

case $COMMAND in
    set)
        if [ $# -lt 2 ]; then
            echo "ERROR: Key and value are required"
            echo "Usage: $0 set KEY VALUE"
            exit 1
        fi
        
        KEY=$1
        VALUE=$2
        
        log "INFO" "Setting secret: $KEY"
        flask secrets set "$KEY" "$VALUE"
        exit $?
        ;;
        
    get)
        if [ $# -lt 1 ]; then
            echo "ERROR: Key is required"
            echo "Usage: $0 get KEY"
            exit 1
        fi
        
        KEY=$1
        flask secrets get "$KEY"
        exit $?
        ;;
        
    list)
        flask secrets list
        exit $?
        ;;
        
    delete)
        if [ $# -lt 1 ]; then
            echo "ERROR: Key is required"
            echo "Usage: $0 delete KEY"
            exit 1
        fi
        
        KEY=$1
        log "INFO" "Deleting secret: $KEY"
        flask secrets delete "$KEY"
        exit $?
        ;;
        
    rotate)
        log "INFO" "Rotating encryption key"
        
        # Generate new key
        NEW_KEY=$(openssl rand -base64 32)
        
        # Export keys for flask command
        export NEW_ENCRYPTION_KEY="$NEW_KEY"
        
        flask secrets rotate
        EXIT_CODE=$?
        
        if [ $EXIT_CODE -eq 0 ]; then
            echo "Key rotation successful."
            echo "New encryption key: $NEW_KEY"
            echo "IMPORTANT: Update your environment with this new key!"
        fi
        
        exit $EXIT_CODE
        ;;
        
    *)
        echo "ERROR: Unknown command: $COMMAND"
        show_usage
        exit 1
        ;;
esac
```

### File Permission Handling

Create a script to manage file permissions:

```bash
#!/bin/bash
# secure_permissions.sh - Set secure file permissions

# Configuration
APP_DIR="/path/to/journal"
CONFIG_DIR="$APP_DIR/instance"
LOG_DIR="$APP_DIR/logs"
PERM_LOG="$LOG_DIR/permissions.log"
USER=$(whoami)
GROUP=$(id -gn)
SERVICE_USER="www-data"  # Web server user

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to log messages
log() {
    local level=$1
    local message=$2
    echo "$(date +"%Y-%m-%d %H:%M:%S") [$level] $message" | tee -a "$PERM_LOG"
}

log "INFO" "Setting secure file permissions"

# Ensure app directory is owned by current user
sudo chown -R $USER:$GROUP "$APP_DIR"
log "INFO" "Set ownership of $APP_DIR to $USER:$GROUP"

# Make instance directory readable by service user
sudo chown -R $USER:$SERVICE_USER "$CONFIG_DIR"
sudo chmod -R 750 "$CONFIG_DIR"
log "INFO" "Set permissions on $CONFIG_DIR to 750 (drwxr-x---)"

# Secure specific sensitive files
if [ -f "$CONFIG_DIR/secrets.enc" ]; then
    sudo chmod 640 "$CONFIG_DIR/secrets.enc"
    log "INFO" "Set permissions on secrets.enc to 640 (-rw-r-----)"
fi

if [ -f "$CONFIG_DIR/.env" ]; then
    sudo chmod 640 "$CONFIG_DIR/.env"
    log "INFO" "Set permissions on .env to 640 (-rw-r-----)"
fi

# Set log directory permissions
sudo chown -R $USER:$SERVICE_USER "$LOG_DIR"
sudo chmod -R 770 "$LOG_DIR"
log "INFO" "Set permissions on $LOG_DIR to 770 (drwxrwx---)"

# Set proper permissions on instance database
if [ -f "$CONFIG_DIR/journal" ]; then
    sudo chown $USER:$SERVICE_USER "$CONFIG_DIR/journal"
    sudo chmod 660 "$CONFIG_DIR/journal"
    log "INFO" "Set permissions on journal to 660 (-rw-rw----)"
fi

# Set proper permissions on static files
STATIC_DIR="$APP_DIR/static"
if [ -d "$STATIC_DIR" ]; then
    sudo chown -R $USER:$SERVICE_USER "$STATIC_DIR"
    sudo chmod -R 755 "$STATIC_DIR"
    log "INFO" "Set permissions on $STATIC_DIR to 755 (drwxr-xr-x)"
fi

# Set proper permissions on upload directory if it exists
UPLOAD_DIR="$APP_DIR/uploads"
if [ -d "$UPLOAD_DIR" ]; then
    sudo chown -R $USER:$SERVICE_USER "$UPLOAD_DIR"
    sudo chmod -R 770 "$UPLOAD_DIR"
    log "INFO" "Set permissions on $UPLOAD_DIR to 770 (drwxrwx---)"
fi

# Secure Python files
find "$APP_DIR" -type f -name "*.py" -exec sudo chmod 644 {} \;
log "INFO" "Set permissions on Python files to 644 (-rw-r--r--)"

# Secure shell scripts
find "$APP_DIR" -type f -name "*.sh" -exec sudo chmod 750 {} \;
log "INFO" "Set permissions on shell scripts to 750 (-rwxr-x---)"

# Report results
echo "Secure permissions have been set."
echo "Ownership and permissions:"
ls -la "$APP_DIR" | head -n 5
ls -la "$CONFIG_DIR" | head -n 5

exit 0
```

### Service User Constraints

Create a secure systemd service configuration:

```ini
# /etc/systemd/system/journal.service
[Unit]
Description=Personal Journal Flask Application
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/path/to/journal
Environment="FLASK_APP=wsgi.py"
Environment="FLASK_ENV=production"
Environment="PYTHONUNBUFFERED=1"

# Load environment variables from file
EnvironmentFile=/path/to/journal/instance/.env

# Resource constraints
MemoryLimit=512M
CPUQuota=50%
TasksMax=100
LimitNOFILE=4096

# Restart settings
Restart=on-failure
RestartSec=5s
StartLimitInterval=60s
StartLimitBurst=3

# Security settings
ProtectSystem=full
ProtectHome=true
PrivateTmp=true
NoNewPrivileges=true
ReadWritePaths=/path/to/journal/instance /path/to/journal/logs /path/to/journal/uploads
ReadOnlyPaths=/path/to/journal/app /path/to/journal/static

# Startup command
ExecStart=/path/to/journal/venv/bin/gunicorn --workers 2 --bind 127.0.0.1:8000 wsgi:app

# Standard output settings
StandardOutput=journal
StandardError=journal
SyslogIdentifier=journal

[Install]
WantedBy=multi-user.target
```

### Secure Backup Handling

Create a secure backup script:

```bash
#!/bin/bash
# secure_backup.sh - Create encrypted backups

# Configuration
APP_DIR="/path/to/journal"
BACKUP_DIR="$APP_DIR/backups"
LOG_DIR="$APP_DIR/logs"
BACKUP_LOG="$LOG_DIR/backups.log"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.tar.gz.enc"
GPG_RECIPIENT="your.email@journal.local"  # GPG key identifier

# Create directories if they don't exist
mkdir -p "$BACKUP_DIR"
mkdir -p "$LOG_DIR"

# Function to log messages
log() {
    local level=$1
    local message=$2
    echo "$(date +"%Y-%m-%d %H:%M:%S") [$level] $message" | tee -a "$BACKUP_LOG"
}

# Check if GPG is installed
if ! command -v gpg &> /dev/null; then
    log "ERROR" "GPG is not installed. Please install it before running this script."
    exit 1
fi

# Check if GPG recipient key exists
if ! gpg --list-keys "$GPG_RECIPIENT" &> /dev/null; then
    log "ERROR" "GPG key for $GPG_RECIPIENT not found. Please import the key first."
    exit 1
fi

log "INFO" "Starting encrypted backup"

# Create temporary directory
TEMP_DIR=$(mktemp -d)
log "INFO" "Created temporary directory: $TEMP_DIR"

# Ensure temporary directory is deleted on exit
trap "rm -rf $TEMP_DIR" EXIT

# Backup database
DB_PATH="$APP_DIR/instance/journal"
if [ -f "$DB_PATH" ]; then
    PostgreSQL "$DB_PATH" ".backup '$TEMP_DIR/journal'"
    log "INFO" "Database backed up"
else
    log "ERROR" "Database file not found at $DB_PATH"
    exit 1
fi

# Backup configuration files
CONFIG_DIR="$APP_DIR/instance"
if [ -d "$CONFIG_DIR" ]; then
    cp -r "$CONFIG_DIR" "$TEMP_DIR/instance"
    log "INFO" "Configuration backed up"
else
    log "ERROR" "Configuration directory not found at $CONFIG_DIR"
    exit 1
fi

# Backup uploads if they exist
UPLOAD_DIR="$APP_DIR/uploads"
if [ -d "$UPLOAD_DIR" ]; then
    cp -r "$UPLOAD_DIR" "$TEMP_DIR/uploads"
    log "INFO" "Uploads backed up"
fi

# Create archive
cd "$TEMP_DIR"
tar -czf backup.tar.gz *
log "INFO" "Created archive"

# Encrypt the archive
gpg --encrypt --recipient "$GPG_RECIPIENT" --output "$BACKUP_FILE" --trust-model always backup.tar.gz
log "INFO" "Encrypted backup created: $BACKUP_FILE"

# Set secure permissions on backup file
chmod 600 "$BACKUP_FILE"

# Clean up old backups - keep only last 10
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/backup_*.tar.gz.enc 2>/dev/null | wc -l)
if [ $BACKUP_COUNT -gt 10 ]; then
    log "INFO" "Cleaning up old backups"
    ls -1t "$BACKUP_DIR"/backup_*.tar.gz.enc | tail -n +11 | xargs rm -f
fi

log "INFO" "Backup completed successfully"

# Output backup details
echo "Backup completed successfully."
echo "Backup file: $BACKUP_FILE"
echo "Size: $(du -h "$BACKUP_FILE" | cut -f1)"
echo "To restore: ./secure_restore.sh $BACKUP_FILE"

exit 0
```

Corresponding restore script:

```bash
#!/bin/bash
# secure_restore.sh - Restore from encrypted backup

# Configuration
APP_DIR="/path/to/journal"
LOG_DIR="$APP_DIR/logs"
RESTORE_LOG="$LOG_DIR/restore.log"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to log messages
log() {
    local level=$1
    local message=$2
    echo "$(date +"%Y-%m-%d %H:%M:%S") [$level] $message" | tee -a "$RESTORE_LOG"
}

# Check if GPG is installed
if ! command -v gpg &> /dev/null; then
    log "ERROR" "GPG is not installed. Please install it before running this script."
    exit 1
fi

# Parse arguments
if [ $# -ne 1 ]; then
    echo "Usage: $0 BACKUP_FILE"
    exit 1
fi

BACKUP_FILE=$1

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    log "ERROR" "Backup file not found: $BACKUP_FILE"
    exit 1
fi

log "INFO" "Starting restore from $BACKUP_FILE"

# Create temporary directory
TEMP_DIR=$(mktemp -d)
log "INFO" "Created temporary directory: $TEMP_DIR"

# Ensure temporary directory is deleted on exit
trap "rm -rf $TEMP_DIR" EXIT

# Decrypt backup file
log "INFO" "Decrypting backup file"
gpg --decrypt --output "$TEMP_DIR/backup.tar.gz" "$BACKUP_FILE" || { log "ERROR" "Failed to decrypt backup file"; exit 1; }

# Extract archive
log "INFO" "Extracting archive"
tar -xzf "$TEMP_DIR/backup.tar.gz" -C "$TEMP_DIR" || { log "ERROR" "Failed to extract archive"; exit 1; }

# Stop application service
log "INFO" "Stopping application service"
sudo systemctl stop journal || log "WARN" "Failed to stop service, continuing anyway"

# Backup current database
DB_PATH="$APP_DIR/instance/journal"
if [ -f "$DB_PATH" ]; then
    log "INFO" "Backing up current database"
    cp "$DB_PATH" "$DB_PATH.$TIMESTAMP.bak" || log "WARN" "Failed to backup current database"
fi

# Restore database
if [ -f "$TEMP_DIR/journal" ]; then
    log "INFO" "Restoring database"
    cp "$TEMP_DIR/journal" "$DB_PATH" || { log "ERROR" "Failed to restore database"; exit 1; }
    # Set proper permissions
    chown www-data:www-data "$DB_PATH" || log "WARN" "Failed to set database ownership"
    chmod 660 "$DB_PATH" || log "WARN" "Failed to set database permissions"
else
    log "ERROR" "Database not found in backup"
    exit 1
fi

# Restore configuration files
if [ -d "$TEMP_DIR/instance" ]; then
    log "INFO" "Restoring configuration files"
    # Exclude database file as we've already restored it
    rsync -av --exclude='journal' "$TEMP_DIR/instance/" "$APP_DIR/instance/" || { log "ERROR" "Failed to restore configuration"; exit 1; }
else
    log "ERROR" "Configuration not found in backup"
    exit 1
fi

# Restore uploads if they exist
if [ -d "$TEMP_DIR/uploads" ]; then
    log "INFO" "Restoring uploads"
    rsync -av "$TEMP_DIR/uploads/" "$APP_DIR/uploads/" || { log "ERROR" "Failed to restore uploads"; exit 1; }
fi

# Start application service
log "INFO" "Starting application service"
sudo systemctl start journal || { log "ERROR" "Failed to start service"; exit 1; }

log "INFO" "Restore completed successfully"

# Output restore details
echo "Restore completed successfully from $BACKUP_FILE"
echo "Original database backed up to $DB_PATH.$TIMESTAMP.bak"

exit 0
```

This comprehensive guide provides robust deployment practices for your Flask journal application. By implementing these scripts and utilities, you'll ensure reliable deployments with proper error handling, rollback mechanisms, health checks, and security considerations.
