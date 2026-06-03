/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   types.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/18 20:41:41 by ilazar            #+#    #+#             */
/*   Updated: 2026/06/03 16:55:34 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export const MAX_PLAYERS_PER_ROOM = 4;
export const MIN_PLAYERS_TO_START = 2;
export const MAX_ROOM_NAME_LENGTH = 20;
export const MAX_MSG_LENGTH = 200;
export const MAX_MSG_HISTORY = 50;
export const RECONNECTION_GRACE_PERIOD = 15000; // 15 seconds
export const DROP_TIMER_DURATION = 30_000; // 30 seconds

export type Player = {
  playerId: string;      // permanent identity (userId) used for game logic
  socketId: string;      // current connection used for networking
  userName: string;      // display name for UI/chat
  isReady:  boolean;
};

export type GameState = "waiting" | "playing" | "finished";


import { Game } from "../gamelogic/Game";

export type Room = {
  id: string;
  name: string;
  players: Player[];
  state: GameState;
  chatHistory: Array<{ username: string; msg: string }>;
  game?: Game;
};

// What the frontend sees for "other" players
export type FrontendPlayer = {
  id: string;
  userName: string;
  isTheObserver: boolean; // true if this is the player themselves, false for other players
  cardCount: number;
  cards?: { color: string; value: string | number }[];
};

// What the frontend sees for a Room
export type FrontendRoom = {
  id: string;
  name: string;
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
  | { success: false; roomId: string, error: string | undefined};


export type RoomIdResult = 
  | { success: true; roomId: string }
  | { success: false; roomId: string, error: string | undefined};


export type msgResult =
  | { success: true ; msg: string }
  | { success: false; error: string | undefined };