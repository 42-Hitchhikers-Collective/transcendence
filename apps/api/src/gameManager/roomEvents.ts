/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   roomEvents.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/13 17:25:50 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/20 16:07:43 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as gm from "./gameManager";
import { Player, Room, RoomResult, RoomIdResult } from "./types";
import { MAX_PLAYERS_PER_ROOM } from "./types";

// --- Room Events ---

// Create a new room and return it
export function createRoom(roomName: string): RoomResult {
  const roomId = generateRoomId();
  const room: Room = {
    id: roomId,
    name: roomName,
    players: [],
    state: "waiting",
  };
  const validation = validateRoomName(roomName);
  if (!validation.success)
    return {success: false, error: validation.error};
  gm.getRoomsByIdMap().set(roomId, room);
  gm.getRoomsByNameMap().set(roomName, room);
  return { success: true, room: room };
}

// Add player to room. removes player from old room
export function joinRoom(name: string, playerId: string): RoomResult {
  if (gm.isInRoom(playerId))
    return { success: false, error: "Player already in a room" }; //// <--- Jess: if the player never left the room (refreshes the page, re-enters) we should stop here
  const room = gm.getRoomByName(name);
  if (!room)
    return { success: false, error: "Room not found" };
  const roomId = room.id;
  if (gm.getPlayerRoomId(playerId) === roomId) { // Already in same room
    // START EDIT BY JESS
    // Added this code to avoid losing the player's socket id
    // when the player tries to refresh the game room 
    const onlinePlayer = gm.getOnlinePlayer(playerId); 
    if (onlinePlayer) {
      const existing = room.players.find(p => p.playerId === playerId); 
      // if the playerIs is found as part of the room's player array, update the socketId to the current one from the onlinePlayers map
      if (existing) {
        existing.socketId = onlinePlayer.socketId;
      }
    }
    // FINISH EDIT BY JESS
    return { success: true, room: room };
  }
  if (room.players.length >= MAX_PLAYERS_PER_ROOM)
    return { success: false, error: "Room is full" };
  if (room.state !== "waiting")
    return { success: false, error: "Game already begun" };
  leaveRoom(playerId);
  const player = gm.getOnlinePlayer(playerId);
  if (!player)
    return { success: false, error: "Player not found" };
  room.players.push({ playerId, socketId: player.socketId, userName: player.userName, isReady: false });
  gm.addToPlayerRoom(playerId, roomId); // add to playerRooms
  return { success: true, room: room };;
}

// Player leaves room or disconnects
// Removes player from it's room object, from PlayerRooms, deletes room if empty
export function leaveRoom(playerId: string): RoomIdResult {
  const currentRoomId = gm.getPlayerRoomId(playerId);
  if (currentRoomId == null) 
    return {success: false, error: "Player not in room"};
  const room = gm.getRoomsByIdMap().get(currentRoomId);
  if (!room)
    return { success: false, error: "Room object not found" };
  const removed = gm.removePlayerFromPlayersArray(room.players, playerId);
  if (!removed)
    return { success: false, error: "Player not in room array" };
  gm.getPlayerRoomsMap().delete(playerId);
  gm.deleteRoomIfEmpty(room);
  return { success: true, roomId: currentRoomId };
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
    return {success: false, error: "Room name cannot be empty"};
  if (gm.getRoomsByNameMap().has(name))
    return {success: false, error: "Room name already exists"};
  if (name.length > 10)
    return {success: false, error: "Room name cannot exceed 10 characters"};
  const regex = /^[a-zA-Z0-9\-_!?.]+$/;
  if (!regex.test(name))
    return { success: false, error: "Room name contains invalid characters"};
  return { success: true, room: null as any };
  }