/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameEvents.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/13 16:51:49 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/15 13:44:43 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as gm from "./gameManager";
import { Room, RoomResult, RoomIdResult } from "./types";


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





//  --- Start Game Events ---


// Set isReady for given player true or false. if true, checks if game can be started and starts it.
export function setReady(playerId: string, isReady: boolean): RoomIdResult {
  const roomId = gm.getPlayerRoomId(playerId);
  if (!roomId)
    return { success: false, error: "Player is not in a room" };
  const room = gm.getRoomsByIdMap().get(roomId);
  if (!room)
    return { success: false, error: "Room not found" };
  const player = room.players.find(p => p.playerId === playerId);
  if (!player)
    return { success: false, error: "Player not found in room" };
  player.isReady = isReady;
  return { success: true, roomId: roomId };
}

// Start the game
export function startGame(playerId: string): RoomResult {
  const roomId = gm.getPlayerRoomId(playerId);
  if (!roomId)
    return {success: false, error: "Player is not in a room"};
  const room = gm.getRoomById(roomId);
  if (!room)
    return {success: false, error: "Room not found"};
  if (startGameCondition(room)) {
      room.state = "playing";
      // room.game = new GameInstanceImpl(room.players); // Initialize the "Game Slot" with the actual game instance;
      return {success: true, room};
  }
  return {success: false, error: "Start conditions aren't met"};;
}

// Returns true only if game is in waiting mode, at least 2 players in the room, and all players are ready
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