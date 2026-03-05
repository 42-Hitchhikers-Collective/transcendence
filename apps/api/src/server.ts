import Fastify from "fastify";
import { prismaPlugin } from "./plugins/prisma";
import { authPlugin } from "./plugins/auth";
import { rateLimitPlugin } from "./plugins/rate_limit";
import rolesPlugin from "./plugins/roles";

import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/users";
import { profileRoutes } from "./routes/profiles";
import { securityRoutes } from "./routes/security";
import { adminRoutes } from "./routes/admin";
import { setupSocket } from "./realtime";

const app = Fastify({ logger: true, trustProxy: true });

app.setErrorHandler((err, req, reply) => {
  req.log.error(err);
  reply.code((err as any).statusCode || 500).send(err);
});

app.get("/api/health", async () => ({ ok: true }));

app.get("/api/db/ping", async () => {
  const r = await app.prisma.$queryRaw`SELECT 1 as ok`;
  return { ok: true, r };
});

const port = Number(process.env.PORT || "3000");

const start = async () => {
  await app.register(prismaPlugin);
  await app.register(authPlugin);
  await app.register(rateLimitPlugin);
  await app.register(rolesPlugin);

  await app.register(securityRoutes, { prefix: "/api/auth" });
  await app.register(authRoutes, { prefix: "/api/auth" });

  await app.register(userRoutes, { prefix: "/api/users" });
  await app.register(profileRoutes, { prefix: "/api/profiles" });

  await app.register(adminRoutes, { prefix: "/api" });

  await app.listen({ port, host: "0.0.0.0" });
  setupSocket(app);
};

start().catch((err) => {
  app.log.error(err);
  process.exit(1);
});