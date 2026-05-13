/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.handlers.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 15:31:52 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/13 17:05:55 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Socket } from "socket.io";
import { gameManager } from "../../gameManager";
import { getIdentity } from "../socket.utils";

// --- Game Events ---

export function registerGameHandlers(
  socket: Socket,
  broadcastRoomState: (roomId: string) => void
) {

    // Start the game
    socket.on("start_game", () => {
    const { playerId } = getIdentity(socket);
    const res = gameManager.startGame(playerId);
    if (!res.success) {
        socket.emit("error", { message: res.error });
        return;
    }
    const roomId = res.room.id;
    broadcastRoomState(roomId);
    });


    // Play a card
    socket.on("play_card", ({ cardIndex }) => {
    const { playerId } = getIdentity(socket);
    const res = gameManager.playCard(playerId, cardIndex);
    if (res.success)
        broadcastRoomState(res.roomId); 
    else
        socket.emit("error", { message: res.error });
    });

    // Draw a card
    socket.on("draw_card", () => {
    const { playerId } = getIdentity(socket);
    const res = gameManager.drawCard(playerId);
    if (res.success)
        broadcastRoomState(res.roomId);
    else
        socket.emit("error", { message: res.error });
    })
};