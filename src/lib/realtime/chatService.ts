/**
 * ChatService: chat en tiempo real sobre WebSocket reutilizable.
 * - sendMessage(chatId, message)
 * - onMessage(callback)
 * - onTyping(callback)
 * - joinChat(chatId)
 * - leaveChat(chatId)
 */

import type { Message, Room } from "@/lib/chat";
import { createSocketClient, getWebSocketUrl } from "./socketClient";

export type { Message, Room } from "@/lib/chat";

/** Payload de mensaje entrante (servidor puede enviar { message } o el objeto directo). */
export type IncomingMessage = Message | { message: Message };

/** Payload de typing (chatId, userId, userName, isTyping). */
export interface TypingPayload {
  chatId?: string;
  roomId?: string;
  userId?: string;
  userName?: string;
  isTyping?: boolean;
}

export interface ChatServiceHandle {
  /** Conectar (se llama automáticamente si autoConnect). */
  connect(): Promise<void>;
  /** Desconectar. */
  disconnect(): void;
  /** Enviar mensaje en un chat. */
  sendMessage(chatId: string, message: string): void;
  /** Suscribirse a mensajes entrantes. Devuelve función para desuscribir. */
  onMessage(callback: (message: Message) => void): () => void;
  /** Suscribirse a indicador de escritura. Devuelve función para desuscribir. */
  onTyping(callback: (payload: TypingPayload) => void): () => void;
  /** Entrar a un chat. */
  joinChat(chatId: string): void;
  /** Salir de un chat. */
  leaveChat(chatId: string): void;
  /** Estado de conexión. */
  readonly status: "closed" | "connecting" | "open" | "error";
}

/**
 * Crea el ChatService usando el cliente reutilizable (auto-conexión, reconexión, auth con userId).
 */
export function createChatService(options: { url?: string; userId?: string; autoConnect?: boolean } = {}): ChatServiceHandle {
  const { url: urlOption, userId, autoConnect = true } = options;
  const url = urlOption?.trim() || getWebSocketUrl();

  const socket = createSocketClient({
    url: url || undefined,
    userId,
    autoConnect,
    reconnect: true,
  });

  function sendMessage(chatId: string, message: string): void {
    socket.send("chat_message", { roomId: chatId, text: message });
  }

  function joinChat(chatId: string): void {
    socket.send("join_room", { roomId: chatId });
  }

  function leaveChat(chatId: string): void {
    socket.send("leave_room", { roomId: chatId });
  }

  function onMessage(callback: (message: Message) => void): () => void {
    return socket.on("message", (data: unknown) => {
      const payload = data as IncomingMessage;
      const message = "message" in payload && payload.message ? payload.message : (payload as Message);
      if (message?.id != null || message?.text != null) {
        callback(message as Message);
      }
    });
  }

  function onTyping(callback: (payload: TypingPayload) => void): () => void {
    return socket.on("typing", (data: unknown) => {
      callback((data as TypingPayload) ?? {});
    });
  }

  return {
    connect: () => socket.connect(),
    disconnect: () => socket.disconnect(),
    sendMessage,
    onMessage,
    onTyping,
    joinChat,
    leaveChat,
    get status() {
      return socket.status;
    },
  };
}
