# #!/usr/bin/env bash
# # ------------------------------------------------------------------------------
# # backend_test.sh — minimal, commented smoke + auth tests for your Fastify API
# # Assumes:
# #   - NGINX terminates TLS and proxies https://localhost/api -> Fastify
# #   - Auth endpoints:
# #       POST /api/auth/register
# #       POST /api/auth/login
# #       POST /api/auth/refresh
# #       POST /api/auth/logout
# #       POST /api/auth/logout-all
# #   - Protected endpoints:
# #       GET  /api/users/me
# #       PATCH /api/profiles/me
# #   - Refresh token stored in httpOnly cookie (Path=/api/auth)
# #
# # Usage:
# #   chmod +x backend_test.sh
# #   ./backend_test.sh
# #
# # Optional env overrides:
# #   BASE_URL=https://localhost
# #   TEST_EMAIL=test@example.com
# #   TEST_PASSWORD=test1234
# #   TEST_DISPLAY_NAME=Test
# #   ADMIN_EMAIL=admin@example.com
# #   ADMIN_PASSWORD=ChangeMe123!
# # ------------------------------------------------------------------------------

# set -euo pipefail

# BASE_URL="${BASE_URL:-https://localhost}"
# API="${BASE_URL}/api"

# TEST_EMAIL="${TEST_EMAIL:-test@example.com}"
# TEST_PASSWORD="${TEST_PASSWORD:-test1234}"
# TEST_DISPLAY_NAME="${TEST_DISPLAY_NAME:-Test}"

# ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
# ADMIN_PASSWORD="${ADMIN_PASSWORD:-ChangeMe123!}"

# # Temp files for cookies
# COOKIE1="$(mktemp)"
# COOKIE2="$(mktemp)"
# COOKIE_OLD="$(mktemp)"

# cleanup() {
#   rm -f "$COOKIE1" "$COOKIE2" "$COOKIE_OLD"
# }
# trap cleanup EXIT

# # ------------------------------------------------------------------------------
# # helpers
# # ------------------------------------------------------------------------------

# say() { printf "\n==> %s\n" "$*"; }

# # Run curl, keep it quiet but show errors; -k because dev cert is self-signed
# # You can add "-i" per call when you need headers.
# curl_json() {
#   curl -sk "$@" -H "Content-Type: application/json"
# }

# # Extract token field from a JSON response like: {"token":"..."}
# # Works with your current API responses.
# extract_token() {
#   sed -n 's/.*"token":"\([^"]*\)".*/\1/p'
# }

# # Assert HTTP status code equals expected
# assert_status() {
#   local expected="$1"
#   local status="$2"
#   local context="$3"

#   if [ "$status" != "$expected" ]; then
#     echo "FAILED: $context (expected $expected, got $status)"
#     exit 1
#   fi
#   echo "OK: $context ($status)"
# }

# # Get just the HTTP status code for a request
# http_status() {
#   curl -sk -o /dev/null -w "%{http_code}" "$@"
# }

# # ------------------------------------------------------------------------------
# # 1) Basic health checks
# # ------------------------------------------------------------------------------

# say "1) Health check"
# status="$(http_status -i "${API}/health")"
# assert_status "200" "$status" "/api/health reachable via NGINX"

# # excluded after going modular
# say "2) DB ping"
# status="$(http_status -i "${API}/db/ping")"
# assert_status "200" "$status" "/api/db/ping (Fastify↔Prisma↔Postgres)"

# say "3) List users (public endpoint)"
# status="$(http_status -i "${API}/users")"
# assert_status "200" "$status" "/api/users (tables exist, API responds)"

# # ------------------------------------------------------------------------------
# # 2) Register tests
# # ------------------------------------------------------------------------------

# say "4) Register user (may be 201 or 409 if already exists)"
# status="$(http_status -i -X POST "${API}/auth/register" \
#   -H "Content-Type: application/json" \
#   -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\",\"displayName\":\"${TEST_DISPLAY_NAME}\"}")"

# if [ "$status" = "201" ]; then
#   echo "OK: register created user (201)"
# elif [ "$status" = "409" ]; then
#   echo "OK: register duplicate email rejected (409)"
# else
#   echo "FAILED: register unexpected status $status (expected 201 or 409)"
#   exit 1
# fi

# say "5) Register validation should fail (expect 400)"
# status="$(http_status -i -X POST "${API}/auth/register" \
#   -H "Content-Type: application/json" \
#   -d '{"email":"x","password":"1","displayName":""}')"
# assert_status "400" "$status" "register invalid payload rejected"

# # ------------------------------------------------------------------------------
# # 3) Login tests (access token)
# # ------------------------------------------------------------------------------

# say "6) Login wrong password should be 401"
# status="$(http_status -i -X POST "${API}/auth/login" \
#   -H "Content-Type: application/json" \
#   -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"WRONGPASS\"}")"
# assert_status "401" "$status" "login wrong password rejected"

# say "7) Login success: get access token (JWT)"
# TOKEN="$(curl_json -X POST "${API}/auth/login" \
#   -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}" \
#   | extract_token)"

# echo "TOKEN_LEN=${#TOKEN}"
# if [ -z "$TOKEN" ]; then
#   echo "FAILED: login did not return token"
#   exit 1
# fi
# echo "OK: login returned access token"

# # ------------------------------------------------------------------------------
# # 4) Protected endpoints tests
# # ------------------------------------------------------------------------------

# say "8) /users/me without token should be 401"
# status="$(http_status -i "${API}/users/me")"
# assert_status "401" "$status" "/users/me is protected"

# say "9) /users/me with token should be 200"
# status="$(http_status -i "${API}/users/me" -H "Authorization: Bearer $TOKEN")"
# assert_status "200" "$status" "/users/me works with Bearer token"

# say "10) /profiles/me without token should be 401"
# status="$(http_status -i -X PATCH "${API}/profiles/me" \
#   -H "Content-Type: application/json" \
#   -d '{"displayName":"HACKED"}')"
# assert_status "401" "$status" "/profiles/me is protected"

# say "11) /profiles/me with token should be 200"
# status="$(http_status -i -X PATCH "${API}/profiles/me" \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer $TOKEN" \
#   -d '{"displayName":"Sevo","bio":"hello"}')"
# assert_status "200" "$status" "profile update works with Bearer token"

# # ------------------------------------------------------------------------------
# # 5) Refresh token cookie flow (admin user)
# # ------------------------------------------------------------------------------

# say "12) Login admin with cookie jar (should set refresh_token cookie)"
# LOGIN_JSON="$(curl -sk -c "$COOKIE1" "${API}/auth/login" \
#   -H "Content-Type: application/json" \
#   -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}")"

# ACCESS1="$(echo "$LOGIN_JSON" | extract_token)"
# echo "ADMIN_ACCESS_LEN=${#ACCESS1}"
# if [ -z "$ACCESS1" ]; then
#   echo "FAILED: admin login did not return token"
#   exit 1
# fi

# echo "Cookie after login:"
# grep -E "refresh_token" "$COOKIE1" || { echo "FAILED: refresh_token not found in cookie jar"; exit 1; }
# echo "OK: refresh cookie present"

# # Save old cookie to test replay protection
# cp "$COOKIE1" "$COOKIE_OLD"

# say "13) Refresh: should rotate refresh cookie and return new access token"
# REFRESH_JSON="$(curl -sk -b "$COOKIE1" -c "$COOKIE1" -X POST "${API}/auth/refresh")"
# ACCESS2="$(echo "$REFRESH_JSON" | extract_token)"
# echo "REFRESH_ACCESS_LEN=${#ACCESS2}"
# if [ -z "$ACCESS2" ]; then
#   echo "FAILED: refresh did not return token"
#   exit 1
# fi
# echo "OK: refresh returned token"

# echo "Cookie after refresh (should differ from before):"
# grep -E "refresh_token" "$COOKIE1" || { echo "FAILED: refresh_token missing after refresh"; exit 1; }

# say "14) Replay test: using OLD cookie jar on /refresh should be 401"
# status="$(http_status -i -b "$COOKIE_OLD" -X POST "${API}/auth/refresh")"
# assert_status "401" "$status" "old refresh token rejected after rotation"

# say "15) Logout: revoke current refresh token + clear cookie"
# status="$(http_status -i -b "$COOKIE1" -c "$COOKIE1" -X POST "${API}/auth/logout")"
# assert_status "200" "$status" "/auth/logout returns 200"

# say "16) After logout, refresh should be 401"
# status="$(http_status -i -b "$COOKIE1" -c "$COOKIE1" -X POST "${API}/auth/refresh")"
# assert_status "401" "$status" "refresh fails after logout"

# # ------------------------------------------------------------------------------
# # 6) Logout-all test (two sessions)
# # ------------------------------------------------------------------------------

# say "17) Create two admin sessions, then logout-all should revoke both"
# # Session A: cookie jar 1 + access token
# LOGIN_A="$(curl -sk -c "$COOKIE1" "${API}/auth/login" \
#   -H "Content-Type: application/json" \
#   -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}")"
# ACCESS_A="$(echo "$LOGIN_A" | extract_token)"

# # Session B: cookie jar 2
# curl -sk -c "$COOKIE2" "${API}/auth/login" \
#   -H "Content-Type: application/json" \
#   -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}" > /dev/null

# if [ -z "$ACCESS_A" ]; then
#   echo "FAILED: could not get access token for logout-all"
#   exit 1
# fi

# # logout-all requires access token (Bearer)
# status="$(http_status -i -X POST "${API}/auth/logout-all" \
#   -H "Authorization: Bearer $ACCESS_A")"
# assert_status "200" "$status" "logout-all returns 200"

# # Both cookie jars should now fail refresh
# status="$(http_status -i -b "$COOKIE1" -X POST "${API}/auth/refresh")"
# assert_status "401" "$status" "session A refresh fails after logout-all"

# status="$(http_status -i -b "$COOKIE2" -X POST "${API}/auth/refresh")"
# assert_status "401" "$status" "session B refresh fails after logout-all"

# # ------------------------------------------------------------------------------
# # 18) Socket.IO (host) handshake + auth smoke tests
# #   - Handshake via polling (curl) to verify NGINX routing
# #   - Verify socket auth:
# #       * without token -> must fail
# #       * with token    -> must succeed and emit hello/pong
# # ------------------------------------------------------------------------------

# say "18) Socket.IO (host) handshake + auth smoke tests"

# # 18.1 Polling handshake (verifies NGINX -> /socket.io routing)
# handshake="$(curl -k -s -i "${BASE_URL}/socket.io/?EIO=4&transport=polling" | head -n 30)"

# echo "$handshake" | grep -q "HTTP/1.1 200" || {
#   echo "FAILED: socket.io polling handshake not 200"
#   echo "$handshake"
#   exit 1
# }

# echo "$handshake" | grep -q '"sid"' || {
#   echo "FAILED: socket.io polling handshake missing sid"
#   echo "$handshake"
#   exit 1
# }

# echo "OK: polling handshake (sid present)"

# # 18.2 Ensure socket.io-client exists (install once, no npm init needed)
# SOCKET_TEST_DIR="${SOCKET_TEST_DIR:-$(pwd)/.socketio-test}"
# mkdir -p "$SOCKET_TEST_DIR"

# if [ ! -d "$SOCKET_TEST_DIR/node_modules/socket.io-client" ]; then
#   echo "Installing socket.io-client (one-time)..."
#   npm i --prefix "$SOCKET_TEST_DIR" socket.io-client >/dev/null 2>&1 || {
#     echo "FAILED: npm install socket.io-client"
#     echo "Tip: check that node/npm exist and you have write permissions to: $SOCKET_TEST_DIR"
#     exit 1
#   }
# fi

# # 18.3 Socket WITHOUT token must FAIL
# node -e "
# const path = require('path');
# const { io } = require(path.join('${SOCKET_TEST_DIR}', 'node_modules', 'socket.io-client'));

# const s = io('${BASE_URL}', {
#   path: '/socket.io',
#   transports: ['polling','websocket'],
#   rejectUnauthorized: false,
#   timeout: 5000,
# });

# s.on('connect', () => {
#   console.error('FAILED: connected without token');
#   process.exit(1);
# });

# s.on('connect_error', (e) => {
#   console.log('OK: unauthenticated socket rejected:', e.message);
#   process.exit(0);
# });

# setTimeout(() => {
#   console.error('FAILED: timeout waiting for connect_error');
#   process.exit(1);
# }, 7000);
# " || { echo "FAILED: unauthenticated socket test"; exit 1; }

# # 18.4 Socket WITH token must PASS (hello + pong)
# TOKEN="$(curl -k -s ${API}/auth/login \
#   -H "Content-Type: application/json" \
#   -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}" \
#   | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')"

# [ -n "$TOKEN" ] || { echo "FAILED: could not obtain access token for socket auth test"; exit 1; }

# node -e "
# const path = require('path');
# const { io } = require(path.join('${SOCKET_TEST_DIR}', 'node_modules', 'socket.io-client'));

# const s = io('${BASE_URL}', {
#   path: '/socket.io',
#   transports: ['polling','websocket'],
#   rejectUnauthorized: false,
#   timeout: 8000,
#   auth: { token: '${TOKEN}' },
# });

# let gotHello = false;

# s.on('connect', () => {
#   console.log('OK: authenticated socket connected', s.id, 'transport=', s.io.engine.transport.name);
# });

# s.on('hello', (m) => {
#   gotHello = true;
#   console.log('hello', m);
#   s.emit('ping');
# });

# s.on('pong', () => {
#   console.log('pong');
#   s.close();
#   process.exit(gotHello ? 0 : 1);
# });

# s.on('connect_error', (e) => {
#   console.error('FAILED: connect_error', e.message);
#   process.exit(1);
# });

# setTimeout(() => {
#   console.error('FAILED: timeout');
#   process.exit(1);
# }, 12000);
# " || { echo "FAILED: authenticated socket test"; exit 1; }

# echo "OK: Socket.IO auth smoke tests"

# # 18.5 Stronger test than 18.4
# node -e "
# const path = require('path');
# const { io } = require(path.join('${SOCKET_TEST_DIR}', 'node_modules', 'socket.io-client'));

# const s = io('${BASE_URL}', {
#   path: '/socket.io',
#   transports: ['polling','websocket'],
#   rejectUnauthorized: false,
#   timeout: 8000,
#   auth: { token: '${TOKEN}' },
# });

# let gotHello = false;
# let gotPong = false;
# let gotPresenceOnline = false;
# let gotNotify = false;

# s.on('connect', () => {
#   console.log('OK: authenticated socket connected', s.id, 'transport=', s.io.engine.transport.name);
# });

# s.on('hello', (m) => {
#   gotHello = true;
#   console.log('hello', m);

#   // trigger ping/pong
#   s.emit('ping');

#   // trigger private room notification
#   s.emit('notify:self');
# });

# s.on('pong', () => {
#   gotPong = true;
#   console.log('pong');
# });

# s.on('presence:online', (evt) => {
#   // should see an online event (possibly also from other sessions)
#   if (evt && evt.userId) {
#     gotPresenceOnline = true;
#     console.log('presence:online', evt);
#   }
# });

# s.on('notify', (evt) => {
#   if (evt && evt.message === 'private notification') {
#     gotNotify = true;
#     console.log('notify', evt);
#   }
# });

# s.on('connect_error', (e) => {
#   console.error('FAILED: connect_error', e.message);
#   process.exit(1);
# });

# // finish once all expected signals arrived
# const interval = setInterval(() => {
#   if (gotHello && gotPong && gotPresenceOnline && gotNotify) {
#     clearInterval(interval);
#     s.close();
#     console.log('OK: presence + private room notify verified');
#     process.exit(0);
#   }
# }, 100);

# setTimeout(() => {
#   console.error('FAILED: timeout', { gotHello, gotPong, gotPresenceOnline, gotNotify });
#   process.exit(1);
# }, 12000);
# " || { echo "FAILED: authenticated socket test"; exit 1; }

# # # ------------------------------------------------------------------------------
# # # 19) Security flows (Phase 3) — email verify + password reset
# # #   Assumes EXPOSE_DEV_TOKENS=true in dev so request endpoints return token.
# # # ------------------------------------------------------------------------------

# # say "19) Security (Phase 3): email verification + password reset"

# # # 19.1 Request password reset token (public)
# # say "19.1) Password reset: request token (should return ok:true)"
# # RESET_REQ_JSON="$(curl_json -X POST "${API}/auth/password-reset/request" \
# #   -d "{\"email\":\"${ADMIN_EMAIL}\"}")"

# # echo "$RESET_REQ_JSON" | grep -q '"ok":true' || { echo "FAILED: password-reset/request did not return ok:true"; exit 1; }

# # RESET_TOKEN="$(echo "$RESET_REQ_JSON" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')"
# # [ -n "$RESET_TOKEN" ] || { echo "FAILED: reset token missing (set EXPOSE_DEV_TOKENS=true)"; exit 1; }
# # echo "OK: got reset token"

# # # 19.2 Confirm password reset with new password
# # NEW_ADMIN_PASSWORD="NewPass123!"
# # say "19.2) Password reset: confirm token + set new password"
# # status="$(http_status -i -X POST "${API}/auth/password-reset/confirm" \
# #   -H "Content-Type: application/json" \
# #   -d "{\"token\":\"${RESET_TOKEN}\",\"newPassword\":\"${NEW_ADMIN_PASSWORD}\"}")"
# # assert_status "200" "$status" "password-reset/confirm returns 200"

# # # 19.3 Reuse reset token should fail (400)
# # say "19.3) Password reset: reuse token should fail"
# # status="$(http_status -i -X POST "${API}/auth/password-reset/confirm" \
# #   -H "Content-Type: application/json" \
# #   -d "{\"token\":\"${RESET_TOKEN}\",\"newPassword\":\"Whatever123!\"}")"
# # assert_status "400" "$status" "reset token reuse rejected"

# # # 19.4 Login with new password should work
# # say "19.4) Password reset: login with new password"
# # ADMIN_LOGIN_JSON="$(curl_json -X POST "${API}/auth/login" \
# #   -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${NEW_ADMIN_PASSWORD}\"}")"

# # ADMIN_TOKEN_NEW="$(echo "$ADMIN_LOGIN_JSON" | extract_token)"
# # [ -n "$ADMIN_TOKEN_NEW" ] || { echo "FAILED: login with new password did not return token"; exit 1; }
# # echo "OK: login with new password returned token"

# # ADMIN_TOKEN_NEW="$(echo "$ADMIN_LOGIN_JSON" | extract_token)"
# # [ -n "$ADMIN_TOKEN_NEW" ] || { echo "FAILED: ADMIN_TOKEN_NEW empty"; exit 1; }

# # # 19.5 Email verification: request token (authenticated)
# # say "19.5) Email verify: request token (auth required)"
# # VERIFY_REQ_JSON="$(curl -sk -H "Authorization: Bearer ${ADMIN_TOKEN_NEW}" \
# #   -H "Content-Type: application/json" \
# #   -X POST "${API}/auth/email/verify/request")"

# # echo "$VERIFY_REQ_JSON" | grep -q '"ok":true' || { echo "FAILED: email/verify/request did not return ok:true"; exit 1; }

# # VERIFY_TOKEN="$(echo "$VERIFY_REQ_JSON" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')"
# # [ -n "$VERIFY_TOKEN" ] || { echo "FAILED: verify token missing (set EXPOSE_DEV_TOKENS=true)"; exit 1; }
# # echo "OK: got email verify token"

# # # 19.6 Email verification: confirm token
# # say "19.6) Email verify: confirm token"
# # status="$(http_status -i -X POST "${API}/auth/email/verify/confirm" \
# #   -H "Content-Type: application/json" \
# #   -d "{\"token\":\"${VERIFY_TOKEN}\"}")"
# # assert_status "200" "$status" "email/verify/confirm returns 200"

# # # 19.7 Email verification: reuse token should fail (400)
# # say "19.7) Email verify: reuse token should fail"
# # status="$(http_status -i -X POST "${API}/auth/email/verify/confirm" \
# #   -H "Content-Type: application/json" \
# #   -d "{\"token\":\"${VERIFY_TOKEN}\"}")"
# # assert_status "400" "$status" "verify token reuse rejected"

# # echo "OK: Phase 3 security flows passed"

#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

bash "$ROOT/0_backend_basics.sh"
bash "$ROOT/1_backend_user.sh"
bash "$ROOT/2_backend_socket.sh"
bash "$ROOT/3_backend_security.sh"