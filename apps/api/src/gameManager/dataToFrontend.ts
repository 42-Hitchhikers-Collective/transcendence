/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   dataToFrontend.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/19 14:56:40 by ilazar            #+#    #+#             */
/*   Updated: 2026/06/08 16:30:00 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { getDropTimeouts } from "./gameManager";
import { Room, FrontendRoom, FrontendPlayer } from "./types";

// Get a filtered room version for the frontend that doesn't show cards of other players except the observer
export function getFrontendRoom(room: Room, observerPlayerId: string): FrontendRoom {
  const frontendPlayers: FrontendPlayer[] = room.players.map(p => { // for each player
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
    players: frontendPlayers,
    game: room.game ? {
      currentPlayerId: room.game.table.players[room.game.table.turnIndex]?.id || "",
      discardTopCard: room.game.table.discardPile[room.game.table.discardPile.length - 1] || null,
      drawPileCount: room.game.table.drawPile.length || 0,
    } : undefined
  };
}


// get a player object for the frontend with only the relevant info
export function getFrontedPlayerData(playerId: string, userName: string, room: Room | null) {
  return {
    playerId,
    userName,
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