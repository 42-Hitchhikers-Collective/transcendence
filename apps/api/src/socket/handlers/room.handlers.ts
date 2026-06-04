/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   room.handlers.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 15:03:27 by ilazar            #+#    #+#             */
/*   Updated: 2026/06/04 17:33:40 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

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
    const { playerId, userName } = getIdentity(socket);
    const res = gameManager.createRoom(roomName, playerId);
    if (!res.success) {
      console.log("[room:create_room] failed", {
            playerId,
            username: userName,
            roomName: roomName,
            error: res.error,
          });
      return socket.emit("error", { message: res.error });
    }
    const newRoom = res.room;
    socket.emit("room_created", { roomName: newRoom.name });
    // systemChatMsg(playerId, socket, ChatMsgType.CREATE_ROOM);
    broadcastRoomState(newRoom.id);
    console.log("[room:create_room] created", {
        playerId,
        username: userName,
        roomId: newRoom.id,
        roomName: newRoom.name,
      });
  });

  // Join an existing room
  socket.on("join_room", ({ roomName }) => {
    const { playerId, userName } = getIdentity(socket);
    const res = gameManager.joinRoom(roomName, playerId);
    if (!res.success) {
      console.log("[room:join_room] failed", {
        playerId,
        username: userName,
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
    systemChatMsg(playerId, roomId, socket, ChatMsgType.JOIN_ROOM);
    socket.emit("chatHistory", res.room.chatHistory); // Send chat history to player when they join the room
    broadcastRoomState(roomId);
    
    console.log("[room:join_room] success", {
      playerId,
      username: userName,
      socketId: socket.id,
      roomId,
      roomName,
    });
  });

  // Leave room
  socket.on("leave_room", () => {
    const { playerId, userName } = getIdentity(socket);
    const res = gameManager.leaveRoom(playerId);
    if (!res.success) {
      console.log("[room:leave_room] failed", {
        playerId,
        username: userName,
        error: res.error,
      });
      socket.emit("error", { message: res.error });
      return;
    }
    // Clear any pending drop timer since they're intentionally leaving
    gameManager.cancelDropTimer(playerId);
    console.log("[room:user_dropped] timer cancelled for", playerId);
    systemChatMsg(playerId, res.roomId, socket, ChatMsgType.LEFT_ROOM);
    socket.leave(res.roomId);
    broadcastRoomState(res.roomId);
    console.log("[room:leave_room] success", {
      playerId,
      username: socket.name,
      roomId: res.roomId,
    });
  });


  socket.on("user_dropped", () => {
    const { playerId, userName } = getIdentity(socket);
    console.log("[room:user_dropped] will start 30s drop timer", { 
      username: userName,
      socketId: socket.id,
    });
    const roomId = gameManager.getPlayerRoomId(playerId);
    if (!roomId) {
      console.log("[room:user_dropped] fail to start 30s timer: player not in any room", { username: userName });
      return;
    }
    const room = gameManager.getRoomById(roomId);
    if (room) {
      socket.emit("active_room", { roomName: room.name }); // inform client about the active room so they can show a "rejoin" option
      console.log("[room:user_dropped] player dropped from room", { 
      username: userName,
      roomId,
      socketId: socket.id, 
      });
    }
    gameManager.startDropTimer(playerId, ({ roomId }) => { // paranthasis will run only after drop timer expires
      socket.leave(roomId);
      socket.emit("leave_room");
      systemChatMsg(playerId, roomId, socket, ChatMsgType.LEFT_ROOM);
      console.log("[room:user_dropped] timer expired, player removed from room", { userName, roomId });
      broadcastRoomState(roomId);
    });
  });






// --- Helpers ---
  
  // Check if the room with the given name exists, returns room name and exists boolean true or false
  socket.on("is_room_exists", ({ roomName }) => {
    const exists = gameManager.getRoomsByNameMap().has(roomName);
    socket.emit("room_exists_response", { roomName, exists });
  });

  // Check if player is part of the room with the given name, returns room name and isPart boolean true or false
  socket.on("is_part_of_room", ({ roomName }) => {
    const { playerId } = getIdentity(socket);
    const potentialRoom = gameManager.getRoomByName(roomName);
    if (!potentialRoom) {
      return socket.emit("part_of_room_response", { roomName, isPart: false });
    }
    const playerRoomId = gameManager.getPlayerRoomId(playerId);
    const isPart = playerRoomId === potentialRoom.id;
    socket.emit("part_of_room_response", { roomName, isPart });
  });
}