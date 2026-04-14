/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameManager.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 13:14:08 by ilazar            #+#    #+#             */
/*   Updated: 2026/04/14 12:16:42 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

//will manage all active rooms -creating rooms, players joining/leaving

import { Player, Room, RoomResult, RoomIdResult, GameInstance } from "./types";
import { MAX_PLAYERS_PER_ROOM } from "./types";

export class GameManager {
  
  private roomsById: Map<string, Room> = new Map();         // roomId → Room
  private playerRooms: Map<string, string> = new Map(); // playerId → roomId
  private roomsByName: Map<string, Room> = new Map(); // roomName → Room (to allow join by name)
  
  // --- Room Events ---

  // Create a new room and return it
  createRoom(roomName: string): RoomResult {
    const roomId = this.generateRoomId();
    const room: Room = {
      id: roomId,
      name: roomName,
      players: [],
      state: "waiting",
    };
    const validation = this.validateRoomName(roomName);
    if (!validation.success)
      return {success: false, error: validation.error};
    this.roomsById.set(roomId, room);
    this.roomsByName.set(roomName, room);
    return { success: true, room: room };
  }

  // Add player to room. removes player from old room
  joinRoom(name: string, playerId: string, socketId: string): RoomResult {
    const room = this.getRoomByName(name);
    if (!room)
      return { success: false, error: "Room not found" };
    const roomId = room.id;
    if (this.getPlayerRoomId(playerId) === roomId) // Already in same room
      return { success: true, room: room };
    if (room.players.length >= MAX_PLAYERS_PER_ROOM)
      return { success: false, error: "Room is full" };
    if (room.state !== "waiting")
      return { success: false, error: "Game already begun" };
    this.leaveRoom(playerId);
    room.players.push({ playerId, socketId }); // socketId will be set in the Socket Handler when we have access to the socket
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
    this.deleteRoomIfEmpty(room);
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
    const room = this.getRoomById(roomId);
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
    const room = this.getRoomById(roomId);
    if (!room || room.state !== "playing" || !room.game)
      return {success: false, error: "No active game found"};
    
    // call the method defined in the Interface!
    const res = room.game.drawCard(playerId);
    
    if (!res.success)
      return {success: false, error: res.error};
    return {success: true, roomId: roomId};
  }


  // ---> Msg Events ---
  sendMessage(playerId: string, msg: string): RoomIdResult {
    const roomId = this.getPlayerRoomId(playerId);
    if (!roomId)
      return {success: false, error: "Player is not in room"};
    const room = this.getRoomById(roomId);
    if (!room)
      return {success: false, error: "Room not found"};
    if (msg.length === 0 || msg.length > 200)
      return {success: false, error: "Message must be between 1 and 200 characters"};
    return {success: true, roomId: roomId};
  }

  // --- HELPERS ---

  // Check for room name rules and duplicates. Returns true or false with an error message.
  private validateRoomName(name: string): RoomResult {
  if (!name || name.trim().length === 0)
    return {success: false, error: "Room name cannot be empty"};
  if (this.roomsByName.has(name))
    return {success: false, error: "Room name already exists"};
  if (name.length > 10)
    return {success: false, error: "Room name cannot exceed 10 characters"};
  const regex = /^[a-zA-Z0-9\-_!?.]+$/;
  if (!regex.test(name))
    return { success: false, error: "Room name contains invalid characters"};
  return { success: true, room: null as any };
  }

  // Returns true if player is in a room, false otherwise
  isInRoom(playerId: string): boolean {
    return this.playerRooms.has(playerId);
  }

  // Deletes an Empty Room.
  deleteRoomIfEmpty(room: Room): boolean {
    if (room.players.length === 0) {
      this.roomsByName.delete(room.name);
      this.roomsById.delete(room.id);
      return true;
    }
    return false;
  }
  
  // --- PRIVATE ---
  
  // Removes player from it's room player[] array
  private removePlayerFromPlayersArray(players: Player[], playerId: string): boolean {
    const index = players.findIndex(p => p.playerId === playerId);
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
  
  //lookup in playerRoom map after a player. returns roomId. Null if not in a room
  private getPlayerRoomId(playerId: string): string | null {
    return this.playerRooms.get(playerId) ?? null;
  }
  

//--- Getters ---

  getRoomById(roomId: string): Room | null  {
    const room = this.roomsById.get(roomId);
    return room ?? null;
  }

  private getRoomByName(roomName: string): Room | null {
    const room = this.roomsByName.get(roomName);
    console.log(`Looking up room by name: ${roomName} - Found: ${!!room}`);
    return room ?? null;
  }

  getMaxPlayersPerRoom() {
    return MAX_PLAYERS_PER_ROOM;
  }

  // Returns an array of all Room objects
  getAllRooms(): Room[] {
  return Array.from(this.roomsById.values());
}


// --- DEBUG ---
  public debugState() {
    console.log("---- GAME STATE ----");

    for (const [roomId, room] of this.roomsById) {
      const name = room.name ? `${room.name}` : "";
      console.log(`Room: ${roomId} - Name: ${name} - State: ${room.state} - Players: ${room.players.length}`);
      console.log("Players:", room.players.map(p => p.playerId).join(", "));
    }

    console.log("Player list:");
    for (const [playerId, roomId] of this.playerRooms) {
      console.log(`${playerId} → ${roomId}`);
    }
  }
}

