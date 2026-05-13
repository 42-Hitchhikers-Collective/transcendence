# API

Fastify backend for Transcendence. Handles auth, user data, and real-time game via Socket.IO.

## Stack

- **Fastify** — HTTP server
- **Prisma** — ORM + migrations (PostgreSQL)
- **Socket.IO** — real-time game communication
- **JWT** — stateless authentication (`@fastify/jwt`)
- **bcrypt** — password hashing

## Folder structure

```
src/
  game/           # Game logic: GameManager, room/player state, types
  plugins/        # Fastify plugins: auth, prisma, rate limiting, multipart
  routes/         # HTTP route handlers: auth, users, profiles, friends
  services/       # Business logic: auth service
  socket/
    socket.ts     # Socket.IO setup, JWT middleware, connection lifecycle
    handlers/     # Game event handlers (rooms, cards, game state)
  server.ts       # App entry point
prisma/
  schema.prisma   # Database schema
  migrations/     # Applied automatically on startup
  seed.ts         # Mock data
```

## Endpoints

All endpoints are prefixed with `/api`.

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | — | Register with email, password, userName |
| POST | `/login` | — | Login, returns JWT |
| POST | `/logout` | — | Logout (clears session) |

### Users — `/api/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | — | List all users (id, username, avatarUrl) |
| GET | `/me` | JWT | Get current user (email, profile) |
| GET | `/me/history` | JWT | Get last 20 game results for current user |
| GET | `/:username` | JWT | Get public profile by username |

### Profiles — `/api/profiles`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PATCH | `/me` | JWT | Update username, avatarUrl, bio |
| POST | `/me/avatar` | JWT | Upload avatar image (jpeg/png/webp/gif, max 5MB), returns URL |

### Friends — `/api/friends`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | JWT | List friends with online status |
| GET | `/requests` | JWT | List incoming pending friend requests |
| POST | `/request` | JWT | Send a friend request |
| POST | `/accept` | JWT | Accept a friend request |
| DELETE | `/:id` | JWT | Remove a friend |

### Other

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/db/ping` | DB connectivity check |

## Authentication

Protected routes require a JWT in the `Authorization` header:
```
Authorization: Bearer <token>
```

Token is returned from `POST /api/auth/login`. No expiry — tokens are valid until the server secret changes.

## Socket.IO

Connects at `/socket.io`. Requires JWT in handshake:
```js
const socket = io({ auth: { token: "<jwt>" } });
```

### Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `create_room` | client → server | Create a new game room |
| `join_room` | client → server | Join existing room `{ roomId }` |
| `leave_room` | client → server | Leave current room |
| `start_game` | client → server | Start the game in current room |
| `play_card` | client → server | Play a card `{ cardIndex }` |
| `draw_card` | client → server | Draw a card |
| `room_state` | server → client | Broadcast updated room/game state |
| `presence:online` | server → all | User connected `{ userId }` |
| `presence:offline` | server → all | User disconnected `{ userId }` |

## Seed

Populate the DB with 7 mock users and game history:
```bash
make db-seed
```

Mock users (all passwords follow the pattern `<name>1234`):

| Username | Email |
|----------|-------|
| alice | alice@example.com |
| bob | bob@example.com |
| charlie | charlie@example.com |
| diana | diana@example.com |
| eve | eve@example.com |
| frank | frank@example.com |
| grace | grace@example.com |

## Database Schema
![Database Schema](<db_schema.png>)