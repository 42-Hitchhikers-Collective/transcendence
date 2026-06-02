/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 13:14:30 by ilazar            #+#    #+#             */
/*   Updated: 2026/06/02 18:22:33 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { FastifyInstance } from "fastify";
import { Socket } from "socket.io";
import { gameManager, utils } from "../../gameManager";
import { getIdentity } from "../socket.utils";
import { registerRoomHandlers } from "./room.handlers";
import { registerGameHandlers } from "./game.handlers";
import { registerConnectionHandlers } from "./connection.handlers";
// import registerFriendHandlers from "./friend.handlers";
import { ChatMsgType } from "../../gameManager/chatEvents";


export function registerSocketHandlers(
  app: FastifyInstance,
  socket: Socket
) {

 // Broadcast room state to everyone including the sender
  function broadcastRoomState(roomId: string) {
    const room = gameManager.getRoomById(roomId);
    if (!room) return;
    room.players.forEach((player) => {
      if (!player.socketId) return; // skip players without an active socket
      const frontendRoomData = utils.getFrontendRoom(room, player.playerId);
      socket.nsp.to(player.socketId).emit("room_state", frontendRoomData);
    });
    gameManager.debugState();
  }

  // Register related event handlers
  registerRoomHandlers(socket, broadcastRoomState);
  registerGameHandlers(socket, broadcastRoomState, /*broadcastPlayerState*/);
  registerConnectionHandlers(app, socket, broadcastRoomState);
  // registerFriendHandlers(app, socket);
    
  // ---> Msg Events ---
  socket.on("send_message", ({ msg }) => {
    const { playerId, userName } = getIdentity(socket);
    const res = gameManager.prepareChatMsg(playerId, msg);
    if (!res.success) {
      console.log("[send_msg] failed", {
      playerId,
      socketId: socket.id,
      msg,
      error: res.error,
    });
      socket.emit("error", { message: res.error });
      return;
    }
    console.log("[send_msg] Broadcasting message to room:", res.roomId);
    socket.nsp.to(res.roomId).emit("chat_message", { msg, senderId: userName });
  });


  // ---> DEBUG <---

  socket.on("debug", () => {
    gameManager.debugState();
  });

}


/// Helper function to send system messages to the room chat (like player joined, left, game started, etc)
export function systemChatMsg(playerId: string, socket: Socket,msgType: ChatMsgType) {
  const res = gameManager.prepareStrChatMsg(playerId, msgType);
  if (!res.success) {
    console.error(`Failed to send system message: ${res.error}`);
    return;
  }
  const roomId = gameManager.getPlayerRoomId(playerId);
  if (roomId) {
    socket.nsp.to(roomId).emit("chat_message", { msg: res.msg, senderId: "System" });
  }
}