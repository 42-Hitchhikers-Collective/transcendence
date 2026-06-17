# API Concepts

A reference for the building blocks used in every route file.

---

## Where things come from

| Thing | Source |
|---|---|
| `async` / `await` | Plain JavaScript |
| `===`, `!==`, `!` | Plain JavaScript |
| `??`, `?.` | Plain JavaScript |
| ternary `? :` | Plain JavaScript |
| `.map()`, `.filter()`, `.find()` | Plain JavaScript (arrays) |
| template literals `` ` ` `` | Plain JavaScript |
| `try / catch` | Plain JavaScript |
| destructuring `{ a, b } = obj` | Plain JavaScript |
| `import` / `export` | JavaScript modules |
| `{ sub?: string }`, `as`, `type` | TypeScript |
| `app.post()`, `request`, `reply` | Fastify (web framework) |
| `preHandler` | Fastify concept |
| `app.auth` | Our own auth plugin (`plugins/auth.ts`) |
| `request.user` | Set by `app.auth` after JWT verification |
| `app.prisma` | Prisma plugin (`plugins/prisma.ts`) |
| `.findFirst()`, `.create()`, etc. | Prisma (database client) |

---

## Plain TypeScript / JavaScript

### `async` / `await`
`async` marks a function as asynchronous — it can pause and wait for things (like DB queries).
`await` pauses until a Promise resolves and gives you the actual value.

```ts
// without await — you get a Promise, not the data
const user = app.prisma.user.findUnique(...)

// with await — you get the actual user object
const user = await app.prisma.user.findUnique(...)
```

### `===` strict equality
Always use `===` instead of `==` in TypeScript/JavaScript.
`==` converts types before comparing, `===` checks type AND value.

```ts
1 == "1"   // true  — JS converts "1" to 1 first
1 === "1"  // false — different types
```

### `?` in types
A `?` after a field name means it is optional (can be the type or `undefined`).

```ts
{ sub?: string }  // sub can be a string, or it might not exist at all
```

### `as` — type casting
Tells TypeScript "trust me, this value is this type." Use it when TypeScript can't infer the type automatically.

```ts
const payload = request.user as { sub?: string };
```

### `type` — naming a shape
Gives a name to a type so you can reuse it instead of writing it inline every time.

```ts
type LoginInput = { email: string; password: string };

// now use it as a parameter type
async function loginUser(input: LoginInput) { ... }
```

### `!` — logical NOT / "this is not null"
Two uses:

```ts
// 1. Logical NOT — flips true/false
if (!payload.sub) return reply.code(401)...  // "if sub is missing/falsy"

// 2. Non-null assertion — tell TS "this is definitely not null"
const id = payload.sub!  // you're promising TS it exists
```

### `??` — nullish coalescing (fallback value)
Returns the right side if the left side is `null` or `undefined`.

```ts
const name = user.profile?.username ?? "Player";
// if username is null or undefined → use "Player"
// if username is "alice" → use "alice"
```

### `?.` — optional chaining (safe property access)
Safely accesses a property that might not exist. Returns `undefined` instead of crashing.

```ts
user.profile?.username
// if profile is null/undefined → returns undefined (no crash)
// if profile exists → returns profile.username
```

Often combined with `??`:
```ts
p.user.profile?.username ?? "Player"
// safely get username, fall back to "Player" if missing
```

### Ternary `condition ? valueIfTrue : valueIfFalse`
A one-line if/else that returns a value.

```ts
const result = me?.placement === 1 ? "win" : "loss";
// if placement is 1 → "win", otherwise → "loss"

// same as:
let result;
if (me?.placement === 1) result = "win";
else result = "loss";
```

### Destructuring
Pull specific fields out of an object or array into variables.

```ts
// object destructuring
const { id } = request.params as { id: string };
// same as: const id = request.params.id

// with multiple fields
const { email, password } = request.body as { email: string; password: string };

// rename while destructuring
const { id: userId } = request.params;  // userId = request.params.id
```

### Template literals
Strings that can embed variables using `` ` `` and `${}`.

```ts
const roomName = `Lobby ${game.lobby.id.slice(0, 6)}`;
// same as: "Lobby " + game.lobby.id.slice(0, 6)
```

### `import` / `export`
How files share code between each other.

```ts
// named export — export a specific thing by name
export async function friendRoutes(app: any) { ... }

// named import — import it by the same name
import { friendRoutes } from "./routes/friends";

// default export — one main thing per file
export default friendRoutes;

// default import — any name you want
import friendRoutes from "./routes/friends";
```

In this project everything uses **named exports**.

### `try / catch`
Handles errors that might be thrown. Without it, an unhandled error crashes the request.

```ts
try {
  await request.jwtVerify();       // might throw if token is invalid
} catch (err) {
  return reply.code(401).send({ error: "unauthorized" });
}
```

### Array methods — `.map()`, `.filter()`, `.find()`
These three are used heavily to transform Prisma results.

```ts
// .map() — transform every item, returns a new array of the same length
const names = users.map((user) => user.profile.username);

// .filter() — keep only items that match, returns a smaller array
const opponents = game.players.filter((p) => p.userId !== payload.sub);

// .find() — return the first item that matches (or undefined)
const me = game.players.find((p) => p.userId === payload.sub);
```

They are often chained:
```ts
const opponents = game.players
  .filter((p) => p.userId !== payload.sub)   // remove yourself
  .map((p) => ({ id: p.userId, username: p.user.profile?.username ?? "Player" }));
```

### Arrow functions `(param) => expression`
A short way to write functions, commonly used as callbacks inside `.map()`, `.filter()` etc.

```ts
// arrow function
const double = (n: number) => n * 2;

// same as regular function
function double(n: number) { return n * 2; }

// with a block body (needs explicit return)
const double = (n: number) => {
  return n * 2;
};
```

---

## Fastify

The web framework that handles HTTP. Every route follows the same pattern:

```ts
app.post("/path", { preHandler: [app.auth] }, async (request, reply) => {
  // handler
});
```

- `app.post / app.get / app.patch / app.delete` — registers a route for that HTTP method
- First argument — the URL path (relative to the prefix registered in `server.ts`)
- Second argument — options object (schema validation, preHandlers, etc.)
- Third argument — the async handler function

### `request`
The incoming HTTP request. Key properties:
- `request.body` — parsed request body (JSON)
- `request.params` — URL parameters (e.g. `/users/:id` → `request.params.id`)
- `request.headers` — HTTP headers
- `request.user` — set by `app.auth` after JWT verification

### `reply`
Used to send the HTTP response back.
- `reply.send({ data })` — send a JSON response (default 200)
- `reply.code(201).send(...)` — send with a specific status code
- `reply.code(404).send({ error: "not found" })` — send an error

### `preHandler`
An array of functions Fastify runs before your handler. Used for auth checks, input validation, etc.

```ts
{ preHandler: [app.auth] }
// app.auth runs first — if the JWT is invalid, the request is rejected automatically
// if valid, request.user is populated and your handler runs
```

---

## Auth plugin (`plugins/auth.ts`)

A Fastify plugin that wraps `fastify-jwt`. It:
1. Reads the `Authorization: Bearer <token>` header
2. Verifies the JWT signature
3. Decodes the payload and puts it on `request.user`

### `payload.sub`
`sub` is a standard JWT field meaning "subject" — in this project it holds the logged-in user's ID.

```ts
const payload = request.user as { sub?: string };
// payload.sub === the logged-in user's database ID
```

Always check `if (!payload.sub)` before using it defensively.

---

## Prisma (`plugins/prisma.ts`)

The database client. Registered as a Fastify plugin so it's available as `app.prisma` everywhere.

### Common methods

```ts
// Find one record (returns null if not found)
await app.prisma.user.findUnique({ where: { id: "..." } });
await app.prisma.user.findFirst({ where: { email: "..." } });

// Find many records
await app.prisma.user.findMany({ where: { ... }, orderBy: { ... }, take: 20 });

// Create a record
await app.prisma.user.create({ data: { ... } });

// Update a record
await app.prisma.user.update({ where: { id: "..." }, data: { ... } });

// Create or update (upsert)
await app.prisma.profile.upsert({
  where: { userId: "..." },
  update: { bio: "..." },
  create: { userId: "...", username: "..." },
});

// Delete a record
await app.prisma.user.delete({ where: { id: "..." } });
```

### `select`
Limits which fields Prisma returns — good practice to never expose `passwordHash` etc.

```ts
await app.prisma.user.findUnique({
  where: { id: "..." },
  select: { id: true, email: true, profile: { select: { username: true } } },
});
```

---

## Non-route files

### `const` vs `let`
- `const` — value can never be reassigned (use by default)
- `let` — value can be reassigned later

```ts
const name = "alice";   // fixed
let payload: JwtPayload; // will be assigned inside try/catch below
```

### `new` — creating a class instance
Classes are blueprints; `new` creates an actual object from one.

```ts
const prisma = new PrismaClient();       // creates a database client
const io = new SocketIOServer(app.server); // creates a Socket.IO server
```

### `||` and `&&` — logical OR / AND
Different from `??` — these check for any falsy value (`""`, `0`, `false`, `null`, `undefined`).

```ts
// || — use left side if truthy, otherwise right side
const token = socket.handshake.auth?.token || someOtherToken;

// && — only proceed if left side is truthy
if (jwtApi && typeof jwtApi.verify === "function") { ... }
```

Use `??` when you only want to fall back on `null`/`undefined` (not empty strings or 0).
Use `||` when any falsy value should trigger the fallback.

### `typeof` — runtime type check
Used to check what type a value actually is at runtime.

```ts
typeof jwtApi.verify === "function"  // true if verify is a function
typeof someVar === "string"          // true if it's a string
```

### Regular expressions
A pattern for matching/replacing text. Written between `/` `/`.

```ts
"Bearer abc123".replace(/^Bearer\s+/i, "")
// /^Bearer\s+/i means: starts with "Bearer" followed by whitespace, case-insensitive
// result: "abc123"
```

### `interface` — TypeScript object shape
Like `type`, but used especially for extending/augmenting existing types.

```ts
interface FastifyInstance {
  prisma: PrismaClient;  // adds prisma to Fastify's existing type
}
```

### `declare module` — module augmentation
Tells TypeScript "add these types to an existing library's types." Used in plugins so TypeScript knows `app.prisma` and `app.auth` exist.

```ts
declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;  // now TS knows app.prisma is a PrismaClient
    auth: (request: any, reply: any) => Promise<void>;
  }
}
```

Without this, TypeScript would complain that `app.prisma` doesn't exist.

### `app.decorate()` — adding things to the Fastify instance
How Fastify plugins attach new properties to `app` so every route can use them.

```ts
app.decorate("prisma", prisma);  // now app.prisma is available everywhere
app.decorate("auth", async (request, reply) => { ... });  // now app.auth works
```

### `app.addHook()` — lifecycle hooks
Runs code at specific points in Fastify's lifecycle. `onClose` runs when the server shuts down.

```ts
app.addHook("onClose", async () => {
  await prisma.$disconnect();  // cleanly close DB connection on shutdown
});
```

---

## Socket.IO concepts

### `socket.on()` vs `socket.emit()`
- `socket.on("event", handler)` — **listen** for an event from the client
- `socket.emit("event", data)` — **send** an event to that specific client
- `io.emit("event", data)` — **broadcast** an event to **all** connected clients

```ts
socket.on("ping", () => socket.emit("pong"));       // one client
io.emit("presence:online", { userId });              // everyone
```

### `socket.join(room)` — rooms
Groups sockets together so you can emit to all of them at once.

```ts
socket.join(`user:${userId}`);   // join a room named "user:abc123"
io.to(`user:${userId}`).emit("notification", data);  // emit only to that room
```

### Middleware and `next()`
Socket.IO middleware runs before a connection is accepted. Call `next()` to allow it, `next(new Error(...))` to reject it.

```ts
io.use((socket, next) => {
  if (validToken) return next();          // allow connection
  return next(new Error("unauthorized")); // reject connection
});
```

### Function that returns a function (factory pattern)
`createAuthMiddleware` takes `app` and returns the actual middleware function. This lets the inner function use `app` (its parent's variable) via **closure**.

```ts
export function createAuthMiddleware(app: FastifyInstance) {
  return async (socket: Socket, next: Next) => {
    // can use `app` here because of closure
    const jwtApi = (app as any).jwt;
    ...
  };
}

// used as:
io.use(createAuthMiddleware(app));
```

### `new Error(message)` — creating an error
Creates an Error object that can be thrown or passed to `next()`.

```ts
return next(new Error("unauthorized"));
throw new Error("JWT_SECRET is missing");
```

---

## Typical route skeleton

```ts
app.post("/something", { preHandler: [app.auth] }, async (request: any, reply: any) => {
  // 1. Get the logged-in user's ID
  const payload = request.user as { sub?: string };
  if (!payload.sub) return reply.code(401).send({ error: "unauthorized" });

  // 2. Read input from the request
  const { field } = request.body as { field: string };

  // 3. Talk to the database
  const result = await app.prisma.someModel.create({ data: { ... } });

  // 4. Send the response
  return reply.code(201).send({ result });
});
```
