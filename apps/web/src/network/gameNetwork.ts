import { socket } from "../socket/Socket.ts";

const LOG = (msg: string) => console.log(`[Network] ${msg}`);

export function playCard(cardIndex: number) {
  LOG(`📤 emit play_card | index: ${cardIndex}`);
  socket.emit("play_card", { cardIndex });
}

export function drawCard() {
  LOG(`📤 emit draw_card`);
  socket.emit("draw_card");
}


export function selectWildColor(color: "red" | "blue" | "green" | "yellow") {
  LOG(`📤 emit select_wild_color | color: ${color}`);
  socket.emit("select_wild_color", { color });
}

export function passTurn() {
  LOG(`📤 emit on_press_pass_button`);
  socket.emit("on_press_pass_button");
}
