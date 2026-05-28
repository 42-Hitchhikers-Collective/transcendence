/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   connection.handlers.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/24 14:58:47 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/20 16:52:01 by ilazar           ###   ########.fr       */
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
        console.log("[connection] socket authenticated", {
            playerId,
            socketId: socket.id,
            userName: (socket as any).userName,
        });
        cancelDisconnectTimer(playerId);
    
    // Auto-rejoin player to their room if they were in one (handles reconnections)
    const roomId = gameManager.getPlayerRoomId(playerId);
    if (roomId) {
        // updateSocketId(playerId, socket.id); // is this eccessary? i update socket.id on the player object when they connect
        app.log.info(`Player ${playerId} reconnected with new socketId: ${socket.id}`);
        console.log("[connection] player reconnected", {
        playerId,
        socketId: socket.id,
        roomId,
        userName: (socket as any).userName,
        });
        socket.join(roomId);
        // ----- START EDIT BY JESS ----- 
        // We no longer need to call "gameManager.joinRoom(playerId, roomId)" on the gameManager here because we never remove the player
        // from the room when they disconnect; we just start a grace period timer fro your commented function updateRoomSocketId.
        // If they reconnect before the timer ends, we cancel the timer and keep them in the same room with their updated socket id.
        // If they fail to reconnect before the timer ends, only then do we remove them from the room.

        // PlayerRooms already tracks the room; refresh the socketId stored on the room's player entry.
        updateRoomSocketId(playerId, socket.id);
        console.log("[connection] player auto-joined room after reconnect", {
            playerId,
            socketId: socket.id,
            roomId,
            userName: (socket as any).userName,
        });
        broadcastRoomState(roomId);
        // -----  END EDIT BY JESS ----- 
    }
    
    // Disconnect and leave room if in any
    socket.on("disconnect", () => {
                console.log("[connection] socket disconnected", {
                    playerId,
                    socketId: socket.id,
                    userName: (socket as any).userName,
                });
        
        // Prevent older stale sockets (like a closed previous tab) from triggering the grace period
        const currentPlayer = gameManager.getOnlinePlayer(playerId);
        if (currentPlayer && currentPlayer.socketId !== socket.id) {
                        console.log("[connection] stale socket disconnect ignored", {
                            playerId,
                            socketId: socket.id,
                            currentSocketId: currentPlayer.socketId,
                            userName: currentPlayer.userName,
                        });
            return; 
        }

        startGracePeriod(socket, playerId, broadcastRoomState);
    });
}

// Start grace period before removing player from their room
export function startGracePeriod(
  socket: Socket, // <--- jess: removed app as a parameter because you never used it in the function
  playerId: string,
  broadcastRoomState: (roomId: string) => void
) {
        const userName = (socket as any).userName;
        console.log("[connection] starting disconnect grace period", {
            playerId,
            socketId: socket.id,
            userName,
            gracePeriodMs: RECONNECTION_GRACE_PERIOD,
        });
    const timeoutId = setTimeout(() => {
        const res = gameManager.leaveRoom(playerId);
        gameManager.removePlayerFromOnlinePlayers(playerId);
        const userName = (socket as any).userName;
                    console.log("[connection] grace period ended", {
                    playerId,
                    socketId: socket.id,
                    userName,
                    leaveSuccess: res.success,
                    roomId: res.success ? res.roomId : null,
                });
        if (res.success) {
            socket.leave(res.roomId); // <-- JESS: you forgot to make the player leave the room when timer ends and res is success, so i added it here
            broadcastRoomState(res.roomId);
                        console.log("[connection] player removed after grace period", {
                            playerId,
                            socketId: socket.id,
                            userName,
                            roomId: res.roomId,
                        });       
        }
    }, RECONNECTION_GRACE_PERIOD);
        console.log("[connection] grace period timer scheduled", {
            playerId,
            socketId: socket.id,
            userName,
        });
    gameManager.setPlayerTimeout(playerId, timeoutId); // Store the timeout in the Map
}

// Cancel the disconnection timer
function cancelDisconnectTimer(playerId: string) {

    const player = gameManager.getOnlinePlayer(playerId);
    if (player) {
                console.log("[connection] cancelling disconnect timer", {
                    playerId,
                    userName: player.userName,
                    socketId: player.socketId,
                });
    } else {
                console.log("[connection] cancelling disconnect timer", {
                    playerId,
                    userName: null,
                });
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