#!/usr/bin/env bash
set -euo pipefail

# ---- base urls
BASE_URL="${BASE_URL:-https://localhost}"
API="${BASE_URL}/api"

# ---- user for "basic user flow"
TEST_EMAIL="${TEST_EMAIL:-test@example.com}"
TEST_PASSWORD="${TEST_PASSWORD:-test1234}"
TEST_DISPLAY_NAME="${TEST_DISPLAY_NAME:-Test}"

# ---- admin for refresh-cookie and socket tests
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-ChangeMe123!}"

# ---- socket test dir (for socket.io-client install)
SOCKET_TEST_DIR="${SOCKET_TEST_DIR:-$(pwd)/.socketio-test}"

say() { printf "\n==> %s\n" "$*"; }

curl_json() {
  curl -sk "$@" -H "Content-Type: application/json"
}

extract_token() {
  sed -n 's/.*"token":"\([^"]*\)".*/\1/p'
}

http_status() {
  curl -sk -o /dev/null -w "%{http_code}" "$@"
}

http_status_json() {
  curl -sk -o /dev/null -w "%{http_code}" \
    -H "Content-Type: application/json" \
    "$@"
}

assert_status() {
  local expected="$1"
  local status="$2"
  local context="$3"

  if [ "$status" != "$expected" ]; then
    echo "FAILED: $context (expected $expected, got $status)"
    exit 1
  fi
  echo "OK: $context ($status)"
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "FAILED: missing command: $1"
    exit 1
  }
}
