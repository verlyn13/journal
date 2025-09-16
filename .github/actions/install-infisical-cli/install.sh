#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:?version required}"         # e.g. 0.42.1
OPTIONAL="${2:-false}"
CACHE_DIR="$HOME/.cache/infisical/${VERSION}"
BIN_PATH="/usr/local/bin/infisical"

mkdir -p "$CACHE_DIR"

# 1) Cache hit - check if already installed
if [ -x "$BIN_PATH" ]; then
  echo "::notice::Infisical already installed at $BIN_PATH"
  "$BIN_PATH" --version || true
  exit 0
fi
if [ -f "${CACHE_DIR}/infisical" ]; then
  echo "::notice::Using cached Infisical CLI from ${CACHE_DIR}"
  sudo install -m 0755 "${CACHE_DIR}/infisical" "$BIN_PATH"
  infisical --version
  exit 0
fi

# 2) GitHub Releases first (preferred)
OS="$(uname | tr '[:upper:]' '[:lower:]')"           # linux or darwin
ARCH="$(uname -m)"
# Map architecture naming if needed
case "$ARCH" in
  x86_64) ARCH="amd64" ;;
  aarch64) ARCH="arm64" ;;
esac

# Infisical uses different naming convention: infisical_${VERSION}_linux_amd64.tar.gz
TARBALL="infisical_${VERSION}_${OS}_${ARCH}.tar.gz"
BASE="https://github.com/Infisical/infisical/releases/download/v${VERSION}"
URL="${BASE}/${TARBALL}"
SUM_URL="${URL}.sha256"

echo "::group::Download from GitHub Release"
echo "Attempting to download from: $URL"
if curl -fL --retry 4 --retry-delay 3 --connect-timeout 10 --max-time 60 -o "${CACHE_DIR}/${TARBALL}" "$URL"; then
  echo "Download successful"

  # Try to verify checksum if available
  if curl -fsSL --retry 2 --connect-timeout 10 --max-time 30 -o "${CACHE_DIR}/${TARBALL}.sha256" "$SUM_URL"; then
    echo "Verifying checksum..."
    (cd "${CACHE_DIR}" && sha256sum -c "${TARBALL}.sha256")
  else
    echo "::warning::Checksum file not found at ${SUM_URL}; proceeding without verification"
  fi

  echo "Extracting tarball..."
  tar -xzf "${CACHE_DIR}/${TARBALL}" -C "${CACHE_DIR}"

  # The extracted binary is usually named 'infisical'
  if [ -f "${CACHE_DIR}/infisical" ]; then
    echo "Installing Infisical CLI to system..."
    sudo install -m 0755 "${CACHE_DIR}/infisical" "$BIN_PATH"
    echo "::endgroup::"
    echo "::notice::Successfully installed Infisical CLI from GitHub Release"
    infisical --version
    exit 0
  else
    echo "::error::Expected binary not found after extraction"
    ls -la "${CACHE_DIR}"
  fi
else
  echo "::warning::Failed to download from GitHub Release"
fi
echo "::endgroup::"

# 3) Cloudsmith APT repository fallback (bounded retries)
echo "::group::Cloudsmith APT Repository Fallback"
echo "::warning::Falling back to Cloudsmith APT repository..."

# Try to set up the repository with bounded retries
SETUP_SUCCESS=false
for i in 1 2 3; do
  echo "Repository setup attempt $i/3..."
  if curl -1sLf --retry 2 --retry-delay 2 --connect-timeout 10 --max-time 30 \
    'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash; then
    SETUP_SUCCESS=true
    break
  fi
  echo "::warning::Cloudsmith repo setup attempt $i/3 failed; retrying..."
  sleep $((2**i))
done

if [ "$SETUP_SUCCESS" = "true" ]; then
  echo "Repository added successfully, updating package list..."
  sudo apt-get update -qq

  echo "Installing infisical package..."
  if sudo apt-get install -y infisical; then
    echo "::endgroup::"
    echo "::notice::Successfully installed Infisical CLI from Cloudsmith APT repo"
    infisical --version

    # Cache the installed binary for next time
    if [ -x "$BIN_PATH" ]; then
      cp "$BIN_PATH" "${CACHE_DIR}/infisical"
    fi
    exit 0
  else
    echo "::error::Failed to install infisical package from APT"
  fi
else
  echo "::error::Failed to set up Cloudsmith APT repository after 3 attempts"
fi
echo "::endgroup::"

# 4) Final fallback or failure
echo "::error::All installation methods failed for Infisical CLI"
if [ "$OPTIONAL" = "true" ]; then
  echo "::warning::Installation marked as optional; continuing without Infisical CLI"
  exit 0
fi
exit 1