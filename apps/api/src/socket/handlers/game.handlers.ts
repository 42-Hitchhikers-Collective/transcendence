/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.handlers.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 15:31:52 by ilazar            #+#    #+#             */
/*   Updated: 2026/06/02 17:22:31 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Socket } from "socket.io";
import { gameManager } from "../../gameManager";
import { getIdentity } from "../socket.utils";
import { systemChatMsg } from "./index";
import { ChatMsgType } from "../../gameManager/chatEvents";


// --- Game Events ---

export function registerGameHandlers(
  socket: Socket,
  broadcastRoomState: (roomId: string) => void,
//   broadcastPlayerState: (playerId: string) => void
) {

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

    // Select color for wild card
    socket.on("select_wild_color", ({ color }) => {
    const { playerId } = getIdentity(socket);
    const res = gameManager.selectWildColor(playerId, color);
    if (res.success)
        broadcastRoomState(res.roomId);
    else
        socket.emit("error", { message: res.error });
    });

    
    // --- Start Game Events ---

    // Start the game by pressing a button.
    socket.on("start_game", () => {
        const { playerId } = getIdentity(socket);
        const res = gameManager.startGameButton(playerId);
        if (!res.success) {
            socket.emit("error", { message: res.error });
            socket.emit("game_start_error", { message: res.error });
            return;
        }
        console.log(`Game started in room ${res.room.id}`);
        socket.nsp.to(res.room.id).emit("game_started", { roomId: res.room.id });
        systemChatMsg(playerId, socket, ChatMsgType.STARTED_GAME);
        broadcastRoomState(res.room.id);
    });
}