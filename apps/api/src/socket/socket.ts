import { Server as SocketIOServer } from "socket.io";
import { FastifyInstance } from "fastify";
import { registerSocketHandlers } from "./handlers";

type JwtPayload = { sub?: string };

export function setupSocket(app: FastifyInstance) {
  const io = new SocketIOServer(app.server, {
    path: "/socket.io",
    cors: { origin: true },
  });

  // --- Auth middleware: reject connections without a valid JWT ---
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers.authorization || "").replace(/^Bearer\s+/i, "");

    if (!token) return next(new Error("unauthorized"));

    const jwtApi = (app as any).jwt;
    if (!jwtApi || typeof jwtApi.verify !== "function") {
      app.log.error("JWT plugin not available on app");
      return next(new Error("unauthorized"));
    }

    let payload: JwtPayload;
    try {
      payload = jwtApi.verify(token) as JwtPayload;
    } catch {
      return next(new Error("unauthorized"));
    }

    if (!payload.sub) return next(new Error("unauthorized"));

    (socket as any).userId = payload.sub;
    socket.join(`user:${payload.sub}`);

    return next();
  });
  io.on("connection", (socket) => {
    const userId = (socket as any).userId as string;

    app.log.info({ socketId: socket.id, userId }, "socket connected");

    // Notify everyone a new client joined
    io.emit("newClient", socket.id);

    // Presence
    io.emit("presence:online", { userId });

    // Basic ping/pong health check
    socket.emit("hello", { message: "Hello from Socket.IO" });
    socket.on("ping", () => socket.emit("pong"));

    socket.on("disconnect", () => {
      io.emit("presence:offline", { userId });
      app.log.info({ socketId: socket.id, userId }, "socket disconnected");
    });

    // Game room handlers (create_room, join_room, leave_room, start_game, play_card, draw_card)
    registerSocketHandlers(app, socket);
  });

  return io;
}
