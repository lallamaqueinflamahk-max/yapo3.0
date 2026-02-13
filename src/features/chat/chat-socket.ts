/**
 * Socket único para chat + signaling WebRTC.
 * Conecta a NEXT_PUBLIC_WS_URL. Eventos: chat_message, video_join, video_offer, video_answer, video_ice.
 */

import { createSocketClient, getWebSocketUrl } from "@/lib/realtime";
import type { ChatRealtimeIn, ChatRealtimeOut } from "./types";

const WS_URL = getWebSocketUrl();

export { getWebSocketUrl };

export type ChatSocketStatus = "closed" | "connecting" | "open" | "error";

export interface ChatSocketHandle {
  connect(): Promise<void>;
  disconnect(): void;
  send(event: ChatRealtimeOut): void;
  subscribe(fn: (event: ChatRealtimeIn) => void): () => void;
  readonly status: ChatSocketStatus;
}

/**
 * Crea un cliente que envía eventos tipados y notifica por tipo.
 * Un solo WebSocket para chat y video.
 */
export function createChatSocket(options?: { url?: string; userId?: string; userName?: string }): ChatSocketHandle {
  const url = options?.url?.trim() || WS_URL;
  const userId = options?.userId ?? "";
  const client = createSocketClient({
    url: url || undefined,
    userId,
    autoConnect: false,
    reconnect: true,
  });

  const listeners = new Set<(event: ChatRealtimeIn) => void>();

  function send(event: ChatRealtimeOut): void {
    if (event.type === "auth") {
      client.send("auth", { userId: event.userId, userName: event.userName });
      return;
    }
    if (event.type === "join_room") {
      client.send("join_room", {
        roomId: event.roomId,
        roomName: event.roomName,
        roomType: event.roomType,
      });
      return;
    }
    if (event.type === "leave_room") {
      client.send("leave_room", { roomId: event.roomId });
      return;
    }
    if (event.type === "chat_message") {
      client.send("chat_message", { roomId: event.roomId, text: event.text });
      return;
    }
    if (event.type === "typing") {
      client.send("typing", { roomId: event.roomId, isTyping: event.isTyping });
      return;
    }
    if (event.type === "video_join") {
      client.send("video_join", {
        roomId: event.roomId,
        userId: event.userId,
        userName: event.userName,
      });
      return;
    }
    if (event.type === "video_leave") {
      client.send("video_leave", { roomId: event.roomId, userId: event.userId });
      return;
    }
    if (event.type === "video_offer") {
      client.send("video_offer", {
        roomId: event.roomId,
        targetUserId: event.targetUserId,
        toUserId: event.targetUserId,
        sdp: event.sdp,
      });
      return;
    }
    if (event.type === "video_answer") {
      client.send("video_answer", {
        roomId: event.roomId,
        targetUserId: event.targetUserId,
        toUserId: event.targetUserId,
        sdp: event.sdp,
      });
      return;
    }
    if (event.type === "video_ice") {
      client.send("video_ice", {
        roomId: event.roomId,
        targetUserId: event.targetUserId,
        toUserId: event.targetUserId,
        candidate: event.candidate,
      });
      return;
    }
  }

  function subscribe(fn: (event: ChatRealtimeIn) => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function dispatch(parsed: Record<string, unknown>): void {
    const type = parsed.type as string;
    if (!type) return;
    listeners.forEach((cb) => {
      try {
        cb(parsed as ChatRealtimeIn);
      } catch (e) {
        console.warn("[features/chat] subscriber error:", e);
      }
    });
  }

  ["rooms", "room_joined", "messages", "message", "chat_message", "video_join", "video_leave", "video_offer", "video_answer", "video_ice"].forEach(
    (eventType) => {
      client.on(eventType, (data: unknown) => {
        const payload = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
        dispatch({ type: eventType, ...payload });
      });
    }
  );

  return {
    connect: () => client.connect(),
    disconnect: () => client.disconnect(),
    send,
    subscribe,
    get status(): ChatSocketStatus {
      return client.status as ChatSocketStatus;
    },
  };
}
