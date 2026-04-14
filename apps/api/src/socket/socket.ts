/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 13:14:42 by ilazar            #+#    #+#             */
/*   Updated: 2026/04/14 12:06:27 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { Server as SocketIOServer } from "socket.io";
import { FastifyInstance } from "fastify";
import { registerSocketHandlers } from "./handlers";
import { authMiddleware } from "./middleware/auth";


export function setupSocket(app: FastifyInstance) {
  const io = new SocketIOServer(app.server, {
    path: "/socket.io",
    cors: { origin: true },
  });

  io.use(authMiddleware);
  
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    io.emit("newClient", socket.id);

    // delegate logic to handlers
    registerSocketHandlers(app, socket);
  });

  return io;
}