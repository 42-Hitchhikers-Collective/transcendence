/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameManager.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 13:14:08 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/28 16:53:04 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


//will manage all active rooms -creating rooms, players joining/leaving

import { Player, Room} from "./types";
import { MAX_PLAYERS_PER_ROOM} from "./types";


const playerRooms: Map<string, string> = new Map();     // playerId → roomId
const roomsById: Map<string, Room> = new Map();         // roomId → Room
const onlinePlayers: Map<string, Player> = new Map();   // playerId → Player
const roomsByName: Map<string, Room> = new Map();       // roomName → Room (to allow join by name)
const timeouts: Map<string, NodeJS.Timeout> = new Map(); // playerId → timeout for handling disconnection grace period
const dropTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();

// --- Friends ---
// async getFriendsWithStatus(userId: string) {
  // Call friends.service.getFriendsList(userId)
  // Then check onlinePlayers map
  // Return combined result
// }



// --- Socket Timeout ---
// Timeout for socket disconnection.
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

export function getDropTimeouts(): Map<string, ReturnType<typeof setTimeout>> {
  return dropTimeouts;
}


// --- DEBUG ---
  export function debugState() {
    console.log("---- GAME STATE ----");

    for (const [roomId, room] of roomsById) {
      const name = room.name ? `${room.name}` : "";
      console.log(`Room: ${roomId} - Name: ${name} - State: ${room.state} - Players: ${room.players.length}`);
      console.log("Players:", room.players.map(p => `${p.userName} , isReady: ${p.isReady}`).join(", \n"));
    }
    console.log("Online players:\n");
    if (onlinePlayers.size === 0) {
      console.log("No online players");
    } else {
      for (const [playerId, player] of onlinePlayers) {
        const username = player.userName ? `${player.userName}` : "No Username";
        console.log(`Player: ${username} - Room: ${getPlayerRoomId(playerId)}`);
      }
    }
  }