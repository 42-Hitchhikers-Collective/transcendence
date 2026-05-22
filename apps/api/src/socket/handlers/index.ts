/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 13:14:30 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/22 14:49:44 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { FastifyInstance } from "fastify";
import { Socket } from "socket.io";
import { gameManager, utils } from "../../gameManager";
import { getIdentity } from "../socket.utils";
import { registerRoomHandlers } from "./room.handlers";
import { registerGameHandlers } from "./game.handlers";
import { registerConnectionHandlers } from "./connection.handlers";


export function registerSocketHandlers(
  app: FastifyInstance,
  socket: Socket
) {

 // Broadcast room state to everyone includingthe sender
  function broadcastRoomState(roomId: string) {
  const room = gameManager.getRoomById(roomId);
  if (!room) return;
  room.players.forEach((player) => {
    const frontendRoomData = utils.getFrontendRoom(room, player.playerId); 
    socket.nsp.to(player.socketId).emit("room_state", frontendRoomData);
  });
  gameManager.debugState();
}


// Broadcast chat history to everyone in the room including the sender
function broadcastChatHistory(roomId: string) {
  const room = gameManager.getRoomById(roomId);
  if (!room) return;
  const chatHistory = room.chatHistory || [];
  socket.nsp.to(roomId).emit("chat_history", chatHistory);
}


// // AT THE MOMENT UNUSED
// function broadcastPlayerState(playerId: string) {
//   const player = gameManager.getOnlinePlayer(playerId);
//   if (!player) return;
//   const roomId = gameManager.getPlayerRoomId(playerId);
//   if (!roomId) return;
//   socket.nsp.to(roomId).emit("player_state", player);
// }


  // Register related event handlers
  registerRoomHandlers(socket, broadcastRoomState);
  registerGameHandlers(socket, broadcastRoomState, broadcastChatHistory /*broadcastPlayerState*/);
  registerConnectionHandlers(app, socket, broadcastRoomState);

  
// ---> Msg Events ---
socket.on("send_msg", ({ msg }) => {
  const { playerId, userName } = getIdentity(socket);
  const res = gameManager.sendMessage(playerId, msg);
  if (!res.success) {
    socket.emit("error", { message: res.error });
    return;
  }
  if (res.roomId) {
    socket.nsp.to(res.roomId).emit("chat_message", { msg, senderId: userName });
  }
});

// ---> DEBUG <---

socket.on("debug", () => {
  gameManager.debugState();
});

}