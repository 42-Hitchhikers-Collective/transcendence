/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   types.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: gabrielrial <gabrielrial@student.42.fr>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/18 20:41:41 by ilazar            #+#    #+#             */
/*   Updated: 2026/06/30 17:08:24 by gabrielrial      ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export const MAX_PLAYERS_PER_ROOM = 4;
export const MIN_PLAYERS_TO_START = 2;
export const MAX_ROOM_NAME_LENGTH = 20;
export const MAX_MSG_LENGTH = 200;
export const MAX_MSG_HISTORY = 50;
export const RECONNECTION_GRACE_PERIOD = 15000; // 15 seconds
export const DROP_TIMER_DURATION = 30_000; // 30 seconds
export const SYSTEM_SENDER_NAME = "🦄";

export type Player = {
  playerId: string;      // permanent identity (userId) used for game logic
  socketId: string;      // current connection used for networking
  userName: string;      // display name for UI/chat
  avatarUrl: string;     // the avatar of the player to show in the chat
};

export type GameState = "waiting" | "playing" | "finished";


import { Game } from "../gamelogic/Game";

export type Room = {
  id: string;
  name: string;
  players: Player[];
  state: GameState;
  chatHistory: Array<{ username: string; msg: string }>;
  gameDbId?: string; // id of the game in the database
  game?: Game;
};

// What the frontend sees for "other" players
export type GameCanvasPlayer = {
  id: string;
  userName: string;
  isTheObserver: boolean; // true if this is the player themselves, false for other players
  cardCount: number;
  cards?: { color: string; value: string | number }[];
};

// What the frontend sees for a Room
export type GameCanvasRoom = {
  id: string;
  name: string;
  state: GameState;
  current_turn: string;
  cardsToDraw: number;
  players: GameCanvasPlayer[];
  game?: {
    currentPlayerId: string;
    discardTopCard: { color: string; value: string | number } | null;
    drawPileCount: number;
    currentColor: string | undefined;
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

export type msgLeftRoom =
  | { success: true ; roomId: string, action: string, currentPlayer: string }