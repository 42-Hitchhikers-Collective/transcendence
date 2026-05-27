/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   friend.handlers.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/27 17:00:00 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/27 15:51:35 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Socket } from "socket.io";
import { FastifyInstance } from "fastify";
import { getIdentity } from "../socket.utils";

// Notify friends of a presence change (online/offline)
export async function notifyFriendsPresence(
  app: FastifyInstance,
  socket: Socket,
  playerId: string,
  status: "online" | "offline"
) {
  const friendsSvc = (app as any).friendsService;
  if (!friendsSvc || typeof friendsSvc.getFriendIds !== "function") return;
  try {
    const friendIds: string[] = await friendsSvc.getFriendIds(playerId);
    const payload: any = { id: playerId, status };
    if (status === "offline") payload.lastSeen = new Date().toISOString();
    friendIds.forEach((fid) => socket.nsp.to(`user:${fid}`).emit("friend:presence", payload));
  } catch (err) {
    app.log.error(err);
  }
}

export function registerFriendHandlers(app: FastifyInstance, socket: Socket) {
  const { playerId, userName } = getIdentity(socket);

  // On connect, announce online to friends
  notifyFriendsPresence(app, socket, playerId, "online");

  // Invite another player to be a friend
  socket.on("friend:invite", async ({ to, message }) => {
    const svc = (app as any).friendsService;
    if (!svc || typeof svc.createInvite !== "function") {
      return socket.emit("op_error", { message: "Friends service not available" });
    }
    if (!to || to === playerId) return socket.emit("op_error", { message: "Invalid target" });
    try {
      const result = await svc.createInvite(playerId, to, message);
      if (!result.success) return socket.emit("op_error", { message: result.error });
      // Ask inviter
      socket.emit("friend:invite_sent", { to });
      // Notify target if online (use user room)
      socket.nsp.to(`user:${to}`).emit("friend:invite", { from: playerId, fromName: userName, message, createdAt: result.createdAt });
    } catch (err) {
      app.log.error(err);
      socket.emit("op_error", { message: "Internal error" });
    }
  });

  // Respond to an invite
  socket.on("friend:respond", async ({ from, accept }) => {
    const svc = (app as any).friendsService;
    if (!svc || typeof svc.respondInvite !== "function") {
      return socket.emit("op_error", { message: "Friends service not available" });
    }
    try {
      const res = await svc.respondInvite(from, playerId, !!accept);
      if (!res.success) return socket.emit("op_error", { message: res.error });
      if (res.accepted) {
        // notify both users
        socket.nsp.to(`user:${from}`).emit("friend:added", { id: playerId, userName });
        socket.emit("friend:added", { id: from, userName: res.friendName || "" });
      } else {
        socket.nsp.to(`user:${from}`).emit("friend:invite_declined", { by: playerId });
      }
    } catch (err) {
      app.log.error(err);
      socket.emit("op_error", { message: "Internal error" });
    }
  });

  // Remove a friend
  socket.on("friend:remove", async ({ friendId }) => {
    const svc = (app as any).friendsService;
    if (!svc || typeof svc.removeFriend !== "function") {
      return socket.emit("op_error", { message: "Friends service not available" });
    }
    try {
      const res = await svc.removeFriend(playerId, friendId);
      if (!res.success) return socket.emit("op_error", { message: res.error });
      socket.emit("friend:removed", { id: friendId });
      socket.nsp.to(`user:${friendId}`).emit("friend:removed", { id: playerId });
    } catch (err) {
      app.log.error(err);
      socket.emit("op_error", { message: "Internal error" });
    }
  });

  // Request friend list (can be served by REST instead)
  socket.on("friend:list", async () => {
    const svc = (app as any).friendsService;
    if (!svc || typeof svc.getFriends !== "function") {
      return socket.emit("op_error", { message: "Friends service not available" });
    }
    try {
      const res = await svc.getFriends(playerId);
      if (!res.success) return socket.emit("op_error", { message: res.error });
      socket.emit("friend:list", { friends: res.friends });
    } catch (err) {
      app.log.error(err);
      socket.emit("op_error", { message: "Internal error" });
    }
  });

  // When the socket disconnects we don't immediately mark user offline here; the
  // connection handler manages a grace period and will emit offline presence when
  // the player is finally removed. This handler could optionally call
  // emitPresenceToFriends("offline") if you want immediate notify.
}

export default registerFriendHandlers;
