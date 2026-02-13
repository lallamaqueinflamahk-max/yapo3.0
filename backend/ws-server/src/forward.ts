/**
 * Reenvío de eventos. El servidor NO decide nada; solo reenvía.
 * chat_message, wallet_event, video_offer, video_answer, video_ice.
 */

import type { WebSocket } from "ws";
import type { RoomStore } from "./rooms.js";
import { getUserId, getUserName, getSocketsForUser, getMembersOfRoom } from "./rooms.js";

/** Eventos que el servidor solo reenvía (no decide lógica). */
const FORWARD_TYPES = new Set([
  "chat_message",
  "user_online",
  "user_typing",
  "typing",
  "wallet_event",
  "video_join",
  "video_leave",
  "video_offer",
  "video_answer",
  "video_ice",
]);

export function send(ws: WebSocket, data: object): void {
  if (ws.readyState !== 1) return;
  ws.send(JSON.stringify(data));
}

/**
 * Reenvía el mensaje al roomId (todos los miembros del room excepto opcionalmente el sender).
 */
export function forwardToRoom(
  store: RoomStore,
  roomId: string,
  message: object,
  excludeUserId?: string | null
): void {
  const members = getMembersOfRoom(roomId, store);
  members.forEach((userId) => {
    if (excludeUserId && userId === excludeUserId) return;
    getSocketsForUser(userId, store).forEach((ws) => send(ws, message));
  });
}

/**
 * Reenvía el mensaje a un usuario concreto (toUserId).
 */
export function forwardToUser(
  store: RoomStore,
  toUserId: string,
  message: object
): void {
  getSocketsForUser(toUserId, store).forEach((ws) => send(ws, message));
}

/**
 * Enruta y reenvía según tipo de evento.
 * - chat_message, wallet_event: reenvío a roomId.
 * - video_offer, video_answer, video_ice: reenvío a toUserId si existe, si no a roomId.
 */
export function forward(
  ws: WebSocket,
  store: RoomStore,
  type: string,
  payload: Record<string, unknown>
): void {
  if (!FORWARD_TYPES.has(type)) return;

  const fromUserId = getUserId(ws, store) ?? (payload.fromUserId as string) ?? (payload.userId as string);
  const fromUserName = getUserName(ws, store) ?? (payload.userName as string);
  const roomId = (payload.roomId as string)?.trim();
  const toUserId = ((payload.toUserId as string) ?? (payload.targetUserId as string))?.trim();

  const message: Record<string, unknown> = { type, ...payload, fromUserId };
  if (fromUserName) message.userName = fromUserName;

  if (toUserId && ["video_offer", "video_answer", "video_ice"].includes(type)) {
    forwardToUser(store, toUserId, message);
    return;
  }

  if (roomId) {
    forwardToRoom(store, roomId, message, fromUserId ?? undefined);
  }
}
