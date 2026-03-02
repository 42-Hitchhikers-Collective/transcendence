import Fastify from "fastify";
import jwt from "@fastify/jwt";
import bcrypt from "bcrypt";
import { Server as SocketIOServer } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = Fastify({ logger: true });

/* ----------------------------- Global error handler ----------------------------- */
app.setErrorHandler((err, req, reply) => {
  app.log.error(err);
  reply.code(500).send({ error: "internal_server_error" });
});

/* ----------------------------- JWT setup ----------------------------- */
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET is missing");
}

app.register(jwt, { secret: jwtSecret });

async function authenticate(request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.code(401).send({ error: "unauthorized" });
  }
}

/* ----------------------------- Routes ----------------------------- */

// Health
app.get("/health", async () => ({ ok: true }));

// DB ping
app.get("/db/ping", async () => {
  const r = await prisma.$queryRaw`SELECT 1 as ok`;
  return { ok: true, r };
});

// MVP: list users (public for now) — avoid leaking emails
app.get("/users", async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      createdAt: true,
      profile: { select: { displayName: true, avatarUrl: true } },
    },
  });
  return { users };
});

// Register (validated)
app.post(
  "/auth/register",
  {
    schema: {
      body: {
        type: "object",
        required: ["email", "password", "displayName"],
        additionalProperties: false,
        properties: {
          email: { type: "string", minLength: 3 },
          password: { type: "string", minLength: 6 },
          displayName: { type: "string", minLength: 1 },
        },
      },
    },
  },
  async (request, reply) => {
    const body = request.body as { email: string; password: string; displayName: string };

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return reply.code(409).send({ error: "email already in use" });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        profile: { create: { displayName: body.displayName } },
      },
      select: { id: true, email: true, createdAt: true },
    });

    return reply.code(201).send({ user });
  }
);

// Login (validated)
app.post(
  "/auth/login",
  {
    schema: {
      body: {
        type: "object",
        required: ["email", "password"],
        additionalProperties: false,
        properties: {
          email: { type: "string", minLength: 3 },
          password: { type: "string", minLength: 6 },
        },
      },
    },
  },
  async (request, reply) => {
    const body = request.body as { email: string; password: string };

    const user = await prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      return reply.code(401).send({ error: "invalid credentials" });
    }

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) {
      return reply.code(401).send({ error: "invalid credentials" });
    }

    const token = app.jwt.sign({ sub: user.id }, { expiresIn: "15m" });
    return reply.send({ token });
  }
);

// Me (protected)
app.get("/users/me", { preHandler: [authenticate] }, async (request: any, reply) => {
  const payload = request.user as { sub?: string };
  if (!payload.sub) {
    return reply.code(401).send({ error: "unauthorized" });
  }

  const me = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      createdAt: true,
      profile: { select: { displayName: true, avatarUrl: true, bio: true } },
    },
  });

  return { user: me };
});

// Update profile (protected + validated + upsert)
app.patch(
  "/profiles/me",
  {
    preHandler: [authenticate],
    schema: {
      body: {
        type: "object",
        additionalProperties: false,
        properties: {
          displayName: { type: "string", minLength: 1 },
          avatarUrl: { type: "string", minLength: 1 },
          bio: { type: "string" },
        },
      },
    },
  },
  async (request: any, reply) => {
    const payload = request.user as { sub?: string };
    if (!payload.sub) {
      return reply.code(401).send({ error: "unauthorized" });
    }

    const body = request.body as { displayName?: string; avatarUrl?: string; bio?: string };

    const profile = await prisma.profile.upsert({
      where: { userId: payload.sub },
      update: {
        displayName: body.displayName,
        avatarUrl: body.avatarUrl,
        bio: body.bio,
      },
      create: {
        userId: payload.sub,
        displayName: body.displayName || "User",
        avatarUrl: body.avatarUrl,
        bio: body.bio,
      },
      select: { displayName: true, avatarUrl: true, bio: true },
    });

    return reply.send({ profile });
  }
);

/* ----------------------------- Socket.IO ----------------------------- */
const port = Number(process.env.PORT || "3000");

const start = async () => {
  await app.listen({ port, host: "0.0.0.0" });

  const io = new SocketIOServer(app.server, {
    path: "/socket.io",
    cors: { origin: true },
  });

  io.on("connection", (socket) => {
    app.log.info(`socket connected: ${socket.id}`);
    socket.emit("hello", { message: "Hello from Socket.IO" });
    socket.on("ping", () => socket.emit("pong"));
  });
};

start().catch((err) => {
  app.log.error(err);
  process.exit(1);
});