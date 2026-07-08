#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$ROOT/_lib.sh"

say "==> Phase 11) OAuth + Linking"

TOKEN_A="$(get_or_create_test_user_token "oauth_a@example.com")"

say "-- OAuth start returns 302 or 200 with url"
RES="$(curl_raw GET "/api/oauth/google/start" "" "Authorization: Bearer $TOKEN_A")"
assert_status "$RES" 302 200

say "-- Callback rejects invalid code/state (should be 400/401)"
RES="$(curl_raw GET "/api/oauth/google/callback?code=invalid&state=invalid" "")"
assert_status "$RES" 400 401

say "-- Link endpoint is protected (no token => 401)"
RES="$(curl_json POST "/api/oauth/google/link" '{}' )"
assert_status "$RES" 401

say "-- Unlink endpoint is protected"
RES="$(curl_json POST "/api/oauth/google/unlink" '{}' )"
assert_status "$RES" 401

say "OK: Phase 11 smoke tests done"