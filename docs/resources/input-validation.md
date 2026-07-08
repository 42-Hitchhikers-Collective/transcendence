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
| **Backend** | Fastify schema: `email` minLength 6 + regex pattern, `password` minLength 6, `additionalProperties: false` rejects extra fields. Rate limit: 10 req / 5 min |

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
| **Brute Force** | Rate limit: 10 attempts / 5 min per IP |
| **NoSQL Injection** | `additionalProperties: false` blocks unexpected fields like `$gt` operators |
| **XSS** | Input never rendered unsanitized; email is a string, not HTML |

---

## 2. Signup Form (`POST /api/auth/register`)

| Layer | Validation |
|-------|-----------|
| **Frontend** | Email format, password ≥8 chars, username 1-20 chars, confirm password must match, **same SQL injection detection as login** (excluding password) |
| **Backend** | Fastify schema: `email` regex, `password` ≥8 chars + must contain digit + lowercase + uppercase, `username` 1-20 chars + regex `^[a-zA-Z0-9_\\-.]+$`. Rate limit: 10 req / 5 min. Duplicate email/username checks, bcrypt password hashing |

### Prevents

| Attack | How |
|--------|-----|
| **Weak Passwords** | Schema enforces minimum complexity (digit + lowercase + uppercase) |
| **Username Enumeration** | Generic error messages — no user data leaked |
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
| Brute Force (login) | Rate limit 10/5min |
| Brute Force (uploads) | Rate limit 5/5min |
| Path Traversal | Filename derived from userId, not user input |
| Malicious File Upload | MIME check + Sharp image validation |
| DoS (large payloads) | Nginx 5MB global cap + per-route size limits |
| NoSQL Injection | `additionalProperties: false` blocks `$gt`/`$ne` operators |
| Prototype Pollution | Type checks on socket event params |
| Game State Tampering | Parameter validation on all game events |
| Weak Passwords | Schema enforces complexity requirements |

---

## Additional Protections

### CSRF Protection (cookie-based)

CSRF (Cross-Site Request Forgery) is an attack where `evil.com` tricks your browser into sending authenticated requests to our app — for example, a hidden `<form>` that POSTs to `/api/profiles/me/avatar`.

Our JWT cookie uses `sameSite: "strict"`, which tells the browser: _"only send this cookie for requests originating from our own site."_ A cross-site request from `evil.com` will NOT include the cookie, so the request is rejected as unauthenticated.

```ts
reply.setCookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "strict",  // ← blocks CSRF at the browser level
  path: "/",
});
```

**Coverage:**
- ✅ `sameSite: strict` blocks cross-site cookie attachment (the fundamental CSRF mechanism)
- ✅ Browser support is universal (Chrome, Firefox, Safari, Edge — all since 2020)
- ✅ httpOnly cookies prevent token theft via XSS, which is the only scenario `sameSite` doesn't cover
- ⚠️ A dedicated CSRF token (header-based) would add defense-in-depth but is not required given the above

---

### Request Size Protection

Large request bodies can be used for denial-of-service attacks by exhausting server memory or bandwidth.

**Coverage:**
- ✅ **Nginx 5 MB cap** — `client_max_body_size 5m;` on all `/api/` routes rejects oversized payloads at the reverse proxy before they reach Fastify
- ✅ **Fastify 1 MB default** — JSON body parser enforces a 1 MB limit for all non-upload endpoints
- ✅ **Avatar-specific 2 MB limit** — explicit size check in `/profiles/me/avatar` handler
- ⚠️ Per-route `client_max_body_size` in Nginx would allow finer-grained control, but the existing cascade (2 MB → 1 MB → 5 MB) covers all current use cases
