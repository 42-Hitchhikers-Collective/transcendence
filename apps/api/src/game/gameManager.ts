/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameManager.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 13:14:08 by ilazar            #+#    #+#             */
/*   Updated: 2026/04/02 18:24:24 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

//will manage all active rooms -creating rooms, players joining/leaving

import { Player, Room, RoomResult, RoomIdResult, GameInstance } from "./types";
import { MAX_PLAYERS_PER_ROOM } from "./types";

export class GameManager {
  
  private roomsById: Map<string, Room> = new Map();         // roomId → Room
  private playerRooms: Map<string, string> = new Map(); // playerId → roomId
  
  
  // --- Room Events ---

  // Create a new room and return it
  createRoom(): Room {
    const roomId = this.generateRoomId();
    const room: Room = {
      id: roomId,
      players: [],
      state: "waiting",
    };
    this.roomsById.set(roomId, room);
    return room;
  }

  // Add player to room. removes player from old room
  joinRoom(roomId: string, playerId: string): RoomResult {
    const room = this.  roomsById.get(roomId);
    if (!room) {
      return { success: false, error: "Room not found" };
    }
    if (this.getPlayerRoomId(playerId) === roomId) { // Already in same room
      return { success: true, room: room };
    }
    if (room.players.length >= MAX_PLAYERS_PER_ROOM) {
      return { success: false, error: "Room is full" };
    }
    if (room.state !== "waiting") {
      return { success: false, error: "Game already begun" };
    }
    this.leaveRoom(playerId);
    room.players.push({ id: playerId });
    this.addToPlayerRoom(playerId, roomId); // add to playerRooms
    return { success: true, room: room };;
  }

  // Player leaves room or disconnects
  // Removes player from it's room object, from PlayerRooms, deletes room if empty
  leaveRoom(playerId: string): RoomIdResult {
    const currentRoomId = this.getPlayerRoomId(playerId);
    if (currentRoomId == null) 
      return {success: false, error: "Player not in room"};
    const room = this.roomsById.get(currentRoomId);
    if (!room)
      return { success: false, error: "Room object not found" };
    const removed = this.removePlayerFromPlayersArray(room.players, playerId);
    if (!removed)
      return { success: false, error: "Player not in room array" };
    this.playerRooms.delete(playerId);
    if (room.players.length === 0)
      this.roomsById.delete(currentRoomId);
    return { success: true, roomId: currentRoomId };
  }
  
  
  // --- Game Events ---
  
  // Set room state to "playing"
  startGame(playerId: string): RoomResult {
    const roomId = this.getPlayerRoomId(playerId);
    if (!roomId)
      return { success: false, error: "Player is not in room" };
    const room = this.roomsById.get(roomId);
    if (!room)
      return { success: false, error: "Room not found" };
    if (room.state !== "waiting")
      return { success: false, error: "Game already begun" };
    if (room.players.length < 2)
      return { success: false, error: "Not enough players" };
    room.state = "playing";
    // 2. Initialize the "Game Slot"
    // When Gabriel finishes, you'll do: room.game = new GabrielGame(room.players);
    // For now, we just acknowledge the 'game' property exists in the Room type.
    return { success: true, room: room };
  }


  // Play a card
  playCard(playerId: string, cardIndex: number): RoomIdResult {
    const roomId = this.getPlayerRoomId(playerId);
    if (!roomId)
      return {success: false, error: "Player is not in room"};
    const room = this.getRoom(roomId);
    if (!room || room.state !== "playing" || !room.game)
      return {success: false, error: "No active game found"};
    
    // call the method defined in the Interface!
    const res = room.game.playCard(playerId, cardIndex);
    
    if (!res.success)
      return {success: false, error: res.error};
    return {success: true, roomId: roomId};
  };
  
  
  // Draw a card
  drawCard(playerId: string): RoomIdResult {
    const roomId = this.getPlayerRoomId(playerId);
    if (!roomId)
      return {success: false, error: "Player is not in room"};
    const room = this.getRoom(roomId);
    if (!room || room.state !== "playing" || !room.game)
      return {success: false, error: "No active game found"};
    
    // call the method defined in the Interface!
    const res = room.game.drawCard(playerId);
    
    if (!res.success)
      return {success: false, error: res.error};
    return {success: true, roomId: roomId};
  }
  
  // --- PRIVATE ---
  
  // Removes player from it's room player[] array
  private removePlayerFromPlayersArray(players: Player[], playerId: string): boolean {
    const index = players.findIndex(p => p.id === playerId);
    if (index === -1) return false;
    players.splice(index, 1);
    return true;
  }

  // add to playerRooms. map naturaly avoids duplicates.
  private addToPlayerRoom(playerId: string, roomId: string) {
    this.playerRooms.set(playerId, roomId);
  }
  
  // Generate a unique roomId
  private generateRoomId(): string {
    let roomId;
    do {
      roomId = "room_" + Math.random().toString(36).substring(2, 6);
    } while (this.roomsById.has(roomId));
    return roomId;
  }
  
  //lookup in playerRoom map after a player. returns roomId
  private getPlayerRoomId(playerId: string): string | null {
    return this.playerRooms.get(playerId) ?? null;
  }
  

//--- Getters ---

  getRoom(roomId: string): Room | null  {
    const room = this.roomsById.get(roomId);
    return room ?? null;
  }

  getAllRooms() {
    return Array.from(this.roomsById.values());
  }

  getMaxPlayersPerRoom() {
    return MAX_PLAYERS_PER_ROOM;
  }
  


// --- DEBUG ---
  public debugState() {
    console.log("---- GAME STATE ----");

    for (const [roomId, room] of this.roomsById) {
      console.log(`Room ${roomId}`);
      console.log("Players:", room.players.map(p => p.id));
    }

    console.log("Player -> Room map:");
    for (const [playerId, roomId] of this.playerRooms) {
      console.log(`${playerId} → ${roomId}`);
    }
  }
}

