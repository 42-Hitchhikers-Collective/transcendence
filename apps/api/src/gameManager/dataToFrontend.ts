/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   dataToFrontend.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/19 14:56:40 by ilazar            #+#    #+#             */
/*   Updated: 2026/06/15 13:45:20 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { gameManager } from ".";
import { getDropTimeouts } from "./gameManager";
import { Room, GameCanvasRoom, GameCanvasPlayer } from "./types";

// Get a filtered room version for the game rendering that doesn't show cards of other players except the observer
export function getGameCanvasRoom(room: Room, observerPlayerId: string): GameCanvasRoom {
  const gameCanvasPlayers: GameCanvasPlayer[] = room.players.map(p => { // for each player
    const isMe = p.playerId === observerPlayerId;
    
    return {
      id: p.playerId,
      userName: p.userName,
      isTheObserver: isMe,
      // Everyone sees the count
      cardCount: room.game?.table.getCardCount(p.playerId) || 0,
      // ONLY the observer sees their own actual cards
      cards: isMe ? room.game?.table.getHand(p.playerId)?.map(card => ({ color: card.color, value: card.value })) : undefined
    };
  });

  // 2. Return the filtered room object
  return {
    id: room.id,
    name: room.name,
    state: room.state,
    current_turn: room.game?.table.players[room.game?.table.turnIndex].id || "",
    players: gameCanvasPlayers,
    game: room.game ? {
      currentPlayerId: room.game.table.players[room.game.table.turnIndex]?.id || "",
      discardTopCard: room.game.table.discardPile[room.game.table.discardPile.length - 1] || null,
      drawPileCount: room.game.table.drawPile.length || 0,
    } : undefined
  };
}


// Returns a player object for the frontend with only the relevant info NEW
export function getFrontedPlayerInfo(playerId: string, userName: string, room: Room | null) {
  const player = room ? room.players.find(p => p.playerId === playerId) : null;
  return {
    playerId,
    userName,
    avatarUrl: player?.avatarUrl ?? "/avatars/default.png", 
    duringDrop: getDropTimeouts().has(playerId), // true if player is currently in drop timer grace period
    activeRoom: room? 
      {
        roomId: room.id,
        roomName: room.name,
        roomState: room.state, // "waiting", "playing", or "finished"
      }
    : null,
  };
}

// Returns a room object for the frontend with only the relevant info
export function getFrontedRoomInfo(roomid: string) {
  const room = gameManager.getRoomById(roomid);
  if (!room) return null;
  return {
    roomId: room.id,
    roomName: room.name,
    roomState: room.state, // "waiting", "playing", or "finished"
    players: room.players.map(p => ({
      userName: p.userName,
      avatarUrl: p.avatarUrl ?? "/avatars/default.png",
      dropped: getDropTimeouts().has(p.playerId) // true if player is currently in drop timer grace period
    })) || []
  };
}