/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.utils.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 13:05:28 by ilazar            #+#    #+#             */
/*   Updated: 2026/04/15 13:48:40 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Socket } from "socket.io";


export function getIdentity(socket: Socket) {
  return {
    playerId: (socket as any).userId,
    socketId: socket.id,
    userName: (socket as any).userName,
  };
}

