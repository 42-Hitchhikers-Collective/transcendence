# 1. What make setup does

```
setup: certs                    # ← first generates self-signed SSL certs
    $(COMPOSE) down -v          # tears down all containers + volumes
    docker system prune -a --volumes -f  # wipes ALL Docker images, containers, volumes, build cache
    rm -rf data/postgres/*      # deletes local Postgres data files
    mkdir -p data/postgres data/avatars  # recreates needed dirs
    $(COMPOSE) up -d --build    # builds & starts all containers
    # …waits for DB to be healthy…
    $(COMPOSE) exec -T api npm run db:seed  # seeds the database
```

In short: complete nuke-and-rebuild from scratch.
- It wipes everything Docker-related
- regenerates SSL certs
- rebuilds all images
- seeds the DB.


# 2. We need to make sure to also wipe the frontend data in our browser. We do that by resetting the service worker and clearing the cache. This is a manual process that must be done in the browser itself.

1. Cache (Cache Storage) — static files (JS, CSS, images) the browser saved to load faster.
Clearing it is harmless; the site just re-downloads fresh assets.
Service workers power several features like PWA, offline caching, and push notifications, background sync, vite dev server etc..

2. Service Worker — a persistent background script that decides which cache to serve. Even if you clear the cache, the SW itself stays registered and may re-cache stale assets.

Because of the order of operations, we unregister the SW first, then clear site data (if you clear the cache first, the service worker may re-cache the old assets before you have a chance to unregister it and this can lead to the frontend appearing white or not reflecting your latest changes).

NOTE: Typically just unregistering the SW is enough to fix the issue, but clearing the cache is a good idea to make sure everything is fresh.


# 3. How to clear everything in one go

### On Chrome

#### Method A — DevTools (recommended, surgical):
Open DevTools (F12 / Cmd+Opt+I) on https://localhost:8443
Application tab → left sidebar → Storage
Click "Clear site data" — this nukes SW, all caches, IndexedDB, cookies, everything for localhost:8443 in one click
Method B — Browser settings (nuclear, clears everything for all sites):

#### Chrome/Edge: chrome://settings/clearBrowserData → "Cached images and files" → pick "All time"
Firefox: Preferences → Privacy & Security → Cookies and Site Data → "Clear Data"
Safari: Develop menu → "Empty Caches" (or Safari → Settings → Privacy → Manage Website Data)
For your situation, Method A is all you need — it targets only localhost:8443 and handles both the SW and cache in one click.

### On Firefox

##### Firefox: Clear everything for localhost:8443 (surgical)
- Open DevTools (F12 / Cmd+Opt+I) on https://localhost:8443
- Go to the Storage tab (it's listed right next to "Application" in Chrome — same name in Firefox)
- In the left sidebar, expand Service Workers → find localhost:8443 → click "Unregister"
- Still in Storage tab → left sidebar → scroll down to Cache Storage → right-click any entry → Delete all
- Hard-refresh (Cmd+Shift+R)

- Alternatively, for a one-click nuke in Firefox:
- Click the padlock icon 🔒 in the address bar → "Clear Cookies and Site Data" — but this only clears cookies/storage, not the service worker.

#### Firefox: Nuclear (all sites)
- Menu → Settings → Privacy & Security → scroll to Cookies and Site Data → "Clear Data…" → check both boxes → Clear
Or in the same section, click "Manage Data…" → search for localhost → Remove Selected





1. Open https://localhost:8443
2. Open DevTools → Application tab
3. In the left sidebar, click Service Workers
4. Click "Unregister" for the localhost:8443 entry
5. Also go to Storage → Clear site data (this clears everything: SW, cache, IndexedDB, etc.)
6. After that, hard-refresh (Cmd+Shift+R) and the site should load fine.

This is something you'll need to do manually once per browser after removing the PWA plugin — make setup only cleans Docker/server-side state, not your local browser state.
There's no way to unregister a service worker from the server side.

You can clean local browser state by clearing the cache and unregistering the service worker, but this is a manual process that must be done in the browser itself.

You can clear the cache by going to the browser settings and clearing browsing data, or by using DevTools as described above. Unregistering the service worker is also done through DevTools in the Application tab.