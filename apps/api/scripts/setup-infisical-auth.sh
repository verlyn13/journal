#!/usr/bin/env bash
# setup-infisical-auth.sh
# Manage Universal Auth (UA) credentials for Infisical using gopass

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

STORE_PREFIX="projects/journal/infisical"
ID_TOKEN_SERVICE_KEY_ID="$STORE_PREFIX/ua-client-id-token-service"
ID_TOKEN_SERVICE_KEY_SECRET="$STORE_PREFIX/ua-client-secret-token-service"
ID_ROTATOR_KEY_ID="$STORE_PREFIX/ua-client-id-rotator"
ID_ROTATOR_KEY_SECRET="$STORE_PREFIX/ua-client-secret-rotator"
PROJECT_ID_KEY="$STORE_PREFIX/project-id"
SERVER_URL_KEY="$STORE_PREFIX/server-url"
ARCHIVE_PREFIX="$STORE_PREFIX/archive"

usage() {
  cat <<EOF
Usage: $0 <setup|retrieve|export|test|rotate>

Subcommands:
  setup     Store UA credentials and config in gopass
  retrieve  Display masked stored values
  export    Print export lines for environment variables
  test      Validate UA login via Infisical CLI
  rotate    Archive old UA creds and store new ones

Gopass Keys:
  $ID_TOKEN_SERVICE_KEY_ID
  $ID_TOKEN_SERVICE_KEY_SECRET
  $ID_ROTATOR_KEY_ID
  $ID_ROTATOR_KEY_SECRET
  $PROJECT_ID_KEY
  $SERVER_URL_KEY
EOF
}

require() {
  command -v "$1" >/dev/null 2>&1 || { echo "Missing dependency: $1" >&2; exit 1; }
}

mask() { local s="$1"; echo "${s:0:3}****${s: -3}"; }

cmd_setup() {
  require gopass
  echo "Storing UA credentials in gopass..."
  read -r -p "INFISICAL_PROJECT_ID: " PROJECT_ID
  read -r -p "INFISICAL_SERVER_URL: " SERVER_URL
  read -r -p "UA_CLIENT_ID_TOKEN_SERVICE: " UA_TS_ID
  read -r -s -p "UA_CLIENT_SECRET_TOKEN_SERVICE: " UA_TS_SECRET; echo
  read -r -p "UA_CLIENT_ID_ROTATOR: " UA_ROT_ID
  read -r -s -p "UA_CLIENT_SECRET_ROTATOR: " UA_ROT_SECRET; echo

  echo -n "$PROJECT_ID" | gopass insert -m -f "$PROJECT_ID_KEY"
  echo -n "$SERVER_URL" | gopass insert -m -f "$SERVER_URL_KEY"
  echo -n "$UA_TS_ID" | gopass insert -m -f "$ID_TOKEN_SERVICE_KEY_ID"
  echo -n "$UA_TS_SECRET" | gopass insert -m -f "$ID_TOKEN_SERVICE_KEY_SECRET"
  echo -n "$UA_ROT_ID" | gopass insert -m -f "$ID_ROTATOR_KEY_ID"
  echo -n "$UA_ROT_SECRET" | gopass insert -m -f "$ID_ROTATOR_KEY_SECRET"

  echo "✅ Stored UA credentials and config in gopass"
}

cmd_retrieve() {
  require gopass
  PROJECT_ID="$(gopass show "$PROJECT_ID_KEY" || true)"
  SERVER_URL="$(gopass show "$SERVER_URL_KEY" || true)"
  UA_TS_ID="$(gopass show "$ID_TOKEN_SERVICE_KEY_ID" || true)"
  UA_TS_SECRET="$(gopass show "$ID_TOKEN_SERVICE_KEY_SECRET" || true)"
  UA_ROT_ID="$(gopass show "$ID_ROTATOR_KEY_ID" || true)"
  UA_ROT_SECRET="$(gopass show "$ID_ROTATOR_KEY_SECRET" || true)"

  echo "INFISICAL_PROJECT_ID: ${PROJECT_ID:-<missing>}"
  echo "INFISICAL_SERVER_URL: ${SERVER_URL:-<missing>}"
  [[ -n "${UA_TS_ID:-}" ]] && echo "UA_CLIENT_ID_TOKEN_SERVICE: $(mask "$UA_TS_ID")" || echo "UA_CLIENT_ID_TOKEN_SERVICE: <missing>"
  [[ -n "${UA_TS_SECRET:-}" ]] && echo "UA_CLIENT_SECRET_TOKEN_SERVICE: $(mask "$UA_TS_SECRET")" || echo "UA_CLIENT_SECRET_TOKEN_SERVICE: <missing>"
  [[ -n "${UA_ROT_ID:-}" ]] && echo "UA_CLIENT_ID_ROTATOR: $(mask "$UA_ROT_ID")" || echo "UA_CLIENT_ID_ROTATOR: <missing>"
  [[ -n "${UA_ROT_SECRET:-}" ]] && echo "UA_CLIENT_SECRET_ROTATOR: $(mask "$UA_ROT_SECRET")" || echo "UA_CLIENT_SECRET_ROTATOR: <missing>"
}

cmd_export() {
  require gopass
  echo "export INFISICAL_PROJECT_ID=\"$(gopass show "$PROJECT_ID_KEY")\""
  echo "export INFISICAL_SERVER_URL=\"$(gopass show "$SERVER_URL_KEY")\""
  echo "export UA_CLIENT_ID_TOKEN_SERVICE=\"$(gopass show "$ID_TOKEN_SERVICE_KEY_ID")\""
  echo "export UA_CLIENT_SECRET_TOKEN_SERVICE=\"$(gopass show "$ID_TOKEN_SERVICE_KEY_SECRET")\""
  echo "export UA_CLIENT_ID_ROTATOR=\"$(gopass show "$ID_ROTATOR_KEY_ID")\""
  echo "export UA_CLIENT_SECRET_ROTATOR=\"$(gopass show "$ID_ROTATOR_KEY_SECRET")\""
}

cmd_test() {
  require gopass; require infisical
  # Export env and attempt UA login
  eval "$($0 export)"
  echo "Attempting Universal Auth login..."
  if infisical login --method universal-auth \
      --client-id "$UA_CLIENT_ID_TOKEN_SERVICE" \
      --client-secret "$UA_CLIENT_SECRET_TOKEN_SERVICE" \
      --silent --plain >/dev/null; then
    echo "✅ Universal Auth login succeeded"
  else
    echo "❌ Universal Auth login failed"; exit 1
  fi
}

cmd_rotate() {
  require gopass
  ts=$(date +%Y%m%d-%H%M%S)
  mkdir -p "$HOME/.local/share/gopass/$ARCHIVE_PREFIX" || true
  for key in \
    "$ID_TOKEN_SERVICE_KEY_ID" "$ID_TOKEN_SERVICE_KEY_SECRET" \
    "$ID_ROTATOR_KEY_ID" "$ID_ROTATOR_KEY_SECRET"; do
    val="$(gopass show "$key" || true)"
    if [[ -n "$val" ]]; then
      archive_key="$ARCHIVE_PREFIX/$(basename "$key").$ts"
      echo -n "$val" | gopass insert -m -f "$archive_key"
      echo "Archived $key -> $archive_key"
    fi
  done
  echo "Now run: $0 setup to store new UA credentials"
}

case "${1:-}" in
  setup) cmd_setup ;;
  retrieve) cmd_retrieve ;;
  export) cmd_export ;;
  test) cmd_test ;;
  rotate) cmd_rotate ;;
  *) usage; exit 1 ;;
esac

