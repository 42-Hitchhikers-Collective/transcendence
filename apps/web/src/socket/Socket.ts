import { io } from "socket.io-client";
import { EventBus } from "../events/EventBus";

export const socket = io("http://localhost:3000", {
  path: "/socket.io",
});

socket.on("connect", () => {
  console.log("connected");
});

socket.on("room_state", (table) => {
  EventBus.emit("ROOM_STATE", table);
});

socket.on("error", (err) => {
  EventBus.emit("SOCKET_ERROR", err);
});