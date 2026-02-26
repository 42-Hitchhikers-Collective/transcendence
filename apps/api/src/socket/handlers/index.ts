import { FastifyInstance } from "fastify";
import { Socket } from "socket.io";

export function registerSocketHandlers(
  app: FastifyInstance,
  socket: Socket
) {

//   socket.on("yoyo", () => {
//     socket.emit("hello");
//   });



  socket.on("disconnect", () => {
    //app.log.info(`socket disconnected: ${socket.id}`);
    console.log(`Socket disconnected: ${socket.id}`);
    });

}