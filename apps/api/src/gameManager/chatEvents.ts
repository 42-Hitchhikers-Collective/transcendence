/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   chatEvents.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/21 17:36:17 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/26 16:50:38 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Room, RoomIdResult } from "./types";
import { getPlayerRoomId, getRoomById, getUsername } from "./gameManager";
import { MAX_MSG_LENGTH, MAX_MSG_HISTORY } from "./types";


// ---> Chat Events ---

// Chat message types for predefined system messages
export enum ChatMsgType {
  JOIN_ROOM = "JOIN_ROOM",
  LEFT_ROOM = "LEFT_ROOM",
  STARTED_GAME = "STARTED_GAME",
  WON_GAME = "WON_GAME"
}

// Map enum to actual message text
const CHAT_MESSAGE_TEXT: Record<ChatMsgType, string> = {
  [ChatMsgType.JOIN_ROOM]: "has joined the room.",
  [ChatMsgType.LEFT_ROOM]: "has left the room.",
  [ChatMsgType.STARTED_GAME]: "started the game.",
  [ChatMsgType.WON_GAME]: "won the game!"
};

// Validate a chat msg and add it to room's chat history
export function prepareChatMsg(playerId: string, msg: string): RoomIdResult {
    const roomId = getPlayerRoomId(playerId);
    if (!roomId)
        return {success: false, error: "Player is not in room"};
    const room = getRoomById(roomId);
    if (!room)
        return {success: false, error: "Room not found"};
    if (msg.length === 0 || msg.length > MAX_MSG_LENGTH)
        return {success: false, error: `Message must be between 1 and ${MAX_MSG_LENGTH} characters`};
    const username = getUsername(playerId) || "Unknown";
    addMsgToChatHistory(room, username, msg);
    return {success: true, roomId: roomId};
}

// Helper to create predefined system messages like join/leave/start/win. and add it to chat history
export function prepareStrChatMsg(playerId: string, msgType: ChatMsgType): RoomIdResult {
  const roomId = getPlayerRoomId(playerId);
  if (!roomId)
    return {success: false, error: "Player is not in room"};
  const room = getRoomById(roomId);
  if (!room)
    return {success: false, error: "Room not found"};
  const username = getUsername(playerId) || "Unknown";
  const msgText = CHAT_MESSAGE_TEXT[msgType];
  const fullMessage = `${username} ${msgText}`;
  addMsgToChatHistory(room, "System", fullMessage);
  return {success: true, roomId: roomId};
}


// Helper to add message to room's chat history and trim history if exceeds max
function addMsgToChatHistory(room: Room, username: string, msg: string) {
    room.chatHistory.push({ username, msg });
    if (room.chatHistory.length > MAX_MSG_HISTORY) {
        room.chatHistory.shift();
    }
}