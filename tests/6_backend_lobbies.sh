#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$ROOT/_lib.sh"

say "==> Phase 7) Lobbies + Invites + Matchmaking"

TOKEN_A="$(get_or_create_test_user_token "lobby_a@example.com")"
TOKEN_B="$(get_or_create_test_user_token "lobby_b@example.com")"

say "-- A creates lobby"
RES="$(curl_json POST "/api/lobbies" '{}' "Authorization: Bearer $TOKEN_A")"
assert_status "$RES" 201 200
LOBBY_ID="$(json_get "$RES" "id")"

say "-- B joins lobby"
RES="$(curl_json POST "/api/lobbies/$LOBBY_ID/join" '{}' "Authorization: Bearer $TOKEN_B")"
assert_status "$RES" 200 201

say "-- B ready"
RES="$(curl_json POST "/api/lobbies/$LOBBY_ID/ready" '{"ready":true}' "Authorization: Bearer $TOKEN_B")"
assert_status "$RES" 200

say "-- A fetch lobby state (members + ready flags)"
RES="$(curl_json GET "/api/lobbies/$LOBBY_ID" "" "Authorization: Bearer $TOKEN_A")"
assert_status "$RES" 200
assert_json_contains "$RES" '"ready":true'

say "-- Invites: A invites B"
# either via userId or email
RES="$(curl_json POST "/api/invites" '{"lobbyId":"'"$LOBBY_ID"'","to":"lobby_b@example.com"}' "Authorization: Bearer $TOKEN_A")"
assert_status "$RES" 201 200
INVITE_ID="$(json_get "$RES" "id")"

say "-- B accepts invite (joins lobby)"
RES="$(curl_json POST "/api/invites/$INVITE_ID/accept" '{}' "Authorization: Bearer $TOKEN_B")"
assert_status "$RES" 200 201

say "-- B leaves lobby"
RES="$(curl_json POST "/api/lobbies/$LOBBY_ID/leave" '{}' "Authorization: Bearer $TOKEN_B")"
assert_status "$RES" 200 204

say "OK: Phase 7 REST tests done"

# Matchmaking (simple)
say "-- Matchmaking: queue A"
RES="$(curl_json POST "/api/matchmaking/queue" '{}' "Authorization: Bearer $TOKEN_A")"
assert_status "$RES" 200 201

say "-- Matchmaking: queue B"
RES="$(curl_json POST "/api/matchmaking/queue" '{}' "Authorization: Bearer $TOKEN_B")"
assert_status "$RES" 200 201

# Either poll for match result:
RES="$(curl_json GET "/api/matchmaking/status" "" "Authorization: Bearer $TOKEN_A")"
assert_status "$RES" 200
# or verify socket "match:found" in node script.