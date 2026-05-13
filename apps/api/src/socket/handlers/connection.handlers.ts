/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   connection.handlers.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/24 14:58:47 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/13 16:28:07 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Socket } from "socket.io";
import { FastifyInstance } from "fastify";
import { gameManager } from "../../gameManager";
import { getIdentity } from "../socket.utils";
import { RECONNECTION_GRACE_PERIOD } from "../../gameManager/types";


// --- Connection Events ---

export function registerConnectionHandlers(
  app: FastifyInstance,
  socket: Socket,
  broadcastRoomState: (roomId: string) => void
) {
    const { playerId } = getIdentity(socket);
    
    // Auto-rejoin player to their room if they were in one (handles reconnections)
    const roomId = gameManager.getPlayerRoomId(playerId);
    if (roomId) {
        socket.join(roomId);
        app.log.info(`Player ${playerId} automatically rejoin room ${roomId}`);
        broadcastRoomState(roomId);
    }
    
    // Cancel any pending disconnect timer on reconnection
    cancelDisconnectTimer(socket);
    
    // Disconnect and leave room if in any
    socket.on("disconnect", () => {
        app.log.info({ socketId: socket.id }, "socket disconnected");
        app.log.info(`socket disconnected: ${playerId}`);
        startGracePeriod(app, socket, playerId, broadcastRoomState);
    });
}


// --- Private ---

// Start grace period before removing player from their room
function startGracePeriod(
  app: FastifyInstance,
  socket: Socket,
  playerId: string,
  broadcastRoomState: (roomId: string) => void
) {
    
        const timeoutId = setTimeout(() => {
            const res = gameManager.leaveRoom(playerId);
            if (res.success) {
                socket.leave(res.roomId);
                broadcastRoomState(res.roomId);
                app.log.info(`Player ${playerId} removed after grace period`);       
            }
        }, RECONNECTION_GRACE_PERIOD);
        (socket as any).disconnectionTimeout = timeoutId; 
}

// Cancel the disconnection timer
function cancelDisconnectTimer(socket: Socket) {
    const timeoutId = (socket as any).disconnectionTimeout;
    if (timeoutId) {
        clearTimeout(timeoutId);
        delete (socket as any).disconnectionTimeout;
    }
}