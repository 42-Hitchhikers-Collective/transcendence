import { Server as SocketIOServer } from "socket.io";
import { FastifyInstance } from "fastify";
import { registerSocketHandlers } from "./handlers";
import { createAuthMiddleware } from "./middleware/auth";

export function setupSocket(app: FastifyInstance) {
  const io = new SocketIOServer(app.server, {
    path: "/socket.io",
    cors: { origin: true },
  });

  // --- Use JWT auth middleware ---
  io.use(createAuthMiddleware(app));
  
  io.on("connection", (socket) => {
    const userId = (socket as any).userId as string;

    app.log.info({ socketId: socket.id, userId }, "socket connected");

    // Notify everyone a new client joined
    // io.emit("newClient", socket.id);

    // Presence
    // io.emit("presence:online", { userId });

    // Basic ping/pong health check
    // socket.emit("hello", { message: "Hello from Socket.IO" });
    // socket.on("ping", () => socket.emit("pong"));

    // socket.on("disconnect", () => {
    //   io.emit("presence:offline", { userId });
    //   app.log.info({ socketId: socket.id, userId }, "socket disconnected");
    // });

    // Game room handlers (create_room, join_room, leave_room, start_game, play_card, draw_card)
    registerSocketHandlers(app, socket);
  });

  return io;
}
