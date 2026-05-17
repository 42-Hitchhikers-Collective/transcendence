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

export function selectWildColor(color: "red" | "blue" | "green" | "yellow") {
  socket.emit("select_wild_color", { color });
}

export function passTurn() {
  socket.emit("pass_turn");
}