
Here's the situation: your database needs to be updated from your schema. Currently, you have:

- **Schema** at schema.prisma ✓
- **Empty migration folder** at 20260415102527_init ✗ (no `migration.sql` file)
- **Docker command** using `prisma db push` instead of proper migrations

## Steps to update your database

**. Generate the migration SQL from your schema:**

```bash
docker compose exec api npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > apps/api/prisma/migrations/20260415102527_init/migration.sql
```


**. Mark the migration as applied (since DB already matches):**

```bash
docker compose exec api npx prisma migrate resolve --applied 20260415102527_init
```

**. Check status:**

```bash
docker compose exec api npx prisma migrate status
```

Should output: `Database is up to date. The following migrations have been applied:`

**. (Optional) Switch docker-compose from `db push` to `migrate deploy`** — edit docker-compose.yml line 40:

```diff
- command: sh -lc "npx prisma db push --accept-data-loss && npm run db:seed && npm run dev"
+ command: sh -lc "npx prisma migrate deploy && npm run db:seed && npm run dev"
```
