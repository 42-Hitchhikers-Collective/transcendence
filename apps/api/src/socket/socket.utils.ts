/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.utils.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 13:05:28 by ilazar            #+#    #+#             */
/*   Updated: 2026/04/10 14:02:46 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Socket } from "socket.io";


// later JWT can be added by only changing getIdentity
// to return the actual userId instead of socket.id, and the rest of the code can remain unchanged
export function getIdentity(socket: Socket) {
  return {
    playerId: socket.data.user?.userId ?? socket.id, // fallback now, JWT later
    socketId: socket.id,
  };
}

