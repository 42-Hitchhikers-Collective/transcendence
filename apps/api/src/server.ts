import dotenv from "dotenv";
import Fastify from "fastify";

import { prismaPlugin } from "./plugins/prisma";
import { authPlugin } from "./plugins/auth";
import { rateLimitPlugin } from "./plugins/rate_limit";
import { multipartPlugin } from "./plugins/multipart";
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/users";
import { profileRoutes } from "./routes/profiles";
import { setupSocket } from "./socket/socket";
import { gameManager } from "./gameManager";

dotenv.config();

const app = Fastify({ logger: false, trustProxy: true });

app.setErrorHandler((err, req, reply) => {
  req.log.error(err);
  if ((err as any).code === 'FST_ERR_VALIDATION') {
    const v = (err as any).validation?.[0];
    const field = v?.instancePath?.replace('/', '') || 'input';
    if (field === 'password' && v?.keyword === 'pattern')
      return reply.code(400).send({ error: 'password must be at least 8 characters and include uppercase, lowercase, and a number' });
    return reply.code(400).send({ error: `${field}: ${v?.message ?? 'invalid'}` });
  }
  reply.code((err as any).statusCode || 500).send(err);
});

app.get("/api/health", async () => ({ ok: true }));

app.get("/api/db/ping", async () => {
  const r = await app.prisma.$queryRaw`SELECT 1 as ok`;
  return { ok: true, r };
});

app.get("/rooms", async () => {
  return gameManager.getAllRooms;
});

const port = Number(process.env.PORT || "3000");

const start = async () => {
  await app.register(prismaPlugin);
  await app.register(authPlugin);
  await app.register(rateLimitPlugin);
  await app.register(multipartPlugin);

  await app.register(authRoutes, { prefix: "/api/auth" });

  await app.register(userRoutes, { prefix: "/api/users" });
  await app.register(profileRoutes, { prefix: "/api/profiles" });

  setupSocket(app);
  await app.listen({ port, host: "0.0.0.0" });
};

start().catch((err) => {
  app.log.error(err);
  process.exit(1);
});