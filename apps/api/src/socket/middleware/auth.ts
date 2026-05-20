/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/14 15:08:01 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/19 14:00:10 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */



import { Socket } from "socket.io";
import { FastifyInstance } from "fastify";

type JwtPayload = { sub?: string };
type Next = (err?: Error) => void;

export function createAuthMiddleware(app: FastifyInstance) {
  return async (socket: Socket, next: Next) => {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers.authorization || "").replace(/^Bearer\s+/i, "");

    if (!token) return next(new Error("unauthorized"));

    const jwtApi = (app as any).jwt;
    if (!jwtApi || typeof jwtApi.verify !== "function") {
      app.log.error("JWT plugin not available on app");
      return next(new Error("unauthorized"));
    }

    let payload: JwtPayload;
    try {
      payload = jwtApi.verify(token) as JwtPayload;
    } catch {
      return next(new Error("unauthorized"));
    }

    if (!payload.sub) return next(new Error("unauthorized"));

    // Fetch user profile to get username
    try {
      const profile = await app.prisma.profile.findUnique({
        where: { userId: payload.sub },
        select: { username: true },
      });

      if (!profile) return next(new Error("unauthorized"));

      (socket as any).userId = payload.sub;
      (socket as any).userName = profile.username;
      socket.join(`user:${payload.sub}`);

      return next();
    } catch (err) {
      app.log.error(err);
      return next(new Error("unauthorized"));
    }
  };
}