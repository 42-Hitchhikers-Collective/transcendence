/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   room.handlers.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 15:03:27 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/13 18:36:33 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Socket } from "socket.io";
import { gameManager } from "../../gameManager";
import { getIdentity } from "../socket.utils";

// --- Room Events ---

export function registerRoomHandlers(
  socket: Socket,
  broadcastRoomState: (roomId: string) => void
) {

  // Create a new room. Enter it and leave old room if in any
  socket.on("create_room", ({ roomName }) => {
    const { playerId, socketId, userName } = getIdentity(socket);
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
      gameManager.joinRoom(roomName, playerId, socketId, userName);
      socket.join(newRoom.id);
      socket.emit("room_created", { roomName: newRoom.name });
    }
  });

  // Join an existing room
  socket.on("join_room", ({ roomName }) => {
    const { playerId, socketId, userName } = getIdentity(socket);
    const res = gameManager.joinRoom(roomName, playerId, socketId, userName);
    if (!res.success) {
      socket.emit("error", { message: res.error });
      return;
    }
    const roomId = res.room.id;
    socket.join(roomId);
    socket.emit("room_joined", { roomName });
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
    socket.leave(res.roomId);
    broadcastRoomState(res.roomId);
  });


  // Set ready to play
  socket.on("set_ready", ({ isReady }: { isReady: boolean }) => {
    const { playerId } = getIdentity(socket);
    const res = gameManager.setReady(playerId, isReady); //TODO
    if (!res.success) {
      socket.emit("error", { message: res.error });
      return;
    }
    broadcastRoomState(res.roomId);
  });
}