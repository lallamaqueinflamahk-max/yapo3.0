import type { WebSocket } from "ws";
import { getUserId, send, type Store } from "./auth.js";

export type VideoSignalType = "video_offer" | "video_answer" | "video_ice";

export interface VideoSignalMessage {
  type: VideoSignalType;
  roomId: string;
  fromUserId: string;
  toUserId?: string;
  payload: unknown;
}

/**
 * Signaling server WebRTC: no procesa media, solo reenvía mensajes.
 * Estructura: { type, roomId, fromUserId, toUserId?, payload }
 * - video_offer → reenviar a todos los peers del room (excepto el emisor)
 * - video_answer → reenviar al originador (toUserId)
 * - video_ice → reenviar al peer indicado (toUserId)
 */

export function handleVideoJoin(
  ws: WebSocket,
  payload: { roomId?: string; userId?: string; userName?: string },
  store: Store
): void {
  const userId = getUserId(ws, store) ?? String(payload?.userId ?? "").trim();
  const roomId = String(payload?.roomId ?? "").trim();
  if (!userId || !roomId) {
    console.log("[video_join] missing userId or roomId, ignored");
    return;
  }
  if (!store.videoRooms.has(roomId)) {
    store.videoRooms.set(roomId, new Set());
  }
  store.videoRooms.get(roomId)!.add(userId);
  const participants = Array.from(store.videoRooms.get(roomId)!).map((uid) => ({
    userId: uid,
    userName: uid === userId ? payload?.userName : undefined,
  }));
  send(ws, { type: "video_participants", participants });
  broadcastToVideoRoomExcept(store, roomId, userId, {
    type: "video_user_joined",
    userId,
    userName: payload?.userName,
  });
  console.log("[video_join] roomId=%s userId=%s", roomId, userId);
}

/** video_offer: reenviar a todos los peers del room (múltiples participantes). */
export function handleVideoOffer(
  ws: WebSocket,
  payload: { roomId?: string; fromUserId?: string; toUserId?: string; payload?: unknown },
  store: Store
): void {
  const fromUserId = getUserId(ws, store);
  const roomId = String(payload?.roomId ?? "").trim();
  const signalPayload = payload?.payload;
  if (!fromUserId || !roomId) {
    console.log("[video_offer] missing fromUserId or roomId, ignored");
    return;
  }
  const members = store.videoRooms.get(roomId);
  if (!members) return;
  const msg: VideoSignalMessage = {
    type: "video_offer",
    roomId,
    fromUserId,
    payload: signalPayload,
  };
  members.forEach((uid) => {
    if (uid === fromUserId) return;
    const client = store.clients.get(uid);
    if (client) send(client, msg);
  });
  console.log("[video_offer] roomId=%s from=%s peers=%d", roomId, fromUserId, members.size - 1);
}

/** video_answer: reenviar al originador (toUserId). */
export function handleVideoAnswer(
  ws: WebSocket,
  payload: { roomId?: string; fromUserId?: string; toUserId?: string; payload?: unknown },
  store: Store
): void {
  const fromUserId = getUserId(ws, store);
  const toUserId = String(payload?.toUserId ?? "").trim();
  const roomId = String(payload?.roomId ?? "").trim();
  const signalPayload = payload?.payload;
  if (!fromUserId || !toUserId) {
    console.log("[video_answer] missing fromUserId or toUserId, ignored");
    return;
  }
  const target = store.clients.get(toUserId);
  if (target) {
    const msg: VideoSignalMessage = {
      type: "video_answer",
      roomId,
      fromUserId,
      toUserId,
      payload: signalPayload,
    };
    send(target, msg);
    console.log("[video_answer] roomId=%s from=%s to=%s", roomId, fromUserId, toUserId);
  }
}

/** video_ice: reenviar al peer correcto (toUserId). */
export function handleVideoIce(
  ws: WebSocket,
  payload: { roomId?: string; fromUserId?: string; toUserId?: string; payload?: unknown },
  store: Store
): void {
  const fromUserId = getUserId(ws, store);
  const toUserId = String(payload?.toUserId ?? "").trim();
  const roomId = String(payload?.roomId ?? "").trim();
  const signalPayload = payload?.payload;
  if (!fromUserId || !toUserId) {
    console.log("[video_ice] missing fromUserId or toUserId, ignored");
    return;
  }
  const target = store.clients.get(toUserId);
  if (target) {
    const msg: VideoSignalMessage = {
      type: "video_ice",
      roomId,
      fromUserId,
      toUserId,
      payload: signalPayload,
    };
    send(target, msg);
    console.log("[video_ice] roomId=%s from=%s to=%s", roomId, fromUserId, toUserId);
  }
}

export function handleVideoLeave(
  ws: WebSocket,
  payload: { roomId?: string; userId?: string },
  store: Store
): void {
  const userId = getUserId(ws, store) ?? String(payload?.userId ?? "").trim();
  const roomId = String(payload?.roomId ?? "").trim();
  if (!userId || !roomId) return;
  const members = store.videoRooms.get(roomId);
  if (members) {
    members.delete(userId);
    if (members.size === 0) store.videoRooms.delete(roomId);
  }
  broadcastToVideoRoom(store, roomId, { type: "video_user_left", userId });
  console.log("[video_leave] roomId=%s userId=%s", roomId, userId);
}

function broadcastToVideoRoom(store: Store, roomId: string, data: object): void {
  const members = store.videoRooms.get(roomId);
  if (!members) return;
  members.forEach((uid) => {
    const client = store.clients.get(uid);
    if (client) send(client, data);
  });
}

function broadcastToVideoRoomExcept(store: Store, roomId: string, exceptUserId: string, data: object): void {
  const members = store.videoRooms.get(roomId);
  if (!members) return;
  members.forEach((uid) => {
    if (uid === exceptUserId) return;
    const client = store.clients.get(uid);
    if (client) send(client, data);
  });
}
