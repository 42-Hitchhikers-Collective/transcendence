import Fastify from "fastify";
import { prismaPlugin } from "./plugins/prisma";
import { authPlugin } from "./plugins/auth";
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/users";
import { profileRoutes } from "./routes/profiles";
// import { setupSocket } from "./socket";
import { setupSocket } from "./realtime";

const app = Fastify({ logger: true });

app.setErrorHandler((err, req, reply) => {
  req.log.error(err);
  reply.code((err as any).statusCode || 500).send(err);
});

app.register(prismaPlugin);
app.register(authPlugin);

app.get("/api/health", async () => ({ ok: true }));

// Debug endpoint (optional)
app.get("/api/db/ping", async () => {
  const r = await app.prisma.$queryRaw`SELECT 1 as ok`;
  return { ok: true, r };
});

app.register(authRoutes, { prefix: "/api/auth" });
app.register(userRoutes, { prefix: "/api/users" });
app.register(profileRoutes, { prefix: "/api/profiles" });

const port = Number(process.env.PORT || "3000");

const start = async () => {
  await app.listen({ port, host: "0.0.0.0" });
  setupSocket(app);
};

start().catch((err) => {
  app.log.error(err);
  process.exit(1);
});

