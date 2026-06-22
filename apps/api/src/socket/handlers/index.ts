/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 13:14:30 by ilazar            #+#    #+#             */
/*   Updated: 2026/06/15 15:41:31 by ilazar           ###   ########.fr       */
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
import { SYSTEM_SENDER_NAME } from "../../gameManager/types";


export function registerSocketHandlers(
  app: FastifyInstance,
  socket: Socket
) {

 // Broadcast Game Canvas to everyone including the sender
  function broadcastGameCanvas(roomId: string) {
    const room = gameManager.getRoomById(roomId);
    if (!room) return;
    room.players.forEach((player) => {
      if (!player.socketId) return; // skip players without an active socket
      const gameCanvasRoom = utils.getGameCanvasRoom(room, player.playerId);
      socket.nsp.to(player.socketId).emit("room_state", gameCanvasRoom);
    });
    gameManager.debugState();
  }

  // Broadcast Game Page info to everyone in the room
  function broadcastGamePage(roomId: string) {
    const roomInfo = utils.getFrontedRoomInfo(roomId);
    if (roomInfo) {
      socket.nsp.to(roomId).emit("room_info_response", roomInfo);
      // console.log(`<-------------  📋 ROOM INFO ${roomId} 📋 -------------> \n`, roomInfo);
      // console.log(`<--------------------------------------------->`);
    }
  }

  // Register related event handlers
  registerConnectionHandlers(app, socket, broadcastGameCanvas /* broadcastGamePage */);
  registerRoomHandlers(socket, broadcastGameCanvas, broadcastGamePage);
  registerGameHandlers(app, socket, broadcastGameCanvas, broadcastGamePage); // JESS: I need to pass broadcastGamePage to update the gamepage on who is playing
  // registerFriendHandlers(app, socket);


  // Emits an object of the current player state (or null) on request
  socket.on("player_info_request", () => {
    const { playerId, userName } = getIdentity(socket);
    const roomId = gameManager.getPlayerRoomId(playerId);
    const room = roomId ? gameManager.getRoomById(roomId) : null;
    const frontedPlayerData = utils.getFrontedPlayerInfo(playerId, userName, room);
    socket.emit("player_info_response", frontedPlayerData);
  });

  // Emits an object of the current room state (or null) on request
  socket.on("room_info_request", () => {
    const { playerId, userName } = getIdentity(socket);
    const roomId = gameManager.getPlayerRoomId(playerId);
    let frontedRoomInfo = null;
    if (roomId)
      frontedRoomInfo = utils.getFrontedRoomInfo(roomId);
    socket.emit("room_info_response", frontedRoomInfo);
  });

  
  // JESS: I NEEDED THESE EVENT TO REQUEST THE CHAT HSTORY WHEN THE GAME PAGE MOUNTS
  socket.on("chat_history_request", () => {
    const { playerId } = getIdentity(socket);
    const roomId = gameManager.getPlayerRoomId(playerId);
    if (!roomId) return;
    const room = gameManager.getRoomById(roomId);
    if (!room) return;
    socket.emit("chat_history_response", room.chatHistory ?? []);
  });

  // ---> Msg Events ---
  socket.on("send_msg", ({ msg }) => {
    const { playerId, userName } = getIdentity(socket);
    const res = gameManager.prepareChatMsg(playerId, msg);
    if (!res.success) {
      console.log("[send_msg] failed", {
      playerId,
      username: userName,
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
export function systemChatMsg(playerId: string, roomId: string, socket: Socket,msgType: ChatMsgType) {
  const res = gameManager.prepareStrChatMsg(playerId, roomId, msgType);
  if (!res.success) {
    console.error(`Failed to send system message: ${res.error}`);
    return;
  }
  if (roomId) {
    socket.nsp.to(roomId).emit("chat_message", { msg: res.msg, senderId: SYSTEM_SENDER_NAME });
  }
}