/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 13:14:30 by ilazar            #+#    #+#             */
/*   Updated: 2026/04/02 17:51:07 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { FastifyInstance } from "fastify";
import { Socket } from "socket.io";
import { gameManager, utils } from "../../game";

export function registerSocketHandlers(
  app: FastifyInstance,
  socket: Socket
) {

 // Broadcast room state to everyone except the sender
  function broadcastRoomState(socket: Socket, roomId: string) {
  const room = gameManager.getRoom(roomId);
  if (!room) return;
  room.players.forEach((player) => {
    const dataToSend = utils.getSanitizedRoom(room, player.id); 
    
    socket.nsp.to(player.id).emit("room_state", dataToSend);
  });
  gameManager.debugState();
}

  // Disconnect and leave room if in any
  socket.on("disconnect", () => {
  const res = gameManager.leaveRoom(socket.id);
  if (res.success) {
    socket.leave(res.roomId);
    broadcastRoomState(socket, res.roomId);
  }
  app.log.info(`socket disconnected: ${socket.id}`);
});
    
  // --- Room Events ---
  
  // Create a new room  //TODO: will not broadcast if leaves room to join a new one
  socket.on("create_room", () => {
    const room = gameManager.createRoom();
    if (room) {
      socket.join(room.id);
      gameManager.joinRoom(room.id, socket.id);
      socket.emit("room_created", { roomId: room.id })
    }
    
  });

  // Join an existing room
  socket.on("join_room", ({ roomId }) => {
    const res = gameManager.joinRoom(roomId, socket.id);
    if (!res.success) {
      socket.emit("error", { message: res.error });
      return;
    }
    socket.join(roomId);
    socket.emit("room_joined", { roomId });
    broadcastRoomState(socket, roomId);
  });

  
  // Leave room
  socket.on("leave_room", () => {
    const res = gameManager.leaveRoom(socket.id);
    if (!res.success) {
      socket.emit("error", { message: res.error });
      return;
    }
    socket.leave(res.roomId);
    broadcastRoomState(socket, res.roomId);
});


// ---> Game Events ---

// Start the game
socket.on("start_game", () => {
  const res = gameManager.startGame(socket.id);
  if (!res.success) {
    socket.emit("error", { message: res.error });
    return;
  }
  const roomId = res.room.id;
  broadcastRoomState(socket, roomId);
});


// Play a card
socket.on("play_card", ({ cardIndex }) => {
  const res = gameManager.playCard(socket.id, cardIndex);
  if (res.success)
      broadcastRoomState(socket, res.roomId); 
  else
      socket.emit("error", { message: res.error });
});

// Draw a card
socket.on("draw_card", () => {
  const res = gameManager.drawCard(socket.id);
  if (res.success)
      broadcastRoomState(socket, res.roomId);
  else
      socket.emit("error", { message: res.error });
});

// ---> DEBUG <---

socket.on("debug", () => {
  gameManager.debugState();
});

}