/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameManager.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.de>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 13:14:08 by ilazar            #+#    #+#             */
/*   Updated: 2026/03/18 21:20:47 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

//will manage all active rooms -creating rooms, players joining/leaving

import { Player, Room, roomResult, roomIdResult } from "./types";
import { MAX_PLAYERS_PER_ROOM } from "./types";

export class GameManager {
  
  private roomList: Map<string, Room> = new Map();         // roomId → Room
  private playerRoomList: Map<string, string> = new Map(); // playerId → roomId
  
  
  // --- Room Events ---

  // Create a new room and return it
  createRoom(): Room {
    const roomId = this.generateRoomId();
    const room: Room = {
      id: roomId,
      players: [],
      state: "waiting",
    };
    this.roomList.set(roomId, room);
    return room;
  }

  // Add player to room. removes player from old room
  joinRoom(roomId: string, playerId: string): roomResult {
    const room = this.roomList.get(roomId);
    if (!room) {
      return { success: false, error: "Room not found" };
    }
    if (room.players.length >= MAX_PLAYERS_PER_ROOM) {
      return { success: false, error: "Room is full" };
    }
    if (room.state !== "waiting") {
      return { success: false, error: "Game already begun" };
    }
    this.leaveRoom(playerId);
    room.players.push({ id: playerId });
    this.addToPlayerRoomList(playerId, roomId); // add to playerRooms
    return { success: true, room: room };;
  }

    // Player leaves room or disconnects. Removes from room. returns roomId
  // Removes player from it's room object, from PlayerRoomList, deletes room if empty
  leaveRoom(playerId: string): roomIdResult {
    const currentRoomId = this.getPlayerRoomId(playerId);
    if (currentRoomId == null) 
      return {success: false, error: "Player not in room"};
    const room = this.roomList.get(currentRoomId);
    if (!room)
      return { success: false, error: "Room object not found" };
    const removed = this.removePlayerFromPlayersArray(room.players, playerId);
    if (!removed)
      return { success: false, error: "Player not in room array" };
    this.playerRoomList.delete(playerId);
    if (room.players.length === 0)
      this.roomList.delete(currentRoomId);
    return { success: true, roomId: currentRoomId };
  }
  
  
  // --- Game Events ---
  
  // Set room state to "playing"
  startGame(playerId: string): roomResult {
    const roomId = this.getPlayerRoomId(playerId);
    if (!roomId)
      return { success: false, error: "Player is not in room" };
    const room = this.roomList.get(roomId);
    if (!room)
      return { success: false, error: "Room not found" };
    if (room.state !== "waiting")
      return { success: false, error: "Game already begun" };
    if (room.players.length < 2)
      return { success: false, error: "Not enough players" };
    room.state = "playing";
    return { success: true, room: room };
  }
  
  // --- PRIVATE ---
  
  // Removes player from it's room player[] array
  private removePlayerFromPlayersArray(players: Player[], playerId: string): boolean {
    const index = players.findIndex(p => p.id === playerId);
    if (index === -1) return false;
    players.splice(index, 1);
    return true;
  }

  // add to playerRoomList. map naturaly avoids duplicates.
  private addToPlayerRoomList(playerId: string, roomId: string) {
    this.playerRoomList.set(playerId, roomId);
  }
  
  // Generate a unique roomId
  private generateRoomId(): string {
    let roomId;

    do {
      roomId = "room_" + Math.random().toString(36).substring(2, 6);
    } while (this.roomList.has(roomId));
    return roomId;
  }
  
  
  //lookup in playerRoom map after a player. returns roomId
  getPlayerRoomId(playerId: string): string | null {
    return this.playerRoomList.get(playerId) ?? null;
  }
  
//--- Getters ---

  getRoom(roomId: string): Room | null  {
    const room = this.roomList.get(roomId);
    return room ?? null;
  }

  getAllRooms() {
    return Array.from(this.roomList.values());
  }

  getMaxPlayersPerRoom() {
    return MAX_PLAYERS_PER_ROOM;
  }
  


// --- DEBUG ---
  public debugState() {
    console.log("---- GAME STATE ----");

    for (const [roomId, room] of this.roomList) {
      console.log(`Room ${roomId}`);
      console.log("Players:", room.players.map(p => p.id));
    }

        console.log("Player -> Room map:");
    for (const [playerId, roomId] of this.playerRoomList) {
      console.log(`${playerId} → ${roomId}`);
    }
  }
}

