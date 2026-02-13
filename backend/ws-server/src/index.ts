/**
 * Servidor WebSocket: chat + signaling WebRTC.
 * Reenvía mensajes por sala (roomId) o por usuario (toUserId/targetUserId).
 * Sin persistencia. Preparado para producción: health, graceful shutdown, CORS.
 * Variables de entorno: WS_PORT, PORT, CORS_ORIGINS.
 */

import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import {
  createStore,
  joinUser,
  joinRoom,
  leaveRoom,
  removeClient,
  getUserId,
  getRoomsForUser,
} from "./rooms.js";
import { send, forward } from "./forward.js";
import type { RoomStore } from "./rooms.js";
import type { WsMessage } from "./types.js";

const WS_PORT = Number(process.env.WS_PORT || process.env.PORT) || 3001;
const CORS_ORIGINS = (process.env.CORS_ORIGINS ?? process.env.CORS ?? "*")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

function isOriginAllowed(origin: string | undefined): boolean {
  if (CORS_ORIGINS.length === 0 || CORS_ORIGINS.includes("*")) return true;
  if (!origin) return true;
  return CORS_ORIGINS.some((allowed) => allowed === origin || origin.startsWith(allowed));
}

function onConnection(ws: WebSocket, store: RoomStore): void {
  if (process.env.NODE_ENV !== "production") {
    console.log("[ws] connection");
  }

  ws.on("message", (raw: Buffer | string) => {
    try {
      const data = JSON.parse(raw.toString()) as WsMessage;
      route(ws, store, data);
    } catch {
      if (process.env.NODE_ENV !== "production") {
        console.log("[ws] invalid JSON");
      }
    }
  });

  ws.on("close", () => {
    removeClient(ws, store);
  });

  ws.on("error", () => {
    removeClient(ws, store);
  });
}

function route(ws: WebSocket, store: RoomStore, data: WsMessage): void {
  if (typeof data !== "object" || data === null) return;
  const type = String(data.type ?? "").trim();
  const payload = (data.payload ?? data) as Record<string, unknown>;

  switch (type) {
    case "auth": {
      const userId = (payload.userId as string)?.trim();
      const userName = (payload.userName as string)?.trim();
      if (userId) {
        joinUser(ws, userId, store, userName || undefined);
        send(ws, { type: "auth_ok", userId });
      }
      break;
    }
    case "get_rooms": {
      const userId = getUserId(ws, store);
      if (userId) {
        const rooms = getRoomsForUser(userId, store).map((id) => ({ id, name: id, type: "private" }));
        send(ws, { type: "rooms", rooms });
      }
      break;
    }
    case "join_room": {
      const userId = getUserId(ws, store);
      const roomId = (payload.roomId as string)?.trim();
      if (userId && roomId) {
        joinRoom(userId, roomId, store);
        send(ws, { type: "room_joined", roomId });
      }
      break;
    }
    case "leave_room": {
      const userId = getUserId(ws, store);
      const roomId = (payload.roomId as string)?.trim();
      if (userId && roomId) leaveRoom(userId, roomId, store);
      break;
    }
    case "video_join": {
      const userId = getUserId(ws, store);
      const roomId = (payload.roomId as string)?.trim();
      if (userId && roomId) {
        joinRoom(userId, roomId, store);
        send(ws, { type: "room_joined", roomId });
      }
      forward(ws, store, type, payload);
      break;
    }
    case "video_leave": {
      const userId = getUserId(ws, store);
      const roomId = (payload.roomId as string)?.trim();
      if (userId && roomId) leaveRoom(userId, roomId, store);
      forward(ws, store, type, payload);
      break;
    }
    case "chat_message":
    case "user_online":
    case "user_typing":
    case "typing":
    case "wallet_event":
    case "video_offer":
    case "video_answer":
    case "video_ice":
      forward(ws, store, type, payload);
      break;
    default:
      if (type && process.env.NODE_ENV !== "production") {
        console.log("[ws] unknown type=%s", type);
      }
  }
}

function closeAllClients(wss: WebSocketServer): void {
  wss.clients.forEach((ws: WebSocket) => {
    if (ws.readyState === ws.OPEN) ws.close(1000, "Server shutdown");
  });
}

export function startServer(port: number = WS_PORT): { wss: WebSocketServer; server: ReturnType<typeof createServer> } {
  const store = createStore();
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws: WebSocket) => {
    onConnection(ws, store);
  });

  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const url = req.url ?? "";
    if (req.method === "GET" && (url === "/health" || url === "/healthz" || url === "/ready")) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, service: "yapo-ws" }));
      return;
    }
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("YAPÓ WS Server");
  });

  server.on("upgrade", (req: IncomingMessage, socket, head: Buffer) => {
    if (!isOriginAllowed(req.headers.origin)) {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  server.listen(port, () => {
    console.log("[ws] listening on port %s (CORS: %s)", port, CORS_ORIGINS.join(",") || "*");
  });

  function shutdown(signal: string): void {
    console.log("[ws] %s received, closing server", signal);
    closeAllClients(wss);
    server.close(() => {
      console.log("[ws] server closed");
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  return { wss, server };
}

const isMain = typeof process !== "undefined" && process.argv[1]?.endsWith("index.js");
if (isMain) {
  startServer(WS_PORT);
}
