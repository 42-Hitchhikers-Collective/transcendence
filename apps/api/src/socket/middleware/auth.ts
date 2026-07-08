/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/14 15:08:01 by ilazar            #+#    #+#             */
/*   Updated: 2026/06/18 15:45:14 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */



import { Socket } from "socket.io";
import { FastifyInstance } from "fastify";

type JwtPayload = { sub?: string };
type Next = (err?: Error) => void;

// JESS: we need this so that the socket can read the cookie from the handshake headers and extract the JWT token
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  // Splits the cookie header into individual cookies and parse them into key-value pairs
  cookieHeader.split(";").forEach((pair) => {
    const eqIdx = pair.indexOf("=");
    if (eqIdx > 0) {
      const key = pair.substring(0, eqIdx).trim(); // Gets the cookie name and trims whitespace
      const val = pair.substring(eqIdx + 1).trim(); // Gets the cookie value and trims whitespace
      if (key) cookies[key] = decodeURIComponent(val);
    }
  });
  return cookies;
}
//------------------------------------------------------------------------------------------------------------------

export function createAuthMiddleware(app: FastifyInstance) {
  return async (socket: Socket, next: Next) => {
    const cookieHeader = socket.handshake.headers.cookie as string | undefined; // JESS: Gets the cookie header from the handshake
    const cookies = cookieHeader ? parseCookies(cookieHeader) : {}; // JESS: Parses the cookies from the header and it returns an object with key-value pairs of cookie names and values or an empty object if no cookies are present

    // token can come from either the cookie, the socket handshake auth, or the authorization header
    const token =
      cookies.token || // JESS: added cookie as a source of the token because we are storing the JWT in a cookie to handle XXS attacks (we had it in local storage before but that is not secure)
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
        select: { username: true, avatarUrl: true },
      });

      if (!profile) return next(new Error("unauthorized"));

      (socket as any).userId = payload.sub;
      (socket as any).userName = profile.username;
      (socket as any).avatarUrl = profile.avatarUrl;
      socket.join(`user:${payload.sub}`);

      return next();
    } catch (err) {
      app.log.error(err);
      return next(new Error("unauthorized"));
    }
  };
}