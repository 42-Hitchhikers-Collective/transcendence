/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   types.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/18 20:41:41 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/20 14:30:29 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export const MAX_PLAYERS_PER_ROOM = 4;
export const RECONNECTION_GRACE_PERIOD = 15000; // 15 seconds

export type Player = {
  playerId: string;      // permanent identity (userId) used for game logic
  socketId: string;      // current connection used for networking
  userName: string;      // display name for UI/chat
  isReady:  boolean;
  timeout?: NodeJS.Timeout; // for handling disconnection grace period
};

export type GameState = "waiting" | "playing" | "finished";


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