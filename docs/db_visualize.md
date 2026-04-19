# Visualize
Prisma ERD (prisma-erd.simonknott.de)

# Manual migration after ORM changes
docker compose exec api npx prisma migrate dev --name remove-refresh-tokens

# Add mock data to database
docker compose exec api npm run db:seed