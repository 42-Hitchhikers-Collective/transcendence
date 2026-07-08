#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$ROOT/_lib.sh"

say "==> Phase 6) Friends + Blocking + Presence"

# ---- helpers ----
register_and_login() {
  local email="$1"
  local password="$2"

  curl_json POST "/api/auth/register" '{"email":"'"$email"'","password":"'"$password"'"}' >/dev/null || true

  local res
  res="$(curl_json POST "/api/auth/login" '{"email":"'"$email"'","password":"'"$password"'"}')"
  extract_token "$res"
}

authz() { echo "Authorization: Bearer $1"; }

# ---- setup users ----
EMAIL_A="a_friend@example.com"
EMAIL_B="b_friend@example.com"
PASS="ChangeMe123!"

TOKEN_A="$(register_and_login "$EMAIL_A" "$PASS")"
TOKEN_B="$(register_and_login "$EMAIL_B" "$PASS")"

# You need a way to address users (by id). Common approaches:
# - /users/me returns id
# - /users?email=... returns id
ME_A="$(curl_json GET "/api/users/me" "" "$(authz "$TOKEN_A")")"
ME_B="$(curl_json GET "/api/users/me" "" "$(authz "$TOKEN_B")")"
USER_A_ID="$(json_get "$ME_A" "id")"
USER_B_ID="$(json_get "$ME_B" "id")"

say "-- Friend request A -> B"
RES="$(curl_json POST "/api/friends/requests" '{"toUserId":"'"$USER_B_ID"'"}' "$(authz "$TOKEN_A")")"
assert_status "$RES" 201 200

say "-- Duplicate request should fail (409)"
RES="$(curl_json POST "/api/friends/requests" '{"toUserId":"'"$USER_B_ID"'"}' "$(authz "$TOKEN_A")")"
assert_status "$RES" 409 400

say "-- B lists incoming requests (should include A)"
RES="$(curl_json GET "/api/friends/requests/incoming" "" "$(authz "$TOKEN_B")")"
assert_status "$RES" 200
assert_json_contains "$RES" "$USER_A_ID"

say "-- B accepts request from A -> creates friendship"
RES="$(curl_json POST "/api/friends/requests/accept" '{"fromUserId":"'"$USER_A_ID"'"}' "$(authz "$TOKEN_B")")"
assert_status "$RES" 200

say "-- A lists friends (should include B)"
RES="$(curl_json GET "/api/friends" "" "$(authz "$TOKEN_A")")"
assert_status "$RES" 200
assert_json_contains "$RES" "$USER_B_ID"

say "-- B lists friends (should include A)"
RES="$(curl_json GET "/api/friends" "" "$(authz "$TOKEN_B")")"
assert_status "$RES" 200
assert_json_contains "$RES" "$USER_A_ID"

say "-- Blocking: A blocks B"
RES="$(curl_json POST "/api/blocks" '{"userId":"'"$USER_B_ID"'"}' "$(authz "$TOKEN_A")")"
assert_status "$RES" 200 201

say "-- While blocked: B cannot send request to A (403/409)"
RES="$(curl_json POST "/api/friends/requests" '{"toUserId":"'"$USER_A_ID"'"}' "$(authz "$TOKEN_B")")"
assert_status "$RES" 403 409

say "-- Unblock: A unblocks B"
RES="$(curl_json DELETE "/api/blocks/$USER_B_ID" "" "$(authz "$TOKEN_A")")"
assert_status "$RES" 200 204

say "OK: Phase 6 REST tests done"

# ---- Presence (Socket.IO) ----
# Optional: run a node test similar to your socket script:
# node "$ROOT/socket_presence_test.js" "$TOKEN_A" "$TOKEN_B" "$USER_A_ID" "$USER_B_ID"