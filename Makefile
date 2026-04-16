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

re: clean up

# Setup
dirs:
	mkdir -p data/postgres data/avatars nginx/certs
	
certs: dirs
	mkdir -p nginx/certs
	openssl req -x509 -newkey rsa:2048 -sha256 -days 3650 -nodes \
		-keyout nginx/certs/dev.key \
		-out nginx/certs/dev.crt \
		-subj "/CN=localhost"

# Database
db:
	$(COMPOSE) up -d db

db-seed:
	$(COMPOSE) exec api npm run db:seed

db-migrate:
	$(COMPOSE) exec api npx prisma migrate dev
		
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
	$(COMPOSE) exec api npx prisma migrate dev --name init

prune:
	docker system prune -a --volumes -f   

# Phony
.PHONY: all up down logs clean re certs dirs db db-seed db-migrate db-reset api migration prune ps
