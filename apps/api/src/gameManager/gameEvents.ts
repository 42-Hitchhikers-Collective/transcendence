/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameEvents.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: gabrielrial <gabrielrial@student.42.fr>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/13 16:51:49 by ilazar            #+#    #+#             */
/*   Updated: 2026/06/17 15:23:28 by gabrielrial      ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as gm from "./gameManager";
import { Room, RoomResult, RoomIdResult, MAX_PLAYERS_PER_ROOM, MIN_PLAYERS_TO_START } from "./types";
import { Game as GameInstance } from "../gamelogic/Game";
import { Card } from "../gamelogic/Card";

type Event = { color: boolean; uno: boolean; finish: boolean};

 // --- Game Events ---

// Play a card
export function playCard(playerId: string, cardIndex: number): RoomIdResult {
  const roomId = gm.getPlayerRoomId(playerId);
  if (!roomId)
    return {success: false, roomId: "undefined", error: "Player is not in room"};
  const room = gm.getRoomById(roomId);
  if (!room || room.state !== "playing" || !room.game)
    return {success: false, roomId: roomId, error: "No active game found"};
  
  // Convert cardIndex to Card
  const card = getCardFromIndex(playerId, cardIndex);
  if (!card)
    return {success: false, roomId: roomId, error: "Invalid card index"};
  
  // Call the game's playCard with the Card object
  const res = room.game.playCard(playerId, card);
  
  if (!res)
    return {success: false, roomId: roomId, error: "Card play failed"};
  return {success: true, roomId: roomId};
};


// Pass the turn to the next player
export function passTurn(playerId: string, roomId: string): RoomIdResult {
  const room = gm.getRoomById(roomId);
  if (room && room.game) {
    room.game.passTurn(playerId);
    return { success: true, roomId };
  }
  return { success: false, roomId: roomId, error: "Room or game not found" };
}


// Draw a card
export function drawCard(playerId: string): RoomIdResult {
  const roomId = gm.getPlayerRoomId(playerId);
  if (!roomId)
    return {success: false, roomId: "undefined", error: "Player is not in room"};
  const room = gm.getRoomById(roomId);
  if (!room || room.state !== "playing" || !room.game)
    return {success: false, roomId: roomId, error: "No active game found"};
  
  // call the method defined in the Interface!
  const success = room.game.drawCard(playerId);
  
  if (!success)
    return {success: false, roomId: roomId, error: "Game logic error: invalid move"};
  return {success: true, roomId: roomId};
}


// Select color for wild card
export function selectWildColor(playerId: string, color: "red" | "blue" | "green" | "yellow"): RoomIdResult {
    const roomId = gm.getPlayerRoomId(playerId);
    if (!roomId)
      return {success: false, roomId: "undefined", error: "Player is not in room"};
    const room = gm.getRoomById(roomId);
    if (!room || room.state !== "playing" || !room.game)
      return {success: false, roomId: roomId, error: "No active game found"};
    console.log(`Color recived: ${color}`)
    room.game.table.changeColor(color);
    room.game.passTurn(playerId);
    return {success: true, roomId: roomId};
}


export function checkGameEvent(roomId: string): Event | null {
  const room = gm.getRoomById(roomId);
  if (room) {
    if (room.game) {
      const event = room.game.checkEvent();
        return event;
    }
  }
  return null;
}

//  --- Start/End Game Events ---


//  Start the game manually if start button was pressed, and all condition are met  
export function startGameButton(playerId: string): RoomResult {
  const roomId = gm.getPlayerRoomId(playerId);
  if (!roomId)
    return {success: false, roomId: "undefined", error: "Player is not in a room"};
  const room = gm.getRoomById(roomId);
  if (!room)
    return {success: false, roomId: roomId, error: "Room not found"};
  if (startGameCondition(room)) {
      room.state = "playing";
      const playersMap = mapPlayersForGame(room.players);
      room.game = new GameInstance(playersMap); // Initialize the "Game Slot" with the actual game instance;
      return {success: true, room};
  }
  return {success: false, roomId: roomId, error: "Start conditions aren't met"};;
}


export function endGame(roomId: string) {
  const room = gm.getRoomById(roomId);
  if (!room || !room.game)
    return {success: false, roomId: roomId, error: "Room or game not found"};
  room.state = "finished";
    return {
    success: true,
    winnerId: room.game.winner?.id || "undefined",
    roomId: roomId
  };
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

// Players pressed Pass Turn Button
export function passTurnButton(playerId: string): RoomIdResult {
  const roomId = gm.getPlayerRoomId(playerId);
  if (!roomId)
    return {success: false, roomId: "undefined", error: "Player is not in room"};
  const room = gm.getRoomById(roomId);
  if (!room || room.state !== "playing" || !room.game)
    return {success: false, roomId: roomId, error: "No active game found"};
  if (room.game.playerPassBotton(playerId))
    return {success: false, roomId: roomId, error: "Game logic error: invalid move"};
  return {success: true, roomId: roomId};
}

// Returns true only if game is in waiting mode, at least 2 players in the room, and all players are ready
function startGameCondition(room: Room): boolean {
    if (!room)
        return false;
    if (room.state !== "waiting")
        return false;
    if (room.players.length < MIN_PLAYERS_TO_START)
        return false;
    return true;
  }