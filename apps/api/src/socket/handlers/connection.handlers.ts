/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   connection.handlers.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/24 14:58:47 by ilazar            #+#    #+#             */
/*   Updated: 2026/07/06 13:31:49 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Socket } from "socket.io";
import { FastifyInstance } from "fastify";
import { gameManager } from "../../gameManager";
import { getIdentity } from "../socket.utils";
import { systemChatMsg } from ".";
import { ChatMsgType } from "../../gameManager/chatEvents";
// import { RECONNECTION_GRACE_PERIOD } from "../../gameManager/types";


// --- Connection Events ---

export function registerConnectionHandlers(
  app: FastifyInstance,
  socket: Socket,
  broadcastRoomState: (roomId: string) => void
) {
    const { playerId, userName } = getIdentity(socket);
    
    // cancelDisconnectTimer(playerId);
    
    // Auto-rejoin player to their room if they were in one (handles reconnections)
    const roomId = gameManager.getPlayerRoomId(playerId);
    if (roomId) {
        console.log(`[Socket] ${userName} reconnected with new socketId: ${socket.id}`);
        socket.join(roomId); // join back the room with the new socket to be able to receive room updates
        console.log(`Player ${userName} automatically rejoin room ${roomId}`);
        systemChatMsg(playerId, roomId, socket, ChatMsgType.DROP_ROOM_BACK);
        broadcastRoomState(roomId);
    }
    
    // Disconnect and leave room if in any
    socket.on("disconnect", () => {
        console.log(`[Socket] ${userName} disconnected`);
        // Prevent older stale sockets (like a closed previous tab) from triggering the grace period
        const currentPlayer = gameManager.getOnlinePlayer(playerId);
        if (currentPlayer && currentPlayer.socketId !== socket.id) {
            console.log(`[Socket] ${userName} Stale socket disconnected, ignoring.`);
            return; 
        }
    });
}



/// --- Older Grace period implementation ---

// Start grace period before removing player from their room
/*
function startGracePeriod(
  app: FastifyInstance,
  socket: Socket,
  playerId: string,
  broadcastRoomState: (roomId: string) => void
) {
    const userName = (socket as any).userName;
    console.log(`[Grace period] starting for: ${userName} `);
    const timeoutId = setTimeout(async () => {
        const res = gameManager.leaveRoom(playerId);
         gameManager.removePlayerFromOnlinePlayers(playerId);
        console.log(`[Grace period] ended for player ${userName}, removed from online players and left room if in any.`);
        if (res.success) {
            broadcastRoomState(res.roomId);
            console.log(`[Grace period] ${userName} removed from online players`);       
        }
    }, RECONNECTION_GRACE_PERIOD);
    gameManager.setPlayerTimeout(playerId, timeoutId); // Store the timeout in the Map
}

// --- Private ---

// Cancel the disconnection timer
function cancelDisconnectTimer(playerId: string) {
    const player = gameManager.getOnlinePlayer(playerId);
    const playerName = player ? player.userName : playerId;
    // console.log("[Grace period] check if to cancel for:", playerName);
    gameManager.clearPlayerTimeout(playerId);
}
*/