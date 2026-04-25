*This project has been created as part of the 42 curriculum by <login1>, <login2>, <login3>, <login4>.*  

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

## Project Management

## Technical Stack
Reverse Proxy:  NGINX          # Serves static files + proxies /api → Fastify
Backend:        Fastify        # API server (Node/TS) 
Backend ORM:    Primsa         # Helper to access DB data
Database:       PostgreSQL     # Data persistence  
Frontend:       React          # UI framework (TailwindCSS or Material UI for customization)  
Build Tool:     Vite           # Dev server + bundler for React  
Game Framework: Phaser         # 

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
Table: Module | Justification | Implementation | Points | Team Member  

- Web
Major: Use a framework for both the frontend and backend.  
Minor: Use an ORM for the database.  
- User Management
Major: Standard user management and authentication.
- Artificial Intelligence
Major: Introduce an AI Opponent for games.
- Gaming and user experience
Major: Implement a complete web-based game where users can play against each other.

## Individual Contributions