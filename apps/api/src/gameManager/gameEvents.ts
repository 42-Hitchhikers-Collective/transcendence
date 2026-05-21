/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameEvents.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/13 16:51:49 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/21 17:35:50 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as gm from "./gameManager";
import { Room, RoomResult, RoomIdResult, MAX_PLAYERS_PER_ROOM, MIN_PLAYERS_TO_START } from "./types";
import { Game as GameInstance } from "../gamelogic/Game";
import { Card } from "../gamelogic/Card";


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
  const success = room.game.drawCard(playerId);
  
  if (!success)
    return {success: false, error: "Game logic error: invalid move"};
  return {success: true, roomId: roomId};
}


// Select color for wild card
export function selectWildColor(playerId: string, color: "red" | "blue" | "green" | "yellow"): RoomIdResult {
    const roomId = gm.getPlayerRoomId(playerId);
    if (!roomId)
      return {success: false, error: "Player is not in room"};
    const room = gm.getRoomById(roomId);
    if (!room || room.state !== "playing" || !room.game)
      return {success: false, error: "No active game found"};
    room.game.table.changeColor(color);
    return {success: true, roomId: roomId};
}


//  --- Start Game Events ---


// Set isReady for given player true or false.
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

// Start the game automatically if MAX_PLAYERS_PER_ROOM players are ready, and all conditions are met
export function startGameAuto(playerId: string): RoomResult {
  const roomId = gm.getPlayerRoomId(playerId);
  if (!roomId)
    return {success: false, error: "Player is not in a room"};
  const room = gm.getRoomById(roomId);
  if (!room)
    return {success: false, error: "Room not found"};
  const allPlayersReady = room.players.every(player => player.isReady);
  if (room.players.length == MAX_PLAYERS_PER_ROOM && allPlayersReady) {
    if (startGameCondition(room)) {
        room.state = "playing";
        const playersMap = mapPlayersForGame(room.players);
        room.game = new GameInstance(playersMap); // Initialize the "Game Slot" with the actual game instance;
        return {success: true, room};
    }
  }
  return {success: false, error: "Start conditions aren't met"};;
}


//  Start the game manually if start button was pressed, and all condition are met  
export function startGameButton(playerId: string): RoomResult {
  const roomId = gm.getPlayerRoomId(playerId);
  if (!roomId)
    return {success: false, error: "Player is not in a room"};
  const room = gm.getRoomById(roomId);
  if (!room)
    return {success: false, error: "Room not found"};
  if (startGameCondition(room)) {
      room.state = "playing";
      const playersMap = mapPlayersForGame(room.players);
      room.game = new GameInstance(playersMap); // Initialize the "Game Slot" with the actual game instance;
      return {success: true, room};
  }
  return {success: false, error: "Start conditions aren't met"};;
}



// --- Helpers ---

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
    if (room.players.length < MIN_PLAYERS_TO_START)
        return false;
    // const allPlayersReady = room.players.every(player => player.isReady);
    // if (!allPlayersReady)
        // return false;
    return true;
  }