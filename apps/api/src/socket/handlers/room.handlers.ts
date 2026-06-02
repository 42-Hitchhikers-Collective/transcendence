/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   room.handlers.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 15:03:27 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/26 16:58:08 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Socket } from "socket.io";
import { gameManager } from "../../gameManager";
import { getIdentity } from "../socket.utils";
import { systemMsg } from ".";
import { ChatMsgType } from "../../gameManager/chatEvents";
import { startGracePeriod } from "./connection.handlers"; // <-- JESS: used in the "user_dropped" event that i need on the frontend

// --- Room Events ---
export function registerRoomHandlers(
  socket: Socket,
  broadcastRoomState: (roomId: string) => void,
) {

  // JESS - WHY DOES THE CREATE ROOM DOES NOT HANDLE ONLY CREATE ROOM? 
  // A function cannot be this long and nested or it will create problmens in the codebase,
  // it has to respect single responsibility principle and handle just 1 thing - create the room
  // not also check if the player is already in a room, leave the old room, join the new room, etc...

  // Create a new room. Enter it and leave old room if in any
  socket.on("create_room", ({ roomName }) => {
    const { playerId } = getIdentity(socket);
    console.log("[room:create_room] received", {
      playerId,
      socketId: socket.id,
      roomName,
    });
    if (gameManager.isInRoom(playerId)) {
      const currentRoomId = gameManager.getPlayerRoomId(playerId); // get the current room id before we leave the room so we can send it back in the error message
      const currentRoom = currentRoomId
        ? gameManager.getRoomById(currentRoomId)
        : null; // get the current room object to get the name for the error message, if it exists
      const currentRoomName = currentRoom?.name ?? "unknown"; // if we have the room object use its name, otherwise default to "unknown" in the error message
      console.log("[room:create_room] blocked, player already in room", {
        playerId,
        socketId: socket.id,
        currentRoomId,
        currentRoomName,
      });
      return socket.emit("error", {
        // Jess added this data so we can show the name of the room that is active and blocking the player to create another one
        message: `Player already in a room "${currentRoomName}"`,
        roomId: currentRoomId ?? null,
        roomName: currentRoomName,
      });
    }
    const res = gameManager.createRoom(roomName);
    if (!res.success) {
      console.log("[room:create_room] failed", {
        playerId,
        socketId: socket.id,
        roomName,
        error: res.error,
      });
      return socket.emit("error", { message: res.error });
    }
    const newRoom = res.room;
    if (newRoom) {
      if (gameManager.isInRoom(playerId)) {
        const res = gameManager.leaveRoom(playerId);
        if (!res.success) {
          console.log("[room:create_room] failed leaving old room", {
            playerId,
            socketId: socket.id,
            newRoomId: newRoom.id,
            newRoomName: newRoom.name,
            error: res.error,
          });
          socket.emit("error", { message: res.error });
          gameManager.deleteRoomIfEmpty(newRoom);
          return;
        }
        const oldRoomId = res.roomId;
        console.log("[room:create_room] left old room before creating new one", {
          playerId,
          socketId: socket.id,
          oldRoomId,
          newRoomId: newRoom.id,
          newRoomName: newRoom.name,
        });
        socket.leave(oldRoomId);
        broadcastRoomState(oldRoomId);
      }
      console.log("[room:create_room] created", {
        playerId,
        socketId: socket.id,
        roomId: newRoom.id,
        roomName: newRoom.name,
      });
      // NOTE FROM JESS -> createRoom and join room are 2 different processes and
      // should be calles separately, also because in our website the player creates a room on the 
      // profile page, and ONLY when they load the game page (game room) they join as a player
      // they are 2 separate processes that should not get mixed up
      // gameManager.joinRoom(roomName, playerId); // <----- this is why i commented this out, but ideally it should be removed
      // socket.join(newRoom.id); // <----- also this should be removed
      socket.emit("room_created", { roomName: newRoom.name });
      console.log("[room:create_room] emitted room_created", {
        playerId,
        socketId: socket.id,
        roomName: newRoom.name,
      });
    }
  });

  // Join an existing room
  socket.on("join_room", ({ roomName }) => {
    const { playerId } = getIdentity(socket);
    console.log("[room:join_room] received", {
      playerId,
      socketId: socket.id,
      roomName,
    });
    if (gameManager.isInRoom(playerId)) {
      console.log("[room:join_room] blocked, player already in room", {
        playerId,
        socketId: socket.id,
        roomName,
      });
      return socket.emit("error", { message: "Player already in a room" });
    }
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
    console.log("[room:join_room] success", {
      playerId,
      socketId: socket.id,
      roomId,
      roomName,
    });
    socket.join(roomId);
    cancelDropTimer(playerId); // If user re-enters the room, the drop timer should be cancelled
    socket.emit("room_joined", { roomName });
    console.log("[room:join_room] emitted room_joined and joined socket room", {
      playerId,
      socketId: socket.id,
      roomId,
      roomName,
    });
    broadcastRoomState(roomId);
  });

  // Leave room
  socket.on("leave_room", () => { // NOTE FROM JESS -> this event kicks out the player from the room, the player is no longer seen as a player from thegame manager, so it should be used when we need to kick out the player from the room (when the game ends or after they have been inactive for a while)
    const { playerId } = getIdentity(socket);
    console.log("[room:leave_room] received", {
      playerId,
      socketId: socket.id,
    });
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
    console.log("[room:leave_room] success", {
      playerId,
      socketId: socket.id,
      roomId: res.roomId,
    });
    socket.leave(res.roomId);
    broadcastRoomState(res.roomId);
  });

/* ----------------------- FUNCTIONS ADDED BY JESS (to check and discuss with inbar and gabriel) ------------------------------- */
  //  Passes user and their room info so that the frontend (website) can handle edgecases coming from the user's activity
  // (example if user is outside the room, the frontend notifies the user)
  socket.on("get_room_state", () => {
    const { playerId } = getIdentity(socket);
    console.log("[room:get_room_state] received", {
      playerId,
      socketId: socket.id,
    });
    const roomId = gameManager.getPlayerRoomId(playerId);
    if (!roomId) {
      console.log("[room:get_room_state] no room found", {
        playerId,
        socketId: socket.id,
      });
      return;
    }
    const room = gameManager.getRoomById(roomId);
    if (!room) {
      console.log("[room:get_room_state] room id not found", {
        playerId,
        socketId: socket.id,
        roomId,
      });
      return;
    }
    // emit a different event — GameScene does not listen to this
    socket.emit("active_room", { roomName: room.name });
    console.log("[room:get_room_state] emitted active_room", {
      playerId,
      socketId: socket.id,
      roomId: room.id,
      roomName: room.name,
    });
  });

  // is called from the frontend when the user leaved the game page (room) when it is still active, we do not want to kick them out of the room with "leave_room"
  // so we use this event to notify the frontend that the user is inactive and will have a grace period before
  // we call "leave_room" for them
 socket.on("user_dropped", () => {
  const { playerId } = getIdentity(socket);
  // Don't stack timers
  if (dropTimers.has(playerId)) return;
  console.log("[room:user_dropped] starting 30s drop timer", { playerId, socketId: socket.id });
  const timer = setTimeout(() => {
    dropTimers.delete(playerId);
    const roomId = gameManager.getPlayerRoomId(playerId);
    if (!roomId) return; // already removed by other means
    const res = gameManager.leaveRoom(playerId);
    if (!res.success) return;
    socket.emit("leave_room"); 
    broadcastRoomState(roomId);
    console.log("[room:user_dropped] timer expired, player removed from room", { playerId, roomId });
  }, 30_000);

  dropTimers.set(playerId, timer);
});
}

// These functions are added because your current one is implemented
// on a socket level, not game roome level which is what i need in "user_dropped" event
// Module-level: survives across socket reconnections
const dropTimers = new Map<string, ReturnType<typeof setTimeout>>();
// Export so socket.ts can cancel on reconnect
export function cancelDropTimer(playerId: string) {
  const timer = dropTimers.get(playerId);
  if (timer) {
    clearTimeout(timer);
    dropTimers.delete(playerId);
    console.log("[room:user_dropped] timer cancelled for", playerId);
  }
}
