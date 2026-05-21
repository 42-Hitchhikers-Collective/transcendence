/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameManager.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 13:14:08 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/21 17:55:14 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


//will manage all active rooms -creating rooms, players joining/leaving

import { Player, Room, RoomResult, RoomIdResult } from "./types";
import { MAX_PLAYERS_PER_ROOM, MAX_MSG_LENGTH } from "./types";


const roomsById: Map<string, Room> = new Map();         // roomId → Room
const playerRooms: Map<string, string> = new Map();     // playerId → roomId
const roomsByName: Map<string, Room> = new Map();       // roomName → Room (to allow join by name)
const onlinePlayers: Map<string, Player> = new Map();   // playerId → Player
const timeouts: Map<string, NodeJS.Timeout> = new Map(); // playerId → timeout for handling disconnection grace period
  


// --- Timeout ---
export function setPlayerTimeout(playerId: string, timeout: NodeJS.Timeout) {
  timeouts.set(playerId, timeout);
}

export function clearPlayerTimeout(playerId: string) {
  const timeout = timeouts.get(playerId);
  if (timeout) {
    clearTimeout(timeout);
    timeouts.delete(playerId);
  }
}

// --- HELPERS ---


// Get Username from PlayerId
export function getUsername(playerId: string): string | null {
  const player = onlinePlayers.get(playerId);
  return player ? player.userName : null;
}

// Adds player to onlinePlayers set. Returns true if player was added, false if already exists.
export function addPlayerToOnlinePlayers(player: Player): boolean {
  if (!onlinePlayers.has(player.playerId)) {
    onlinePlayers.set(player.playerId, player);
    return true;
  }
  return false;
}

// Removes player from onlinePlayers set. Returns true if player was removed, false if player was not in the set.
export function removePlayerFromOnlinePlayers(playerId: string): boolean {
  return onlinePlayers.delete(playerId);
}


// Returns true if player is in a room, false otherwise
export function isInRoom(playerId: string): boolean {
  return playerRooms.has(playerId);
}

// Deletes an Empty Room.
export function deleteRoomIfEmpty(room: Room): boolean {
  if (room.players.length === 0) {
    roomsByName.delete(room.name);
    roomsById.delete(room.id);
    return true;
  }
  return false;
}

// Removes player from it's room player[] array
export function removePlayerFromPlayersArray(players: Player[], playerId: string): boolean {
  const index = players.findIndex(p => p.playerId === playerId);
  if (index === -1) return false;
  players.splice(index, 1);
  return true;
}

// add to playerRooms. map naturaly avoids duplicates.
export function addToPlayerRoom(playerId: string, roomId: string) {
  playerRooms.set(playerId, roomId);
}

//lookup in playerRoom map after a player. returns roomId. Null if not in a room
export function getPlayerRoomId(playerId: string): string | null {
  return playerRooms.get(playerId) ?? null;
}

export function getRoomById(roomId: string): Room | null  {
  const room = roomsById.get(roomId);
  return room ?? null;
}

export function getRoomByName(roomName: string): Room | null {
  const room = roomsByName.get(roomName);
  console.log(`Looking up room by name: ${roomName} - Found: ${!!room}`);
  return room ?? null;
}


//--- Getters ---

export function getMaxPlayersPerRoom() {
  return MAX_PLAYERS_PER_ROOM;
}
  
// Returns an array of all Room objects
export function getAllRooms(): Room[] {
  return Array.from(roomsById.values());
}

export function getRoomsByIdMap(): Map<string, Room> {
  return roomsById;
}

export function getPlayerRoomsMap(): Map<string, string> {
  return playerRooms;
}

export function getRoomsByNameMap(): Map<string, Room> {
  return roomsByName;
}

export function getOnlinePlayersMap(): Map<string, Player> {
  return onlinePlayers;
}

export function getOnlinePlayer(playerId: string): Player | null {
  const player = onlinePlayers.get(playerId);
  return player ?? null;
}


// --- DEBUG ---
  export function debugState() {
    console.log("---- GAME STATE ----");

    for (const [roomId, room] of roomsById) {
      const name = room.name ? `${room.name}` : "";
      console.log(`Room: ${roomId} - Name: ${name} - State: ${room.state} - Players: ${room.players.length}`);
      console.log("Players:", room.players.map(p => `${p.userName} , isReady: ${p.isReady}`).join(", \n"));
    }

    if (onlinePlayers.size === 0) {
      console.log("No online players");
    } else {
      for (const [playerId, player] of onlinePlayers) {
        const username = player.userName ? `${player.userName}` : "No Username";
        console.log(`Player: ${username} - Room: ${getPlayerRoomId(playerId)}`);
      }
    }
  }





  // // --- Room Events ---

  // // Create a new room and return it
  // createRoom(roomName: string): RoomResult {
  //   const roomId = this.generateRoomId();
  //   const room: Room = {
  //     id: roomId,
  //     name: roomName,
  //     players: [],
  //     state: "waiting",
  //   };
  //   const validation = this.validateRoomName(roomName);
  //   if (!validation.success)
  //     return {success: false, error: validation.error};
  //   this.roomsById.set(roomId, room);
  //   this.roomsByName.set(roomName, room);
  //   return { success: true, room: room };
  // }

  // // Add player to room. removes player from old room
  // joinRoom(name: string, playerId: string, socketId: string, userName: string): RoomResult {
  //   const room = this.getRoomByName(name);
  //   if (!room)
  //     return { success: false, error: "Room not found" };
  //   const roomId = room.id;
  //   if (this.getPlayerRoomId(playerId) === roomId) // Already in same room
  //     return { success: true, room: room };
  //   if (room.players.length >= MAX_PLAYERS_PER_ROOM)
  //     return { success: false, error: "Room is full" };
  //   if (room.state !== "waiting")
  //     return { success: false, error: "Game already begun" };
  //   this.leaveRoom(playerId);
  //   room.players.push({ playerId, socketId, userName, isReady:false });
  //   this.addToPlayerRoom(playerId, roomId); // add to playerRooms
  //   return { success: true, room: room };;
  // }

  // // Player leaves room or disconnects
  // // Removes player from it's room object, from PlayerRooms, deletes room if empty
  // leaveRoom(playerId: string): RoomIdResult {
  //   const currentRoomId = this.getPlayerRoomId(playerId);
  //   if (currentRoomId == null) 
  //     return {success: false, error: "Player not in room"};
  //   const room = this.roomsById.get(currentRoomId);
  //   if (!room)
  //     return { success: false, error: "Room object not found" };
  //   const removed = this.removePlayerFromPlayersArray(room.players, playerId);
  //   if (!removed)
  //     return { success: false, error: "Player not in room array" };
  //   this.playerRooms.delete(playerId);
  //   this.deleteRoomIfEmpty(room);
  //   return { success: true, roomId: currentRoomId };
  // }
  

  // // Set isReady for given player true or false
  // setReady(playerId: string, isReady: boolean): RoomIdResult {
  //   const roomId = this.getPlayerRoomId(playerId);
  //   if (!roomId)
  //     return { success: false, error: "Player is not in a room" };
  //   const room = this.roomsById.get(roomId);
  //   if (!room)
  //     return { success: false, error: "Room not found" };
  //   const player = room.players.find(p => p.playerId === playerId);
  //   if (!player)
  //     return { success: false, error: "Player not found in room" };
  //   player.isReady = isReady;
  //   return { success: true, roomId: roomId };
  // }
  

  
  // // --- Game Events ---


  // private startGameCondition(room: Room): boolean {
  //   if (!room)
  //     return false;
  //   if (room.state !== "waiting")
  //     return false;
  //   if (room.players.length < 2)
  //     return false;
  //   const allPlayersReady = room.players.every(player => player.isReady);
  //   if (!allPlayersReady)
  //     return false;
  //   return true;
  // }

  //   private startGame(room: Room): {
  //     return;
  // }
  
  // // Set room state to "playing"
  // // startGame(playerId: string): RoomResult {
  // //   const roomId = this.getPlayerRoomId(playerId);
  // //   if (!roomId)
  // //     return { success: false, error: "Player is not in a room" };
  // //   const room = this.roomsById.get(roomId);
  // //   if (!room)
  // //     return { success: false, error: "Room not found" };
  // //   if (room.state !== "waiting")
  // //     return { success: false, error: "Game already begun" };
  // //   if (room.players.length < 2)
  // //     return { success: false, error: "Not enough players" };
  // //   room.state = "playing";
  // //   // 2. Initialize the "Game Slot"
  // //   // When Gabriel finishes, you'll do: room.game = new GabrielGame(room.players);
  // //   // For now, we just acknowledge the 'game' property exists in the Room type.
  // //   return { success: true, room: room };
  // // }


  // // Play a card
  // playCard(playerId: string, cardIndex: number): RoomIdResult {
  //   const roomId = this.getPlayerRoomId(playerId);
  //   if (!roomId)
  //     return {success: false, error: "Player is not in room"};
  //   const room = this.getRoomById(roomId);
  //   if (!room || room.state !== "playing" || !room.game)
  //     return {success: false, error: "No active game found"};
    
  //   // call the method defined in the Interface!
  //   const res = room.game.playCard(playerId, cardIndex); //gabriel's function
    
  //   if (!res.success)
  //     return {success: false, error: res.error};
  //   return {success: true, roomId: roomId};
  // };
  
  
  // // Draw a card
  // drawCard(playerId: string): RoomIdResult {
  //   const roomId = this.getPlayerRoomId(playerId);
  //   if (!roomId)
  //     return {success: false, error: "Player is not in room"};
  //   const room = this.getRoomById(roomId);
  //   if (!room || room.state !== "playing" || !room.game)
  //     return {success: false, error: "No active game found"};
    
  //   // call the method defined in the Interface!
  //   const res = room.game.drawCard(playerId);
    
  //   if (!res.success)
  //     return {success: false, error: res.error};
  //   return {success: true, roomId: roomId};
  // }