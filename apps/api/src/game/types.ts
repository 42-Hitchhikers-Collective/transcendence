/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   types.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.de>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/18 20:41:41 by ilazar            #+#    #+#             */
/*   Updated: 2026/03/19 15:40:28 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export const MAX_PLAYERS_PER_ROOM = 4;

export type Player = {
  id: string;
};

export type GameState = "waiting" | "playing" | "finished";


export interface gameInstance {
  currentPlayerId: string;
  discardTopCard: { color: string; value: string };
  drawPileCount: number;
  playerHands: Map<string, number>; // playerId -> number of cards
  
  // The actions you'll call from your Socket handlers
  playCard(playerId: string, cardIndex: number): { success: boolean; error?: string };
  drawCard(playerId: string): { success: boolean; error?: string };
  getHand(playerId: string): { color: string; value: string }[];
}


export type Room = {
  id: string;
  players: Player[];
  state: GameState;
  game?: gameInstance;
};

// What the frontend sees for "other" players
export type SanitizedPlayer = {
  id: string;
  cardCount: number;
  cards?: { color: string; value: string }[];
};

// What the frontend sees for a Room
export type SanitizedRoom = {
  id: string;
  state: GameState;
  players: SanitizedPlayer[];
  game?: {
    currentPlayerId: string;
    discardTopCard: { color: string; value: string };
    drawPileCount: number;
  };
};

export type roomResult =
  | { success: true; room: Room }
  | { success: false; error: string | undefined};


export type roomIdResult = 
  | { success: true; roomId: string }
  | { success: false; error: string | undefined};