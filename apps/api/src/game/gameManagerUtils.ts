/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameManagerUtils.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/19 14:56:40 by ilazar            #+#    #+#             */
/*   Updated: 2026/04/16 17:07:29 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { Room, SanitizedRoom, SanitizedPlayer } from "./types";


// Get a "sanitizied" room version that doesn't show cards of other players except the observer
export function getSanitizedRoom(room: Room, observerPlayerId: string): SanitizedRoom {
  const sanitizedPlayers: SanitizedPlayer[] = room.players.map(p => { // for each player
    const isMe = p.playerId === observerPlayerId;
    
    return {
      id: p.playerId,
      // Everyone sees the count
      cardCount: room.game?.playerHands.get(p.playerId) || 0,
      // ONLY the observer sees their own actual cards
      cards: isMe ? room.game?.getHand(p.playerId) : undefined
    };
  });

  // 2. Return the filtered room object
  return {
    id: room.id,
    state: room.state,
    players: sanitizedPlayers,
    game: room.game ? {
      currentPlayerId: room.game.currentPlayerId,
      discardTopCard: room.game.discardTopCard,
      drawPileCount: room.game.drawPileCount,
    } : undefined
  };
}