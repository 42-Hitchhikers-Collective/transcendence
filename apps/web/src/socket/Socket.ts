import { io } from "socket.io-client";
import { EventBus } from "../events/EventBus";
import type { FrontendRoom } from "../gameCanvas/types/roomTypes";

/* 
When calling io() we do not need to specify the URL because it uses the frontend's localhost by deafault
*/

export const socket = io({
  path: "/socket.io",
  // autoConnect: false, // it is needed to enforce when we want to connect or the socket will always try to connect
  auth: (cb) => cb({ token: localStorage.getItem("auth_token") ?? "" }), //  reading from localStorage could be a bit brittle and break things if we have BE changes, JESS will change thie later
});

socket.on("connect", () => {
  console.log(
    `[socket] connected \n
    id: ${socket.id} \n
    transport: ${socket.io.engine.transport.name}`,
  );
});

socket.on("connect_error", (err) => {
  console.warn(`[socket] connect_error \n Error Message ${err.message}`);
});

socket.on("disconnect", (message) => {
  console.warn(`[socket] disconnect \n Disconnect Message: ${message}`);
});

socket.io.on("reconnect_attempt", (message) => {
  console.warn(`[socket] reconnect_attempt \n Reconnect Message: ${message}`);
});

socket.io.engine?.on("upgradeError", (err) => {
  console.warn(`[socket] upgradeError \n Upgrade Error Message: ${err}`);
});

socket.on("room_state", (frontendRoom: FrontendRoom) => {
  console.log(`[EventBus] ROOM_STATE \n Room Message: ${frontendRoom}`);
  EventBus.emit("ROOM_STATE", frontendRoom);
});

socket.on("error", (err) => {
  console.log(`[EventBus] SOCKET_ERROR \n Error Message: ${err}`);
  EventBus.emit("SOCKET_ERROR", err);
});
