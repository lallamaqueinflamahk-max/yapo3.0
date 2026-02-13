/**
 * Cliente WebSocket reutilizable.
 * - Conecta automáticamente
 * - Reconexión con backoff si se corta
 * - emit(event, data) / on(event, callback)
 * - Compatible localhost / Vercel / ngrok (NEXT_PUBLIC_WS_URL)
 */

export type WebSocketStatus = "closed" | "connecting" | "open" | "error";

const DEFAULT_RECONNECT_INTERVAL_MS = 1000;
const MAX_RECONNECT_INTERVAL_MS = 30_000;
const MAX_RECONNECT_ATTEMPTS = 0; // 0 = infinito

/**
 * Resuelve la URL WebSocket según entorno.
 * - NEXT_PUBLIC_WS_URL: si existe, se usa (https→wss, http→ws).
 * - localhost/127.0.0.1: ws://localhost:3001 (o el puerto que uses).
 * - Vercel/ngrok: usar NEXT_PUBLIC_WS_URL con wss en producción.
 */
export function getWebSocketUrl(fallbackPort = 3001): string {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_WS_URL?.trim()?.replace(/^https/, "wss").replace(/^http/, "ws")
      ?? `ws://localhost:${fallbackPort}`;
  }
  const env = process.env.NEXT_PUBLIC_WS_URL?.trim();
  if (env) {
    if (env.startsWith("https")) return env.replace(/^https/, "wss");
    if (env.startsWith("http")) return env.replace(/^http/, "ws");
    return env;
  }
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return `ws://localhost:${fallbackPort}`;
  }
  // Vercel / producción: sin env no hay URL por defecto
  return "";
}

export interface WebSocketClientOptions {
  /** URL del WebSocket. Si no se pasa, se usa getWebSocketUrl(). */
  url?: string;
  /** Conectar al crear (default true). */
  autoConnect?: boolean;
  /** Reconectar si se cierra o falla (default true). */
  reconnect?: boolean;
  /** Intervalo inicial de reconexión en ms (default 1000). */
  reconnectIntervalMs?: number;
  /** Máximo intervalo de reconexión en ms (default 30000). */
  maxReconnectIntervalMs?: number;
  /** Máximo de intentos de reconexión (0 = infinito, default 0). */
  maxReconnectAttempts?: number;
  /** Callback al abrir. */
  onOpen?: () => void;
  /** Callback al cerrar. */
  onClose?: (event?: CloseEvent) => void;
  /** Callback al error. */
  onError?: (event: Event) => void;
  /** Callback al cambiar estado. */
  onStatusChange?: (status: WebSocketStatus) => void;
}

export interface WebSocketClientHandle {
  connect(): Promise<void>;
  disconnect(): void;
  /** Envía un evento (type + payload). El servidor recibe { type, payload }. */
  emit(event: string, data?: unknown): void;
  /** Envía un objeto crudo (para backends que esperan { type, roomId, text } etc.). */
  send(payload: unknown): void;
  /** Suscribe a un evento. Devuelve función para desuscribir. */
  on(event: string, callback: (data: unknown) => void): () => void;
  /** Quita listeners de un evento (o todos si no se pasa callback). */
  off(event: string, callback?: (data: unknown) => void): void;
  readonly status: WebSocketStatus;
  readonly url: string;
}

type Listener = (data: unknown) => void;

export function createWebSocketClient(options: WebSocketClientOptions = {}): WebSocketClientHandle {
  const {
    url: urlOption,
    autoConnect = true,
    reconnect: reconnectEnabled = true,
    reconnectIntervalMs = DEFAULT_RECONNECT_INTERVAL_MS,
    maxReconnectIntervalMs = MAX_RECONNECT_INTERVAL_MS,
    maxReconnectAttempts = MAX_RECONNECT_ATTEMPTS,
    onOpen,
    onClose,
    onError,
    onStatusChange,
  } = options;

  const url = urlOption?.trim() || getWebSocketUrl();
  const eventListeners = new Map<string, Set<Listener>>();
  let ws: WebSocket | null = null;
  let status: WebSocketStatus = "closed";
  let reconnectAttempts = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let intentionalClose = false;

  function setStatus(next: WebSocketStatus): void {
    if (next === status) return;
    status = next;
    onStatusChange?.(next);
  }

  function clearReconnectTimer(): void {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }

  function scheduleReconnect(): void {
    if (!reconnectEnabled || intentionalClose) return;
    if (maxReconnectAttempts > 0 && reconnectAttempts >= maxReconnectAttempts) return;
    clearReconnectTimer();
    const delay = Math.min(
      reconnectIntervalMs * Math.pow(2, reconnectAttempts),
      maxReconnectIntervalMs
    );
    reconnectAttempts += 1;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect().catch(() => {});
    }, delay);
  }

  function dispatch(eventName: string, data: unknown): void {
    const listeners = eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error("[WebSocket] listener error:", err);
        }
      });
    }
    const anyListeners = eventListeners.get("*");
    if (anyListeners) {
      anyListeners.forEach((cb) => {
        try {
          cb({ event: eventName, data });
        } catch (err) {
          console.error("[WebSocket] listener error:", err);
        }
      });
    }
  }

  function connect(): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve();
    if (!url) return Promise.reject(new Error("WebSocket URL no configurada (NEXT_PUBLIC_WS_URL)"));
    if (ws?.readyState === WebSocket.OPEN) return Promise.resolve();
    intentionalClose = false;
    if (ws) {
      ws.close();
      ws = null;
    }
    setStatus("connecting");
    return new Promise((resolve, reject) => {
      try {
        ws = new WebSocket(url);
        ws.onopen = () => {
          reconnectAttempts = 0;
          setStatus("open");
          onOpen?.();
          resolve();
        };
        ws.onclose = (event) => {
          ws = null;
          setStatus("closed");
          onClose?.(event);
          if (!intentionalClose) scheduleReconnect();
        };
        ws.onerror = (event) => {
          setStatus("error");
          onError?.(event);
          reject(event);
        };
        ws.onmessage = (event) => {
          try {
            const raw = typeof event.data === "string" ? event.data : "";
            const parsed = raw ? JSON.parse(raw) : {};
            const eventName = parsed.type ?? parsed.event ?? "message";
            const data = parsed.payload ?? parsed.data ?? parsed;
            dispatch(eventName, data);
          } catch {
            dispatch("message", event.data);
          }
        };
      } catch (err) {
        setStatus("closed");
        reject(err);
      }
    });
  }

  function disconnect(): void {
    intentionalClose = true;
    clearReconnectTimer();
    if (ws) {
      ws.close();
      ws = null;
    }
    setStatus("closed");
    onClose?.();
  }

  function emit(eventName: string, data?: unknown): void {
    if (ws?.readyState !== WebSocket.OPEN) return;
    const payload = JSON.stringify({ type: eventName, payload: data });
    ws.send(payload);
  }

  function send(payload: unknown): void {
    if (ws?.readyState !== WebSocket.OPEN) return;
    const raw = typeof payload === "string" ? payload : JSON.stringify(payload);
    ws.send(raw);
  }

  function on(eventName: string, callback: (data: unknown) => void): () => void {
    let set = eventListeners.get(eventName);
    if (!set) {
      set = new Set();
      eventListeners.set(eventName, set);
    }
    set.add(callback);
    return () => off(eventName, callback);
  }

  function off(eventName: string, callback?: (data: unknown) => void): void {
    if (!callback) {
      eventListeners.delete(eventName);
      return;
    }
    const set = eventListeners.get(eventName);
    if (set) {
      set.delete(callback);
      if (set.size === 0) eventListeners.delete(eventName);
    }
  }

  const handle: WebSocketClientHandle = {
    connect,
    disconnect,
    emit,
    send,
    on,
    off,
    get status() {
      if (ws) {
        if (ws.readyState === WebSocket.OPEN) return "open";
        if (ws.readyState === WebSocket.CONNECTING) return "connecting";
      }
      return status;
    },
    get url() {
      return url;
    },
  };

  if (autoConnect && url && typeof window !== "undefined") {
    connect().catch(() => {});
  }

  return handle;
}
