# Header
COMPOSE = docker compose -f docker-compose.yml

# Basics
all: up

up: dirs
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

ps:
	$(COMPOSE) ps

logs:
	$(COMPOSE) logs -f

clean:
	$(COMPOSE) down -v --remove-orphans

re: down up

rebuild: clean up

# Setup
dirs:
	mkdir -p data/postgres data/avatars nginx/certs
	
certs: dirs
	openssl req -x509 -newkey rsa:2048 -sha256 -days 3650 -nodes \
		-keyout nginx/certs/dev.key \
		-out nginx/certs/dev.crt \
		-subj "/CN=localhost"

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

# Database
db:
	$(COMPOSE) up -d db

db-seed:
	$(COMPOSE) exec api npm run db:seed

db-migrate:
	$(COMPOSE) exec -it api npx prisma migrate dev

db-reset:
	$(COMPOSE) down -v
	rm -rf data/postgres/*
	$(COMPOSE) up -d

# Prisma
prisma-studio:
	$(COMPOSE) exec api npx prisma studio --hostname 0.0.0.0 --port 5555
	
# API / Backend
api:
	$(COMPOSE) up -d --build api
	
migration:
	$(COMPOSE) exec -it api npx prisma migrate dev --name init

prune:
	docker system prune -a --volumes -f

reinstall:
	rm -rf apps/api/node_modules apps/web/node_modules
	npm install --prefix apps/api
	npm install --prefix apps/web

# Fresh start: removes all data and rebuilds everything so that is ready to run
fresh:
	docker compose down -v
	docker system prune -a --volumes -f
	rm -rf data/postgres/*
	mkdir -p data/postgres data/avatars nginx/certs
	$(COMPOSE) up -d --build

# Run this on the school pc, make sure to follow the points in this file first /home/jslusark/sgoinfre/transcendence/docs/how_to_start_on_42.md
setup: certs
	$(COMPOSE) down -v 2>/dev/null; true
	docker system prune -a --volumes -f
	rm -rf data/postgres/*
	mkdir -p data/postgres data/avatars
	$(COMPOSE) up -d --build
	@echo "Waiting for database to be healthy..."
	@until docker compose -f docker-compose.yml exec -T db pg_isready -U transcendence 2>/dev/null; do sleep 1; done
	sleep 2
	$(COMPOSE) exec -T api npm run db:seed
	@echo ""
	@echo "  Setup complete — app running at https://localhost:8443"
	@echo ""

# Phony
.PHONY: all up down logs clean re rebuild certs host-certs deploy dirs db db-seed db-migrate db-reset api migration prune ps reinstall fresh setup
