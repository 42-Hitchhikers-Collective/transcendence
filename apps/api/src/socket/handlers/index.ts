/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.de>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 13:14:30 by ilazar            #+#    #+#             */
/*   Updated: 2026/03/05 13:44:06 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { FastifyInstance } from "fastify";
import { Socket } from "socket.io";
import { gameManager } from "../../game";

export function registerSocketHandlers(
  app: FastifyInstance,
  socket: Socket
) {

//   socket.on("yoyo", () => {
//     socket.emit("hello");
//   });

  // Disconnect
  socket.on("disconnect", () => {
    app.log.info(`socket disconnected: ${socket.id}`);
    console.log(`Socket disconnected: ${socket.id}`);
    });

  // --- Room Events ---
  // Create a new room
  socket.on("create_room", () => {
    const room = gameManager.createRoom(socket.id);
    socket.join(room.id);
    socket.emit("room_created", { roomId: room.id, maxPlayers: room.maxPlayers })
  });

  // Join an existing room
  socket.on("join_room", ({ roomId }) => {
    const room = gameManager.getRoom(roomId);

    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }
    
    if (room.players.length >= room.maxPlayers) {
      socket.emit("error", { message: "Room is full" });
      return;
    }
    
    gameManager.addPlayerToRoom(roomId, socket.id);
    socket.join(roomId);
    socket.emit("room_joined", { roomId });
    socket.to(roomId).emit("player_joined", { playerId: socket.id });
    });
    
}