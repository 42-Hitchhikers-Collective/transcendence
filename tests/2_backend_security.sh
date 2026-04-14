#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
source "$ROOT/_lib.sh"

# Dedicated user for security flows
SEC_EMAIL="security_test@example.com"
SEC_PASSWORD="SecNew123!"
SEC_DISPLAY_NAME="SecurityTest"

extract_dev_token_field() {
  sed -n 's/.*"token":"\([^"]*\)".*/\1/p'
}

say "0) Sanity: API reachable"
status="$(http_status -i "${API}/health")"
assert_status "200" "$status" "/api/health reachable"

say "1) Ensure dedicated security test user exists (201 or 409)"
status="$(http_status_json -i -X POST "${API}/auth/register" \
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
if [ -z "$RESET_TOKEN" ]; then
  echo "FAILED: reset token missing. Your API is returning ok:true but no token."
  echo "Fix: set EXPOSE_DEV_TOKENS=true in your API env (dev only), or adapt the test to fetch tokens from email."
  echo "$RESET_REQ_JSON"
  exit 1
fi
echo "OK: got reset token"

say "2.1) Password reset: confirm token (set new password)"
SEC_NEW_PASSWORD="SecNew123!$(date +%s)"

status="$(http_status_json -i -X POST "${API}/auth/password-reset/confirm" \
  -d "{\"token\":\"${RESET_TOKEN}\",\"newPassword\":\"${SEC_NEW_PASSWORD}\"}")"
assert_status "200" "$status" "password-reset/confirm"

say "2.2) Password reset: reuse token should fail (400)"
status="$(http_status_json -i -X POST "${API}/auth/password-reset/confirm" \
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
# 3) Email verification flow
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
if [ -z "$VERIFY_TOKEN" ]; then
  echo "FAILED: verify token missing. Your API is returning ok:true but no token."
  echo "Fix: set EXPOSE_DEV_TOKENS=true in your API env (dev only), or adapt the test to fetch tokens from email."
  echo "$VERIFY_REQ_JSON"
  exit 1
fi
echo "OK: got verify token"

say "3.1) Email verify: confirm token should succeed (200)"
status="$(http_status_json -i -X POST "${API}/auth/email/verify/confirm" \
  -d "{\"token\":\"${VERIFY_TOKEN}\"}")"
assert_status "200" "$status" "email/verify/confirm"

say "3.2) Email verify: reuse token should fail (400)"
status="$(http_status_json -i -X POST "${API}/auth/email/verify/confirm" \
  -d "{\"token\":\"${VERIFY_TOKEN}\"}")"
assert_status "400" "$status" "verify token reuse rejected"

# ------------------------------------------------------------------------------
# RL) Rate limiting proof (do NOT hammer password-reset/request)
# Use a different endpoint so reruns don't break the main flow.
#
# We hammer /email/verify/confirm with a bogus token:
# - Should return 400 for a while
# - Eventually return 429 when the limiter triggers
# ------------------------------------------------------------------------------

if [ "${RUN_RL_PROOF:-0}" = "1" ]; then
  say "RL) Rate limit proof: spam /auth/email/verify/request WITHOUT auth until 429"

  hit429=0
  i=1
  MAX_ATTEMPTS=80

  while [ "$i" -le "$MAX_ATTEMPTS" ]; do
    code="$(curl -sk -o /dev/null -w "%{http_code}" \
      -X POST "${API}/auth/email/verify/request")"

    if [ "$code" = "429" ]; then
      hit429=1
      echo "OK: rate limit triggered on attempt $i (HTTP 429)"
      break
    fi

    if [ "$code" != "401" ]; then
      echo "FAILED: unexpected status while probing rate limit: got $code (expected 401 or 429)"
      exit 1
    fi

    i=$((i + 1))
  done

  if [ "$hit429" -ne 1 ]; then
    echo "FAILED: did not observe HTTP 429 within ${MAX_ATTEMPTS} attempts."
    exit 1
  fi
else
  echo "SKIP: rate limit proof (set RUN_RL_PROOF=1 to run it)"
fi

say "DONE ✅ Phase 3 security flow tests passed"
echo "Note: the test user password was set to: ${SEC_NEW_PASSWORD}"