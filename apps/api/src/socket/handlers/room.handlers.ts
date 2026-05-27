/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   room.handlers.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 15:03:27 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/27 14:33:19 by ilazar           ###   ########.fr       */
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

  // Create a new room. Enter it and leave old room if in any
  socket.on("create_room", ({ roomName }) => {
    const { playerId } = getIdentity(socket);
    const res = gameManager.createRoom(roomName);
    if (!res.success)
      return socket.emit("error", { message: res.error });
    const newRoom = res.room;
    if (newRoom) {
      if (gameManager.isInRoom(playerId)) {
        const res = gameManager.leaveRoom(playerId);
        if (!res.success) {
          socket.emit("error", { message: res.error });
          gameManager.deleteRoomIfEmpty(newRoom);
          return;
        }
        const oldRoomId = res.roomId;
        socket.leave(oldRoomId);
        broadcastRoomState(oldRoomId);
      }
      gameManager.joinRoom(roomName, playerId);
      socket.join(newRoom.id);
      socket.emit("room_created", { roomName: newRoom.name });
      systemChatMsg(playerId, socket, ChatMsgType.CREATE_ROOM);
      broadcastRoomState(newRoom.id);
    }
  });

  // Join an existing room
  socket.on("join_room", ({ roomName }) => {
    const { playerId } = getIdentity(socket);
    const res = gameManager.joinRoom(roomName, playerId);
    if (!res.success) {
      socket.emit("error", { message: res.error });
      return;
    }
    const roomId = res.room.id;
    socket.join(roomId);
    socket.emit("room_joined", { roomName });
    systemChatMsg(playerId, socket, ChatMsgType.JOIN_ROOM);
    socket.emit("chatHistory", res.room.chatHistory); // Send chat history to player when they join the room
    broadcastRoomState(roomId);
  });

  // Leave room
  socket.on("leave_room", () => {
    const { playerId } = getIdentity(socket);
    const res = gameManager.leaveRoom(playerId);
    if (!res.success) {
      socket.emit("error", { message: res.error });
      return;
    }
    systemChatMsg(playerId, socket, ChatMsgType.LEFT_ROOM);
    socket.leave(res.roomId);
    broadcastRoomState(res.roomId);
  });

}