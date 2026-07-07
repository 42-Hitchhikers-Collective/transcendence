*This project has been created as part of the 42 curriculum by grial, ilazar, jslusark, wlucke.*

# transcendence

A real-time multiplayer UNO card game — the final project of the 42 Common Core. Play UNO with friends in custom rooms, chat in real time, track your stats on a leaderboard, and more.

---

## Description
**Project name:** Transcendence (UNO)
**Our Goal:** Build a single-page web application where users can play the UNO card game against each other in real time. All communication between frontend and backend is encrypted via HTTPS. The project demonstrates mastery of full-stack web development, real-time networking, game logic, and DevOps practices.

**Key Features:**
- 🎮 **Multiplayer UNO** — full rule engine (draw, skip, reverse, +2, +4, wild cards, UNO call)
- 🔐 **Authentication** — email/password registration & login with JWT via HttpOnly cookies
- 💬 **Real-time Chat** — in-room messaging with system notifications (join, leave, win, UNO)
- 🏆 **Leaderboard & Stats** — ranked by wins, game history with opponent details
- 👤 **User Profiles** — avatar upload, game history, stats display
- 🔒 **HTTPS** — all traffic encrypted via NGINX TLS termination
- 🐳 **Docker** — fully containerized (API, Web, DB, NGINX) with a single `make` command

---

## Instructions

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Docker | 24+ | Container runtime |
| Docker Compose | 2+ | Multi-container orchestration |
| Make | (any) | Build automation |
| OpenSSL | (any) | SSL certificate generation |
| Node.js | 20+ | Required for `.env` generation |

### Quick Start

Clone the repository then run this single command to build the project from scratch and start all containers:

```bash
make           # or 'make setup' — full clean build from scratch
```

This single command:
1. Creates `.env` with random secure credentials
2. Generates self-signed SSL certificates
3. Cleans any previous Docker state
4. Builds & starts all 4 containers (db, api, web, nginx)
5. Pushes the Prisma schema to PostgreSQL
6. Seeds the database with test users and game history

These commands can also be executed individually for more control. Please see the **Makefile** commmands section below for details.

**Open:** `https://localhost:8443` (accept the self-signed certificate warning)

### Test Users (seeded)

| Username | Email | Password |
|----------|-------|----------|
| alice | alice@example.com | Alice12345 |
| bob | bob@example.com | Bob12345 |
| charlie | charlie@example.com | Charlie12345 |

### Makefile Commands

| Command | Description |
|---------|-------------|
| `make` / `make setup` | Full clean build from scratch (wipes everything) |
| `make up` | Build & start all containers (preserves DB data) |
| `make down` | Stop all containers (preserves DB data) |
| `make re` | Restart all containers (preserves DB data) |
| `make clean` | Stop containers & remove volumes |
| `make rebuild` | `clean` + `up` |
| `make db-migrate` | Run Prisma migration |
| `make db-seed` | Re-seed the database |
| `make prisma-studio` | Open Prisma Studio at `http://localhost:5555` |
| `make logs` | Tail all container logs |

### Environment Variables (`.env`)

Generated automatically by `make env`. The original `.env` file is never committed, only a `.env.example` placeholder values is available:

| Variable | Purpose |
|----------|---------|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Database credentials |
| `DATABASE_URL` | Prisma connection string |
| `JWT_SECRET` | JWT signing key |
| `EXPOSE_DEV_TOKENS` | Dev-only: expose tokens in API responses for test suite |

---

## Resources

### Project Documentation

| Document | Description |
|----------|-------------|
| [`docs/setup.md`](docs/setup.md) | Full setup guide |
| [`docs/secure-connections.md`](docs/secure-connections.md) | HTTPS architecture & verification |
| [`docs/auth-token-architecture.md`](docs/auth-token-architecture.md) | JWT cookie flow |
| [`docs/source-map-errors.md`](docs/source-map-errors.md) | Firefox console warnings explanation |
| [`docs/phaser-console-errors.md`](docs/phaser-console-errors.md) | Phaser race condition fixes |
| [`docs/db_visualize.md`](docs/db_visualize.md) | Database visualization guide |
| [`docs/frontend-routing.md`](docs/frontend-routing.md) | Frontend routing architecture |
| [`docs/FRONTEND_ROOM_PAYLOAD.md`](docs/FRONTEND_ROOM_PAYLOAD.md) | Room data contract |
| [`docs/api-concepts.md`](docs/api-concepts.md) | API design overview |
| [`docs/input-validation.md`](docs/input-validation.md) | Validation strategy |
| [`apps/web/documentation/architecture.md`](apps/web/documentation/architecture.md) | Frontend architecture |
| [`apps/web/documentation/socket_error_list.md`](apps/web/documentation/socket_error_list.md) | Socket error reference |

### External References
- [UNO Official Rules](https://en.wikipedia.org/wiki/Uno_(card_game))
- [Fastify Documentation](https://fastify.dev/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Docker Documentation](https://docs.docker.com/)

### AI Usage

AI assistants were used throughout the project for:
- **Brainstorming** — researching solutions, generating ideas, and exploring alternative approaches to problems.
- **Debugging**: Ai has been incredibly useful when debugging partner code and identifying missing data or misconfigurations, especially in cases where we couldn't communicate directly with the author. It has helped us understand code we did not own and fix issues quickly, avoiding potential delays in our development process.
- **Documentation**: recording important findings in notes and finalising documentation for the project.

All AI-generated code was reviewed and tested, thoroughly, human verification was a must to ensure correctness and functionality.

---

## Team Information

<!-- | Login | Role(s) | Responsibilities |
|-------|---------|-----------------|
| **grial** | [TO FILL] | [TO FILL] |
| **ilazar** | [TO FILL] | [TO FILL] |
| **jslusark** | [TO FILL] | [TO FILL] |
| **wlucke** | [TO FILL] | [TO FILL] |
 -->


---

## Project Management

| Practice | Approach |
|----------|----------|
| **Communication** | Slack — daily updates and sync meetings |
| **Task Tracking** | GitHub Kanban Board — columns: Backlog, Todo, In Progress, To Review, Done |
| **Documentation** | Notion (architecture decisions, meeting notes) + Markdown docs in `docs/` |
| **Code Reviews** | In-person merge sessions on campus — changes integrated into shared branch after build verification |
| **Version Control** | Git with feature branches, merged via PR to `main` |

---

## Technical Stack

### Architecture

```
Browser ──HTTPS──▶ NGINX ──proxy──▶ Fastify API (:3000)
                         │
                         ├──proxy──▶ Vite Dev Server (:5173)
                         │
                         └──WSS──▶ Socket.IO (via /socket.io/)
                                    │
                                    └──▶ PostgreSQL (:5432)
```

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework — component-based SPA |
| **TypeScript 5** | Type-safe development |
| **Vite 7** | Dev server + build tool |
| **TailwindCSS 4** | Utility-first CSS |
| **Radix UI / shadcn/ui** | Accessible UI primitives |
| **React Router v7** | Client-side routing |
| **Phaser 3.90** | 2D game canvas (UNO board, cards, drag & drop) |
| **React Hook Form + Zod** | Form handling + schema validation |
| **Motion** | Animations |
| **Recharts** | Stats charts |
| **Lucide React** | Icons |

### Backend

| Technology | Purpose |
|------------|---------|
| **Fastify 5** | HTTP server — high performance, TypeScript-native |
| **Socket.IO 4** | Real-time bidirectional communication |
| **Prisma 6** | ORM — type-safe database access |
| **JWT** (`@fastify/jwt`) | Stateless authentication |
| **bcrypt** | Password hashing |
| **sharp** | Image processing (avatar validation) |
| **@fastify/rate-limit** | Brute-force protection |

### Database

**PostgreSQL 16** — chosen for:
- ACID compliance (game results must be accurate)
- JSON support (flexible game state storage)
- Strong Prisma ORM support
- Reliability and maturity

### Infrastructure

| Technology | Purpose |
|------------|---------|
| **NGINX** | Reverse proxy + TLS termination + static file serving |
| **Docker Compose** | Container orchestration — 4 services on a bridge network |
| **OpenSSL** | Self-signed certificates for local HTTPS |

### Major Technical Choices

| Choice | Why |
|--------|-----|
| **TLS Termination at NGINX** | Single encryption point, backend stays simple (plain HTTP internally) |
| **HttpOnly JWT Cookies** | XSS-resistant token storage — JS cannot read the token |
| **In-Memory Game State** | UNO games are ephemeral — no need to persist every card draw to DB |
| **Phaser Canvas (not WebGL)** | Eliminates Firefox GPU pipeline warnings; Canvas 2D is sufficient for a card game |
| **`prisma db push` over Migrations** | Faster dev iteration; schema is small and controlled |

---

## Database Schema

![Database Schema](apps/api/db_schema.png)

### Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| **User** | Player accounts | `id` (UUID PK), `email` (unique), `passwordHash` |
| **Profile** | Public player info | `userId` (PK/FK → User), `username` (unique), `avatarUrl` |
| **Game** | Completed game records | `id` (UUID PK), `roomName`, `status` (RUNNING/FINISHED/ABORTED), `createdAt`, `endedAt` |
| **GamePlayer** | Player participation in games | composite PK (`gameId`, `userId`), `placement` (1st, 2nd, ...) |

### Relationships
- `User` 1:1 `Profile`
- `User` 1:N `GamePlayer` N:1 `Game`

Schema file: [`apps/api/prisma/schema.prisma`](apps/api/prisma/schema.prisma)

---

## Features List

| # | Feature | Description | Team Member |
|---|---------|-------------|-------------|
| 1 | **UNO Game Engine** | Full rule logic: draw, skip, reverse, +2, +4, wild, UNO call, game finish detection | [TO FILL] |
| 2 | **Real-Time Gameplay** | Socket.IO-powered card play, turn passing, wild color selection | [TO FILL] |
| 3 | **Phaser Game Canvas** | 2D canvas rendering: board, player hands, drag & drop cards, animations | [TO FILL] |
| 4 | **Authentication** | Email/password register & login, JWT via HttpOnly cookies, rate limiting | [TO FILL] |
| 5 | **User Profiles** | Avatar upload (with validation), profile display, stats | [TO FILL] |
| 6 | **Game History** | Completed games with opponents, result (win/loss), and date | [TO FILL] |
| 7 | **Leaderboard** | Public ranking by wins, with tiebreaker (fewest games) | [TO FILL] |
| 8 | **Room System** | Create/join rooms by name, 2–4 players, 30s drop timer, reconnection | [TO FILL] |
| 9 | **Real-Time Chat** | In-room messaging, system notifications (join/leave/win/UNO), 50-msg history | [TO FILL] |
| 10 | **HTTPS + Docker** | TLS-terminated NGINX, fully containerized, single-command setup | [TO FILL] |
| 11 | **Input Validation** | Two-layer: frontend regex + backend JSON Schema + rate limiting | [TO FILL] |
| 12 | **Database Schema** | Prisma ORM + PostgreSQL, seed data for testing | [TO FILL] |

> [TO FILL: Add the correct team member login for each feature.]

---

## Modules

| Module | Type | Points | Justification | Implementation | Team Member |
|--------|------|--------|---------------|----------------|-------------|
| **Frontend Framework** | Minor | 1 | React is the most widely-used component-based UI framework, suitable for a dynamic SPA | React 19 + Vite + TailwindCSS | [TO FILL] |
| **Backend Framework** | Minor | 1 | Fastify is high-performance, TypeScript-native, with excellent plugin ecosystem | Fastify 5 + TypeScript | [TO FILL] |
| **Database** | Minor | 1 | PostgreSQL with Prisma ORM for type-safe, schema-driven data access | PostgreSQL 16 + Prisma 6 | [TO FILL] |
| **Game Engine** | Major | 2 | Custom UNO engine with Phaser rendering — card logic, turn management, event detection | Phaser 3 + custom `gamelogic/` module | [TO FILL] |
| **Real-Time Multiplayer** | Major | 2 | Socket.IO for bidirectional real-time game and chat communication | Socket.IO 4 with custom `gameManager/` | [TO FILL] |
| **User Management** | Major | 2 | Full auth system with registration, login, JWT cookies, profiles, avatars | Fastify JWT + bcrypt + sharp | [TO FILL] |
| **HTTPS/Docker** | Minor | 1 | TLS-terminated NGINX reverse proxy, containerized microservices | Docker Compose + NGINX + OpenSSL | [TO FILL] |

**Points:** 2 + 2 + 2 + 1 + 1 + 1 + 1 = **10 points** (minimum required: 7)

> [TO FILL: Verify module points and assign correct team members.]

---

## Individual Contributions

> [TO FILL: Replace each section with actual contributions, features, and challenges for each team member.]

### grial
- **Features:** [TO FILL]
- **Modules:** [TO FILL]
- **Challenges:** [TO FILL]

### ilazar
- **Features:** [TO FILL]
- **Modules:** [TO FILL]
- **Challenges:** [TO FILL]

### jslusark
- **Features:** [TO FILL]
- **Modules:** [TO FILL]
- **Challenges:** [TO FILL]

### wlucke
- **Features:** [TO FILL]
- **Modules:** [TO FILL]
- **Challenges:** [TO FILL]

---

## Known Limitations

- **No OAuth** — only email/password authentication (42 login, Google, etc. not implemented)
- **Self-Signed Certificate** — browsers show a security warning on first visit (click "Advanced" → "Proceed")
- **No Mobile Responsiveness** — game canvas is optimized for desktop (1000×800)
- **In-Memory Rooms** — room state is lost on server restart; game history persists in DB
- **No Password Reset** — no email system configured; use seeded test accounts

---

## License

This project is part of the 42 School curriculum. All rights reserved.

| Minor: ORM | Prisma provides type-safe DB access and schema management without raw SQL | Prisma 6 with PostgreSQL | 1 | wlucke |
| Major: User Management & Auth | Core requirement — secure accounts with profiles, avatars, and friend visibility | JWT auth, bcrypt passwords, profile editing, avatar uploads, online status | 2 | wlucke |
| Major: Real-time WebSockets | Live game state and social features require real-time sync across clients | Socket.IO 4 with room management, presence tracking, graceful disconnect handling | 2 | ilazar |
| Major: User Social Interaction | Chat, profiles, and friends are the social backbone of the platform | In-game and lobby chat (Socket.IO), profile pages, friend requests with online status | 2 | jslusark + wlucke + ilazar |
| Minor: Game Statistics & Match History | Tracking progress adds depth and replayability | Win/loss stats, match history with opponents and dates, displayed on profile | 1 | jslusark |
| Major: Complete Web-based Game | Core game requirement — multiplayer card game with clear rules and win/loss conditions | UNO in Phaser with full game rules, hand management, turn logic | 2 | grial |
| Major: Multiplayer (3+ Players) | UNO is designed for 3–4 players; supporting this makes the game meaningful | Room-based sync via Socket.IO, up to 4 simultaneous players | 2 | ilazar + grial |
| | | | | |
| ***Optional — under discussion*** | | | | |
| Major: Remote Players | Allows players on separate computers to compete with resilient connections | Reconnection grace period, latency handling via Socket.IO | +2 | ilazar |
| Major: AI Opponent | Fills lobbies and enables single-player practice | TBD | +2 | grial |

**Confirmed total: 14 pts** — Remote Players and AI Opponent are optional buffer modules.

## Individual Contributions