1) Verify Fastify is reachable through NGINX
curl -k -i https://localhost/api/health

2) Verify DB connectivity (Fastify ↔ Prisma ↔ Postgres)
curl -k -i https://localhost/api/db/ping

3) Ensure your tables exist (otherwise /users may fail)
curl -k -i https://localhost/api/users

4) **TODO: Test socket.io**



??
# Dont know if this is needed
docker compose exec db psql -U postgres -d postgres -c "SELECT version();"
docker compose exec api npx prisma validate
docker compose exec api npx prisma migrate dev --name init
docker compose exec api npx prisma migrate deploy

# Test User Management MVP
## Register
curl -k -i https://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234","displayName":"Test"}'
## Login (get token)
curl -k -s https://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234"}'
## Login (get token)
TOKEN=$(curl -k -s https://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234"}' | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
curl -k -i https://localhost/api/users/me -H "Authorization: Bearer $TOKEN"
## Login+
TOKEN=$(curl -k -s https://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234"}' | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

curl -k -i https://localhost/api/profiles/me \
  -X PATCH \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"displayName":"Sevo","bio":"hello"}'
  
# Prisma Studio (Open Port on 5555) [Web UI for DB Tables]
http://localhost:5555