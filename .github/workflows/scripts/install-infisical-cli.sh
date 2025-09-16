#!/usr/bin/env bash
# Usage: install-infisical-cli.sh [version]
# Example: install-infisical-cli.sh 0.149.0
# Note: Version parameter is ignored - Infisical doesn't provide versioned releases
# We always install from Cloudsmith which provides the latest stable version
set -euo pipefail

# Version parameter kept for compatibility but ignored
VER="${1:-latest}"
echo "Note: Infisical CLI doesn't support pinned versions via APT. Installing latest stable."

# Check if already installed
if command -v infisical &> /dev/null; then
  CURRENT_VER=$(infisical --version 2>&1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "unknown")
  echo "Infisical CLI already installed: ${CURRENT_VER}"
  exit 0
fi

# Check if this is optional (for workflows that don't strictly need it)
if [ "${INFISICAL_CLI_REQUIRED:-true}" = "false" ]; then
  echo "Infisical CLI not required for this workflow, skipping installation"
  exit 0
fi

echo "Installing Infisical CLI from Cloudsmith APT repository..."

# First check if Cloudsmith is accessible
echo "Checking Cloudsmith availability..."
if ! curl -fsSL --connect-timeout 5 --max-time 10 -o /dev/null -w "%{http_code}" \
  https://dl.cloudsmith.io/public/infisical/infisical-cli/config.json 2>/dev/null | grep -q "200\|404"; then
  echo "WARNING: Cloudsmith appears to be down (not returning 200 or 404)"
  echo "This is a temporary infrastructure issue outside our control."

  if [ "${INFISICAL_CLI_OPTIONAL:-false}" = "true" ]; then
    echo "Infisical CLI is optional, continuing without it"
    exit 0
  fi
fi

# Use bounded retries with exponential backoff
for i in 1 2 3; do
  echo "Attempt ${i}/3: Setting up Cloudsmith repository..."

  # Download the setup script first to check for errors
  if curl -fsSL --connect-timeout 10 --max-time 60 \
    -o /tmp/infisical-setup.sh \
    https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh; then

    # Check if we got an HTML error page instead of a script
    if head -n1 /tmp/infisical-setup.sh | grep -q "<"; then
      echo "Warning: Cloudsmith returned HTML (likely an error page)"
      rm -f /tmp/infisical-setup.sh
    else
      # Execute the script
      if sudo -E bash /tmp/infisical-setup.sh; then
        echo "Repository setup successful"
        rm -f /tmp/infisical-setup.sh
        break
      fi
    fi
  fi

  if [ $i -eq 3 ]; then
    echo "WARNING: Cloudsmith repository unavailable after 3 attempts"
    echo "This is likely a temporary issue with the Cloudsmith service."

    # Check if we can continue without Infisical CLI
    if [ "${INFISICAL_CLI_OPTIONAL:-false}" = "true" ]; then
      echo "Infisical CLI is optional for this workflow, continuing without it"
      exit 0
    else
      echo "Infisical CLI is required but cannot be installed."
      echo "Please retry the workflow in a few minutes."
      exit 1
    fi
  fi

  WAIT=$((2**i))
  echo "Cloudsmith might be experiencing issues. Retrying in ${WAIT} seconds..."
  sleep $WAIT
done

# Install with timeout
echo "Installing infisical package..."
if ! sudo timeout 120 apt-get update; then
  echo "Failed to update package list"
  exit 1
fi

if ! sudo timeout 120 apt-get install -y infisical; then
  echo "Failed to install infisical"
  exit 1
fi

# Verify installation
if ! infisical --version; then
  echo "Infisical CLI installation verification failed"
  exit 1
fi

echo "Infisical CLI installed successfully"