#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$ROOT/_lib.sh"

say "==> Phase 9) Chat"

TOKEN_A="$(get_or_create_test_user_token "chat_a@example.com")"
TOKEN_B="$(get_or_create_test_user_token "chat_b@example.com")"

USER_B_ID="$(get_my_id "$TOKEN_B")"

say "-- A sends first DM -> creates conversation"
RES="$(curl_json POST "/api/messages/dm" '{"toUserId":"'"$USER_B_ID"'","content":"hello"}' "Authorization: Bearer $TOKEN_A")"
assert_status "$RES" 201 200
CONV_ID="$(json_get "$RES" "conversationId")"

say "-- Fetch messages (first page)"
RES="$(curl_json GET "/api/conversations/$CONV_ID/messages?limit=20" "" "Authorization: Bearer $TOKEN_A")"
assert_status "$RES" 200
assert_json_contains "$RES" "hello"

say "-- Pagination cursor"
CURSOR="$(json_get "$RES" "nextCursor")"
if [ -n "$CURSOR" ] && [ "$CURSOR" != "null" ]; then
  RES="$(curl_json GET "/api/conversations/$CONV_ID/messages?limit=20&cursor=$CURSOR" "" "Authorization: Bearer $TOKEN_A")"
  assert_status "$RES" 200
fi

say "OK: Phase 9 REST tests done"

# Socket delivery belongs in node test:
# node "$ROOT/socket_chat_test.js" "$TOKEN_A" "$TOKEN_B" "$CONV_ID"