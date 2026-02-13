/**
 * Cliente WebSocket reutilizable para tiempo real (chat, video, etc.).
 * - Conecta usando NEXT_PUBLIC_WS_URL (vía getWebSocketUrl)
 * - Auto-reconnect con backoff
 * - send(type, payload) / on(type, callback)
 * - Auth inicial con userId al conectar
 */

import {
  createWebSocketClient,
  getWebSocketUrl as getWsUrl,
  type WebSocketStatus,
  type WebSocketClientHandle,
} from "./websocketClient";

export { getWebSocketUrl } from "./websocketClient";
export type SocketStatus = WebSocketStatus;

export interface SocketClientOptions {
  /** URL del WebSocket. Si no se pasa, se usa getWebSocketUrl() (NEXT_PUBLIC_WS_URL). */
  url?: string;
  /** userId para enviar auth al conectar. Si se pasa, se envía { type: "auth", userId } al abrir. */
  userId?: string;
  /** Conectar al crear (default true). */
  autoConnect?: boolean;
  /** Reconectar si se cierra o falla (default true). */
  reconnect?: boolean;
  /** Callback al abrir. */
  onOpen?: () => void;
  /** Callback al cerrar. */
  onClose?: () => void;
  /** Callback al error. */
  onError?: (error: Event) => void;
  /** Callback al cambiar estado. */
  onStatusChange?: (status: SocketStatus) => void;
}

export interface SocketClientHandle {
  connect(): Promise<void>;
  disconnect(): void;
  /** Envía un mensaje tipado. El servidor recibe { type, ...payload }. */
  send(type: string, payload?: Record<string, unknown>): void;
  /** Suscribe a un evento. Devuelve función para desuscribir. */
  on(type: string, callback: (data: unknown) => void): () => void;
  /** Quita listeners de un evento (o todos si no se pasa callback). */
  off(type: string, callback?: (data: unknown) => void): void;
  readonly status: SocketStatus;
  readonly url: string;
}

/**
 * Crea un cliente WebSocket reutilizable con auth por userId, send(type, payload) y on(type, callback).
 * Compatible con chat y video (mismo socket puede usarse para ambos).
 */
export function createSocketClient(options: SocketClientOptions = {}): SocketClientHandle {
  const {
    url: urlOption,
    userId,
    autoConnect = true,
    reconnect = true,
    onOpen: userOnOpen,
    onClose: userOnClose,
    onError: userOnError,
    onStatusChange: userOnStatusChange,
  } = options;

  const url = urlOption?.trim() || getWsUrl();

  const ws: WebSocketClientHandle = createWebSocketClient({
    url: url || undefined,
    autoConnect,
    reconnect,
    onOpen: () => {
      if (userId?.trim()) {
        ws.send({ type: "auth", userId: userId.trim() });
      }
      userOnOpen?.();
    },
    onClose: userOnClose,
    onError: userOnError,
    onStatusChange: userOnStatusChange,
  });

  function send(type: string, payload?: Record<string, unknown>): void {
    const body = payload && Object.keys(payload).length > 0 ? { type, ...payload } : { type };
    ws.send(body);
  }

  function on(eventType: string, callback: (data: unknown) => void): () => void {
    return ws.on(eventType, callback);
  }

  function off(eventType: string, callback?: (data: unknown) => void): void {
    ws.off(eventType, callback);
  }

  return {
    connect: () => ws.connect(),
    disconnect: () => ws.disconnect(),
    send,
    on,
    off,
    get status() {
      return ws.status;
    },
    get url() {
      return ws.url;
    },
  };
}
