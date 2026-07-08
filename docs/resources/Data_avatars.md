# Why data is at the project root (not inside api)
The short answer: Yes, avatars should be at the root — it's a shared resource between two Docker services. Here's the full breakdown:

### 1. avatars — Shared between API and Nginx
Look at the volume mounts in docker-compose.yml:

Since both the api and nginx containers need access to the same avatar files, the directory can't live inside api — that would make it invisible to nginx. Keeping it at the project root lets Docker bind-mount it into both containers.

The API writes avatars to this folder (Fastify serves them at /avatars/ from avatars — see server.ts line 55), and nginx can serve them directly as static files, bypassing the Node.js server entirely for better performance.

### 2. avatars — Placeholder, overridden at runtime
The avatars folder inside the API source exists so the path exists in the repo, but at runtime, the Docker volume mount (./data/avatars:/app/data/avatars) completely replaces whatever is there with the root-level avatars. It's effectively unused.

### 3. postgres — Unused / leftover
This is created by the Makefile's dirs target (mkdir -p data/postgres), but the docker-compose uses a named Docker volume (postgres_data) for PostgreSQL, not postgres. So this folder at the root is not actually mounted into any container — it's effectively dead code in the Makefile. You could remove it safely.

Summary
Path	    Should it exist?	    Why?
avatars     (root)	                ✅ Yes	Shared volume between API (write) and Nginx (read-only serve)
postgres    (root)	                ❌ Unnecessary	Makefile creates it but Docker uses a named volume instead
avatars	    🤷 Placeholder	        Replaced by volume mount at runtime, could be removed