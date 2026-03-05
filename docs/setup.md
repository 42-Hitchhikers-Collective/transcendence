# Setup

## Repo Structure
.
├── apps
│   ├── api
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── prisma
│   │   │   ├── schema.prisma
│   │   │   └── migrations
│   │   └── src
│   │       └── server.ts
│   └── web
│       ├── Dockerfile
│       ├── package.json
│       └── src
├── docker-compose.yml
├── docs
│   └── setup.md
├── Makefile
├── nginx
│   ├── certs
│   └── nginx.conf
└── README.md

## Toolchain Overview
Frontend: Vite + React + TypeScript
Backend: Node.js + Fastify + Prisma + Socket.IO
Database: PostgreSQL
Reverse Proxy: NGINX (HTTPS + routing for /, /api, /socket.io)
Infrastructure: Docker Compose

## Local URLs
App (HTTPS): https://localhost/
API Health: https://localhost/api/health
DB Ping (via Prisma): https://localhost/api/db/ping
(Optional HTTP): http://localhost:8080/ (if you route port 8080 → nginx:80)

# Create Frontend (Vite + React + TS)
npm create vite@latest apps/web -- --template react-ts
cd apps/web
npm install
<!--
Need to install the following packages:
create-vite@8.3.0
Ok to proceed? (y) y


> npx
> create-vite apps/web --template react-ts

│
◇  Target directory "apps/web" is not empty. Please choose how to proceed:
│  Ignore files and continue
│
◇  Use Vite 8 beta (Experimental)?:
│  No
│
◇  Install with npm and start now?
│  Yes
│
◇  Scaffolding project in /home/sevo/Desktop/transcendence/apps/web...
│
◇  Installing dependencies with npm...

added 175 packages, and audited 176 packages in 11s

45 packages are looking for funding
-->

## Create Backend (Fastify + TypeScript)
mkdir -p apps/api
cd apps/api
npm init -y
npm install fastify
npm install -D typescript tsx @types/node
npx tsc --init

## Add Prisma + Client
mkdir -p prisma
mkdir -p prisma/migrations
npm install prisma --save-dev
npm install @prisma/client
npx prisma init

## Test
https://localhost/
curl -k -i https://localhost/api/health
curl -k -i https://localhost/api/db/ping

## JWT (Easy Auth: Access Token only)
docker compose exec api npm i @fastify/jwt
docker compose exec api npm i -D  @types/jsonwebtoken

## Cookies --> mainly for JWT token refresh
docker compose exec api npm i @fastify/cookie

## Password Hashing: bcrypt
docker compose exec api npm i bcrypt
docker compose exec api npm i -D @types/bcrypt

## SOCKET.IO
docker compose exec api npm i socket.io
docker compose exec web npm i socket.io-client

## TailwindCSS (not installed.)
docker compose exec web npm i -D @tailwindcss/cli
docker compose exec web npm exec tailwindcss init -p

# SOCKET.IO CLIENT for testing
docker compose exec api sh -lc 'npm i -D socket.io-client'

# Security Add-On for Fastify
docker compose exec api sh -lc "npm i @fastify/rate-limit"
