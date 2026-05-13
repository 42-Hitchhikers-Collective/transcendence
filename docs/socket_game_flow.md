# Socket ↔ Game Logic Flow

Complete walkthrough of how a player action flows from client through sockets to game logic and back to all players.

---

## 1) Connection & Setup (happens once per client)

```
Client Browser
    ↓
    └─→ Connect to `http://server:3000/socket.io` with JWT token
        │
        ├─→ Server: socket.io/socket.ts → setupSocket()
        │   └─→ JWT middleware: socket/middleware/auth.ts → createAuthMiddleware()
        │       │ Validates token, extracts userId (→ playerId)
        │       │ Looks up userName from database
        │       └─→ (socket as any).userId = "user123"
        │           (socket as any).userName = "Alice"
        │
        ├─→ socket.on("connection", ...) fires
        │   └─→ registerSocketHandlers() called
        │       │ Sets up broadcastRoomState() callback function
        │       │ Registers: room handlers, game handlers, connection handlers
        │       └─→ socket event listeners attached for:
        │           • create_room
        │           • join_room
        │           • leave_room
        │           • start_game
        │           • play_card
        │           • draw_card
        │           • send_msg
        │
        └─→ Client receives: socket.emit("hello", {...})
```

---

## 2) Example Flow: `play_card` action (complete trace)

### Timeline

#### **T₁: Client emits**
```ts
// Client-side (browser)
socket.emit("play_card", { cardIndex: 2 });
```

#### **T₂: Server receives event in socket handler**
Location: `apps/api/src/socket/handlers/game.handlers.ts` → `registerGameHandlers()`

```ts
socket.on("play_card", ({ cardIndex }) => {
  const { playerId } = getIdentity(socket);  // ← Extract identity from socket
  const res = gameManager.playCard(playerId, cardIndex);  // ← Call GameManager
  
  if (res.success)
    broadcastRoomState(res.roomId);  // ← Broadcast on success
  else
    socket.emit("error", { message: res.error });  // ← Send error to sender
});
```

**Where `getIdentity()` comes from** (`socket/socket.utils.ts`):
```ts
export function getIdentity(socket: Socket) {
  return {
    playerId: (socket as any).userId,        // ← From JWT
    socketId: socket.id,                      // ← Current socket connection
    userName: (socket as any).userName,       // ← Fetched during auth
  };
}
```

#### **T₃: GameManager.playCard() called**
Location: `apps/api/src/game/gameManager.ts` → `playCard()`

```ts
playCard(playerId: string, cardIndex: number): RoomIdResult {
  // Step 1: Find which room the player is in
  const roomId = this.getPlayerRoomId(playerId);
  if (!roomId)
    return {success: false, error: "Player is not in room"};
  
  // Step 2: Fetch the room object
  const room = this.getRoomById(roomId);
  if (!room || room.state !== "playing" || !room.game)
    return {success: false, error: "No active game found"};
  
  // Step 3: Forward to the UNO engine
  const res = room.game.playCard(playerId, cardIndex);  // ← Gabriel's engine
  
  // Step 4: Return result to socket handler
  if (!res.success)
    return {success: false, error: res.error};
  return {success: true, roomId: roomId};
}
```

**Internal calls inside GameManager:**
- `getPlayerRoomId(playerId)` → looks up in `playerRooms` map
- `getRoomById(roomId)` → looks up in `roomsById` map

#### **T₄: UNO Engine processes (Gabriel's code)**
Location: `apps/api/src/game/uno/UnoGame.ts` (or wherever Gabriel implements it)

```ts
// Inside the UnoGame class (must implement GameInstance interface)
playCard(playerId: string, cardIndex: number): { success: boolean; error?: string } {
  // Step 1: Validate player exists
  if (!this.players.has(playerId))
    return { success: false, error: "Player not found" };
  
  // Step 2: Validate it's their turn
  if (this.currentPlayerId !== playerId)
    return { success: false, error: "Not your turn" };
  
  // Step 3: Validate card index is in range
  const playerHand = this.playerHands.get(playerId);
  if (cardIndex < 0 || cardIndex >= playerHand.length)
    return { success: false, error: "Invalid card index" };
  
  // Step 4: Validate card is playable (UNO rules)
  const card = playerHand[cardIndex];
  if (!this.isCardPlayable(card, this.discardTopCard))
    return { success: false, error: "Card is not playable" };
  
  // Step 5: Update state (IMPORTANT: all these must stay consistent!)
  this.playedCard = playerHand.splice(cardIndex, 1)[0];
  this.discardTopCard = this.playedCard;
  this.playerHands.set(playerId, playerHand.length);
  this.currentPlayerId = this.getNextPlayer();
  
  // Step 6: Return success
  return { success: true };
}
```

**Key constraint:** The engine must keep these fields consistent:
- `currentPlayerId` → who's turn it is
- `discardTopCard` → top card of discard pile
- `drawPileCount` → how many cards left in draw deck
- `playerHands: Map<string, number>` → card counts per player

#### **T₅: Socket handler receives result**
Back in `game.handlers.ts`:

```ts
const res = gameManager.playCard(playerId, cardIndex);

if (res.success)
  broadcastRoomState(res.roomId);  // ← T₅: Success → broadcast
else
  socket.emit("error", { message: res.error });  // ← T₅: Fail → send error
```

#### **T₆: broadcastRoomState() sends state to all players**
Location: `apps/api/src/socket/handlers/index.ts` → `broadcastRoomState()`

```ts
function broadcastRoomState(roomId: string) {
  // Step 1: Get the room object
  const room = gameManager.getRoomById(roomId);
  if (!room) return;  // Safety check
  
  // Step 2: For EACH player in the room...
  room.players.forEach((player) => {
    // Step 3: Sanitize the room data for this specific player
    const sanitizedRoomData = utils.getSanitizedRoom(room, player.playerId);
    
    // Step 4: Send to that player's socket
    socket.nsp.to(player.socketId).emit("room_state", sanitizedRoomData);
  });
  gameManager.debugState();
}
```

**What is `getSanitizedRoom()`?** (from `gameManagerUtils.ts`)

```ts
export function getSanitizedRoom(room: Room, observerPlayerId: string): SanitizedRoom {
  const sanitizedPlayers = room.players.map(p => {
    const isMe = p.playerId === observerPlayerId;
    
    return {
      id: p.playerId,
      cardCount: room.game?.playerHands.get(p.playerId) || 0,
      cards: isMe ? room.game?.getHand(p.playerId) : undefined  // ← Only you see your cards
    };
  });

  return {
    id: room.id,
    state: room.state,
    players: sanitizedPlayers,
    game: room.game ? {
      currentPlayerId: room.game.currentPlayerId,
      discardTopCard: room.game.discardTopCard,
      drawPileCount: room.game.drawPileCount,
    } : undefined
  };
}
```

#### **T₇: Client receives broadcast**

```ts
// Client-side (browser)
socket.on("room_state", (sanitizedRoom) => {
  // Frontend updates UI with:
  // - You see your 7 cards
  // - Alice shows cardCount=5 (no cards array)
  // - Bob shows cardCount=6 (no cards array)
  // - currentPlayerId = "user456" (it's Bob's turn now)
  // - discardTopCard = { color: "red", value: "5" }
  
  updateUI(sanitizedRoom);
});
```

---

## 3) Other Actions (follow same pattern)

All game actions follow the same flow:

```
Client emits → Socket handler → GameManager → Engine (validate & update) 
  → Return result → Socket broadcasts room_state → All clients receive
```

### `draw_card` flow
```ts
socket.on("draw_card", () => {
  const { playerId } = getIdentity(socket);
  const res = gameManager.drawCard(playerId);  // ← Calls engine.drawCard()
  
  if (res.success)
    broadcastRoomState(res.roomId);
  else
    socket.emit("error", { message: res.error });
});
```

### `join_room` flow (room lifecycle instead of game rules)
```ts
socket.on("join_room", ({ roomName }) => {
  const { playerId, socketId, userName } = getIdentity(socket);
  const res = gameManager.joinRoom(roomName, playerId, socketId, userName);
  
  if (!res.success) {
    socket.emit("error", { message: res.error });
    return;
  }
  
  const roomId = res.room.id;
  socket.join(roomId);  // ← Socket.IO room grouping
  socket.emit("room_joined", { roomName });
  broadcastRoomState(roomId);
});
```

### `start_game` flow (initializes engine)
```ts
socket.on("start_game", () => {
  const { playerId } = getIdentity(socket);
  const res = gameManager.startGame(playerId);  // ← Must set room.game here!
  
  if (!res.success) {
    socket.emit("error", { message: res.error });
    return;
  }
  
  const roomId = res.room.id;
  broadcastRoomState(roomId);
});
```

And in `GameManager.startGame()`:
```ts
startGame(playerId: string): RoomResult {
  // ... validation ...
  room.state = "playing";
  
  // THIS IS WHERE THE ENGINE IS CREATED (Inbar's responsibility to wire this)
  // room.game = new UnoGame(room.players);  // ← Gabriel provides the class
  
  return { success: true, room: room };
}
```

---

## 4) Reconnection Flow (important!)

#### **Without reconnection** (player disconnects forever):
```
Client disconnects
  ↓
socket.on("disconnect") fires
  ↓
start grace period (15s timeout)
  ↓
setTimeout triggers
  ↓
gameManager.leaveRoom(playerId)  ← Player removed
  ↓
room deleted if empty OR room state updates
  ↓
Other players receive room_state without the disconnected player
```

#### **With reconnection** (player reconnects within 15s):
```
Same client reconnects (new socket.id, same JWT userId)
  ↓
setupSocket() → JWT verified → socket gets (socket as any).userId = same playerId
  ↓
registerConnectionHandlers() called
  ↓
const roomId = gameManager.getPlayerRoomId(playerId);  // ← Still there!
if (roomId) {
  socket.join(roomId);  // ← Re-join Socket.IO room
  broadcastRoomState(roomId);  // ← Receive full state again
}
  ↓
cancelDisconnectTimer() cancels the 15s grace timeout
  ↓
Player continues game without interruption
```

**Problem to fix:** The `player.socketId` in the room is still the OLD socket id!
So if they reconnect and then leave, `broadcastRoomState()` emits to the old socket.

**Solution (Inbar-owned):** Update the stored socketId.
```ts
// Add to GameManager:
updatePlayerSocketId(playerId: string, newSocketId: string): void {
  const roomId = this.getPlayerRoomId(playerId);
  if (roomId) {
    const room = this.roomsById.get(roomId);
    if (room) {
      const player = room.players.find(p => p.playerId === playerId);
      if (player) {
        player.socketId = newSocketId;
      }
    }
  }
}

// Call in connection handler:
registerConnectionHandlers(app, socket, broadcastRoomState) {
  const { playerId } = getIdentity(socket);
  const roomId = gameManager.getPlayerRoomId(playerId);
  if (roomId) {
    gameManager.updatePlayerSocketId(playerId, socket.id);  // ← ADD THIS
    socket.join(roomId);
    broadcastRoomState(roomId);
  }
  ...
}
```

---

## 5) Call hierarchy (who calls whom)

```
Socket Layer (Inbar)
├─ setupSocket()
│  └─ registerSocketHandlers()
│     ├─ registerRoomHandlers()
│     │  ├─ createRoom()    → GameManager.createRoom()
│     │  ├─ joinRoom()      → GameManager.joinRoom()
│     │  └─ leaveRoom()     → GameManager.leaveRoom()
│     ├─ registerGameHandlers()
│     │  ├─ startGame()     → GameManager.startGame()  [must set room.game]
│     │  ├─ playCard()      → GameManager.playCard()   → Engine.playCard()
│     │  └─ drawCard()      → GameManager.drawCard()   → Engine.drawCard()
│     ├─ registerConnectionHandlers()
│     │  ├─ Auto-rejoin on connect
│     │  └─ Grace period on disconnect
│     └─ broadcastRoomState()
│        ├─ GameManager.getRoomById()
│        ├─ For each player:
│        │  ├─ getSanitizedRoom()     [from utils]
│        │  └─ socket.nsp.to().emit("room_state")
│        └─ GameManager.debugState()
│
GameManager (Inbar)
├─ Room lifecycle: createRoom, joinRoom, leaveRoom
├─ Game control: startGame, playCard, drawCard
├─ State queries: getPlayerRoomId, getRoomById, getAllRooms
└─ Mapping: playerId ↔ roomId, roomName ↔ Room
    
Game Engine (Gabriel) — implements GameInstance interface
├─ playCard(playerId, cardIndex)
├─ drawCard(playerId)
├─ getHand(playerId)
└─ State maintenance:
   ├─ currentPlayerId
   ├─ discardTopCard
   ├─ drawPileCount
   └─ playerHands: Map<string, number>
```

---

## 6) Key takeaways

1. **Sockets are dumb**: They don't know UNO rules. They just forward actions to `GameManager` and broadcast the result.

2. **GameManager is a router**: It tracks rooms/players and forwards game actions to the engine. It doesn't know UNO rules either.

3. **Engine is authoritative**: Only the engine knows what's valid. It updates state and signals success/failure.

4. **Broadcast is sanitized**: Each player sees only their own hand, not others'. This prevents cheating.

5. **Reconnection requires socketId update**: Without it, broadcasts target the old disconnected socket.

6. **All failures stop propagation**: If engine returns error, socket sends error event (no broadcast).
   - If socket finds no room, it sends error event (no engine call).
   - This prevents corrupting state with partially-validated actions.
