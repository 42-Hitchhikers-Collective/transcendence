# ============================================================
#  Transcendence: Makefile recipes for building, running, and managing the application.
# 
#  1. Run "MAKE" to build the whole project from scratch all in one command. This is the default recipe as it's the first command to run on a new computer.
#  2. Use Docker lifecycle section to start/stop/restart the app while keeping your database data intact.
#  3. When you are done developing, you can use the Cleanup section to remove containers and volumes or prune unused Docker resources.
#  4. Use the Fresh starts section to wipe everything and start from scratch, without seeding the database.
#  5. Use Infrastructure section to create directories and generate SSL certs separately when needed for deployment.
#  6. Use Goinfre section on school computers to relocate Docker + npm off the tiny /home tmpfs onto /sgoinfre.
#  7. Use Database section recipes for tasks that are directly related to the database, such as seeding, migrating, resetting, and opening Prisma Studio.
#  8. Use Dev tools section recipes for tasks that are not part of the main application lifecycle, such as running the API only, reinstalling dependencies, or other utilities.
# 
# ============================================================

COMPOSE = docker compose -f docker-compose.yml

# ── Goinfre (school) paths ───────────────────────────────────
#  /home is a tiny tmpfs; Docker + npm must live on /sgoinfre
GOINFRE_BASE  := /goinfre/goinfre/Perso/$(shell whoami)
GOINFRE_DOCKER := $(GOINFRE_BASE)/docker
GOINFRE_NPM    := $(GOINFRE_BASE)/.npm
is_sgoinfre    := $(shell test -d /sgoinfre && echo 1 || echo 0)

# ── Environment variables file ───────────────────────────────────

ENV_FILE := .env

# ── Default ──────────────────────────────────────────────────

all: setup

# ── Infrastructure (directories, certs, env) ─────────────────
#  One-time setup steps that create files and folders needed
#  before Docker can start. Run automatically by "make setup".

# Generates a .env file with random secure credentials if one doesn't exist.
# Creates: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, DATABASE_URL,
# JWT_SECRET, and EXPOSE_DEV_TOKENS. Safe to run — won't overwrite existing .env.
env:
	@if [ -f "$(ENV_FILE)" ]; then \
		echo "✅  .env already exists"; \
	else \
		echo "📝  Creating .env..."; \
		POSTGRES_USER=$$(node -e "console.log(require('crypto').randomBytes(8).toString('hex'))"); \
		POSTGRES_PASSWORD=$$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"); \
		POSTGRES_DB=$$(node -e "console.log(require('crypto').randomBytes(8).toString('hex'))"); \
		JWT_SECRET=$$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"); \
		printf "POSTGRES_USER=%s\nPOSTGRES_PASSWORD=%s\nPOSTGRES_DB=%s\n\nDATABASE_URL=postgresql://%s:%s@db:5432/%s?schema=public\nJWT_SECRET=%s\n\nEXPOSE_DEV_TOKENS=true\n" \
			"$$POSTGRES_USER" "$$POSTGRES_PASSWORD" "$$POSTGRES_DB" \
			"$$POSTGRES_USER" "$$POSTGRES_PASSWORD" "$$POSTGRES_DB" \
			"$$JWT_SECRET" > "$(ENV_FILE)"; \
		echo "✅  .env created"; \
	fi

# Creates local directories for Docker volume mounts:
# data/postgres → PostgreSQL data, data/avatars → uploaded profile pictures,
# nginx/certs → SSL certificates. Idempotent (mkdir -p).
dirs:
	@echo "📁  Creating required directories..."
	mkdir -p data/postgres data/avatars nginx/certs

# Generates a self-signed SSL certificate for local HTTPS development.
# Creates nginx/certs/dev.key and nginx/certs/dev.crt valid for 10 years.
# Only for localhost — browsers will show a security warning (expected).
certs: dirs
	@echo "🔐  Generating self-signed SSL certificate..."
	openssl req -x509 -newkey rsa:2048 -sha256 -days 3650 -nodes \
		-keyout nginx/certs/dev.key \
		-out nginx/certs/dev.crt \
		-subj "/CN=localhost"
	@echo "✅  SSL certificate ready"

# Prints the local and LAN URLs after the app starts.
# Detects your LAN IP so other devices on the same network can connect.
# Called automatically by "make up" and "make setup".
show-url:
	@echo "✅  App running at https://localhost:8443"
	@LAN_IP=$$({ ip -4 addr show 2>/dev/null || ifconfig 2>/dev/null; } | grep -oE 'inet (addr:)?[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | grep -v 127.0.0.1 | head -1); \
	if [ -n "$$LAN_IP" ]; then \
	  echo "🌐  Other devices: https://$$LAN_IP:8443"; \
	fi

# Like "certs" but includes your LAN IP in the certificate SAN field.
# This avoids certificate errors when other devices connect via LAN IP.
# Also saves the detected IP to nginx/certs/host-ip.txt for reference.
host-certs: dirs
	$(eval LAN_IP := $(shell ip -4 addr show | grep -oP '(?<=inet )\d+\.\d+\.\d+\.\d+' | grep -v 127.0.0.1 | head -1))
	@echo "Generating cert for localhost + $(LAN_IP)"
	openssl req -x509 -newkey rsa:2048 -sha256 -days 3650 -nodes \
		-keyout nginx/certs/dev.key \
		-out nginx/certs/dev.crt \
		-subj "/CN=localhost" \
		-addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:$(LAN_IP)"
	@echo "$(LAN_IP)" > nginx/certs/host-ip.txt
	@echo ""
	@echo "  Game available at: https://$(LAN_IP):8443"
	@echo ""

# Builds and starts the app with LAN-accessible certificates.
# Use this when you want other devices (phone, tablet, another laptop)
# on the same network to connect to your dev server.
deploy: host-certs
	$(COMPOSE) up -d --build
	@echo ""
	@echo "  Connect from other computers: https://$(shell cat nginx/certs/host-ip.txt):8443"
	@echo ""

# ── Goinfre (school machine) setup ───────────────────────────
#  On 42 school machines, /home is a tiny tmpfs that fills up fast.
#  These targets relocate Docker's data-root and npm's cache onto
#  the larger /sgoinfre partition. Safe to run repeatedly.

# Moves Docker's data-root from ~/.local/share/docker to /sgoinfre.
# Stops Docker, writes a new daemon.json config, restarts Docker.
# All existing images/containers/volumes remain but are now stored on /sgoinfre.
goinfre-docker:
	@echo "🐳  Configuring Docker to use goinfre..."
	@mkdir -p $(GOINFRE_DOCKER)
	@mkdir -p ~/.config/docker
	@echo '{"data-root": "$(GOINFRE_DOCKER)"}' > ~/.config/docker/daemon.json
	@systemctl --user stop docker 2>/dev/null; sleep 1
	@systemctl --user start docker; sleep 3
	@echo "   Docker root: $$(docker info --format '{{.DockerRootDir}}' 2>/dev/null || echo 'UNKNOWN')"
	@echo "✅  Docker → goinfre"

# Moves npm's global cache and prefix from ~/.npm to /sgoinfre.
# Prevents npm install from filling up the tiny /home partition.
goinfre-npm:
	@echo "📦  Configuring npm to use goinfre..."
	@mkdir -p $(GOINFRE_NPM)
	@npm config set cache $(GOINFRE_NPM)/_cacache
	@npm config set prefix $(GOINFRE_NPM)/_global
	@echo "   npm cache : $$(npm config get cache)"
	@echo "   npm prefix: $$(npm config get prefix)"
	@echo "✅  npm → goinfre"

# Verifies that Docker and npm are correctly pointing to /sgoinfre.
# Shows current paths and disk usage for /home vs /sgoinfre.
goinfre-check:
	@echo "=== Docker ==="
	@echo "Root dir: $$(docker info --format '{{.DockerRootDir}}' 2>/dev/null || echo 'NOT RUNNING')"
	@echo "daemon.json: $$(cat ~/.config/docker/daemon.json 2>/dev/null || echo 'MISSING')"
	@echo ""
	@echo "=== npm ==="
	@echo "cache : $$(npm config get cache)"
	@echo "prefix: $$(npm config get prefix)"
	@echo ""
	@echo "=== Disk ==="
	@df -h /home /sgoinfre 2>/dev/null || true

# Runs all goinfre setup steps and verifies the result.
# Called automatically by "make setup" when /sgoinfre is detected.
goinfre: goinfre-docker goinfre-npm goinfre-check
	@echo "✅  Goinfre setup complete"

# ── Docker lifecycle ─────────────────────────────────────────
#  Start / stop / restart: keeps your database data intact.
#  These are your day-to-day commands while developing.

# Builds and starts ALL containers (db, api, web, nginx).
# Rebuilds images if Dockerfiles changed, then prints the URLs.
# Database data is preserved across restarts.
up: dirs
	@echo "🔨  Building and starting all containers..."
	$(COMPOSE) up -d --build
	$(MAKE) show-url

# Stops all containers but preserves volumes (database data survives).
# Use this when you're done developing for the day or need to free resources.
down:
	@echo "🛑  Stopping all containers..."
	$(COMPOSE) down
	@echo "✅  All containers stopped"

# Quick restart: stops then starts. Database data is preserved.
# Faster alternative to "make down && make up".
re: down up
	@echo "✅  Restarted: data preserved"

# Lists all running containers and their status (Up, Exited, health).
# Useful to verify everything is running after startup.
ps:
	$(COMPOSE) ps

# Streams live logs from all containers (follow mode).
# Press Ctrl+C to stop watching. Useful for debugging runtime issues.
logs:
	$(COMPOSE) logs -f

# ── Cleanup ──────────────────────────────────────────────────
#  Remove containers, volumes, and unused Docker resources.
#  Data WILL BE LOST with these commands — make sure you mean it.

# Stops containers and removes volumes (database + node_modules).
# Use this when you want a full project reset without touching
# Docker cache or other projects on the machine.
clean:
	@echo "🧹  Stopping containers and removing volumes..."
	$(COMPOSE) down -v --remove-orphans
	@echo "✅  Cleaned up"

# Deep clean: removes ALL unused Docker resources system-wide —
# stopped containers, dangling images, unused networks, build cache.
# Affects EVERY project on this machine, not just this one.
# Use sparingly to reclaim disk space.
prune:
	@echo "🧹  Pruning unused Docker resources..."
	docker system prune -a --volumes -f
	@echo "✅  Docker pruned"

# Combines clean + up: wipes everything for this project then rebuilds.
# Database data IS lost, but Docker cache and other projects are untouched.
rebuild: clean up

# ── Reset & setup ────────────────────────────────────────────
#  Wipe everything and start from zero, or set up the project
#  on a brand new machine from scratch.

# Full system-wide wipe + rebuild for this project only.
# Runs prune (cleans all Docker resources on the machine),
# then clean (removes this project's volumes), then rebuilds.
# No seeding — database will be empty. Use "make setup" if you want seed data.
fresh: clean prune
	@echo "🧼  Fresh start: rebuilding containers..."
	$(MAKE) up
	@echo "✅  Fresh start complete"

# The "everything from scratch" command for a new machine.
# Creates .env, generates SSL certs, cleans Docker, sets up
# goinfre paths (if on school machine), builds all containers,
# runs migrations, and seeds test data.
# Run this once when cloning the repo on a new computer.
setup: env certs clean prune
	@if [ "$(is_sgoinfre)" = "1" ]; then \
	  echo "🏫  School machine detected — configuring goinfre..."; \
	  $(MAKE) goinfre; \
	fi
	@echo "🚀  Full setup: rebuilding from scratch..."
	$(MAKE) up
	@echo "  ⏳  Waiting for database and seeding..."
	@until docker compose -f docker-compose.yml exec -T db pg_isready -U app 2>/dev/null; do sleep 1; done
	sleep 2
	$(MAKE) db-seed
	@echo ""
	@echo "✅  Setup complete"
	$(MAKE) show-url
	@echo ""

# ── Database ─────────────────────────────────────────────────
#  Recipes for managing the database schema, migrations, and seed data.
#  All commands run inside the API container where Prisma is installed.

# Starts ONLY the database container (no API, no web, no nginx).
# Useful when you need a running DB for manual Prisma commands,
# or when debugging database issues in isolation.
db:
	@echo "🗄️   Starting database only..."
	$(COMPOSE) up -d db
	@echo "✅  Database running on port 5434"

# Seeds the database with test data (users, games, etc.).
# Safe to run multiple times — seed script skips if data already exists.
# Requires the API container to be running.
db-seed:
	@echo "🌱  Seeding database with test data..."
	$(COMPOSE) exec api npm run db:seed
	@echo "✅  Database seeded"

# Generates a NEW migration after you modify schema.prisma.
# Prompts you interactively for a migration name.
# Prisma compares schema.prisma with the current DB and creates
# a migration SQL file + applies it. No data is lost.
# Requires the API container to be running.
db-migrate:
	@echo "🔄  Running Prisma migration (you'll be prompted for a name)..."
	$(COMPOSE) exec -it api npx prisma migrate dev
	@echo "✅  Migration complete"

# Creates the INITIAL migration from scratch (wipes everything first!).
# Stops API, destroys the DB volume, starts a fresh DB, generates
# the "init" migration from schema.prisma, then rebuilds and starts
# all services. All existing data WILL BE LOST.
# Use this: (a) first time setting up migrations, (b) after deleting
# all migration files, (c) when your migration history is hopelessly broken.
db-migrate-init:
	@echo "🧹  Stopping API and wiping database..."
	$(COMPOSE) stop api 2>/dev/null; $(COMPOSE) rm -f api 2>/dev/null
	$(COMPOSE) down -v
	@echo "🗄️   Starting fresh database..."
	$(COMPOSE) up -d db
	@echo "  ⏳  Waiting for database..."
	@until $(COMPOSE) exec -T db pg_isready -U app 2>/dev/null; do sleep 1; done
	@echo "📝  Generating initial migration..."
	$(COMPOSE) run --rm api npx prisma migrate dev --name init
	@echo "🚀  Starting all services..."
	$(COMPOSE) up -d --build
	$(MAKE) show-url
	@echo "✅  Initial migration created and app running"

# Wipes the database volume and restarts all containers from scratch.
# The API container will re-apply existing migrations on startup
# (via "prisma migrate deploy") and then seed.
# All existing data WILL BE LOST, but migrations are preserved.
# Use this when you want a clean DB without regenerating migrations.
db-reset:
	@echo "🗑️   Wiping database and recreating from scratch..."
	$(COMPOSE) down -v
	$(COMPOSE) up -d
	@echo "✅  Database reset: fresh schema applied"

# Opens Prisma Studio — a visual database browser — at localhost:5555.
# Lets you inspect tables, edit rows, and run queries in a GUI.
# Requires the API container to be running.
prisma-studio:
	@echo "🔍  Opening Prisma Studio..."
	$(COMPOSE) exec api npx prisma studio --hostname 0.0.0.0 --port 5555

# ── Dev tools ────────────────────────────────────────────────
#  Utilities for development that aren't part of the main app lifecycle.

# Builds and starts ONLY the API container (+ its DB dependency).
# Useful when you're only working on backend code and don't need
# the web frontend or nginx proxy running.
api:
	@echo "🔧  Building and starting API only..."
	$(COMPOSE) up -d --build api
	@echo "✅  API running on port 3000"

# Deletes all node_modules and re-runs npm install for both services.
# Use this when dependencies get out of sync, after switching branches,
# or when you see mysterious "module not found" errors.
reinstall:
	@echo "📦  Reinstalling all dependencies..."
	rm -rf apps/api/node_modules apps/web/node_modules
	npm install --prefix apps/api
	npm install --prefix apps/web
	@echo "✅  Dependencies reinstalled"

# ── Phony targets ────────────────────────────────────────────

.PHONY: all up down re ps logs clean prune rebuild fresh setup \
        dirs certs host-certs deploy show-url \
        goinfre-docker goinfre-npm goinfre-check goinfre \
        db db-seed db-migrate db-migrate-init db-reset prisma-studio \
        api reinstall
