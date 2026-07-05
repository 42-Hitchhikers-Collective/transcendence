# Input Validation & Attack Prevention

How every input in the Transcendence app is validated, and what attacks it prevents.

---

## Validation Layers

Every user input passes through **two validation layers**:

```
User Input → [Frontend Validation] → [Backend Validation] → Application
```

- **Frontend** — instant feedback for the user (UX), but **never trusted** alone
- **Backend** — the real security gate; Fastify schema validation runs before any handler code

---

## 1. Login Form (`POST /api/auth/login`)

| Layer | Validation |
|-------|-----------|
| **Frontend** | Email format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`), password ≥8 chars, **SQL injection pattern detection** blocks `'`, `"`, `;`, `=`, `\`, comment markers, SQL keywords |
| **Backend** | Fastify schema: `email` minLength 6 + regex pattern, `password` minLength 6, `additionalProperties: false` rejects extra fields. Rate limit: 10 req/min |

### Frontend SQL injection detection

Before any form data reaches the server, a `hasSqlInjection()` function checks for:

| Category | Blocked patterns |
|----------|-----------------|
| SQL meta-characters | `'`, `"`, `;`, `=`, `\` |
| Comment markers | `--`, `/*`, `*/`, `#` |
| Tautologies | `OR 1=1`, `'1'='1`, `AND 1=1` |
| SQL keywords | `UNION`, `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `CREATE`, `TRUNCATE`, `EXEC`, `GRANT`, `DECLARE` |
| System tables | `INFORMATION_SCHEMA`, `PG_CLASS`, `SYSOBJECTS` |
| Encoded injection | `0x...`, `CHAR(`, `CONCAT(`, `LOAD_FILE`, `INTO OUTFILE` |
| Filter evasion | `/**/`, `/*!*/` (comment-between-keywords bypass) |

> Passwords are **excluded** from this check — they are bcrypt-hashed on the backend, making SQL injection in passwords meaningless.

### Prevents

| Attack | How |
|--------|-----|
| **SQL Injection** | Frontend blocks injection patterns + Prisma parameterized queries on backend — two-layer defense |
| **Brute Force** | Rate limit: 10 attempts/minute per IP |
| **NoSQL Injection** | `additionalProperties: false` blocks unexpected fields like `$gt` operators |
| **XSS** | Input never rendered unsanitized; email is a string, not HTML |

---

## 2. Signup Form (`POST /api/auth/register`)

| Layer | Validation |
|-------|-----------|
| **Frontend** | Email format, password ≥8 chars, username 1-20 chars, confirm password must match, **same SQL injection detection as login** (excluding password) |
| **Backend** | Fastify schema: `email` regex, `password` ≥8 chars + must contain digit + lowercase + uppercase, `username` 1-20 chars + regex `^[a-zA-Z0-9_\\-.]+$` (blocks `'`, `"`, `<`, `>`, `=`, `;` at the schema level). Duplicate email/username checks |

### Prevents

| Attack | How |
|--------|-----|
| **Weak Passwords** | Schema enforces minimum complexity (digit + lowercase + uppercase) |
| **Username Enumeration** | Generic error messages ("email already in use", "username already in use") — no user data leaked |
| **Bulk Account Creation** | Rate limit: 10 requests/minute on login also indirectly limits register spam |
| **Bulk Account Creation** | No rate limit currently — ⚠️ could add one for production |
| **XSS in Username** | Backend schema enforces `^[a-zA-Z0-9_\\-.]+$` — no `<`, `>`, `"`, `'` or other HTML characters allowed. React JSX auto-escapes as backup. |

---

## 3. Avatar Upload (`POST /api/profiles/me/avatar`)

| Layer | Validation |
|-------|-----------|
| **Frontend** | Only accepts `image/jpeg`, `image/png`, `image/webp`, max 2 MB |
| **Backend** | Auth required, rate limit 5/5min, MIME type check, 2 MB size limit, **image content validation via Sharp** (rejects non-images renamed to `.jpg`), filename derived from userId (prevents path traversal) |

### Prevents

| Attack | How |
|--------|-----|
| **Malicious File Upload** | MIME check + Sharp content validation — a `.php` file renamed to `.jpg` is rejected |
| **Path Traversal** | Filename is always `${userId}.${ext}` — no user-controlled path segments |
| **DoS via Large Uploads** | 2 MB limit + Nginx 5 MB global cap |
| **Brute Force Uploads** | Rate limit: 5 per 5 minutes per user |

---

## 4. Chat Messages (Socket: `send_msg`)

| Layer | Validation |
|-------|-----------|
| **Frontend** | `trim()` removes whitespace; empty messages aren't sent |
| **Backend** | Length check: 1–200 characters (`MAX_MSG_LENGTH`). Messages are in-memory only (no database) |

### Prevents

| Attack | How |
|--------|-----|
| **DoS (Message Flood)** | 200-char max per message prevents memory exhaustion |
| **SQL Injection** | Not applicable — messages never touch the database |
| **XSS** | React JSX auto-escapes `{msg.msg}`; system messages use predefined enum values, never raw user input |

---

## 5. Room Names (Socket: `create_room` / `join_room`)

| Layer | Validation |
|-------|-----------|
| **Frontend** | Regex `/^[\w-]{1,20}$/` (alphanumeric, underscores, hyphens, 1-20 chars) |
| **Backend** | Empty check, maxLength 20, duplicate check, regex `/^[a-zA-Z0-9\-_!?.]+$/` |

### Prevents

| Attack | How |
|--------|-----|
| **Injection in Room Names** | Strict character whitelist — no special chars that could be used for injection |
| **Resource Exhaustion** | 20-char limit prevents oversized room names |
| **Duplicate Room Names** | Backend deduplication check |

---

## 6. Game Events (Socket: `play_card`, `select_wild_color`)

| Event | Validation |
|-------|-----------|
| `play_card` | `cardIndex` must be a non-negative integer |
| `select_wild_color` | `color` must be one of `["red", "blue", "green", "yellow"]` |

### Prevents

| Attack | How |
|--------|-----|
| **Game State Corruption** | Invalid `cardIndex` rejected before reaching game logic |
| **Invalid Color Injection** | Only valid UNO colors accepted |
| **Prototype Pollution** | Type checking (`typeof cardIndex !== "number"`) prevents object injection |

---

## 7. All Routes — Global Protections

### JWT Authentication

| Protection | How |
|-----------|-----|
| **Token Theft via XSS** | `httpOnly: true` cookie — JavaScript cannot read the token |
| **CSRF** | `sameSite: "strict"` cookie — token not sent on cross-site requests |
| **Token Interception** | `secure: true` cookie — sent only over HTTPS |

### Fastify Schema Validation

Every route with a `schema` block automatically validates:
- Required fields are present
- Fields match their declared types (`string`, `number`)
- Fields match regex patterns (email, password complexity)
- No extra fields (`additionalProperties: false`)

### Prisma Parameterized Queries

All database queries use Prisma's ORM, which parameterizes inputs. Example:

```ts
// Safe — Prisma sends: SELECT * FROM "User" WHERE email = $1
await app.prisma.user.findUnique({ where: { email: input.email } });

// Dangerous (never do this):
// await app.prisma.$queryRaw`SELECT * FROM "User" WHERE email = '${input.email}'`;
```

---

## Attack Coverage Summary

| Attack | Prevented By |
|--------|-------------|
| SQL Injection | Prisma parameterized queries (all routes) |
| XSS (Stored) | React JSX auto-escaping + chat messages never stored in DB |
| XSS (Reflected) | Fastify JSON responses — no HTML rendering |
| CSRF | `sameSite: "strict"` cookie |
| Brute Force (login) | Rate limit 10/min |
| Brute Force (uploads) | Rate limit 5/5min |
| Path Traversal | Filename derived from userId, not user input |
| Malicious File Upload | MIME check + Sharp image validation |
| DoS (large payloads) | Nginx 5MB global cap + per-route size limits |
| NoSQL Injection | `additionalProperties: false` blocks `$gt`/`$ne` operators |
| Prototype Pollution | Type checks on socket event params |
| Game State Tampering | Parameter validation on all game events |
| Weak Passwords | Schema enforces complexity requirements |

---

## What's NOT covered (why the risk is acceptable)

### 1. No rate limit on `/register`

**What it is:** The `/register` endpoint has no request-per-minute cap, unlike `/login` (10/min). Someone could write a script to create hundreds of accounts.

**Why the risk is low:**
- Each registration requires a **valid email format**, a **strong password** (8+ chars, digit + lowercase + uppercase), and a **unique username**
- The server must compute `bcrypt.hash()` for every registration — this is CPU-intensive and naturally throttles bulk creation
- Duplicate email/username checks hit the database on every attempt, adding latency
- An attacker would need to script around these constraints, making bulk registration impractical

**If you wanted to add it:** A simple `rateLimit: { max: 5, timeWindow: "5 minutes" }` in the register route config (like we do for avatar uploads).

---

### 2. No CSRF token for state-changing requests

**What it is:** CSRF (Cross-Site Request Forgery) is an attack where `evil.com` makes your browser send a request to `our-app.com` using your logged-in session. For example, a hidden `<form>` on a malicious site that submits a POST to `/api/profiles/me/avatar` with the attacker's file.

Without protection, your browser would send the JWT cookie along with that request because cookies are automatically attached to all requests to their domain.

**How we protect against it:**
```ts
sameSite: "strict"  // cookie NOT sent on ANY cross-site request
```

`sameSite: "strict"` tells the browser: _"only send this cookie if the user typed our URL in the address bar or clicked a link on our own site."_ If `evil.com` makes a request to `our-app.com`, the cookie is **not** sent — the request is unauthenticated and rejected by `app.auth`.

**Why a dedicated CSRF token isn't needed:**
- `sameSite: strict` blocks the fundamental CSRF mechanism (cross-site cookie attachment)
- A CSRF token (random value embedded in the page, required in every POST/PATCH/DELETE) would be an **additional** layer of defense, not a replacement
- Browser support for `sameSite` is universal (Chrome, Firefox, Safari, Edge — all since 2020)
- The only scenario `sameSite` doesn't cover is same-site XSS (where an attacker injects JavaScript into our own page), which is already prevented by our Content Security Policy via React (no innerHTML) and httpOnly cookies (JavaScript can't read the token)

**If you wanted to add it:** Generate a random token server-side, embed it in a `<meta>` tag, and require it in a `X-CSRF-Token` header on all mutating requests.

---

### 3. No request size validation on most endpoints

**What it is:** Endpoints like `/login`, `/register`, and `/users` don't explicitly reject oversized request bodies. Only `/profiles/me/avatar` has explicit limits (2 MB in code + 5 MB in Nginx).

**Why the risk is low:**
- **Nginx enforces a global 5 MB cap** (`client_max_body_size 5m;`) on all `/api/` routes — any request body larger than 5 MB is rejected at the reverse proxy level before reaching Fastify
- **Fastify has a default body limit of 1 MB** for JSON payloads — this already covers login, signup, and all non-upload endpoints
- Login/signup request bodies are tiny (~100 bytes of JSON) — an attacker sending a 5 MB body to `/login` would just waste bandwidth and get rejected by Nginx or Fastify with a 413 error

**If you wanted to add it:** Per-route `client_max_body_size` in Nginx config, but 1 MB (Fastify default) + 5 MB (Nginx cap) is already more than sufficient.
