/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameEvents.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/13 16:51:49 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/13 17:25:41 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { GameManager } from "./gameManager";
import { Player, Room, RoomResult, RoomIdResult, GameInstance } from "./types";

let gm: GameManager;

// Set the instance (called from index.ts)
export function setGameManager(instance: GameManager) {
  gm = instance;
}



 // --- Game Events ---

  // Play a card
  export function playCard(playerId: string, cardIndex: number): RoomIdResult {
    const roomId = gm.getPlayerRoomId(playerId);
    if (!roomId)
      return {success: false, error: "Player is not in room"};
    const room = gm.getRoomById(roomId);
    if (!room || room.state !== "playing" || !room.game)
      return {success: false, error: "No active game found"};
    
    // call the method defined in the Interface!
    const res = room.game.playCard(playerId, cardIndex); //gabriel's function
    
    if (!res.success)
      return {success: false, error: res.error};
    return {success: true, roomId: roomId};
  };
  
  
  // Draw a card
  export function drawCard(playerId: string): RoomIdResult {
    const roomId = gm.getPlayerRoomId(playerId);
    if (!roomId)
      return {success: false, error: "Player is not in room"};
    const room = gm.getRoomById(roomId);
    if (!room || room.state !== "playing" || !room.game)
      return {success: false, error: "No active game found"};
    
    // call the method defined in the Interface!
    const res = room.game.drawCard(playerId);
    
    if (!res.success)
      return {success: false, error: res.error};
    return {success: true, roomId: roomId};
  }




    
  export function startGame(room: Room): any {
    if (startGameCondition(room)) {
        room.state == "playing";
    }
      return;
  }

function startGameCondition(room: Room): boolean {
    if (!room)
        return false;
    if (room.state !== "waiting")
        return false;
    if (room.players.length < 2)
        return false;
    const allPlayersReady = room.players.every(player => player.isReady);
    if (!allPlayersReady)
        return false;
    return true;
  }

    
  // Set room state to "playing"
  // startGame(playerId: string): RoomResult {
  //   const roomId = this.getPlayerRoomId(playerId);
  //   if (!roomId)
  //     return { success: false, error: "Player is not in a room" };
  //   const room = this.roomsById.get(roomId);
  //   if (!room)
  //     return { success: false, error: "Room not found" };
  //   if (room.state !== "waiting")
  //     return { success: false, error: "Game already begun" };
  //   if (room.players.length < 2)
  //     return { success: false, error: "Not enough players" };
  //   room.state = "playing";
  //   // 2. Initialize the "Game Slot"
  //   // When Gabriel finishes, you'll do: room.game = new GabrielGame(room.players);
  //   // For now, we just acknowledge the 'game' property exists in the Room type.
  //   return { success: true, room: room };
  // }