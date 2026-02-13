/**
 * Rooms por usuario y por grupo.
 * - user rooms: userId -> Set<WebSocket> (un usuario puede tener varias conexiones)
 * - group rooms: roomId -> Set<userId> (miembros del room)
 * Sin persistencia; solo en memoria.
 */

import type { WebSocket } from "ws";

export interface RoomStore {
  /** userId -> Set<WebSocket> */
  userSockets: Map<string, Set<WebSocket>>;
  /** WebSocket -> userId */
  socketToUser: Map<WebSocket, string>;
  /** WebSocket -> userName (opcional, desde auth) */
  socketToUserName: Map<WebSocket, string>;
  /** roomId -> Set<userId> */
  roomMembers: Map<string, Set<string>>;
}

export function createStore(): RoomStore {
  return {
    userSockets: new Map(),
    socketToUser: new Map(),
    socketToUserName: new Map(),
    roomMembers: new Map(),
  };
}

export function joinUser(
  ws: WebSocket,
  userId: string,
  store: RoomStore,
  userName?: string
): void {
  const id = (userId ?? "").toString().trim();
  if (!id) return;
  store.socketToUser.set(ws, id);
  if (userName !== undefined) store.socketToUserName.set(ws, String(userName));
  if (!store.userSockets.has(id)) {
    store.userSockets.set(id, new Set());
  }
  store.userSockets.get(id)!.add(ws);
}

export function joinRoom(userId: string, roomId: string, store: RoomStore): void {
  const uid = (userId ?? "").toString().trim();
  const rid = (roomId ?? "").toString().trim();
  if (!uid || !rid) return;
  if (!store.roomMembers.has(rid)) {
    store.roomMembers.set(rid, new Set());
  }
  store.roomMembers.get(rid)!.add(uid);
}

export function leaveRoom(userId: string, roomId: string, store: RoomStore): void {
  const rid = (roomId ?? "").toString().trim();
  if (!rid) return;
  const members = store.roomMembers.get(rid);
  if (members && userId) members.delete((userId ?? "").toString().trim());
}

export function removeClient(ws: WebSocket, store: RoomStore): void {
  const userId = store.socketToUser.get(ws);
  store.socketToUser.delete(ws);
  if (userId) {
    const set = store.userSockets.get(userId);
    if (set) {
      set.delete(ws);
      if (set.size === 0) store.userSockets.delete(userId);
    }
    store.roomMembers.forEach((members) => members.delete(userId));
  }
}

export function getUserId(ws: WebSocket, store: RoomStore): string | null {
  return store.socketToUser.get(ws) ?? null;
}

export function getUserName(ws: WebSocket, store: RoomStore): string | null {
  return store.socketToUserName.get(ws) ?? null;
}

/** RoomIds en los que está el usuario. */
export function getRoomsForUser(userId: string, store: RoomStore): string[] {
  const list: string[] = [];
  const uid = (userId ?? "").toString().trim();
  store.roomMembers.forEach((members, roomId) => {
    if (members.has(uid)) list.push(roomId);
  });
  return list;
}

/** Sockets de un usuario (puede haber varios). */
export function getSocketsForUser(userId: string, store: RoomStore): Set<WebSocket> {
  return store.userSockets.get((userId ?? "").toString().trim()) ?? new Set();
}

/** UserIds en un room. */
export function getMembersOfRoom(roomId: string, store: RoomStore): Set<string> {
  return store.roomMembers.get((roomId ?? "").toString().trim()) ?? new Set();
}
