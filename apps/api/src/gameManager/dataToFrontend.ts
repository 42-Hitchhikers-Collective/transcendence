/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameManagerUtils.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/19 14:56:40 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/15 13:53:06 by ilazar           ###   ########.fr       */
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
      cardCount: room.game?.playerHands.get(p.playerId) || 0,
      // ONLY the observer sees their own actual cards
      cards: isMe ? room.game?.getHand(p.playerId) : undefined
    };
  });

  // 2. Return the filtered room object
  return {
    id: room.id,
    state: room.state,
    players: frontendPlayers,
    game: room.game ? {
      currentPlayerId: room.game.currentPlayerId,
      discardTopCard: room.game.discardTopCard,
      drawPileCount: room.game.drawPileCount,
    } : undefined
  };
}