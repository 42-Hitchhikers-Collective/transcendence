COMPOSE = docker compose -f docker-compose.yml

all: up

up:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

clean:
	$(COMPOSE) down -v --remove-orphans

re: clean up

certs:
	mkdir -p nginx/certs
	openssl req -x509 -newkey rsa:2048 -sha256 -days 3650 -nodes \
		-keyout nginx/certs/dev.key \
		-out nginx/certs/dev.crt \
		-subj "/CN=localhost"
