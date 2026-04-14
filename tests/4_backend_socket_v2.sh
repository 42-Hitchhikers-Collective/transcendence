#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "$0")" && pwd)/_lib.sh"

need_cmd node

# Two test users for multiplayer tests
USER1_EMAIL="socket_p1@example.com"
USER1_PASS="socket1234"
USER2_EMAIL="socket_p2@example.com"
USER2_PASS="socket1234"

# Register both users (ignore 409 if already exist)
curl -sk -o /dev/null -X POST "${API}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${USER1_EMAIL}\",\"password\":\"${USER1_PASS}\",\"userName\":\"socket_p1\"}"

curl -sk -o /dev/null -X POST "${API}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${USER2_EMAIL}\",\"password\":\"${USER2_PASS}\",\"userName\":\"socket_p2\"}"

TOKEN1="$(curl -sk "${API}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${USER1_EMAIL}\",\"password\":\"${USER1_PASS}\"}" | extract_token)"

TOKEN2="$(curl -sk "${API}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${USER2_EMAIL}\",\"password\":\"${USER2_PASS}\"}" | extract_token)"

[ -n "$TOKEN1" ] || { echo "FAILED: could not get token for player 1"; exit 1; }
[ -n "$TOKEN2" ] || { echo "FAILED: could not get token for player 2"; exit 1; }
echo "OK: both players authenticated"

say "5.1) Player 1 creates a room, player 2 joins, game starts"
node -e "
const path = require('path');
const { io } = require(path.join('${SOCKET_TEST_DIR}', 'node_modules', 'socket.io-client'));

const opts = {
  path: '/socket.io',
  transports: ['polling', 'websocket'],
  rejectUnauthorized: false,
  timeout: 8000,
};

const p1 = io('${BASE_URL}', { ...opts, auth: { token: '${TOKEN1}' } });
const p2 = io('${BASE_URL}', { ...opts, auth: { token: '${TOKEN2}' } });

let roomId = null;
let p1Connected = false;
let p2Connected = false;

function tryJoin() {
  if (!p1Connected || !p2Connected || !roomId) return;
  p2.emit('join_room', { roomId });
}

p1.on('connect', () => {
  p1Connected = true;
  console.log('OK: player 1 connected');
  p1.emit('create_room');
});

p1.on('room_created', (data) => {
  roomId = data.roomId;
  console.log('OK: room created', roomId);
  tryJoin();
});

p2.on('connect', () => {
  p2Connected = true;
  console.log('OK: player 2 connected');
  tryJoin();
});

p2.on('room_joined', (data) => {
  console.log('OK: player 2 joined room', data.roomId);
  p1.emit('start_game');
});

let p1GotState = false;
let p2GotState = false;

function checkDone() {
  if (p1GotState && p2GotState) {
    console.log('OK: both players received room_state after start_game');
    p1.close();
    p2.close();
    process.exit(0);
  }
}

p1.on('room_state', (data) => {
  if (data.state === 'playing') {
    console.log('OK: player 1 sees game playing');
    p1GotState = true;
    checkDone();
  }
});

p2.on('room_state', (data) => {
  if (data.state === 'playing') {
    console.log('OK: player 2 sees game playing');
    p2GotState = true;
    checkDone();
  }
});

p1.on('error', (e) => { console.error('FAILED: p1 error', e); process.exit(1); });
p2.on('error', (e) => { console.error('FAILED: p2 error', e); process.exit(1); });
p1.on('connect_error', (e) => { console.error('FAILED: p1 connect_error', e.message); process.exit(1); });
p2.on('connect_error', (e) => { console.error('FAILED: p2 connect_error', e.message); process.exit(1); });

setTimeout(() => {
  console.error('FAILED: timeout — roomId=' + roomId + ' p1=' + p1Connected + ' p2=' + p2Connected);
  process.exit(1);
}, 15000);
"

say "5.2) /rooms endpoint lists active rooms"
status="$(http_status -i "${BASE_URL}/rooms")"
assert_status "200" "$status" "GET /rooms returns 200"
