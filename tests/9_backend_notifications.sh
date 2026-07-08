#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$ROOT/_lib.sh"

say "==> Phase 10) Notifications"

TOKEN_A="$(get_or_create_test_user_token "notif_a@example.com")"
TOKEN_B="$(get_or_create_test_user_token "notif_b@example.com")"
USER_B_ID="$(get_my_id "$TOKEN_B")"

say "-- Trigger notification: A sends friend request to B"
curl_json POST "/api/friends/requests" '{"toUserId":"'"$USER_B_ID"'"}' "Authorization: Bearer $TOKEN_A" >/dev/null || true

say "-- B fetches notifications"
RES="$(curl_json GET "/api/notifications" "" "Authorization: Bearer $TOKEN_B")"
assert_status "$RES" 200
# optional: assert_json_contains "$RES" "FRIEND_REQUEST"

NOTIF_ID="$(json_get_first "$RES" "id")"

say "-- Mark as read"
RES="$(curl_json POST "/api/notifications/$NOTIF_ID/read" '{}' "Authorization: Bearer $TOKEN_B")"
assert_status "$RES" 200 204

say "OK: Phase 10 REST tests done"

# node "$ROOT/socket_notifications_test.js" "$TOKEN_B"