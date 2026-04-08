/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 13:14:30 by ilazar            #+#    #+#             */
/*   Updated: 2026/04/08 16:57:48 by ilazar           ###   ########.fr       */
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
  const room = gameManager.getRoomById(roomId);
  if (!room) return;
  room.players.forEach((player) => {
    const sanitizedRoomData = utils.getSanitizedRoom(room, player.id); 
    
    socket.nsp.to(player.id).emit("room_state", sanitizedRoomData);
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
  
  // Create a new room. Enter it and leave old room if in any
  socket.on("create_room", ({ roomName }) => {
    const res = gameManager.createRoom(roomName);
    if (!res.success)
      return socket.emit("error", { message: res.error });
    const room = res.room;
    if (room) {
      if (gameManager.isInRoom(socket.id)) {
        const res = gameManager.leaveRoom(socket.id);
        if (!res.success) {
          socket.emit("error", { message: res.error });
          gameManager.deleteRoomIfEmpty(room);
          return;
        }
      socket.leave(room.id);
      broadcastRoomState(socket, room.id);        
    }
      gameManager.joinRoom(roomName, socket.id);
      socket.join(room.id);
      socket.emit("room_created", { roomId: room.id })
    }
  });

  // Join an existing room
  socket.on("join_room", ({ roomName }) => {
    // console.log(`Socket ${socket.id} requested to join room with name: ${roomName}`);
    const res = gameManager.joinRoom(roomName, socket.id);
    if (!res.success) {
      socket.emit("error", { message: res.error });
      return;
    }
    const roomId = res.room.id;
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


// ---> Msg Events ---
socket.on("send_msg", ({ msg }) => {
  const res = gameManager.sendMessage(socket.id, msg);
  if (!res.success) {
    socket.emit("error", { message: res.error });
    return;
  }
  if (res.roomId) {
    socket.nsp.to(res.roomId).emit("chat_msg", { msg, senderId: socket.id });
  }
});

// ---> DEBUG <---

socket.on("debug", () => {
  gameManager.debugState();
});

}