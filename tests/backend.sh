#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

bash "$ROOT/0_backend_basics.sh"
bash "$ROOT/1_backend_user.sh"
bash "$ROOT/2_backend_security.sh"
bash "$ROOT/3_backend_roles.sh"
bash "$ROOT/4_backend_socket.sh"

# bash "$ROOT/5_backend_friends.sh"
# bash "$ROOT/6_backend_lobbies.sh"
# bash "$ROOT/7_backend_games.sh"
# bash "$ROOT/8_backend_chat.sh"
# bash "$ROOT/9_backend_notifications.sh"
# bash "$ROOT/10_backend_oauth.sh"

## ./tests/backend.sh
## RUN_RL_PROOF=1 ./tests/backend.sh (checks USER → 403)