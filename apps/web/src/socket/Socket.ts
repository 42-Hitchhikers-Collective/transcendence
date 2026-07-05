import { io } from "socket.io-client";
import { EventBus } from "../events/EventBus";
import type { FrontendRoom } from "../gameCanvas/types/roomTypes";

export const socket = io({
  path: "/socket.io",
  autoConnect: false, // IMPORTANT: this is false because Jess' AuthContext is what controls socket connection base on the authentication state of the user
  withCredentials: true, // we need this to send the cookie with the socket connection so that the server can authenticate the user
});

// Handles Back-Forward Cache: reconnect socket when page is restored from bfcache
// (bfcache freezes the WebSocket — this reconnects cleanly instead of logging an error)
window.addEventListener("pageshow", (event) => {
  if (event.persisted && socket.disconnected) {
    socket.connect();
  }
});

socket.on("connect_error", (err) => {
  console.log(`[socket] connect_error \n Error Message ${err.message}`);
});

// disconnection happens in logout (check AuthContext.tsx)
socket.on("disconnect", (message) => {
  console.log(`[socket] disconnect \n Disconnect Message: ${message}`);
});

socket.io.on("reconnect_attempt", (message) => {
  console.log(`[socket] reconnect_attempt \n Reconnect Message: ${message}`);
});

socket.io.engine?.on("upgradeError", (err) => {
  console.log(`[socket] upgradeError \n Upgrade Error Message: ${err.message}`);
});

socket.on("room_state", (frontendRoom: FrontendRoom) => {
  console.log(`[EventBus] room_state: \n ${JSON.stringify(frontendRoom)}`);
  EventBus.emit("room_state", frontendRoom);
});

socket.on("uno", (frontendRoom: FrontendRoom) => {
  console.log(`[EventBus] UNO! : \n ${JSON.stringify(frontendRoom)}`);
  EventBus.emit("uno", frontendRoom);
});

socket.on("display_pass_button", (frontendRoom: FrontendRoom) => {
  console.log(`[EventBus] display_pass_button: \n ${JSON.stringify(frontendRoom)}`);
  EventBus.emit("display_pass_button", frontendRoom);
});

socket.on("show_colors", (frontendRoom: FrontendRoom) => {
  console.log(`[EventBus] show_colors: \n ${JSON.stringify(frontendRoom)}`);
  EventBus.emit("show_colors", frontendRoom);
});

socket.on("error", (err) => {
  console.log(`[EventBus] SOCKET_ERROR \n Error Message: ${err.message}`);
  EventBus.emit("error", err);
});

