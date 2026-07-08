#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://localhost}"
API="${BASE_URL}/api"

ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-ChangeMe123!}"

extract_token() { sed -n 's/.*"token":"\([^"]*\)".*/\1/p'; }
http_status() { curl -sk -o /dev/null -w "%{http_code}" "$@"; }

assert_status() {
  local expected="$1"
  local got="$2"
  local msg="$3"
  if [ "$got" != "$expected" ]; then
    echo "FAILED: $msg (expected $expected, got $got)"
    exit 1
  fi
  echo "OK: $msg ($got)"
}

say() { printf "\n==> %s\n" "$*"; }

say "RBAC: /api/admin/users"

say "1) No token => 401"
status="$(http_status -i "${API}/admin/users")"
assert_status "401" "$status" "admin route requires auth"

say "2) ADMIN token => 200"
ADMIN_TOKEN="$(curl -sk "${API}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}" | extract_token)"

[ -n "$ADMIN_TOKEN" ] || { echo "FAILED: could not get ADMIN token"; exit 1; }

status="$(http_status -i "${API}/admin/users" -H "Authorization: Bearer $ADMIN_TOKEN")"
assert_status "200" "$status" "admin can access admin route"