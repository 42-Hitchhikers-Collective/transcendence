# Backend Socket Emit List — Errors

> A list of errors that the backend emits via sockets and that the frontend can use to handle navigation and room handling edgecases, organized by socket event name.

---

## `connect_error` (Socket.IO built-in)

Emitted by Socket.IO when the auth middleware calls `next(new Error(...))`.

| Error Message | Case |
|---|---|
| `"unauthorized"` | No token provided, invalid JWT, JWT plugin unavailable, missing `sub` in payload, or user profile not found |

---

## `error`

Payload: `{ message: string }`

### Room Events

| Error Message | Case |
|---|---|
| `"Player already in a room"` | `create_room` — player is already assigned to a room |
| `"Room name cannot be empty"` | `create_room` — room name is empty or whitespace only |
| `"Room name already exists"` | `create_room` — a room with that name already exists |
| `"Room name cannot exceed 20 characters"` | `create_room` — room name is too long |
| `"Room name contains invalid characters"` | `create_room` — name contains characters outside `[a-zA-Z0-9\-_!?.]` |
| `"Requested room not found"` | `join_room` — no room with the given name exists |
| `"Player already in room (Dropped)"` | `join_room` — player is already in the same room (rejoin after drop) |
| `"Player already in a different room"` | `join_room` — player is in another room and must leave first |
| `"Room is full"` | `join_room` — room has reached MAX_PLAYERS_PER_ROOM (4) |
| `"Game already begun"` | `join_room` — room state is not `"waiting"` |
| `"Player not found"` | `join_room` — player not found in online players map |
| `"Player not in room"` | `leave_room` — player is not assigned to any room |
| `"Room object not found"` | `leave_room` — player's room ID doesn't match any room in the map |
| `"Player not in room array"` | `leave_room` — player not found in the room's `players[]` array |

### Game Events

| Error Message | Case |
|---|---|
| `"Player is not in room"` | `play_card` / `draw_card` / `select_wild_color` / `on_press_pass_button` — player has no room assignment |
| `"Player is not in a room"` | `start_game` / `canvas_ready` — player has no room assignment |
| `"No active game found"` | `play_card` / `draw_card` / `select_wild_color` / `on_press_pass_button` — room state is not `"playing"` or `room.game` is undefined |
| `"Invalid card index"` | `play_card` — card index is out of bounds for the player's hand |
| `"Card play failed"` | `play_card` — the game logic rejected the card play (e.g., invalid card for current discard) |
| `"Game logic error: invalid move"` | `draw_card` — draw failed in game logic |
| `"Game logic error: invalid move"` | `on_press_pass_button` — pass turn failed in game logic |
| `"Room not found"` | `start_game` — room ID doesn't exist in the rooms map |
| `"Start conditions aren't met"` | `start_game` — room state is not `"waiting"`, or fewer than 2 players in the room |

### Chat Events

| Error Message | Case |
|---|---|
| `"Player is not in room"` | `send_msg` — player not assigned to any room |
| `"Room not found"` | `send_msg` — player's room ID doesn't match any room |
| `"Message must be between 1 and 200 characters"` | `send_msg` — message is empty or exceeds MAX_MSG_LENGTH |
| `"Message contains invalid characters"` | `send_msg` — message contains characters outside `[a-zA-Z0-9\-_!?.]` |

---

## `game_start_error`

Payload: `{ message: string }`

Emitted **in addition to** the `error` event for `start_game` failures.

| Error Message | Case |
|---|---|
| `"Player is not in a room"` | `start_game` — player has no room assignment |
| `"Room not found"` | `start_game` — room ID doesn't exist |
| `"Start conditions aren't met"` | `start_game` — not in `"waiting"` state or fewer than 2 players |

---

## `op_error` (commented out)

Payload: `{ message: string }`

Found in `friend.handlers.ts` but **entirely commented out**. Listed for reference:

| Error Message | Case |
|---|---|
| `"Friends service not available"` | Friend-related socket events — service not injected |
| `"Invalid target"` | Friend invite — no target or targeting self |
| `"Internal error"` | Friend operations — unexpected exception |
| `(dynamic res.error)` | Various friend service call failures |
