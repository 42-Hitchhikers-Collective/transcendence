*This project has been created as part of the 42 curriculum by grial, ilazar, jslusark, wlucke.*  

# transcendence
The final 42 project. A group project to develop a game web page with custom features.  

## Description
Project Name:  
Goal:   
Overview:   
Key Features:  

## Instruction (Install & Run)
git clone git@github.com:42-Hitchhikers-Collective/transcendence.git  
cd transcendence  
make certs  
make up  
[In case you get permission problems. Run: sudo chown -R $USER:$USER nginx/certs]
https://localhost (Your browser will warn about the self-signed certificate.)
https://localhost:8443
https://localhost:8443/socket-test0.html --> socket test

## Resources

## Team, Roles & Responsibilities

| Person | Role | Responsibilities |
|---|---|---|
| *(discuss)* | Product Owner (PO) + Developer | Defines product vision, validates completed work, prioritizes features |
| *(discuss)* | Project Manager (PM) + Developer | Coordinates integration, tracks progress, manages communication |
| *(discuss)* | Technical Lead + Developer | Defines architecture, makes technology decisions, reviews critical changes |
| *(discuss)* | Specialized Developer | |

## Project Management

| Practice | Tool / Approach |
|---|---|
| Communication | Slack — regular syncs for progress updates and blockers |
| Task Tracking | GitHub Kanban Board — columns: Backlog, Todo, In Progress, To Review, Done |
| Documentation | Notion (decisions, internal notes) + README files (main, API, web) |
| Code Reviews | Branches were merged together on campus as a team. Changes were integrated into a shared branch and only accepted once the merge built and ran successfully. |
| Work Breakdown | Tasks divided into issues and assigned via the Kanban board |

## Technical Stack
Reverse Proxy:  NGINX          # Serves static files + proxies /api → Fastify
Backend:        Fastify        # API server (Node/TS) 
Backend ORM:    Prisma         # Helper to access DB data
Database:       PostgreSQL     # Data persistence  
Frontend:       React          # UI framework (TailwindCSS or Material UI for customization)  
Build Tool:     Vite           # Dev server + bundler for React  
Game Framework: Phaser         # 2D web game framework — renders the game canvas, manages assets and game scenes

## Database Schema

The schema is defined in `apps/api/prisma/schema.prisma`.  
We use `prisma db push` instead of migrations — it syncs the schema directly to the DB on every startup, no migration files needed.

**Fresh clone**
```
make certs
make up
```
That's it. The DB is created, schema is pushed, and seed data is loaded automatically.

**Changing the schema**
1. Edit `apps/api/prisma/schema.prisma`
2. Run `make re` — this wipes the DB and rebuilds with the new schema + fresh seed data

> ⚠️ `make re` deletes all data. For dev this is fine since we reseed automatically.

**Restart without wiping data** (use during evaluation)
```
make re
```
Brings containers down and back up — DB data is preserved.

**If the DB gets into a broken state**
```
make rebuild
```
Wipes volumes and starts clean.

**Browsing the DB**
```
make prisma-studio
```
Opens Prisma Studio at http://localhost:5555

## Feature List
Table: Feature | Feature Description | Team Member  

## Modules

| Module | Justification | Implementation | Points | Team Member |
|---|---|---|---|---|
| Minor: Frontend Framework | React is a widely-used component-based UI framework well-suited for a dynamic SPA | React 19 with Vite + TailwindCSS | 1 | jslusark |
| Minor: Backend Framework | Fastify is a high-performance, TypeScript-native Node.js framework | Fastify 5 with TypeScript | 1 | wlucke |
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