#!/usr/bin/env bash
# ------------------------------------------------------------------------------
# phase3_security_test.sh — Phase 3 security flow tests (independent)
#
# Tests:
#   - Password reset request/confirm (one-time token, reuse fails)
#   - Email verify request/confirm (one-time token, reuse fails)
#
# Uses a dedicated user so it won't break your seeded admin account.
#
# Assumes endpoints exist under /api/auth:
#   POST /auth/register
#   POST /auth/login
#   POST /auth/password-reset/request
#   POST /auth/password-reset/confirm
#   POST /auth/email/verify/request        (AUTH REQUIRED)
#   POST /auth/email/verify/confirm
#
# Assumes dev token exposure:
#   EXPOSE_DEV_TOKENS=true so request endpoints return { ok:true, token:"..." }
#
# Usage:
#   chmod +x tests/phase3_security_test.sh
#   ./tests/phase3_security_test.sh
#
# Optional env overrides:
#   BASE_URL=https://localhost
#   SEC_EMAIL=security_test@example.com
#   SEC_PASSWORD=SecNew123!        (what we login with)
#   SEC_DISPLAY_NAME=SecurityTest
# ------------------------------------------------------------------------------

# set -euo pipefail
set -euo pipefail
source "$(cd "$(dirname "$0")" && pwd)/tests/_lib.sh" 2>/dev/null || true

BASE_URL="${BASE_URL:-https://localhost}"
API="${BASE_URL}/api"

SEC_EMAIL="${SEC_EMAIL:-security_test@example.com}"
SEC_PASSWORD="${SEC_PASSWORD:-SecNew123!}"
SEC_DISPLAY_NAME="${SEC_DISPLAY_NAME:-SecurityTest}"

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

extract_dev_token_field() {
  # Extract "token" field from JSON like {"ok":true,"token":"..."}
  sed -n 's/.*"token":"\([^"]*\)".*/\1/p'
}

# ------------------------------------------------------------------------------
# 0) Sanity
# ------------------------------------------------------------------------------

say "0) Sanity: API reachable"
status="$(http_status -i "${API}/health")"
assert_status "200" "$status" "/api/health reachable"

# ------------------------------------------------------------------------------
# 1) Ensure dedicated user exists (idempotent)
# ------------------------------------------------------------------------------

say "1) Ensure dedicated security test user exists (201 or 409)"
status="$(http_status -i -X POST "${API}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${SEC_EMAIL}\",\"password\":\"${SEC_PASSWORD}\",\"displayName\":\"${SEC_DISPLAY_NAME}\"}")"

if [ "$status" = "201" ]; then
  echo "OK: security test user created (201)"
elif [ "$status" = "409" ]; then
  echo "OK: security test user already exists (409)"
else
  echo "FAILED: unexpected status $status while ensuring test user"
  exit 1
fi

# ------------------------------------------------------------------------------
# 2) Password reset flow
# ------------------------------------------------------------------------------

say "2) Password reset: request token (expect ok:true + token in dev)"
RESET_REQ_JSON="$(curl_json -X POST "${API}/auth/password-reset/request" \
  -d "{\"email\":\"${SEC_EMAIL}\"}")"

echo "$RESET_REQ_JSON" | grep -q '"ok":true' || {
  echo "FAILED: password-reset/request did not return ok:true"
  echo "$RESET_REQ_JSON"
  exit 1
}

RESET_TOKEN="$(echo "$RESET_REQ_JSON" | extract_dev_token_field)"
[ -n "$RESET_TOKEN" ] || {
  echo "FAILED: reset token missing. Set EXPOSE_DEV_TOKENS=true in API env."
  echo "$RESET_REQ_JSON"
  exit 1
}
echo "OK: got reset token"

say "2.1) Password reset: confirm token (set new password)"
# Use a time-based password so reruns don't depend on prior state.
SEC_NEW_PASSWORD="SecNew123!$(date +%s)"

status="$(http_status -i -X POST "${API}/auth/password-reset/confirm" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"${RESET_TOKEN}\",\"newPassword\":\"${SEC_NEW_PASSWORD}\"}")"
assert_status "200" "$status" "password-reset/confirm"

say "2.2) Password reset: reuse token should fail (400)"
status="$(http_status -i -X POST "${API}/auth/password-reset/confirm" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"${RESET_TOKEN}\",\"newPassword\":\"Whatever123!\"}")"
assert_status "400" "$status" "reset token reuse rejected"

say "2.3) Password reset: login with new password should succeed"
LOGIN_JSON="$(curl_json -X POST "${API}/auth/login" \
  -d "{\"email\":\"${SEC_EMAIL}\",\"password\":\"${SEC_NEW_PASSWORD}\"}")"

ACCESS_TOKEN="$(echo "$LOGIN_JSON" | extract_token)"
[ -n "$ACCESS_TOKEN" ] || {
  echo "FAILED: login after password reset did not return token"
  echo "$LOGIN_JSON"
  exit 1
}
echo "OK: login after reset returned access token"

# ------------------------------------------------------------------------------
# 3) Email verification flow (requires auth)
# ------------------------------------------------------------------------------

say "3) Email verify: request token (auth required, expect ok:true + token in dev)"
VERIFY_REQ_JSON="$(curl -sk -X POST "${API}/auth/email/verify/request" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")"

echo "$VERIFY_REQ_JSON" | grep -q '"ok":true' || {
  echo "FAILED: email/verify/request did not return ok:true"
  echo "$VERIFY_REQ_JSON"
  exit 1
}

VERIFY_TOKEN="$(echo "$VERIFY_REQ_JSON" | extract_dev_token_field)"
[ -n "$VERIFY_TOKEN" ] || {
  echo "FAILED: verify token missing. Set EXPOSE_DEV_TOKENS=true in API env."
  echo "$VERIFY_REQ_JSON"
  exit 1
}
echo "OK: got verify token"

say "3.1) Email verify: confirm token should succeed (200)"
status="$(http_status -i -X POST "${API}/auth/email/verify/confirm" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"${VERIFY_TOKEN}\"}")"
assert_status "200" "$status" "email/verify/confirm"

say "3.2) Email verify: reuse token should fail (400)"
status="$(http_status -i -X POST "${API}/auth/email/verify/confirm" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"${VERIFY_TOKEN}\"}")"
assert_status "400" "$status" "verify token reuse rejected"

say "DONE ✅ Phase 3 security flow tests passed"
echo "Note: the test user password was set to: ${SEC_NEW_PASSWORD}"
echo "You can override SEC_EMAIL/SEC_PASSWORD via env vars to reuse a fixed account."