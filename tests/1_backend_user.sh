#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "$0")" && pwd)/_lib.sh"

COOKIE1="$(mktemp)"
cleanup() { rm -f "$COOKIE1"; }
trap cleanup EXIT

say "1.0) Register validation should fail (400)"
status="$(http_status_json -i -X POST "${API}/auth/register" \
  -d '{"email":"x","password":"1","userName":""}')"
assert_status "400" "$status" "register invalid payload rejected"

say "1.1) Register user (may be 201 or 409)"
status="$(http_status_json -i -X POST "${API}/auth/register" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\",\"userName\":\"${TEST_DISPLAY_NAME}\"}")"

if [ "$status" = "201" ]; then
  echo "OK: register created user (201)"
elif [ "$status" = "409" ]; then
  echo "OK: register duplicate email rejected (409)"
else
  echo "FAILED: register unexpected status $status (expected 201 or 409)"
  exit 1
fi

say "1.2) Login success: get access token"
LOGIN_BODY="$(mktemp)"
LOGIN_CODE="$(curl -sk -o "$LOGIN_BODY" -w "%{http_code}" \
  -H "Content-Type: application/json" \
  -X POST "${API}/auth/login" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}")"

if [ "$LOGIN_CODE" != "200" ]; then
  echo "FAILED: login expected 200, got $LOGIN_CODE"
  cat "$LOGIN_BODY"
  rm -f "$LOGIN_BODY"
  exit 1
fi

TOKEN="$(cat "$LOGIN_BODY" | extract_token)"
rm -f "$LOGIN_BODY"

echo "TOKEN_LEN=${#TOKEN}"
[ -n "$TOKEN" ] || { echo "FAILED: login did not return token"; exit 1; }
echo "OK: login returned access token"

say "1.3) /users/me without token should be 401"
status="$(http_status -i "${API}/users/me")"
assert_status "401" "$status" "/users/me is protected"

say "1.4) /users/me with token should be 200"
status="$(http_status -i "${API}/users/me" -H "Authorization: Bearer $TOKEN")"
assert_status "200" "$status" "/users/me works with Bearer token"

say "1.5) /profiles/me without token should be 401"
status="$(http_status_json -i -X PATCH "${API}/profiles/me" \
  -d '{"userName":"HACKED"}')"
assert_status "401" "$status" "/profiles/me is protected"

say "1.6) /profiles/me with token should be 200"
status="$(http_status_json -i -X PATCH "${API}/profiles/me" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"userName":"Bubu","bio":"hello"}')"
assert_status "200" "$status" "profile update works with Bearer token"

say "1.7) Register admin user (may be 201 or 409)"
status="$(http_status_json -i -X POST "${API}/auth/register" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\",\"userName\":\"admin\"}")"

if [ "$status" = "201" ]; then
  echo "OK: admin user created (201)"
elif [ "$status" = "409" ]; then
  echo "OK: admin user already exists (409)"
else
  echo "FAILED: admin register unexpected status $status"
  exit 1
fi

say "1.8) Admin login (cookie jar) should set refresh_token cookie"
LOGIN_JSON="$(curl -sk -c "$COOKIE1" "${API}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}")"

ACCESS1="$(echo "$LOGIN_JSON" | extract_token)"
echo "ADMIN_ACCESS_LEN=${#ACCESS1}"
[ -n "$ACCESS1" ] || { echo "FAILED: admin login did not return token"; exit 1; }

grep -E "refresh_token" "$COOKIE1" >/dev/null || {
  echo "FAILED: refresh_token not found in cookie jar"
  exit 1
}
echo "OK: admin login + refresh cookie present"

say "1.9) Logout should revoke current refresh token"
status="$(http_status -i -b "$COOKIE1" -c "$COOKIE1" -X POST "${API}/auth/logout")"
assert_status "200" "$status" "/auth/logout returns 200"
