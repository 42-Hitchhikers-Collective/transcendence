/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   connection.handlers.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/24 14:58:47 by ilazar            #+#    #+#             */
/*   Updated: 2026/06/02 17:17:29 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Socket } from "socket.io";
import { FastifyInstance } from "fastify";
import { gameManager } from "../../gameManager";
import { getIdentity } from "../socket.utils";
// import { notifyFriendsPresence } from "./friend.handlers";
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
        app.log.info(`Player ${playerId} reconnected with new socketId: ${socket.id}`);
        socket.join(roomId);
        // updateRoomSocketId(playerId, socket.id); -- NOT NEEDED ANYMORE because I update socketId on the player object when they connect
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
    const timeoutId = setTimeout(async () => {
        const res = gameManager.leaveRoom(playerId);
        
        // Notify friends that player went offline
        // await notifyFriendsPresence(app, socket, playerId, "offline");
        
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

// --- Private ---

// Cancel the disconnection timer
function cancelDisconnectTimer(playerId: string) {
    const player = gameManager.getOnlinePlayer(playerId);
    const playerName = player ? player.userName : playerId;
    console.log("Cancelling disconnect timer if exists for socket:", playerName);
    gameManager.clearPlayerTimeout(playerId);
    // If the user comes back (new socket), also cancel the room-page drop timer ??
    // gameManager.cancelDropTimer(playerId); 
}



// Update the socketId for a player who reconnected UNSED FOR NOW because I update socketId on the player object when they connect
// function updateRoomSocketId(playerId: string, newSocketId: string) {
//     const roomId = gameManager.getPlayerRoomId(playerId);
//     if (!roomId) return;
//     const room = gameManager.getRoomById(roomId);
//     if (!room) return;
//     const player = room.players.find(p => p.playerId === playerId);
//     if (player)
//         player.socketId = newSocketId;
// }