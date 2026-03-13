import { Server as SocketIOServer } from "socket.io";
import { SOCKET_EVENTS } from "./events";
import { userRoom } from "./rooms";

type JwtPayload = { sub?: string };

export function setupSocket(app: any) {
  const io = new SocketIOServer(app.server, {
    path: "/socket.io",
    cors: { origin: true },
  });

  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers.authorization || "").replace(/^Bearer\s+/i, "");

    if (!token) return next(new Error("unauthorized"));

    const jwtApi = app.jwt;
    if (!jwtApi || typeof jwtApi.verify !== "function") {
      app.log.error("JWT not available on app (authPlugin missing?)");
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
    socket.join(userRoom(payload.sub));

    return next();
  });

  io.on("connection", (socket) => {
    const userId = (socket as any).userId as string;

    app.log.info({ socketId: socket.id, userId }, "socket connected");

    socket.emit(SOCKET_EVENTS.HELLO, { message: "Hello from Socket.IO" });
    io.emit(SOCKET_EVENTS.PRESENCE_ONLINE, { userId });

    socket.on(SOCKET_EVENTS.PING, () => socket.emit(SOCKET_EVENTS.PONG));

    socket.on(SOCKET_EVENTS.NOTIFY_SELF, () => {
      io.to(userRoom(userId)).emit(SOCKET_EVENTS.NOTIFY, {
        userId,
        message: "private notification",
      });
    });

    socket.on("disconnect", () => {
      io.emit(SOCKET_EVENTS.PRESENCE_OFFLINE, { userId });
      app.log.info({ socketId: socket.id, userId }, "socket disconnected");
    });
  });
}