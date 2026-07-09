/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   connection.handlers.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: jslusark <jslusark@student.42berlin.de>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/24 14:58:47 by ilazar            #+#    #+#             */
/*   Updated: 2026/07/09 16:30:32 by jslusark         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Socket } from "socket.io";
import { FastifyInstance } from "fastify";
import { gameManager } from "../../gameManager";
import { getIdentity } from "../socket.utils";
import { systemChatMsg } from ".";
import { ChatMsgType } from "../../gameManager/chatEvents";


// --- Connection Events ---

export function registerConnectionHandlers(
  app: FastifyInstance,
  socket: Socket,
  broadcastGameCanvas: (roomId: string) => void
) {
    const { playerId, userName } = getIdentity(socket);
    
    
    // Auto-rejoin player to their room if they were in one (handles reconnections)
    const roomId = gameManager.getPlayerRoomId(playerId);
    if (roomId) {
        console.log(`[Socket] ${userName} reconnected with new socketId: ${socket.id}`);
        socket.join(roomId); // join back the room with the new socket to be able to receive room updates
        console.log(`Player ${userName} automatically rejoin room ${roomId}`);
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