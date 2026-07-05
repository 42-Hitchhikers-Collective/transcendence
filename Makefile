# ============================================================
#  Transcendence: Makefile recipes for building, running, and managing the application.
# 
#  1. Run "MAKE" to build the whole project from scratch all in one command. This is the default recipe as it's the first command to run on a new computer.
#  2. Use Docker lifecycle section to start/stop/restart the app while keeping your database data intact.
#  3. When you are done developing, you can use the Cleanup section to remove containers and volumes or prune unused Docker resources.
#  4. Use the Fresh starts section to wipe everything and start from scratch, without seeding the database.
#  5. Use Infrastructure section to create directories and generate SSL certs separately when needed for deployment.
#  6. Use Database section recipes for tasks that are directly related to the database, such as seeding, migrating, resetting, and opening Prisma Studio.
#  7. Use Dev tools section recipes for tasks that are not part of the main application lifecycle, such as running the API only, reinstalling dependencies, or other utilities.
# 
# ============================================================

COMPOSE = docker compose -f docker-compose.yml

# ── Default ──────────────────────────────────────────────────

all: setup

# ── Infrastructure (directories, certs) ──────────────────────

dirs:
	@echo "📁  Creating required directories..."
	mkdir -p data/postgres data/avatars nginx/certs

certs: dirs
	@echo "🔐  Generating self-signed SSL certificate..."
	openssl req -x509 -newkey rsa:2048 -sha256 -days 3650 -nodes \
		-keyout nginx/certs/dev.key \
		-out nginx/certs/dev.crt \
		-subj "/CN=localhost"
	@echo "✅  SSL certificate ready"

# Prints the local and LAN URLs — reusable by any target that starts the app
show-url:
	@echo "✅  App running at https://localhost:8443"
	@LAN_IP=$$({ ip -4 addr show 2>/dev/null || ifconfig 2>/dev/null; } | grep -oE 'inet (addr:)?[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | grep -v 127.0.0.1 | head -1); \
	if [ -n "$$LAN_IP" ]; then \
	  echo "🌐  Other devices: https://$$LAN_IP:8443"; \
	fi

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

deploy: host-certs
	$(COMPOSE) up -d --build
	@echo ""
	@echo "  Connect from other computers: https://$(shell cat nginx/certs/host-ip.txt):8443"
	@echo ""

# ── Docker lifecycle ─────────────────────────────────────────
#  Start / stop / restart: keeps your database data intact.

up: dirs
	@echo "🔨  Building and starting all containers..."
	$(COMPOSE) up -d --build
	$(MAKE) show-url

down:
	@echo "🛑  Stopping all containers..."
	$(COMPOSE) down
	@echo "✅  All containers stopped"

re: down up
	@echo "✅  Restarted: data preserved"

ps:
	$(COMPOSE) ps

logs:
	$(COMPOSE) logs -f

# ── Cleanup ──────────────────────────────────────────────────

clean:
	@echo "🧹  Stopping containers and removing volumes..."
	$(COMPOSE) down -v --remove-orphans
	@echo "✅  Cleaned up"

prune:
	@echo "🧹  Pruning unused Docker resources..."
	docker system prune -a --volumes -f
	@echo "✅  Docker pruned"

rebuild: clean up

# ── Start project (sets up project from scratch and/or wipes everything) ──────────────────────────

fresh: clean prune
	@echo "🧼  Fresh start: rebuilding containers..."
	$(MAKE) up
	@echo "✅  Fresh start complete"

setup: certs clean prune
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

db:
	@echo "🗄️   Starting database only..."
	$(COMPOSE) up -d db
	@echo "✅  Database running on port 5434"

db-seed:
	@echo "🌱  Seeding database with test data..."
	$(COMPOSE) exec api npm run db:seed
	@echo "✅  Database seeded"

db-migrate:
	@echo "🔄  Running Prisma migration (you'll be prompted for a name)..."
	$(COMPOSE) exec -it api npx prisma migrate dev
	@echo "✅  Migration complete"

db-reset:
	@echo "🗑️   Wiping database and recreating from scratch..."
	$(COMPOSE) down -v
	rm -rf data/postgres/*
	$(COMPOSE) up -d
	@echo "✅  Database reset: fresh schema applied"

prisma-studio:
	@echo "🔍  Opening Prisma Studio..."
	$(COMPOSE) exec api npx prisma studio --hostname 0.0.0.0 --port 5555

# ── Dev tools ────────────────────────────────────────────────

api:
	@echo "🔧  Building and starting API only..."
	$(COMPOSE) up -d --build api
	@echo "✅  API running on port 3000"

reinstall:
	@echo "📦  Reinstalling all dependencies..."
	rm -rf apps/api/node_modules apps/web/node_modules
	npm install --prefix apps/api
	npm install --prefix apps/web
	@echo "✅  Dependencies reinstalled"

# ── Phony targets ────────────────────────────────────────────

.PHONY: all up down re ps logs clean prune rebuild fresh setup \
        dirs certs host-certs deploy show-url \
        db db-seed db-migrate db-reset prisma-studio \
        api reinstall
