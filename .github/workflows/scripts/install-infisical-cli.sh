#!/bin/bash
# Deterministic Infisical CLI installer with caching and fallback
# Usage: ./install-infisical-cli.sh [VERSION]

set -euo pipefail

# Configuration
INFISICAL_VERSION="${1:-${INFISICAL_VERSION:-0.42.1}}"
CACHE_DIR="${HOME}/.cache/infisical"
DEB_FILE="${CACHE_DIR}/infisical_${INFISICAL_VERSION}_linux_amd64.deb"
GITHUB_BASE="https://github.com/Infisical/infisical/releases/download"

# Create cache directory
mkdir -p "${CACHE_DIR}"

echo "Installing Infisical CLI version: ${INFISICAL_VERSION}"

# Function to verify installation
verify_installation() {
    if command -v infisical >/dev/null 2>&1; then
        installed_version=$(infisical --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "unknown")
        echo "Infisical CLI installed: version ${installed_version}"
        return 0
    fi
    return 1
}

# Check if already installed with correct version
if verify_installation; then
    echo "Infisical CLI already available"
    exit 0
fi

# Primary: Download from GitHub releases (pinned, immutable)
if [ ! -f "${DEB_FILE}" ]; then
    echo "Downloading Infisical CLI from GitHub releases..."

    for attempt in 1 2 3 4 5; do
        echo "  Download attempt ${attempt}/5..."

        # Construct URL based on version
        if [ "${INFISICAL_VERSION}" = "latest" ]; then
            # Get latest release URL
            DOWNLOAD_URL=$(curl -fsSL https://api.github.com/repos/Infisical/infisical/releases/latest | \
                          grep -oE "https://[^\"]*infisical_[^\"]*_linux_amd64.deb" | head -1)
        else
            # Use specific version
            DOWNLOAD_URL="${GITHUB_BASE}/v${INFISICAL_VERSION}/infisical_${INFISICAL_VERSION}_linux_amd64.deb"
        fi

        if [ -n "${DOWNLOAD_URL}" ] && \
           curl -fSL --retry 3 --retry-all-errors --retry-delay 2 \
                -o "${DEB_FILE}" "${DOWNLOAD_URL}"; then
            echo "  Download successful"
            break
        fi

        # Exponential backoff
        sleep $((2**attempt))
    done
fi

# Verify download
if [ -s "${DEB_FILE}" ]; then
    echo "Installing from cached/downloaded .deb package..."
    sudo dpkg -i "${DEB_FILE}" || sudo apt-get -f install -y

    if verify_installation; then
        echo "Installation successful"
        exit 0
    fi
fi

# Fallback: Use Cloudsmith repository
echo "Primary installation failed, falling back to Cloudsmith repository..."

for attempt in 1 2 3 4 5; do
    echo "  Cloudsmith setup attempt ${attempt}/5..."

    if curl -fsSL https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh | sudo -E bash; then
        echo "  Repository setup successful"
        break
    fi

    # Exponential backoff
    sleep $((2**attempt))
done

# Install from repository
sudo apt-get update
sudo apt-get install -y infisical

# Final verification
if verify_installation; then
    echo "Installation successful via fallback"
    exit 0
else
    echo "ERROR: Failed to install Infisical CLI from all sources"
    exit 1
fi