/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   room.handlers.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 15:03:27 by ilazar            #+#    #+#             */
/*   Updated: 2026/06/02 16:10:00 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Socket } from "socket.io";
import { gameManager } from "../../gameManager";
import { getIdentity } from "../socket.utils";
import { systemChatMsg } from ".";
import { ChatMsgType } from "../../gameManager/chatEvents";

// --- Room Events ---

export function registerRoomHandlers(
  socket: Socket,
  broadcastRoomState: (roomId: string) => void
) {

  // Create a new room
  socket.on("create_room", ({ roomName }) => {
    const { playerId } = getIdentity(socket);
    const res = gameManager.createRoom(roomName);
    if (!res.success) {
      console.log("[room:create_room] failed", {
            playerId,
            socketId: socket.id,
            roomName: roomName,
            error: res.error,
          });
      return socket.emit("error", { message: res.error });
    }
    const newRoom = res.room;
    socket.emit("room_created", { roomName: newRoom.name });
    systemChatMsg(playerId, socket, ChatMsgType.CREATE_ROOM);
    broadcastRoomState(newRoom.id);
    console.log("[room:create_room] created", {
        playerId,
        socketId: socket.id,
        roomId: newRoom.id,
        roomName: newRoom.name,
      });
  });

  // Join an existing room
  socket.on("join_room", ({ roomName }) => {
    const { playerId } = getIdentity(socket);
    const res = gameManager.joinRoom(roomName, playerId);
    if (!res.success) {
      console.log("[room:join_room] failed", {
        playerId,
        socketId: socket.id,
        roomName,
        error: res.error,
      });
      socket.emit("error", { message: res.error });
      return;
    }
    const roomId = res.room.id;
    socket.join(roomId);
    // Cancel room-page drop timer if player rejoined in time
    gameManager.cancelDropTimer(playerId);
    socket.emit("room_joined", { roomName });
    systemChatMsg(playerId, socket, ChatMsgType.JOIN_ROOM);
    socket.emit("chatHistory", res.room.chatHistory); // Send chat history to player when they join the room
    broadcastRoomState(roomId);
    
    console.log("[room:join_room] success. emitted room_joined and joined socket room", {
      playerId,
      socketId: socket.id,
      roomId,
      roomName,
    });
  });

  // Leave room
  socket.on("leave_room", () => {
    const { playerId } = getIdentity(socket);
    const res = gameManager.leaveRoom(playerId);
    if (!res.success) {
      console.log("[room:leave_room] failed", {
        playerId,
        socketId: socket.id,
        error: res.error,
      });
      socket.emit("error", { message: res.error });
      return;
    }
    // Clear any pending drop timer since they're intentionally leaving
    gameManager.cancelDropTimer(playerId);
    console.log("[room:user_dropped] timer cancelled for", playerId);
    systemChatMsg(playerId, socket, ChatMsgType.LEFT_ROOM);
    socket.leave(res.roomId);
    broadcastRoomState(res.roomId);
    console.log("[room:leave_room] success", {
      playerId,
      socketId: socket.id,
      roomId: res.roomId,
    });
  });


  socket.on("user_dropped", () => {
    const { playerId } = getIdentity(socket);
    console.log("[room:user_dropped] starting 30s drop timer", { playerId, socketId: socket.id });
    gameManager.startDropTimer(playerId, ({ roomId }) => { // paranthasis will run only after drop timer expires
      socket.leave(roomId);
      socket.emit("leave_room");
      systemChatMsg(playerId, socket, ChatMsgType.LEFT_ROOM);
      broadcastRoomState(roomId);
      console.log("[room:user_dropped] timer expired, player removed from room", { playerId, roomId });
    });
  });
}