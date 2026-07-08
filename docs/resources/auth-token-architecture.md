# Auth Token Architecture

> **Last updated**: 2026-07-03 — switched from localStorage to HttpOnly cookies.

The auth system uses **HttpOnly cookies** to store the JWT instead of `localStorage`. This prevents:
- XSS attacks: these attack run javascript in the browser and can steal tokens from `localStorage`. HttpOnly cookies are inaccessible to JS, so they cannot be stolen.
- CSRF attacks: these attacks trick the browser into sending a request to our server with the user's cookie. The `SameSite=Strict` flag prevents the browser from sending the cookie on cross-site requests, so the server will reject any request that doesn't come from our own domain. This prevents requests from malicious sites.

Tests that can be performed to verify the security of the auth system:
- **XSS test**: open the console and try to run `document.cookie`. You should not see the auth token in the output. If you do, it means the token is stored in `localStorage` or a non-HttpOnly cookie, which is insecure.
- **CSRF test**: open a new tab and go to a different site (e.g. `https://example.com`). Open the console and try to run `fetch("https://localhost:8443/api/users/me", { method: "GET", credentials: "include" })`. You should get a 401 Unauthorized response, because the browser will not send the HttpOnly cookie to our server on a cross-site request. If you get a 200 OK response, it means the cookie is not set with `SameSite=Strict`, which is insecure.
- MITM test: open a new tab and go to a different site (e.g. `https://example.com`). Open the console and try to run `fetch("http://localhost:8443/api/users/me", { method: "GET", credentials: "include" })`. You should get a 401 Unauthorized response, because the browser will not send the HttpOnly cookie to our server on an insecure HTTP request. If you get a 200 OK response, it means the cookie is not set with `Secure`, which is insecure.
-  evil.com test: open a new tab and go to a different site (e.g. `https://evil.com`). Open the console and try to run `fetch("https://localhost:8443/api/users/me", { method: "GET", credentials: "include" })`. You should get a 401 Unauthorized response, because the browser will not send the HttpOnly cookie to our server on a cross-site request. If you get a 200 OK response, it means the cookie is not set with `SameSite=Strict`, which is insecure.


---

# 1. JWT_SECRET — the signing key

### Why it matters

The JWT_SECRET is the cryptographic key used to **sign** and **verify** every token.
If an attacker knows the secret, they can forge valid tokens for any user.
If the secret changes, all existing tokens become invalid.

### How it's managed

The secret is **never hardcoded in git or environment files**.
Currently, it is generated fresh on every container start:

```yaml
# docker-compose.yml (api service)
command: sh -lc "export JWT_SECRET=$(node -e \"...crypto.randomBytes(32)...\") && ..."
```

| Scenario | What happens |
|---|---|
| `make rebuild` / `make setup` | Container recreated → new secret → all tokens invalidated → all users logged out |
| Container crash & auto-restart | New secret → all tokens invalidated |
| Different developers | Each machine has its own secret → tokens never cross machines |

The secret is a 64-character hex string (256 bits of entropy), generated via Node.js's `crypto.randomBytes()` — a cryptographically secure random generator. It exists only as an in-memory environment variable inside the container and is never written to disk.

---

# 2. Backend — REST API token management

The backend uses three Fastify plugins:
- **`@fastify/jwt`** — creates and verifies JWT tokens
- **`@fastify/cookie`** — parses incoming cookies and sets outgoing `Set-Cookie` headers

### 2.1 Login (`POST /api/auth/login`)

The login endpoint does three things in sequence:

**Step 1 — Authenticates the user** (in `auth.service.ts`):
```
Request body: { email, password }
  → Looks up user by email in the database
  → Compares password hash with bcrypt
  → If match: returns userId
  → If no match: returns 401 "invalid credentials"
```

**Step 2 — Creates the JWT** (in `routes/auth.ts`):
```ts
const token = await reply.jwtSign(
  { sub: result.userId },    // payload: only the user ID ("sub" = subject) which is used to look up the user on future requests
  { expiresIn: "7d" }        // JWT itself has a 7-day expiration
);
```

The JWT consists of three parts (Base64-encoded):
```ts
Header:    { alg: "HS256", typ: "JWT" } // specifies HMAC-SHA256 signature algorithm that the server uses to verify the token, it is created automatically by the library
Payload:   { sub: "user-uuid-here", iat: 1690000000, exp: 1690600000 } // payload contains only the user ID, issued-at timestamp, and expiration timestamp that are created automatically by the library and used to look up the user on future requests, uuid is a unique identifier
Signature: HMAC-SHA256(header.payload, JWT_SECRET) // ensures the token is valid and untampered, the code is generated automatically by the library using the JWT
```

Only the `sub` (subject = userId) is stored in the payload. The `iat` (issued at) and `exp` (expiration) are added automatically by the library.

**Step 3 — Sets the HttpOnly cookie**:
What is an httpOnly cookie? It's a cookie that the browser stores but **JavaScript cannot read**, so it cannot be stolen by XSS attacks. The cookie is sent automatically by the browser on every request to the same domain, so the server can authenticate the user without exposing the token to JS.

```ts
reply.setCookie("token", token, {
  httpOnly: true,           // JavaScript cannot read this cookie (document.cookie won't show it)
  secure: true,             // Browser only sends over HTTPS, never HTTP
  sameSite: "strict",       // Browser won't send this cookie on cross-site requests
  path: "/",                // Cookie applies to all paths on the domain
  maxAge: 7 * 24 * 60 * 60, // Browser auto-deletes after 7 days (604,800 seconds)
});
```

The response body contains only `{ ok: true }` — **the token is never exposed to JavaScript**.
It travels exclusively through the `Set-Cookie` response header and subsequent `Cookie` request headers.

**Security model of the cookie flags:**

| Flag | What it prevents | Attack scenario blocked |
|---|---|---|
| `httpOnly: true` | XSS (Cross-Site Scripting) | Malicious script injected into the page cannot do `document.cookie` to steal the token |
| `secure: true` | MITM (Man-in-the-Middle) | Token never sent over unencrypted HTTP — only HTTPS |
| `sameSite: "strict"` | CSRF (Cross-Site Request Forgery) | `evil.com` cannot trigger a request to `localhost:8443` that carries the user's cookie |
| `maxAge: 7d` | Indefinite sessions | Browser automatically deletes the cookie after 7 days, forcing re-authentication |

**Two layers of expiration:**

The token expiration is enforced at **two independent levels**:
1. **JWT `exp` claim** (server-side): the server rejects any token older than 7 days, regardless of cookie state
2. **Cookie `maxAge`** (browser-side): the browser automatically deletes the cookie after 7 days

Both are set to 7 days so they align. If someone manually extracted the cookie before expiry, the JWT itself would still be rejected once the `exp` timestamp passes.

### 2.2 Auth middleware — how every request is verified

We use an auth middleware to verify the token on every request.
It allows us to protect routes declaratively, without putting if-checks in every route handler.

The auth middleware is registered once at startup as a Fastify plugin (`apps/api/src/plugins/auth.ts`):

```ts
app.register(cookie);  // enables cookie parsing on all requests
app.register(jwt, {
  secret: jwtSecret,
  cookie: { cookieName: "token", signed: false },
  // ↑ tells @fastify/jwt: "also look for the JWT in a cookie called 'token'"
});
```

Then a decorator `app.auth` is created that any route can use as a `preHandler`:

```ts
app.decorate("auth", async (request, reply) => {
  await request.jwtVerify();  // throws if invalid/missing → 401
});
```

**How `jwtVerify()` works internally:**

```
Incoming request
  │
  ├── 1. Check cookie header: "token=eyJhbG..."
  │      → Found? Parses the JWT from the cookie value
  │
  ├── 2. Check Authorization header: "Bearer eyJhbG..."
  │      → Found? Parses the JWT from the header
  │         (this is backward compatibility for any clients still using Bearer tokens)
  │
  ├── 3. Neither found? → throws 401 "unauthorized"
  │
  └── 4. Token found:
        → HMAC-SHA256(header.payload, JWT_SECRET)
        → Compares with the token's signature
        → Checks exp (expiration) hasn't passed
        → Decodes payload → attach to request.user
        → Route handler proceeds
```

The `cookie: { signed: false }` option means we rely on the JWT's own cryptographic signature for integrity, rather than Fastify's cookie signing mechanism. Since JWTs are already tamper-proof by design (any modification invalidates the signature), double-signing is unnecessary.

**How routes use it — the `preHandler` pattern:**

We use a `preHandler` to run the auth middleware before the route handler, so that if the token is invalid, the request is rejected before any route logic executes.
The preHandler is a declarative way to protect routes without putting if-checks in every handler.

```ts
// Example: GET /api/users/me
app.get("/me", { preHandler: [app.auth] }, async (request, reply) => {
  // If we reach here, the user is authenticated
  // request.user contains { sub: userId, iat: ..., exp: ... }
  const user = await prisma.user.findUnique({ where: { id: request.user.sub } });
  return reply.send({ user });
});
```

If `jwtVerify()` throws (invalid/missing/expired token), Fastify short-circuits with a 401 and the route handler never executes. This is a declarative, non-invasive way to protect routes — no if-checks inside every handler.

### 2.3 Logout (`POST /api/auth/logout`)

Logout is stateless: the server simply tells the browser to delete the cookie by sending a `Set-Cookie` header with an empty value and immediate expiry.

```ts
reply.clearCookie("token", { path: "/" });
return reply.send({ ok: true });
```


The JWT itself is not stored server-side (no blacklist), so there's nothing to delete on the server. The token simply becomes useless because:
1. The browser deletes the cookie → subsequent requests won't include it
2. Even if someone captured the token before logout, it expires naturally after 7 days

This is a tradeoff: stateless logout is simpler but doesn't immediately invalidate a leaked token. For a game application, this is an acceptable balance. A production system with higher security needs would add a token blacklist or refresh token rotation.

---

## 3. Backend — Socket.IO token management

Socket.IO connections are fundamentally different from REST requests.

A socket connection goes through three phases:
1. HTTP handshake (upgrade request):
    - This is where the authentication happens
    - The browser sends an HTTP request to the server to upgrade the connection to WebSocket.
    - The browser automatically attaches cookies to this request, including the HttpOnly JWT cookie.
    - The server intercepts this handshake and verifies the token before allowing the connection.
    - If the token is invalid, the server rejects the connection with a 401 error.
2. WebSocket connection established
    - If the token is valid, the server accepts the connection and attaches the user info to the socket object for future events.
    - The connection is now persistent and bidirectional ( server can send events to the client, and the client can send events to the server).
3. Persistent bidirectional channel (no more HTTP)
    - The server can access the user info from the socket object without re-verifying the token.
    - If the token expires or the user logs out, the server can disconnect the socket.
    - If the browser refreshes, the socket connection is closed and a new handshake is required to reconnect.

Since it's an HTTP request, the browser automatically attaches cookies. The Socket.IO server middleware intercepts this handshake before the connection is allowed.

### 3.1 The cookie parsing challenge

- REST requests have cookies parsed automatically by Fastify's `@fastify/cookie` plugin. 
- Socket.IO handshakes do not — the raw `Cookie` header arrives as a plain string:

```
"token=eyJhbGciOiJIUzI1NiIs...; otherCookie=value"
```

- We need to manually parse this into a usable object. The `parseCookies()` helper (`apps/api/src/socket/middleware/auth.ts`) does exactly this:

```ts
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(";").forEach((pair) => {
    const eqIdx = pair.indexOf("=");
    if (eqIdx > 0) {
      const key = pair.substring(0, eqIdx).trim();
      const val = pair.substring(eqIdx + 1).trim();
      if (key) cookies[key] = decodeURIComponent(val);
    }
  });
  return cookies;
}
```

Input: `"token=eyJhbG...; foo=bar"`
Output: `{ token: "eyJhbG...", foo: "bar" }`

### 3.2 Three-tier token extraction

The middleware checks for the token in three places, in priority order:

```ts
const cookieHeader = socket.handshake.headers.cookie;
const cookies = cookieHeader ? parseCookies(cookieHeader) : {};

const token =
  cookies.token ||                                              // 1. HttpOnly cookie (primary)
  socket.handshake.auth?.token ||                               // 2. Explicit auth (backward compat)
  (socket.handshake.headers.authorization || "").replace(/^Bearer\s+/i, ""); // 3. Bearer header
```

| Priority | Source | Why |
|---|---|---|
| 1 | `cookies.token` | The HttpOnly cookie — primary method, automatic, XSS-safe |
| 2 | `handshake.auth.token` | Explicit auth object from the client — backward compatible with old `socket.io({ auth: ... })` code |
| 3 | `Authorization` header | Bearer token — backward compatible with REST-style auth |

This multi-source approach means the socket auth works regardless of how the client was configured — it gracefully handles the transition from the old localStorage-based system to the new cookie-based system.

### 3.3 Full socket authentication flow

```
Client calls socket.connect() (withCredentials: true)
  │
  ▼
Browser sends HTTP upgrade request with Cookie: token=eyJhbG...
  │
  ▼
Socket.IO server → createAuthMiddleware()
  │
  ├── 1. Extract token from cookie/header/auth
  │      └── No token? → next(new Error("unauthorized")) → connection rejected
  │
  ├── 2. Verify JWT signature with JWT_SECRET
  │      └── Invalid/expired? → next(new Error("unauthorized"))
  │
  ├── 3. Extract userId from JWT payload (payload.sub)
  │      └── No sub? → next(new Error("unauthorized"))
  │
  ├── 4. Look up user profile in database
  │      const profile = await prisma.profile.findUnique({
  │        where: { userId: payload.sub }
  │      })
  │      └── Not found? → next(new Error("unauthorized"))
  │
  └── 5. Attach user data to the socket object
       socket.userId = payload.sub        // for game logic
       socket.userName = profile.username  // for chat/display
       socket.avatarUrl = profile.avatarUrl // for UI
       socket.join(`user:${payload.sub}`)  // personal room for notifications
       │
       ▼
     next() → connection accepted → socket "connection" event fires
```

After step 5, every subsequent socket event (`play_card`, `send_chat`, etc.) can access `socket.userId` without re-verifying. The user is also joined to a personal room (`user:<uuid>`) so the server can send targeted notifications (friend requests, game invites) directly to that user's socket.

### 3.4 Why socket auth is separate from REST auth

The REST auth middleware (`app.auth`) works on Fastify's request/reply objects. Socket.IO has its own middleware chain with different objects (`socket` and `next`). They share the same JWT verification logic (`app.jwt.verify(token)`) but the extraction step differs because:

- REST: cookies are auto-parsed by `@fastify/cookie`
- Socket: raw `Cookie` header must be manually parsed

This is why we have two auth files:
- `plugins/auth.ts` → REST routes
- `socket/middleware/auth.ts` → Socket.IO connections

Both use the same `JWT_SECRET` and the same verification algorithm, so a token generated during login works for both channels.

---

# 4. Frontend — AuthContext

AuthContext is a React context that manages the authentication state and socket connection lifecycle.
It provides a single source of truth for whether the user is logged in, their profile data, and the socket connection.
React context is a way to pass data through the component tree without having to pass props down manually at every level, this is why we use it for auth state, so any component can access the auth state without prop drilling (props drilling is when you pass props through multiple layers of components just to get it to a deeply nested component, which can be cumbersome and error-prone).

Auth context wraps our entire app, so any component can access the auth state via `useAuthContext()`.

```ts
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
}
```

**File**: `apps/web/src/app/auth/AuthContext.tsx`

### 4.1 State model

| State | Type | Purpose |
|---|---|---|
| `user` | `User \| null` | Current user data (fetched from `/api/users/me`) |
| `isAuthenticated` | `boolean` | Whether the user has a valid session |
| `loading` | `boolean` | `true` until initial auth check completes (prevents flash) |

There is **no `token` state** — with HttpOnly cookies, JS cannot read the token, so there's nothing to store.

### 4.2 Lifecycle

```
App mounts
  │
  ▼
loading = true → renders nothing (prevents redirect flash)
  │
  ▼
useEffect → fetchUser()
  │
  ├── GET /api/users/me (credentials: "include" → cookie sent automatically)
  │
  ├── SUCCESS → isAuthenticated = true, user = data → socket.connect()
  │
  └── FAIL → isAuthenticated = false, user = null (expected if not logged in)
  │
  ▼
loading = false → app renders
```

### 4.3 Login flow

```
login(email, password)
  │
  ▼
POST /api/auth/login (credentials: "include")
  │
  ▼
Backend sets Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict
  │
  ▼
fetchUser() → GET /api/users/me → cookie sent → user hydrated
  │
  ▼
isAuthenticated becomes true → useEffect connects socket
```

### 4.4 Logout flow

```
logout()
  │
  ▼
POST /api/auth/logout → backend clears cookie
  │
  ▼
setIsAuthenticated(false)
  │
  ▼
useEffect fires → socket.disconnect() → setUser(null)
```

### 4.5 Socket connection management

The socket connection is **reactive** — it's controlled by `isAuthenticated` in a single `useEffect`:

```tsx
useEffect(() => {
  if (isAuthenticated) {
    socket.connect();   // auto-connect when logged in
  } else {
    socket.disconnect(); // auto-disconnect when logged out
    setUser(null);
  }
}, [isAuthenticated]);
```

This means socket cleanup happens automatically from **any** source of de-auth: logout, expired cookie, or invalid token.

### 4.6 Socket client config

**File**: `apps/web/src/socket/Socket.ts`

```ts
export const socket = io({
  path: "/socket.io",
  autoConnect: false,        // AuthContext controls connection
  withCredentials: true,     // sends cookie with handshake
});
```

No `auth` callback — the cookie is sent automatically with `withCredentials: true`.

### 4.7 API calls throughout the frontend

All protected API calls now use `credentials: "include"` instead of `Authorization: Bearer <token>`:

```ts
// Before (localStorage):
fetch("/api/users/me", {
  headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` }
})

// After (HttpOnly cookie):
fetch("/api/users/me", { credentials: "include" })
```

---

## 5. Summary: why the switch from localStorage to HttpOnly?

| Concern | localStorage | HttpOnly cookie |
|---|---|---|
| XSS can steal token | ✅ yes | ❌ no (JS can't read it) |
| CSRF protection | manual | `sameSite: "strict"` |
| Token in git | was `"dev_secret"` in docker-compose | random per container start |
| Stale login after rebuild | yes (static secret) | no (fresh secret each start) |
| Backward compatible | n/a | socket middleware still accepts `auth.token` + `Authorization` header |

---

## 6. Files involved

| Layer | File | Role |
|---|---|---|
| **BE** | `apps/api/src/routes/auth.ts` | Login sets cookie, logout clears it |
| **BE** | `apps/api/src/plugins/auth.ts` | JWT + cookie plugin setup, `auth` decorator |
| **BE** | `apps/api/src/socket/middleware/auth.ts` | Socket auth: parse cookie, verify JWT |
| **BE** | `docker-compose.yml` | Random `JWT_SECRET` on container start |
| **FE** | `apps/web/src/app/auth/AuthContext.tsx` | Auth state, login/signup/logout, socket lifecycle |
| **FE** | `apps/web/src/socket/Socket.ts` | Socket.IO client with `withCredentials: true` |
| **FE** | `apps/web/src/app/pages/profile/ProfilePage.tsx` | Uses `isAuthenticated` instead of `token` |
| **FE** | `apps/web/src/app/pages/profile/components/profileSection/ProfileAvatar.tsx` | Avatar upload/delete with `credentials: "include"` |
