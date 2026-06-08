/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.handlers.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 15:31:52 by ilazar            #+#    #+#             */
/*   Updated: 2026/06/08 17:06:11 by ilazar           ###   ########.fr       */
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
    if (!res.success)
        socket.emit("error", { message: res.error });
    broadcastRoomState(res.roomId);
    const event = gameManager.checkGameEvent(res.roomId);
    console.log(`[play_card] event: ${event} in room ${res.roomId}`);
    if (event == "color"){
        socket.emit("show_colors", { roomId: res.roomId });
        return;
    }
    else if (event == "finished") {
        socket.nsp.to(res.roomId).emit("game_finished", { roomId: res.roomId });
        return ;
    }
    else if (event == "uno") {
        socket.nsp.to(res.roomId).emit("uno", { playerId });    
    }
    console.log(`[play_card] player ${playerId} played card index ${cardIndex} in room ${res.roomId}`);
    gameManager.passTurn(playerId, res.roomId);
    });

    // Draw a card
    socket.on("draw_card", () => {
    const { playerId } = getIdentity(socket);
    const res = gameManager.drawCard(playerId);
    if (!res.success)
        socket.emit("error", { message: res.error });
    broadcastRoomState(res.roomId);
    })

    // Select color for wild card. When a player selects a color
    socket.on("select_wild_color", ({ color }) => {
    const { playerId } = getIdentity(socket);
    const res = gameManager.selectWildColor(playerId, color);
    if (!res.success)
        socket.emit("error", { message: res.error });
    broadcastRoomState(res.roomId);
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
        socket.nsp.to(res.room.id).emit("game_start_success", { roomId: res.room.id });
        systemChatMsg(playerId, res.room.id, socket, ChatMsgType.STARTED_GAME);
        broadcastRoomState(res.room.id); // if gbriel recieves this too late - i can wait for a signal from jess and only then send this
    });

    // When the game canvas is ready on the frontend, send the initial game state
    socket.on("canvas_ready", () => {
        const { playerId } = getIdentity(socket);
        const roomId = gameManager.getPlayerRoomId(playerId);
        if (!roomId) {
            socket.emit("error", { message: "Player is not in a room" });
            return;
        }
        broadcastRoomState(roomId);
    });
}