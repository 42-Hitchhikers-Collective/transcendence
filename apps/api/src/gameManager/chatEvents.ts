/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   chatEvents.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/21 17:36:17 by ilazar            #+#    #+#             */
/*   Updated: 2026/06/18 17:13:05 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Room, RoomIdResult, SYSTEM_SENDER_NAME, msgResult } from "./types";
import { getPlayerRoomId, getRoomById, getUsername, getOnlinePlayer } from "./gameManager";
import { MAX_MSG_LENGTH, MAX_MSG_HISTORY } from "./types";


// ---> Chat Events ---

// Chat message types for predefined system messages
export enum ChatMsgType {
  JOIN_ROOM = "JOIN_ROOM",
  CREATE_ROOM = "CREATE_ROOM",
  LEFT_ROOM = "LEFT_ROOM",
  STARTED_GAME = "STARTED_GAME",
  WON_GAME = "WON_GAME",
  DROP_ROOM = "DROP_ROOM",
  DROP_ROOM_BACK = "DROP_ROOM_BACK",
  UNO = "UNO"
}

// Map enum to actual message text
const CHAT_MESSAGE_TEXT: Record<ChatMsgType, string> = {
  [ChatMsgType.JOIN_ROOM]: "joined.",
  [ChatMsgType.CREATE_ROOM]: "created the room.",
  [ChatMsgType.LEFT_ROOM]: "left. \n If the game already started, they won't be able to rejoin.",
  [ChatMsgType.STARTED_GAME]: "started the game.",
  [ChatMsgType.WON_GAME]: "won!",
  [ChatMsgType.DROP_ROOM]: "dropped! They have 30 seconds to rejoin or will be removed from the game.",
  [ChatMsgType.DROP_ROOM_BACK]: "is back!",
  [ChatMsgType.UNO]: "called UNO! 🚨", // JESS: add uno call
};

// Validate a chat msg and add it to room's chat history
export function prepareChatMsg(playerId: string, msg: string): RoomIdResult {
    const roomId = getPlayerRoomId(playerId);
    if (!roomId)
        return {success: false, roomId: "undefined", error: "Player is not in room"};
    const room = getRoomById(roomId);
    if (!room)
        return {success: false, roomId: "undefined", error: "Room not found"};
    if (msg.length === 0 || msg.length > MAX_MSG_LENGTH)
        return {success: false, roomId: roomId, error: `Message must be between 1 and ${MAX_MSG_LENGTH} characters`};
   // JESS: removed regex validation as the chat cannot be used for sql injection or any other attacks since it's not using
   // a database. With socjet io we have only risk of DOS attacks, but MAX_MSG_LENGTH = 200 prevents that already.
   // So let's not restrict the chat to only certain characters, as it would be annoying for users and it's nice if they can use emojis for example
    // const regex = /^[a-zA-Z0-9 \-_!?.]+$/;
    // if (!regex.test(msg))
    //   return { success: false, roomId: "undefined", error: "Message contains invalid characters"};
    const username = getUsername(playerId) || "Unknown";
    const onlinePlayer = getOnlinePlayer(playerId);
    const avatarUrl = onlinePlayer?.avatarUrl ?? "/avatars/default.png";
    addMsgToChatHistory(room, username, msg, avatarUrl); // JESS: added avatarUrl to chat history so the frontend can display it
    return {success: true, roomId: roomId};
}

// Helper to create predefined system messages like join/leave/start/win. and add it to chat history
export function prepareStrChatMsg(playerId: string, roomId: string, msgType: ChatMsgType): msgResult {
  if (!roomId)
    return {success: false, error: "Player is not in room"};
  const room = getRoomById(roomId);
  if (!room)
    return {success: false, error: "Room not found"};
  const username = getUsername(playerId) || "Unknown";
  const msgText = CHAT_MESSAGE_TEXT[msgType];
  const fullMessage = `${username} ${msgText}`;
  addMsgToChatHistory(room, SYSTEM_SENDER_NAME, fullMessage);
  return {success: true, msg: fullMessage};
}


// Helper to add message to room's chat history and trim history if exceeds max
function addMsgToChatHistory(room: Room, username: string, msg: string, avatarUrl?: string) {
    room.chatHistory.push({ username, msg, avatarUrl: avatarUrl ?? "" }); // JESS: added avatarUrl to chat history so the frontend can display it
    if (room.chatHistory.length > MAX_MSG_HISTORY) {
        room.chatHistory.shift();
    }
}