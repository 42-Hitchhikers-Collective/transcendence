/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameManager.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.de>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 13:14:08 by ilazar            #+#    #+#             */
/*   Updated: 2026/03/05 13:42:17 by ilazar           ###   ########.fr       */
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
  private rooms: Map<string, Room> = new Map();

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

  joinRoom(roomId: string, playerId: string): Room | null {
    const room = this.rooms.get(roomId);

    if (!room) return null;

    if (room.players.length >= room.maxPlayers) return null;

    room.players.push({ id: playerId });

    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  addPlayerToRoom(roomId: string, playerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    if (room.players.length >= room.maxPlayers) return false;

    room.players.push({ id: playerId });
    return true;
  }

    removePlayer(playerId: string) {
        for (const room of this.rooms.values()) {
        const index = room.players.findIndex(p => p.id === playerId);
        if (index !== -1) {
            room.players.splice(index, 1);

            // remove room if empty
            if (room.players.length === 0) {
            this.rooms.delete(room.id);
            }
            break;
        }
    }
}
  
}

