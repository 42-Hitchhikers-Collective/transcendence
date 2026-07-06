/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.handlers.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: gabrielrial <gabrielrial@student.42.fr>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 15:31:52 by ilazar            #+#    #+#             */
/*   Updated: 2026/07/06 14:44:49 by gabrielrial      ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Socket } from "socket.io";
import { FastifyInstance } from "fastify/types/instance";
import { gameManager } from "../../gameManager";
import { getIdentity } from "../socket.utils";
import { systemChatMsg } from "./index";
import { ChatMsgType } from "../../gameManager/chatEvents";
import { createGameRecord, finalizeGame, abortGame } from "../../services/game.service";
import "../../plugins/prisma"; // Load Prisma module augmentation
import { getRoomById } from "../../gameManager/gameManager";

type Event = { color: boolean; uno: boolean; finish: boolean };
// --- Game Events ---

export function registerGameHandlers(
  app: FastifyInstance, 
  socket: Socket,
  broadcastGameCanvas: (roomId: string) => void,
  broadcastGamePage: (roomId: string) => void, // JESS: I need this to update the gamepage on who is playing
) {

  // Play a card
  socket.on("play_card", async ({ cardIndex }) => {
    const { playerId } = getIdentity(socket);
    const res = gameManager.playCard(playerId, cardIndex);
    if (!res.success)
    {
      console.log(`Are we here? ${res.error}`);
      socket.emit("error_front", res.error);
    }
    // this was encapsulated in an else statement
    broadcastGameCanvas(res.roomId);
    const events = gameManager.checkGameEvent(res.roomId);
    if (!events) {
      socket.emit("error", { message: "Unable to check game event" }); // JESS: res.error doesn't exist in this case, so added a generic error message
      return;
    }
    if (events.finish) {
      systemChatMsg(playerId, res.roomId, socket, ChatMsgType.WON_GAME);
      await endGame(res.roomId, socket); // JESS: why await added?
      broadcastGameCanvas(res.roomId);
      return;
    }
    if (events.uno) {
      socket.nsp.to(res.roomId).emit("uno", { playerId });
      systemChatMsg(playerId, res.roomId, socket, ChatMsgType.UNO); // JESS: added system message for UNO call
    }
    if (events.color) {
      socket.emit("show_colors", { roomId: res.roomId });
      return;
    }
    console.log(`[play_card] player ${playerId} played card index ${cardIndex} in room ${res.roomId}`);
    gameManager.passTurn(playerId, res.roomId);
    broadcastGameCanvas(res.roomId);
    broadcastGamePage(res.roomId); // JESS: I need this to update the gamepage on who is playing 
  });

  // Draw a card
  socket.on("draw_card", () => {
    const { playerId } = getIdentity(socket);
    const res = gameManager.drawCard(playerId);
    if (!res.success) socket.emit("error", { message: res.error });
    broadcastGameCanvas(res.roomId);
    socket.emit("display_pass_button");
  });

  // Select color for wild card. When a player selects a color
  socket.on("select_wild_color", ({ color }) => {
    const { playerId } = getIdentity(socket);
    const res = gameManager.selectWildColor(playerId, color);
    if (!res.success) socket.emit("error", { message: res.error });

    broadcastGameCanvas(res.roomId);
    broadcastGamePage(res.roomId); // JESS: I need this to update the gamepage on who is playing 
  });

  // Pass the turn to the next player by pressing a button
  socket.on("on_press_pass_button", () => {
    const { playerId } = getIdentity(socket);
    const res = gameManager.passTurnButton(playerId);
    if (!res.success) socket.emit("error", { message: res.error });
    broadcastGameCanvas(res.roomId);
    broadcastGamePage(res.roomId);  // JESS: I need this to update the gamepage on who is playing 
  });

  // When the game canvas is ready on the frontend, send the initial game state
  socket.on("canvas_ready", () => {
    const { playerId } = getIdentity(socket);
    const roomId = gameManager.getPlayerRoomId(playerId);
    if (!roomId) {
      socket.emit("error", { message: "Player is not in a room" });
      return;
    }
    const room = getRoomById(roomId);
    broadcastGameCanvas(roomId);
    if (room?.game?.table.color)
      socket.emit("show_colors", { roomId: roomId });
  });

  // --- Major Game Events ---


  // Start the game by pressing a button. Create DB record and store the ID
  socket.on("start_game", async () => {
      const { playerId } = getIdentity(socket);
      const res = gameManager.startGameButton(playerId);
      if (!res.success) {
          socket.emit("error", { message: res.error });
          socket.emit("game_start_error", { message: res.error });
          return;
      }
      console.log(`Game started in room ${res.room.id}`);
      const gameDbId = await createGameRecord(app.prisma, res.room.name); //DB recored creation
      res.room.gameDbId = gameDbId;
      socket.nsp.to(res.room.id).emit("game_start_success", { roomId: res.room.id });
      systemChatMsg(playerId, res.room.id, socket, ChatMsgType.STARTED_GAME);
      broadcastGameCanvas(res.room.id);
      broadcastGamePage(res.room.id); // JESS: I need this to update the gamepage on who is playing 
  });

  // Send finished game data to the Database and announce the finished game
  async function endGame(roomId: string, socket: Socket) {
    const res = gameManager.endGame(roomId);
    if (!res.success) {
      console.error(`Failed to end game in room ${roomId}: ${res.error}`);
      return;
    }
    if (res.room && res.gameDbId && res.winnerId) {
      const playerIds = res.room.players.map((p) => p.playerId);
      await finalizeGame(app.prisma, res.gameDbId, res.winnerId, playerIds);
    }
    socket.nsp.to(roomId).emit("game_finished", { roomId, winnerId: res.winnerId });
  }

  // Abort game - can be triggered by frontend
  socket.on("abort_game", async ({ roomId }) => {
    abortGameAndCleanup(roomId, "aborted_by_frontend");
  });


  // Abort game helper, set game state, update database, notify players in room
  async function abortGameAndCleanup(roomId: string, reason: string) {
    const room = gameManager.getRoomById(roomId);
    if (!room) {
      console.error(`Failed to abort game: room ${roomId} not found`);
      return;
    }
    room.state = "finished"; // update game state
    // update database
    if (room.gameDbId)
      await abortGame(app.prisma, room.gameDbId);
    // Notify players in the room
    socket.nsp.to(roomId).emit("game_aborted", { roomId, reason: reason });
    console.log(`Game in room ${roomId} aborted due to: ${reason}`);
  }
}