/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   roomEvents.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/13 17:25:50 by ilazar            #+#    #+#             */
/*   Updated: 2026/06/03 17:12:54 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as gm from "./gameManager";
import { Room, RoomResult, RoomIdResult, MAX_ROOM_NAME_LENGTH, DROP_TIMER_DURATION } from "./types";
import { MAX_PLAYERS_PER_ROOM } from "./types";
// import { ChatMsgType, prepareStrChatMsg } from "./chatEvents";

// --- Room Events ---

// Create a new room and return it
export function createRoom(roomName: string, playerId: string): RoomResult {
  const currentRoomId = gm.getPlayerRoomId(playerId);
  if (currentRoomId)
    return { success: false, roomId: currentRoomId, error: "Player already in a room" };
  const roomId = generateRoomId();
  const room: Room = {
    id: roomId,
    name: roomName,
    players: [],
    state: "waiting",
    chatHistory: []
  };
  const validation = validateRoomName(roomName);
  if (!validation.success)
    return {success: false, roomId: "undefined", error: validation.error};
  gm.getRoomsByIdMap().set(roomId, room);
  gm.getRoomsByNameMap().set(roomName, room);
  return { success: true, room: room };
}

// Add player to room. removes player from old room
export function joinRoom(name: string, playerId: string): RoomResult {
  const currentRoomId = gm.getPlayerRoomId(playerId);
  if (currentRoomId)
    return { success: false, roomId: currentRoomId, error: "Player already in a room" };
  const room = gm.getRoomByName(name);
  if (!room)
    return { success: false, roomId: "undefined", error: "Room not found" };
  const roomId = room.id;
  if (gm.getPlayerRoomId(playerId) === roomId) // Already in same room
    return { success: false, roomId: roomId, error: "Player already in room (Dropped)" };
  if (room.players.length >= MAX_PLAYERS_PER_ROOM)
    return { success: false, roomId: roomId, error: "Room is full" };
  if (room.state !== "waiting")
    return { success: false, roomId: roomId, error: "Game already begun" };
  leaveRoom(playerId);
  const player = gm.getOnlinePlayer(playerId);
  if (!player)
    return { success: false, roomId: "undefined", error: "Player not found" };
  room.players.push(player);
  gm.addToPlayerRoom(playerId, roomId); // add to playerRooms
  return { success: true, room: room };;
}

// Player leaves room or disconnects
// Removes player from it's room object, from PlayerRooms, deletes room if empty
export function leaveRoom(playerId: string): RoomIdResult {
  const currentRoomId = gm.getPlayerRoomId(playerId);
  if (currentRoomId == null) 
    return {success: false, roomId: "undefined", error: "Player not in room"};
  const room = gm.getRoomsByIdMap().get(currentRoomId);
  if (!room)
    return { success: false, roomId: "undefined", error: "Room object not found" };
  const removed = gm.removePlayerFromPlayersArray(room.players, playerId);
  if (!removed)
    return { success: false, roomId: "undefined", error: "Player not in room array" };
  gm.getPlayerRoomsMap().delete(playerId);
  gm.deleteRoomIfEmpty(room);
  return { success: true, roomId: currentRoomId };
}


// --- User Drop Handling ---

type DropTimerExpiredCallback = (info: { playerId: string; roomId: string }) => void;

// Starts a drop timer when player navigates away from room webpage
// Socket-layer actions (emit/leave/broadcast) are done via the callback.
export function startDropTimer(playerId: string, onExpired?: DropTimerExpiredCallback) {
  if (gm.getDropTimeouts().has(playerId)) return;
  const username = gm.getOnlinePlayer(playerId)?.userName || "Unknown";
  
  const timer = setTimeout(() => {
    gm.getDropTimeouts().delete(playerId);
    const roomId = gm.getPlayerRoomId(playerId);
    if (!roomId) return;
    const res = leaveRoom(playerId);
    if (res.success) onExpired?.({ playerId, roomId }); // invoke callback to handle socket actions after player is removed from room
    console.log("[drop-timer] expired for", username);
  }, DROP_TIMER_DURATION);
  
  gm.getDropTimeouts().set(playerId, timer);
  console.log("[drop-timer] started for", username);
}


export function cancelDropTimer(playerId: string) {
  const timer = gm.getDropTimeouts().get(playerId);
  const username = gm.getOnlinePlayer(playerId)?.userName || "Unknown";
  if (timer) {
    clearTimeout(timer);
    gm.getDropTimeouts().delete(playerId);
    console.log("[drop-timer] cancelled for", username);
  }
}


// --- Helpers ---

// Returns true if player is in a room, false otherwise
export function isInRoom(playerId: string): boolean {
  return gm.getPlayerRoomsMap().has(playerId);
}

//  --- Private ---

// Generate a unique roomId
function generateRoomId(): string {
let roomId;
do {
    roomId = "room_" + Math.random().toString(36).substring(2, 6);
} while (gm.getRoomsByIdMap().has(roomId));
    return roomId;
}


// Check for room name rules and duplicates. Returns true or false with an error message.
function validateRoomName(name: string): RoomResult {
  if (!name || name.trim().length === 0)
    return {success: false, roomId: "undefined", error: "Room name cannot be empty"};
  if (gm.getRoomsByNameMap().has(name))
    return {success: false, roomId: "undefined", error: "Room name already exists"};
  if (name.length > MAX_ROOM_NAME_LENGTH)
    return {success: false, roomId: "undefined", error: `Room name cannot exceed ${MAX_ROOM_NAME_LENGTH} characters`};
  const regex = /^[a-zA-Z0-9\-_!?.]+$/;
  if (!regex.test(name))
    return { success: false, roomId: "undefined", error: "Room name contains invalid characters"};
  return { success: true, room: null as any };
}

// socket reassigning is being made in the connection handler
// When a player joins a room they are already in, reassign the socket id to avoid losing connection
// function rejoinRoom(playerId: string, room: Room): RoomResult {
//   const onlinePlayer = gm.getOnlinePlayer(playerId); 
//   if (onlinePlayer) {
//     const existing = room.players.find(p => p.playerId === playerId); 
//     if (existing)
//       existing.socketId = onlinePlayer.socketId;
//     return { success: true, room: room };
//   }
//   return { success: false, error: "Player is in room but not in online players" };
// }