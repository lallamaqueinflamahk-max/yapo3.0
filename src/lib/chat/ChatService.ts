/**
 * ChatService: chat en tiempo real vía WebSocket.
 * Conecta a NEXT_PUBLIC_WS_URL (getWebSocketUrl).
 * Mensajes 1-1, chats grupales, estados online/escribiendo.
 * Logs de eventos WS en consola para debugging (localhost, Vercel, ngrok).
 */

import {
  createChatService as createRealtimeChatService,
  getWebSocketUrl,
} from "@/lib/realtime";
import type { Message, Room } from "@/lib/chat";
import type { ChatServiceHandle, TypingPayload } from "@/lib/realtime";

const LOG = "[ChatService]";

export type { Message, Room };
export type { ChatServiceHandle, TypingPayload };

/**
 * Crea el servicio de chat conectado a WS_URL (NEXT_PUBLIC_WS_URL).
 * Envía y recibe mensajes; join/leave room; typing.
 * Todos los eventos se loguean en consola.
 */
export function createChatService(options: {
  url?: string;
  userId?: string;
  autoConnect?: boolean;
} = {}): ChatServiceHandle {
  const url = options.url?.trim() || getWebSocketUrl();
  if (typeof window !== "undefined" && url) {
    console.log(`${LOG} WS_URL=${url}`);
  }

  const service = createRealtimeChatService({
    ...options,
    url: url || undefined,
  });

  const originalSendMessage = service.sendMessage.bind(service);
  const originalJoinChat = service.joinChat.bind(service);
  const originalLeaveChat = service.leaveChat.bind(service);

  return {
    connect: service.connect,
    disconnect: service.disconnect,
    sendMessage(chatId: string, message: string) {
      if (typeof window !== "undefined") {
        console.log(`${LOG} send message`, { chatId, text: message.slice(0, 50) });
      }
      originalSendMessage(chatId, message);
    },
    onMessage(callback: (message: Message) => void) {
      return service.onMessage((message) => {
        if (typeof window !== "undefined") {
          console.log(`${LOG} message received`, {
            roomId: message.roomId,
            userId: message.userId,
            text: message.text?.slice(0, 50),
          });
        }
        callback(message);
      });
    },
    onTyping(callback: (payload: TypingPayload) => void) {
      return service.onTyping((payload) => {
        if (typeof window !== "undefined") {
          console.log(`${LOG} typing`, payload);
        }
        callback(payload);
      });
    },
    joinChat(chatId: string) {
      if (typeof window !== "undefined") {
        console.log(`${LOG} join_room`, { chatId });
      }
      originalJoinChat(chatId);
    },
    leaveChat(chatId: string) {
      if (typeof window !== "undefined") {
        console.log(`${LOG} leave_room`, { chatId });
      }
      originalLeaveChat(chatId);
    },
    get status() {
      return service.status;
    },
  };
}

/** Resuelve la URL WebSocket (NEXT_PUBLIC_WS_URL). */
export { getWebSocketUrl } from "@/lib/realtime";
