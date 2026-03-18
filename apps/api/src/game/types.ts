/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   types.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.de>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/18 20:41:41 by ilazar            #+#    #+#             */
/*   Updated: 2026/03/18 21:19:51 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export const MAX_PLAYERS_PER_ROOM = 4;

export type Player = {
  id: string;
};

export type GameState = "waiting" | "playing" | "finished";

export type Room = {
  id: string;
  players: Player[];
  state: GameState; 
};

export type roomResult =
  | { success: true; room: Room }
  | { success: false; error: string };


export type roomIdResult = 
  | { success: true; roomId: string }
  | { success: false; error: string };