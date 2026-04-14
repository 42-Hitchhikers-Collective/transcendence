/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/14 12:02:23 by ilazar            #+#    #+#             */
/*   Updated: 2026/04/14 13:14:50 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Socket } from "socket.io";

type Next = (err?: Error) => void;

export function authMiddleware(socket: Socket, next: Next) {
  // TODO: replace with real JWT verification (Welf)
  
  const token = socket.handshake.auth?.token;

  // Temporary behavior (no JWT yet)
  if (!token) {
    // guest mode for now
    socket.data.user = null;
    return next();
  }

  // Fake user for now
  socket.data.user = {
    userId: token, // temporary
    // later will be replaced:
    // const payload = verifyJWT(token)
    // userId: payload.userId
    
    username: "guest",
  };

  next();

  console.log("Auth:", socket.data.user);
}

