/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   types.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/18 20:41:41 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/18 19:03:57 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export const MAX_PLAYERS_PER_ROOM = 4;
export const RECONNECTION_GRACE_PERIOD = 15000; // 15 seconds

export type Player = {
  playerId: string;      // permanent identity (userId) used for game logic
  socketId: string;      // current connection used for networking
  userName: string;      // display name for UI/chat
  isReady:  boolean;
};

export type GameState = "waiting" | "playing" | "finished";


// export interface GameInstance { //players map<string, string> == <playerid, username>
//   currentPlayerId: string;  // ??
//   discardTopCard: { color: string; value: string };
//   drawPileCount: number;
//   playerHands: Map<string, number>; // playerId -> number of cards they hold for sani room
  
//   // The actions you'll call from your Socket handlers
//   playCard(playerId: string, cardIndex: number): { success: boolean; error?: string };
//   drawCard(playerId: string): { success: boolean; error?: string };
//   getHand(playerId: string): { color: string; value: string }[];  //for sani room
// }


import { Game } from "../gamelogic/Game";

export type Room = {
  id: string;
  name: string;
  players: Player[];
  state: GameState;
  game?: Game; // This will hold the actual Gabriel's game instance when the game starts
};

// What the frontend sees for "other" players
export type FrontendPlayer = {
  id: string;
  userName: string;
  isTheObserver: boolean; // true if this is the player themselves, false for other players
  isReady: boolean;
  cardCount: number;
  cards?: { color: string; value: string | number }[];
};

// What the frontend sees for a Room
export type FrontendRoom = {
  id: string;
  state: GameState;
  players: FrontendPlayer[];
  game?: {
    currentPlayerId: string;
    discardTopCard: { color: string; value: string | number } | null;
    drawPileCount: number;
  };
};

export type RoomResult =
  | { success: true; room: Room }
  | { success: false; error: string | undefined};


export type RoomIdResult = 
  | { success: true; roomId: string }
  | { success: false; error: string | undefined};


// export type Result =
//   | { success: true }
//   | { success: false; error: string | undefined };