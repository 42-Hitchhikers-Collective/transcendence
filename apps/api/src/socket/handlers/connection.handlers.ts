/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   connection.handlers.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/24 14:58:47 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/15 14:00:54 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Socket } from "socket.io";
import { FastifyInstance } from "fastify";
import { gameManager } from "../../gameManager";
import { getIdentity } from "../socket.utils";
import { RECONNECTION_GRACE_PERIOD } from "../../gameManager/types";


// Pausing the game if a player disconnects ?

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
        updateSocketId(playerId, socket.id);
        app.log.info(`Player ${playerId} reconnected with new socketId: ${socket.id}`);
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

function updateSocketId(playerId: string, newSocketId: string) {
    const roomId = gameManager.getPlayerRoomId(playerId);
    if (!roomId) return;
    const room = gameManager.getRoomById(roomId);
    if (!room) return;
    const player = room.players.find(p => p.playerId === playerId);
    if (player)
        player.socketId = newSocketId;
}


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