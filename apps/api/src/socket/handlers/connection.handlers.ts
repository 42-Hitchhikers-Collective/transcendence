/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   connection.handlers.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/24 14:58:47 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/26 17:10:28 by ilazar           ###   ########.fr       */
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
    cancelDisconnectTimer(playerId);
    
    // Auto-rejoin player to their room if they were in one (handles reconnections)
    const roomId = gameManager.getPlayerRoomId(playerId);
    if (roomId) {
        // updateSocketId(playerId, socket.id); // is this eccessary? i update socket.id on the player object when they connect
        app.log.info(`Player ${playerId} reconnected with new socketId: ${socket.id}`);
        socket.join(roomId);
        gameManager.joinRoom(playerId, roomId); // Re-add player to the room in gameManager (in case they were removed on disconnect)
        app.log.info(`Player ${playerId} automatically rejoin room ${roomId}`);
        broadcastRoomState(roomId);
    }
    
    // Disconnect and leave room if in any
    socket.on("disconnect", () => {
        app.log.info(`socket disconnected: ${playerId}`);
        
        // Prevent older stale sockets (like a closed previous tab) from triggering the grace period
        const currentPlayer = gameManager.getOnlinePlayer(playerId);
        if (currentPlayer && currentPlayer.socketId !== socket.id) {
            app.log.info(`Stale socket disconnected for ${playerId}, ignoring.`);
            return; 
        }

        startGracePeriod(app, socket, playerId, broadcastRoomState);
    });
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
        gameManager.removePlayerFromOnlinePlayers(playerId);
        const userName = (socket as any).userName;
        console.log(`Grace period ended for player ${userName}, removed from online players and left room if in any.`);
        if (res.success) {
            broadcastRoomState(res.roomId);
            app.log.info(`Player ${userName} removed after grace period`);       
        }
    }, RECONNECTION_GRACE_PERIOD);
    gameManager.setPlayerTimeout(playerId, timeoutId); // Store the timeout in the Map
}

// Cancel the disconnection timer
function cancelDisconnectTimer(playerId: string) {

    const player = gameManager.getOnlinePlayer(playerId);
    if (player) {
        console.log("Cancelling disconnect timer if exists for socket:", player.userName);
    } else {
        console.log("Cancelling disconnect timer if exists for socket:", playerId);
    }
    gameManager.clearPlayerTimeout(playerId);
}


// --- Private ---


// function updateSocketId(playerId: string, newSocketId: string) {
//     const roomId = gameManager.getPlayerRoomId(playerId);
//     if (!roomId) return;
//     const room = gameManager.getRoomById(roomId);
//     if (!room) return;
//     const player = room.players.find(p => p.playerId === playerId);
//     if (player)
//         player.socketId = newSocketId;
// }