/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameManager.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.de>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 13:14:08 by ilazar            #+#    #+#             */
/*   Updated: 2026/03/09 17:46:02 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

//will manage all active rooms -creating rooms, players joining/leaving

const MAX_PLAYERS_PER_ROOM = 4;

type Player = {
  id: string;
};

type Room = {
  id: string;
  players: Player[];
  maxPlayers: number;
};

export class GameManager {
  // roomId → Room
  private rooms: Map<string, Room> = new Map();
  // playerId → roomId
  private playerRooms: Map<string, string> = new Map();
  
  //can this fail creating a room?
  createRoom(hostId: string): Room {
    const roomId = Math.random().toString(36).substring(2, 8);
    const room: Room = {
      id: roomId,
      players: [{ id: hostId }],
      maxPlayers: MAX_PLAYERS_PER_ROOM,
    };
    this.rooms.set(roomId, room);
    return room;
  }

  // add to playerRooms
  addToRoomMap(roomId: string, playerId: string) {
    //if already inmap...
    this.playerRooms.set(playerId, roomId); 
  }

  //TODO: remove from current room!
  addPlayerToRoom(roomId: string, playerId: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    if (room.players.length >= room.maxPlayers) return null;
    room.players.push({ id: playerId });
    this.addToRoomMap(roomId, playerId); // add to playerRooms
    return room;
  }

  removePlayer(playerId: string): string | null {
  const roomId = this.getPlayerRoom(playerId);
  if (!roomId) return null;
  this.removePlayerFromRoom(roomId, playerId);
  return roomId;
  }
  
  // --- PRIVATE ---
  
  //lookup in playerRoom map. returns roomId
  private getPlayerRoom(playerId: string): string | null {
    return this.playerRooms.get(playerId) ?? null;
  }
  
  //removes player playerRooms array. cleans room if empty
  private removePlayerFromRoom(roomId: string, playerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    const removed = this.removePlayerFromPlayersArray(room.players, playerId);
    if (!removed) return false;
    this.playerRooms.delete(playerId);
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
    }
    return true;
  }

  //removes player from playerRoom array
  private removePlayerFromPlayersArray(players: Player[], playerId: string): boolean {
    const index = players.findIndex(p => p.id === playerId);
    if (index === -1) return false;
    players.splice(index, 1);
    return true;
  }
  

  
  
//--- Getters ---

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getAllRooms() {
    return Array.from(this.rooms.values());
  }
  




// --- DEBUG ---
  public debugState() {
    console.log("---- GAME STATE ----");

    for (const [roomId, room] of this.rooms) {
      console.log(`Room ${roomId}`);
      console.log("Players:", room.players.map(p => p.id));
    }

    console.log("Player -> Room map:", Object.fromEntries(this.playerRooms));
  }

}