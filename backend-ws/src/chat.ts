import type { WebSocket } from "ws";
import { getUserId, send, type Store } from "./auth.js";

export function handleChatJoin(
  ws: WebSocket,
  payload: { roomId?: string },
  store: Store
): void {
  const userId = getUserId(ws, store);
  const roomId = payload?.roomId?.trim();
  if (!userId || !roomId) {
    console.log("[chat_join] missing userId or roomId, ignored");
    return;
  }
  if (!store.chatRooms.has(roomId)) {
    store.chatRooms.set(roomId, new Set());
  }
  store.chatRooms.get(roomId)!.add(userId);
  console.log("[chat_join] roomId=%s userId=%s", roomId, userId);
  send(ws, { type: "room_joined", roomId });
}

export function handleChatMessage(
  ws: WebSocket,
  payload: { roomId?: string; message?: string; text?: string },
  store: Store
): void {
  const userId = getUserId(ws, store);
  const roomId = payload?.roomId?.trim();
  const text = payload?.message ?? payload?.text ?? "";
  if (!userId || !roomId) {
    console.log("[chat_message] missing userId or roomId, ignored");
    return;
  }
  const members = store.chatRooms.get(roomId);
  if (!members) return;
  const msg = {
    type: "message",
    roomId,
    message: { userId, text, roomId, id: `msg-${Date.now()}`, createdAt: new Date().toISOString(), userName: userId },
  };
  members.forEach((uid) => {
    const client = store.clients.get(uid);
    if (client && client !== ws) send(client, msg);
  });
  console.log("[chat_message] roomId=%s from=%s", roomId, userId);
}

export function handleTyping(
  ws: WebSocket,
  payload: { roomId?: string; isTyping?: boolean },
  store: Store
): void {
  const userId = getUserId(ws, store);
  const roomId = payload?.roomId?.trim();
  if (!userId || !roomId) return;
  const members = store.chatRooms.get(roomId);
  if (!members) return;
  const event = { type: "typing", roomId, userId, isTyping: payload?.isTyping !== false };
  members.forEach((uid) => {
    const client = store.clients.get(uid);
    if (client && client !== ws) send(client, event);
  });
}
