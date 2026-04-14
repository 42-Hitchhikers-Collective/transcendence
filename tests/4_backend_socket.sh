#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "$0")" && pwd)/_lib.sh"

need_cmd node
need_cmd npm

say "2) Socket.IO polling handshake (NGINX routing)"
handshake="$(curl -k -s -i "${BASE_URL}/socket.io/?EIO=4&transport=polling" | head -n 30)"

echo "$handshake" | grep -q "HTTP/1.1 200" || {
  echo "FAILED: socket.io polling handshake not 200"
  echo "$handshake"
  exit 1
}

echo "$handshake" | grep -q '"sid"' || {
  echo "FAILED: socket.io polling handshake missing sid"
  echo "$handshake"
  exit 1
}
echo "OK: polling handshake (sid present)"

say "2.1) Ensure socket.io-client installed (one-time)"
mkdir -p "$SOCKET_TEST_DIR"
if [ ! -d "$SOCKET_TEST_DIR/node_modules/socket.io-client" ]; then
  npm i --prefix "$SOCKET_TEST_DIR" socket.io-client >/dev/null 2>&1 || {
    echo "FAILED: npm install socket.io-client"
    exit 1
  }
fi

say "2.2) Socket without token must FAIL"
node -e "
const path = require('path');
const { io } = require(path.join('${SOCKET_TEST_DIR}', 'node_modules', 'socket.io-client'));

const s = io('${BASE_URL}', {
  path: '/socket.io',
  transports: ['polling','websocket'],
  rejectUnauthorized: false,
  timeout: 5000,
});

s.on('connect', () => {
  console.error('FAILED: connected without token');
  process.exit(1);
});

s.on('connect_error', (e) => {
  console.log('OK: unauthenticated socket rejected:', e.message);
  process.exit(0);
});

setTimeout(() => {
  console.error('FAILED: timeout waiting for connect_error');
  process.exit(1);
}, 7000);
"

say "2.3) Socket with token must PASS"
TOKEN="$(curl -k -s ${API}/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}" \
  | extract_token)"

[ -n "$TOKEN" ] || { echo "FAILED: could not obtain access token for socket auth test"; exit 1; }

node -e "
const path = require('path');
const { io } = require(path.join('${SOCKET_TEST_DIR}', 'node_modules', 'socket.io-client'));

const s = io('${BASE_URL}', {
  path: '/socket.io',
  transports: ['polling','websocket'],
  rejectUnauthorized: false,
  timeout: 8000,
  auth: { token: '${TOKEN}' },
});

let gotHello = false;

s.on('connect', () => {
  console.log('OK: authenticated socket connected', s.id, 'transport=', s.io.engine.transport.name);
});

s.on('hello', (m) => {
  gotHello = true;
  console.log('hello', m);
  s.emit('ping');
});

s.on('pong', () => {
  console.log('pong');
  s.close();
  process.exit(gotHello ? 0 : 1);
});

s.on('connect_error', (e) => {
  console.error('FAILED: connect_error', e.message);
  process.exit(1);
});

setTimeout(() => {
  console.error('FAILED: timeout');
  process.exit(1);
}, 12000);
"

echo "OK: Socket.IO auth smoke tests"