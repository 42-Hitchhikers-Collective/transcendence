/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameEvents.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: grial <grial@student.42berlin.de>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/13 16:51:49 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/18 20:32:08 by grial            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as gm from "./gameManager";
import { Room, RoomResult, RoomIdResult } from "./types";
import { Game as GameInstance } from "../gamelogic/Game";
import { Player as GabrielPlayer } from "../gamelogic/Player";
import { Card } from "../gamelogic/Card";

// ===============================
// HELPER: Convert cardIndex to Card
// ===============================
function getCardFromIndex(playerId: string, cardIndex: number): Card | null {
  const roomId = gm.getPlayerRoomId(playerId);
  if (!roomId) return null;
  
  const room = gm.getRoomById(roomId);
  if (!room || !room.game) return null;
  
  // Get player's hand from the game table
  const hand = room.game.table.getHand(playerId);
  if (!hand || cardIndex < 0 || cardIndex >= hand.length) {
    return null;
  }
  
  return hand[cardIndex];
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
  
  // Convert cardIndex to Card
  const card = getCardFromIndex(playerId, cardIndex);
  if (!card)
    return {success: false, error: "Invalid card index"};
  
  // Call the game's playCard with the Card object
  const res = room.game.playCard(playerId, card);
  
  if (!res)
    return {success: false, error: "Card play failed"};
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


export function selectWildColor(playerId: string, color: "red" | "blue" | "green" | "yellow"): RoomIdResult {
    const roomId = gm.getPlayerRoomId(playerId);
    if (!roomId)
      return {success: false, error: "Player is not in room"};
    const room = gm.getRoomById(roomId);
    if (!room || room.state !== "playing" || !room.game)
      return {success: false, error: "No active game found"};
    
    // Set the chosen color directly on the game table
    // Consider to change into a function in the Game class if you want to add validation or other logic
    room.game.table.currentColor = color;
    
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
      const playersMap = mapPlayersForGame(room.players);
      // room.game = new GameInstance(playersMap); // Initialize the "Game Slot" with the actual game instance;
      return {success: true, room};
  }
  return {success: false, error: "Start conditions aren't met"};;
}

// Convert players array to the format expected by the Game constructor
function mapPlayersForGame(players: { playerId: string; userName: string }[]): Map<string, string>[] {
  if (!players || players.length === 0)
    return [];  
  return players.map(player => {
      const userMap = new Map<string, string>();
      userMap.set(player.playerId, player.userName);
      return userMap;
  });
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