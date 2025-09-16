#!/usr/bin/env bash
set -euo pipefail

VER="${1:?usage: install-infisical-cli.sh <version>}"
OS=linux
ARCH="$(uname -m)"
case "$ARCH" in
  x86_64|amd64) ARCH=amd64 ;;
  aarch64|arm64) ARCH=arm64 ;;
  *) echo "Unsupported arch: $(uname -m)"; exit 1 ;;
esac

CACHE="$HOME/.cache/infisical/${OS}-${ARCH}/${VER}"
BIN="$CACHE/infisical"
mkdir -p "$CACHE"

# Check if already installed
if command -v infisical >/dev/null 2>&1; then
  infisical --version && exit 0
fi

# Check cache
if [ -x "$BIN" ]; then
  sudo ln -sf "$BIN" /usr/local/bin/infisical
  infisical --version && exit 0
fi

download() { # url out
  for i in 1 2 3; do
    curl -fL --connect-timeout 5 --max-time 60 -o "$2" "$1" && return 0
    sleep $((2**i))
  done
  return 1
}

# 1) GitHub release tarball (preferred)
TGZ_URL="https://github.com/Infisical/infisical/releases/download/v${VER}/infisical_${VER}_${OS}_${ARCH}.tar.gz"
if download "$TGZ_URL" "$CACHE/cli.tgz"; then
  tar -xzf "$CACHE/cli.tgz" -C "$CACHE"
  mv "$CACHE/infisical" "$BIN"
  chmod +x "$BIN"
  sudo ln -sf "$BIN" /usr/local/bin/infisical
  infisical --version && exit 0
fi

# 2) GitHub .deb (secondary)
DEB_URL="https://github.com/Infisical/infisical/releases/download/v${VER}/infisical_${VER}_${OS}_${ARCH}.deb"
if download "$DEB_URL" "$CACHE/cli.deb"; then
  sudo dpkg -i "$CACHE/cli.deb" || sudo apt-get -f install -y
  command -v infisical && infisical --version && exit 0
fi

# 3) Cloudsmith APT (last resort)
echo "GitHub downloads failed, falling back to Cloudsmith..."
for i in 1 2 3; do
  if curl -1sLf https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh | sudo -E bash; then
    sudo apt-get update && sudo apt-get install -y infisical && break
  fi
  sleep $((2**i))
done

command -v infisical && infisical --version || { echo "Infisical install failed"; exit 1; }