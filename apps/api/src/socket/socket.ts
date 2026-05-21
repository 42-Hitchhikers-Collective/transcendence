import { Server as SocketIOServer } from "socket.io";
import { FastifyInstance } from "fastify";
import { registerSocketHandlers } from "./handlers";
import { createAuthMiddleware } from "./middleware/auth";
import { gameManager } from "../gameManager";
import { Player } from "../gameManager/types";

export function setupSocket(app: FastifyInstance) {
  const io = new SocketIOServer(app.server, {
    path: "/socket.io",
    cors: { origin: true },
  });

  // --- Use JWT auth middleware ---
  io.use(createAuthMiddleware(app));
  
  io.on("connection", (socket) => {
    const playerId = (socket as any).userId as string;
    const userName = (socket as any).userName as string;

    app.log.info({ socketId: socket.id, playerId }, "socket connected");

    // Add player to online players list (or update socketId if already exists)
    const existingPlayer = gameManager.getOnlinePlayer(playerId);
    if (existingPlayer) {
      app.log.info(`Player ${playerId} already online, updating socketId to ${socket.id}`);
      existingPlayer.socketId = socket.id;
      io.emit("playerUpdate", existingPlayer); // TODO: optimize to only emit to the room the player is in
    } else {
      app.log.info(`Adding new online player: ${playerId} (${userName})`);
      const newPlayer: Player = { playerId, socketId: socket.id, userName, isReady: false };
      gameManager.addPlayerToOnlinePlayers(newPlayer);
      io.emit("playerUpdate", newPlayer); // TODO: optimize to only emit to the room the player is in?
    }

    // Game room handlers (create_room, join_room, leave_room, start_game, play_card, draw_card)
    registerSocketHandlers(app, socket);
  });

  return io;
}
