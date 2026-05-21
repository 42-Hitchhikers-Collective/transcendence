/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   dataToFrontend.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: grial <grial@student.42berlin.de>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/19 14:56:40 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/18 19:26:05 by grial            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { Room, FrontendRoom, FrontendPlayer } from "./types";


// Get a filtered room version for the frontend that doesn't show cards of other players except the observer
export function getFrontendRoom(room: Room, observerPlayerId: string): FrontendRoom {
  const frontendPlayers: FrontendPlayer[] = room.players.map(p => { // for each player
    const isMe = p.playerId === observerPlayerId;
    
    return {
      id: p.playerId,
      userName: p.userName,
      isTheObserver: isMe,
      isReady: p.isReady,
      // Everyone sees the count
      cardCount: room.game?.table.getCardCount(p.playerId) || 0,
      // ONLY the observer sees their own actual cards
      cards: isMe ? room.game?.table.getHand(p.playerId)?.map(card => ({ color: card.color, value: card.value })) : undefined
    };
  });

  // 2. Return the filtered room object
  return {
    id: room.id,
    state: room.state,
    players: frontendPlayers,
    game: room.game ? {
      currentPlayerId: room.game.table.players[room.game.table.turnIndex]?.id || "",
      discardTopCard: room.game.table.discardPile[room.game.table.discardPile.length - 1] || null,
      drawPileCount: room.game.table.drawPile.length || 0,
    } : undefined
  };
}