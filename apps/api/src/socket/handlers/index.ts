/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 13:14:30 by ilazar            #+#    #+#             */
/*   Updated: 2026/04/14 12:59:05 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { FastifyInstance } from "fastify";
import { Socket } from "socket.io";
import { gameManager, utils } from "../../game";
import { getIdentity } from "../socket.utils";
import { registerRoomHandlers } from "./room.handlers";
import { registerGameHandlers } from "./game.handlers";


export function registerSocketHandlers(
  app: FastifyInstance,
  socket: Socket
) {

 // Broadcast room state to everyone includingthe sender
  function broadcastRoomState(roomId: string) {
  const room = gameManager.getRoomById(roomId);
  if (!room) return;
  room.players.forEach((player) => {
    const sanitizedRoomData = utils.getSanitizedRoom(room, player.playerId); 
    socket.nsp.to(player.socketId).emit("room_state", sanitizedRoomData);
  });
  gameManager.debugState();
}

  // Register room-related event handlers
  registerRoomHandlers(socket, broadcastRoomState);
  
  // Register game-related event handlers
  registerGameHandlers(socket, broadcastRoomState);


  // Disconnect and leave room if in any
  socket.on("disconnect", () => {
  const { playerId } = getIdentity(socket);
  const res = gameManager.leaveRoom(playerId);
  if (res.success) {
    socket.leave(res.roomId);
    broadcastRoomState(res.roomId);
  }
  app.log.info(`socket disconnected: ${playerId}`);
});
  


// ---> Msg Events ---
socket.on("send_msg", ({ msg }) => {
  const { playerId } = getIdentity(socket);
  const res = gameManager.sendMessage(playerId, msg);
  if (!res.success) {
    socket.emit("error", { message: res.error });
    return;
  }
  if (res.roomId) {
    // console.log("Broadcasting message to room:", res.roomId);
    socket.nsp.to(res.roomId).emit("chat_message", { msg, senderId: playerId });
  }
});

// ---> DEBUG <---

socket.on("debug", () => {
  gameManager.debugState();
});

}