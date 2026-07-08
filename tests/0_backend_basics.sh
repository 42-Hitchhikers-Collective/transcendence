#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "$0")" && pwd)/_lib.sh"

say "0) Health check"
status="$(http_status -i "${API}/health")"
assert_status "200" "$status" "/api/health reachable via NGINX"

say "0.1) DB ping"
status="$(http_status -i "${API}/db/ping")"
assert_status "200" "$status" "/api/db/ping (Fastify↔Prisma↔Postgres)"

say "0.2) List users (public endpoint)"
status="$(http_status -i "${API}/users")"
assert_status "200" "$status" "/api/users (tables exist, API responds)"