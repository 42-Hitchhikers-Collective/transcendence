import { Server as SocketIOServer } from "socket.io";
import { FastifyInstance } from "fastify";
import { registerSocketHandlers } from "./handlers";

export function setupSocket(app: FastifyInstance) {
  const io = new SocketIOServer(app.server, {
    path: "/socket.io",
    cors: { origin: true },
  });

  io.on("connection", (socket) => {
    console.log(`Sockett connected: ${socket.id}`);
    io.emit("newClient", socket.id);

    // delegate logic to handlers
    registerSocketHandlers(app, socket);
  });

  return io;
}