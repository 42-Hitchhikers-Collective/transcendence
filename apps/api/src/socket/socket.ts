/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/22 13:28:26 by ilazar            #+#    #+#             */
/*   Updated: 2026/06/03 18:13:36 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

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
      const roomId = gameManager.getPlayerRoomId(playerId);
      if (roomId)
        io.to(roomId).emit("playerUpdate", existingPlayer); // emiting that player is now online again to the room - neccessary?
      } else {
        app.log.info(`Adding new online player: ${playerId} (${userName})`);
        const newPlayer: Player = { playerId, socketId: socket.id, userName, isReady: false };
        gameManager.addPlayerToOnlinePlayers(newPlayer);
        // socket.emit("playerUpdate", newPlayer); // not neccessary ? is there a need to be updated when a new player is in town?
    }

    // Game room handlers (create_room, join_room, leave_room, start_game, play_card, draw_card)
    registerSocketHandlers(app, socket);
  });



  return io;
}
