#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$ROOT/_lib.sh"

say "==> Phase 8) Games"

TOKEN_A="$(get_or_create_test_user_token "game_a@example.com")"
TOKEN_B="$(get_or_create_test_user_token "game_b@example.com")"

# Create lobby, join, ready like phase 7, then:
LOBBY_ID="$(create_lobby_with_two_ready "$TOKEN_A" "$TOKEN_B")"

say "-- Start game from lobby"
RES="$(curl_json POST "/api/lobbies/$LOBBY_ID/start" '{}' "Authorization: Bearer $TOKEN_A")"
assert_status "$RES" 201 200
GAME_ID="$(json_get "$RES" "gameId")"

say "-- Fetch game state"
RES="$(curl_json GET "/api/games/$GAME_ID" "" "Authorization: Bearer $TOKEN_A")"
assert_status "$RES" 200

say "OK: Phase 8 REST start/state tests done"

# Real validation belongs in a node socket test:
# node "$ROOT/socket_game_test.js" "$TOKEN_A" "$TOKEN_B" "$GAME_ID"