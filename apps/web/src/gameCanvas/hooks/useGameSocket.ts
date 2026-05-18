import { io } from "socket.io-client";
import { EventBus } from "../../events/EventBus";
import type { FrontendRoom } from "../types/roomTypes";

export const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("connected");
});

socket.on("room_state", (frontendRoom: FrontendRoom) => {
  console.log("ROOM_STATE recibido:", frontendRoom);
  EventBus.emit("ROOM_STATE", frontendRoom);
});

socket.on("error", (err) => {
  EventBus.emit("SOCKET_ERROR", err);
});