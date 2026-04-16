/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameManagerUtils.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/19 14:56:40 by ilazar            #+#    #+#             */
/*   Updated: 2026/04/08 12:16:24 by ilazar           ###   ########.fr       */
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




// export function getSanitizedRoom(room: Room, observerId: string) {
//     if (!room) return null;
//     // If there's no game yet, everyone sees the same lobby info
//     if (!room.game) return room;
//     const sanitizedRoom = {
//         id: room.id,
//         state: room.state,
//         players: room.players.map(p => ({
//         id: p.id,
//         // Ask the game engine for the count
//         cardCount: room.game?.playerHands.get(p.id) || 0,

//         // Ask the game engine for the specific hand 
//         // only if this player is the one we are "sanitizing" for.
//         cards: p.id === observerId ? room.game?.getHand(p.id) : undefined
//     }
//         )),
//         game: {
//         currentPlayerId: room.game.currentPlayerId,
//         discardTopCard: room.game.discardTopCard,
//         drawPileCount: room.game.drawPileCount,
//         }
//     };
//     return sanitizedRoom;
// };