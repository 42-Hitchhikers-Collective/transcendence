/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   chatEvents.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/21 17:36:17 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/21 18:00:39 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Room, RoomIdResult } from "./types";
import { getPlayerRoomId, getRoomById, getUsername } from "./gameManager";
import { MAX_MSG_LENGTH, MAX_MSG_HISTORY } from "./types";


// ---> Chat Events ---


export function sendMessage(playerId: string, msg: string): RoomIdResult {
    const roomId = getPlayerRoomId(playerId);
    if (!roomId)
        return {success: false, error: "Player is not in room"};
    const room = getRoomById(roomId);
    if (!room)
        return {success: false, error: "Room not found"};
    if (msg.length === 0 || msg.length > MAX_MSG_LENGTH)
        return {success: false, error: `Message must be between 1 and ${MAX_MSG_LENGTH} characters`};
    const username = getUsername(playerId) || "Unknown";
    addMessageToChatHistory(room, username, msg);
    return {success: true, roomId: roomId};
}



// Helper to add message to room's chat history and trim if exceeds max TODO: Check correctness!
function addMessageToChatHistory(room: Room, username: string, msg: string) {
//check if over the limit and trim if necessary
    room.chatHistory.push({ username, msg });
    if (room.chatHistory.length > MAX_MSG_HISTORY) {
        room.chatHistory.shift();
    }
}