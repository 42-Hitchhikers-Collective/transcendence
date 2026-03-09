import Fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import { setupSocket } from "./socket/socket";
import { gameManager } from "./game";

const prisma = new PrismaClient();
const app = Fastify({ logger: true });

app.get("/health", async () => ({ ok: true }));

app.get("/users", async () => {
  const users = await prisma.user.findMany();
  return { users };
});

app.get("/rooms", async () => {
  return gameManager.getAllRooms;
});

const port = Number(process.env.PORT || "3000");

const start = async () => {
  await app.listen({ port, host: "0.0.0.0" });
  
  setupSocket(app);
};

start().catch((err) => {
  app.log.error(err);
  process.exit(1);
});