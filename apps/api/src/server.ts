import Fastify from "fastify";
import { Server as SocketIOServer } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = Fastify({ logger: true });

app.get("/health", async () => ({ ok: true }));

app.get("/users", async () => {
  const users = await prisma.user.findMany();
  return { users };
});

const port = Number(process.env.PORT || "3000");

const start = async () => {
  await app.listen({ port, host: "0.0.0.0" });

  const io = new SocketIOServer(app.server, {
    path: "/socket.io",
    cors: { origin: true }
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