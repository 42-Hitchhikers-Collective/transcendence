/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.handlers.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: jslusark <jslusark@student.42berlin.de>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 15:31:52 by ilazar            #+#    #+#             */
/*   Updated: 2026/07/06 19:30:26 by jslusark         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Socket } from "socket.io";
import { FastifyInstance } from "fastify/types/instance";
import { gameManager } from "../../gameManager";
import { getIdentity } from "../socket.utils";
import { systemChatMsg } from "./index";
import { ChatMsgType } from "../../gameManager/chatEvents";
import { createGameRecord, finalizeGame, abortGame } from "../../services/game.service";
import { getGameCanvasRoom } from "../../gameManager/dataToFrontend"
import "../../plugins/prisma"; // Load Prisma module augmentation

// type Event = { color: boolean; uno: boolean; finish: boolean };


// --- Game Events ---

export function registerGameHandlers(
  app: FastifyInstance,
  socket: Socket,
  broadcastGameCanvas: (roomId: string) => void,
  broadcastGamePage: (roomId: string) => void,
) {

  // Play a card
  socket.on("play_card", async ({ cardIndex }) => {
    const { playerId } = getIdentity(socket);
    if (typeof cardIndex !== "number" || cardIndex < 0 || !Number.isInteger(cardIndex)) {
      socket.emit("error", { message: "Invalid card index" });
      return;
    }

    const res = gameManager.playCard(playerId, cardIndex);
    if (!res.success) {
      console.log(`Are we here? ${res.error}`);
      socket.emit("error_front", res.error);
    }
    // this was encapsulated in an else statement
    if (!res.success) socket.emit("error", { message: res.error });
    broadcastGameCanvas(res.roomId);
    const events = gameManager.checkGameEvent(res.roomId);
    if (!events) {
      socket.emit("error", { message: "Unable to check game event" });
      return;
    }
    if (events.finish) {
      systemChatMsg(playerId, res.roomId, socket, ChatMsgType.WON_GAME);
      await endGame(res.roomId, socket);
      broadcastGameCanvas(res.roomId);
      return;
    }
    if (events.uno) {
      socket.nsp.to(res.roomId).emit("uno", { playerId });
      systemChatMsg(playerId, res.roomId, socket, ChatMsgType.UNO);
    }
    if (events.color) {
      socket.emit("show_colors", { roomId: res.roomId });
      return;
    }
    console.log(`[play_card] player ${playerId} played card index ${cardIndex} in room ${res.roomId}`);
    gameManager.passTurn(playerId, res.roomId);
    broadcastGameCanvas(res.roomId);
    broadcastGamePage(res.roomId);
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

    const validColors = ["red", "blue", "green", "yellow"];
    if (!validColors.includes(color)) {
      socket.emit("error", { message: "Invalid color" });
      return;
    }

    const res = gameManager.selectWildColor(playerId, color);
    if (!res.success) socket.emit("error", { message: res.error });

    broadcastGameCanvas(res.roomId);
    broadcastGamePage(res.roomId);
  });

  // Pass the turn to the next player by pressing a button
  socket.on("on_press_pass_button", () => {
    const { playerId } = getIdentity(socket);
    const res = gameManager.passTurnButton(playerId);
    if (!res.success) socket.emit("error", { message: res.error });
    broadcastGameCanvas(res.roomId);
    broadcastGamePage(res.roomId);
  });

  // When the game canvas is ready on the frontend, send the initial game state
  socket.on("canvas_ready", () => {
    const { playerId } = getIdentity(socket);
    const roomId = gameManager.getPlayerRoomId(playerId);
    if (!roomId) {
      socket.emit("error", { message: "Player is not in a room" });
      return;
    }
  });


  // When a player refreshes the page, broadcast excusively to them
  socket.on("canvas_refresh", () => {
    const { playerId } = getIdentity(socket);
    const roomId = gameManager.getPlayerRoomId(playerId);
    if (!roomId) return;
    const room = gameManager.getRoomById(roomId);
    if (room) {
      const gameCanvasRoom = getGameCanvasRoom(room, playerId);
      socket.emit("room_state", gameCanvasRoom);
    }
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
    broadcastGamePage(res.room.id);
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
    room.state = "finished";
    if (room.gameDbId)
      await abortGame(app.prisma, room.gameDbId);
    socket.nsp.to(roomId).emit("game_aborted", { roomId, reason: reason });
    console.log(`Game in room ${roomId} aborted due to: ${reason}`);
  }
}