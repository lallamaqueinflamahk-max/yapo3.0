import type { WebSocket } from "ws";

export interface Store {
  clients: Map<string, WebSocket>;
  socketToUserId: Map<WebSocket, string>;
  chatRooms: Map<string, Set<string>>;
  videoRooms: Map<string, Set<string>>;
}

export function handleAuth(
  ws: WebSocket,
  payload: { userId?: string },
  store: Store
): void {
  const userId = payload?.userId?.trim();
  if (!userId) {
    console.log("[auth] missing userId, ignored");
    return;
  }
  store.clients.set(userId, ws);
  store.socketToUserId.set(ws, userId);
  console.log("[auth] userId=%s", userId);
  send(ws, { type: "auth_ok", userId });
}

export function getUserId(ws: WebSocket, store: Store): string | null {
  return store.socketToUserId.get(ws) ?? null;
}

export function send(ws: WebSocket, data: object): void {
  if (ws.readyState !== 1) return;
  ws.send(JSON.stringify(data));
}

export function removeClient(ws: WebSocket, store: Store): void {
  const userId = store.socketToUserId.get(ws);
  if (userId) {
    store.clients.delete(userId);
    store.socketToUserId.delete(ws);
    store.chatRooms.forEach((members) => members.delete(userId));
    store.videoRooms.forEach((members) => members.delete(userId));
    console.log("[auth] disconnected userId=%s", userId);
  }
}
