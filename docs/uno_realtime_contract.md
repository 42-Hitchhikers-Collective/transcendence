# UNO Realtime Contract (Socket ↔ Game)

This document is the shared interface between:

- **Inbar**: Socket layer + `GameManager` (`apps/api/src/game/gameManager.ts`) + reconnection + broadcasting.
- **Gabriel**: UNO engine implementing `GameInstance` (authoritative game rules + state transitions).

Goal: both sides can work independently by following this contract.

---

## 1) Core concepts

### Identity
- **playerId**: stable user identity (comes from JWT `sub`). Used by game logic.
- **socketId**: current connection id. Used only for network delivery.

Server sets these on connect via JWT middleware:
- `socket.userId` → `playerId`
- `socket.userName`

See: `apps/api/src/socket/middleware/auth.ts` and `apps/api/src/socket/socket.utils.ts`.

### Rooms
- Players join a **room** (aka lobby instance) identified by `roomId`.
- `GameManager` owns room lifecycle and membership.

### Authoritative server model
- Client sends intent (e.g. “play card index 2”).
- Server validates, mutates game state, then broadcasts the resulting state.

No client is allowed to compute authoritative rules.

---

## 2) Server → Client state model

### `room_state` (authoritative snapshot)
After any successful state change, server broadcasts `room_state` **to each player individually**, with a **sanitized** view:
- You see your own full hand.
- You only see other players’ card counts.

Payload shape (current code matches `SanitizedRoom`):

```ts
type Card = { color: string; value: string };

type SanitizedPlayer = {
  id: string;              // playerId
  cardCount: number;       // number of cards in hand
  cards?: Card[];          // only present for the receiving player
};

type SanitizedRoom = {
  id: string;              // roomId
  state: 'waiting' | 'playing' | 'finished';
  players: SanitizedPlayer[];
  game?: {
    currentPlayerId: string;
    discardTopCard: Card;
    drawPileCount: number;
  };
};
```

Broadcast rule:
- On any update, server emits `room_state` to every player (one emit per player, sanitized for that player).

Implementation reference:
- Sanitization: `apps/api/src/game/gameManagerUtils.ts`
- Broadcast loop: `apps/api/src/socket/handlers/index.ts`

---

## 3) Client → Server socket events (current contract)

All events are on the default namespace with path `/socket.io`.

### Errors
If an action fails, server emits:

- **Event**: `error`
- **Payload**: `{ message: string }`

Clients should display the message and keep their current UI state.

### Room lifecycle

#### `create_room`
- Client → Server: `{ roomName: string }`
- Server → Client: `room_created` with `{ roomName: string }`
- Server also joins the creator to the room and later will emit `room_state` once membership is updated.

Validation rules (current `GameManager`):
- non-empty, max 10 chars
- allowed chars: `a-zA-Z0-9- _ ! ? .`
- unique room name

#### `join_room`
- Client → Server: `{ roomName: string }`
- Server → Client: `room_joined` with `{ roomName: string }`
- Server → Room players: `room_state` (sanitized)

#### `leave_room`
- Client → Server: `{}`
- Server → Room players: `room_state` (sanitized)

### Game actions

#### `start_game`
- Client → Server: `{}`
- Server → Room players: `room_state` (sanitized)

Note: `GameManager.startGame()` must initialize `room.game` (see section 5).

#### `play_card`
- Client → Server: `{ cardIndex: number }`
- Server → Room players: `room_state` (sanitized)

`cardIndex` is the index inside the **player’s current hand array**.

#### `draw_card`
- Client → Server: `{}`
- Server → Room players: `room_state` (sanitized)

### Chat (optional / already present)

#### `send_msg`
- Client → Server: `{ msg: string }`
- Server → Room: `chat_message` with `{ msg: string; senderId: string }`

Current validation: `1..200` characters.

---

## 4) Reconnection rules (important)

### Desired behavior
- A reconnecting player (same `playerId`) should resume the same room and continue the game.
- During a grace period, a disconnect should **not** immediately kick the player.

### Current implementation
- On connect, server auto-joins the socket to `roomId` if `GameManager` says the player is in a room.
- On disconnect, server waits `RECONNECTION_GRACE_PERIOD` then calls `leaveRoom(playerId)`.

### Required fix/requirement
`broadcastRoomState` currently emits to each player’s stored `player.socketId`.
If a user reconnects, their `socket.id` changes, so `GameManager` must update the player entry.

**Contract requirement:**
- On each connection (or on auto-rejoin), `GameManager` must update `{ playerId → latest socketId }`.

Implementation options (Inbar-owned):
- Add `GameManager.updateSocketId(playerId, socketId)` and call it on connect.
- Or adjust `broadcastRoomState` to emit via room membership (`io.to(roomId)`) and include per-user hand via a different mechanism.

The current code is using the per-player socketId approach, so the **expected** solution is: update the stored socketId.

---

## 5) Boundary between `GameManager` (Inbar) and UNO engine (Gabriel)

### Inbar owns: `GameManager`
File: `apps/api/src/game/gameManager.ts`

Responsibilities:
- Create/join/leave rooms
- Track which room each `playerId` is in
- Start games (`room.state = 'playing'` and set `room.game = ...`)
- Forward actions to the engine (`room.game.playCard/drawCard`)
- Keep room membership correct on reconnect

`GameManager` is *not* the rules engine.

### Gabriel owns: UNO engine implementing `GameInstance`
File location is up to Gabriel (e.g. `apps/api/src/game/uno/UnoGame.ts`).

The engine must satisfy the interface used by sockets + sanitization:

```ts
type ActionResult = { success: true } | { success: false; error: string };

type Card = { color: string; value: string };

export interface GameInstance {
  // Used by `getSanitizedRoom` for UI snapshots
  currentPlayerId: string;
  discardTopCard: Card;
  drawPileCount: number;
  playerHands: Map<string, number>; // playerId -> card count

  // Called by socket handlers (authoritative actions)
  playCard(playerId: string, cardIndex: number): ActionResult;
  drawCard(playerId: string): ActionResult;

  // Used only to reveal the observing player’s own hand
  getHand(playerId: string): Card[];
}
```

### Engine behavior requirements (minimum)
- `playCard` must validate:
  - player exists in game
  - it is player’s turn (unless your rules allow exceptions)
  - `cardIndex` is in range
  - card is legally playable
- `drawCard` must validate:
  - player exists in game
  - it is player’s turn (if required)
  - draw pile refill behavior when empty (if you implement it)
- On success, engine must update:
  - the player’s hand (and `playerHands` counts)
  - `discardTopCard`
  - `currentPlayerId`
  - detect game end and expose it to `GameManager` (see below)

### Game end
Current `GameManager` has `state: 'finished'` but no end-game hook.

Suggested minimal contract (agree before implementing):
- Engine sets an internal `winnerPlayerId?: string` and returns success.
- `GameManager` checks after each action and can flip `room.state = 'finished'`.

(If you prefer, extend `GameInstance` with `isFinished()` / `winnerPlayerId`—but do it once and keep sockets consistent.)

---

## 6) Minimal frontend expectations (so backend stays stable)

Frontend should treat `room_state` as the single source of truth:
- Render `players[]` list
- For “me”: use `cards` array
- For others: use `cardCount`
- Use `game.currentPlayerId` to show whose turn it is
- Use `game.discardTopCard` + `drawPileCount` for table UI

Actions:
- Emit `play_card` using the index into your `cards` array.

---

## 7) Ownership checklist (what each person implements)

### Inbar (sockets + GameManager)
- Ensure reconnect updates stored `socketId` for the `playerId`
- Ensure room broadcasts always reach correct sockets
- Ensure `start_game` creates engine instance and assigns `room.game`
- Keep event payloads stable as described in section 3

### Gabriel (UNO engine)
- Implement `GameInstance`
- Implement UNO rules and state transitions
- Ensure engine state fields are always consistent for `room_state`

---

## 8) Change control

If you want to change:
- event names/payloads
- `GameInstance` interface
- `room_state` shape

Update this doc first, then update both sides in the same PR (or coordinated PRs).
