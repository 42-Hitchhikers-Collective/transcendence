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
        // ----- START EDIT BY JESS ----- 
        // We no longer need to call "gameManager.joinRoom(playerId, roomId)" on the gameManager here because we never remove the player
        // from the room when they disconnect; we just start a grace period timer fro your commented function updateRoomSocketId.
        // If they reconnect before the timer ends, we cancel the timer and keep them in the same room with their updated socket id.
        // If they fail to reconnect before the timer ends, only then do we remove them from the room.

        // PlayerRooms already tracks the room; refresh the socketId stored on the room's player entry.
        updateRoomSocketId(playerId, socket.id);
        app.log.info(`Player ${playerId} automatically rejoin room ${roomId}`);
        broadcastRoomState(roomId);
        // -----  END EDIT BY JESS ----- 
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

// EDIT BY JESS: I just uncommented this so it can be used in  line 45
function updateRoomSocketId(playerId: string, newSocketId: string) {
    const roomId = gameManager.getPlayerRoomId(playerId);
    if (!roomId) return;
    const room = gameManager.getRoomById(roomId);
    if (!room) return;
    const player = room.players.find(p => p.playerId === playerId);
    if (player)
        player.socketId = newSocketId;
}