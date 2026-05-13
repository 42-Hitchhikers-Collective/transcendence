import { socket } from "../socket/Socket.ts";

export function playCard(cardId: string) {
  socket.emit("play_card", { cardId });
}

export function drawCard() {
  socket.emit("draw_card");
}

export function startGame() {
  socket.emit("start_game");
}