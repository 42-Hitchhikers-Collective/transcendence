/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/22 13:28:26 by ilazar            #+#    #+#             */
/*   Updated: 2026/07/06 13:46:31 by ilazar           ###   ########.fr       */
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
  app.decorate("io", io);

  // --- Use JWT auth middleware ---
  io.use(createAuthMiddleware(app));
  
  io.on("connection", (socket) => {
    const playerId = (socket as any).userId as string;
    const userName = (socket as any).userName as string;
    const avatarUrl = (socket as any).avatarUrl as string;
    console.log(`[Socket] ${userName} connected. socketId: ${socket.id}`);

    // Add player to online players list (or update socketId if already exists)
    const existingPlayer = gameManager.getOnlinePlayer(playerId);
    if (existingPlayer) {
      console.log(`[online players] ${userName} is already online, updating socketId to ${socket.id}`);
      existingPlayer.socketId = socket.id;
      existingPlayer.avatarUrl = avatarUrl; // update avatar in case it changed
      const roomId = gameManager.getPlayerRoomId(playerId);
    } else {
        console.log(`[online players] New player: ${userName}`);
        const newPlayer: Player = { playerId, socketId: socket.id, userName, avatarUrl };
        gameManager.addPlayerToOnlinePlayers(newPlayer);
    }
    registerSocketHandlers(app, socket);
  });



  return io;
}
