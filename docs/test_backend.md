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

# ---- Auth test ----
docker compose exec api sh -lc \
'export SEED_ADMIN_EMAIL=admin@example.com; export SEED_ADMIN_PASSWORD="ChangeMe123!"; npm run prisma:migrate && npm run db:seed'

TOKEN=$(curl -sk https://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"ChangeMe123!"}' \
  | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

echo "TOKEN_LEN=${#TOKEN}"
[ -n "$TOKEN" ] || { echo "Login failed: TOKEN empty"; }

curl -sk -i https://localhost/api/users/me \
  -H "Authorization: Bearer $TOKEN"

curl -sk -i https://localhost/api/profiles/me \
  -X PATCH \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"displayName":"Sevo","bio":"hello"}'
  
# Cookies
## login: saves refresh cookie + prints access token
curl -sk -c cookies.txt https://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"ChangeMe123!"}'

## Confirm refresh cookie rotates
grep refresh_token cookies.txt

## refresh: sends cookie, rotates cookie, returns new access token
curl -sk -b cookies.txt -c cookies.txt -X POST https://localhost/api/auth/refresh

## Confirm refresh cookie rotates (different value)
grep refresh_token cookies.txt

## logout: revokes + clears cookie
curl -sk -b cookies.txt -c cookies.txt -X POST https://localhost/api/auth/logout

## Confirm logout kills refresh (Expected: 401 and (ideally) cookie cleared.)
curl -sk -i -b cookies.txt -c cookies.txt -X POST https://localhost/api/auth/refresh