1) Verify Fastify is reachable through NGINX
curl -k -i https://localhost/api/health

2) Verify DB connectivity (Fastify ↔ Prisma ↔ Postgres)
curl -k -i https://localhost/api/db/ping

3) Ensure your tables exist (otherwise /users may fail)
curl -k -i https://localhost/api/users

4) **TODO: Test socket.io**



??

docker compose exec db psql -U postgres -d postgres -c "SELECT version();"
docker compose exec api npx prisma validate
docker compose exec api npx prisma migrate dev --name init
docker compose exec api npx prisma migrate deploy


