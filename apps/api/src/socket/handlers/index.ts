/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.de>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 13:14:30 by ilazar            #+#    #+#             */
/*   Updated: 2026/03/09 17:41:20 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { FastifyInstance } from "fastify";
import { Socket } from "socket.io";
import { gameManager } from "../../game";

export function registerSocketHandlers(
  app: FastifyInstance,
  socket: Socket
) {

 // Broadcast room state to everyone except the sender
  function broadcastRoomState(socket: Socket, roomId: string) {
  const room = gameManager.getRoom(roomId);
  if (!room || roomId == null) return;
  socket.nsp.to(roomId).emit("room_state", room);
  gameManager.debugState();
}

  // Disconnect and leave room if in any
  socket.on("disconnect", () => {
  const roomId = gameManager.removePlayer(socket.id);
  if (roomId) {
    socket.leave(roomId);
    broadcastRoomState(socket, roomId);
  }
  app.log.info(`socket disconnected: ${socket.id}`);
});

    
    
    
  // --- Room Events ---
  // Create a new room
  socket.on("create_room", () => {
    const room = gameManager.createRoom(socket.id);
    if (room) {
      socket.join(room.id);
      gameManager.addToRoomMap(room.id, socket.id);
      socket.emit("room_created", { roomId: room.id, maxPlayers: room.maxPlayers })
    }
    
  });

  // Join an existing room
  socket.on("join_room", ({ roomId }) => {
    const room = gameManager.getRoom(roomId);
    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }
    if (room.players.length >= room.maxPlayers) {
      socket.emit("error", { message: "The room is full" });
      return;
    }
    
    gameManager.addPlayerToRoom(roomId, socket.id);
    socket.join(roomId);
    socket.emit("room_joined", { roomId });
    //broadcast to all clients
    broadcastRoomState(socket, roomId);
  });

  
  // Leave room
  socket.on("leave_room", ({ roomId }) => {
    const room = gameManager.getRoom(roomId);
    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }
    gameManager.removePlayer(socket.id);
    socket.leave(roomId);
    broadcastRoomState(socket, roomId);
});

socket.on("debug", () => {
  gameManager.debugState();
});

}