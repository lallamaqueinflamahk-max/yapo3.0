/**
 * Cliente WebSocket para chat.
 */

import type { Message, Room, PresencePayload } from "./types";

export type IncomingEvent =
  | { type: "auth_ok"; userId: string }
  | { type: "rooms"; rooms: Room[] }
  | { type: "room_joined"; roomId: string }
  | { type: "messages"; roomId: string; messages: Message[] }
  | { type: "message"; message: Message }
  | { type: "presence"; roomId: string; userId: string; userName: string; status: PresencePayload["status"] };

export type OutgoingEvent =
  | { type: "auth"; userId: string; userName?: string }
  | { type: "get_rooms" }
  | { type: "join_room"; roomId: string; roomName?: string; roomType?: "private" | "group" }
  | { type: "leave_room"; roomId: string }
  | { type: "chat_message"; roomId: string; text: string }
  | { type: "typing"; roomId: string; isTyping: boolean };

function getDefaultUrl(): string {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_WS_URL?.replace(/^https/, "wss").replace(/^http/, "ws") ?? "ws://localhost:3001";
  }
  const env = process.env.NEXT_PUBLIC_WS_URL?.trim();
  if (env) {
    if (env.startsWith("https")) return env.replace(/^https/, "wss");
    if (env.startsWith("http")) return env.replace(/^http/, "ws");
    return env;
  }
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return "ws://localhost:3001";
  return "";
}

export function getWebSocketUrl(): string {
  return getDefaultUrl();
}

export function createChatSocket(url?: string) {
  const wsUrl = url ?? getWebSocketUrl();
  let ws: WebSocket | null = null;
  const listeners = new Set<(event: IncomingEvent) => void>();

  function connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!wsUrl) {
        reject(new Error("NEXT_PUBLIC_WS_URL no configurada"));
        return;
      }
      if (ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }
      ws = new WebSocket(wsUrl);
      ws.onopen = () => resolve();
      ws.onerror = () => reject(new Error("WebSocket error"));
      ws.onclose = () => {};
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as IncomingEvent;
          listeners.forEach((fn) => fn(payload));
        } catch {
          // ignore
        }
      };
    });
  }

  function disconnect() {
    if (ws) {
      ws.close();
      ws = null;
    }
  }

  function send(event: OutgoingEvent) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(event));
    }
  }

  function subscribe(fn: (event: IncomingEvent) => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  return {
    connect,
    disconnect,
    send,
    subscribe,
    get readyState() {
      return ws?.readyState ?? WebSocket.CLOSED;
    },
  };
}

export type ChatSocket = ReturnType<typeof createChatSocket>;
