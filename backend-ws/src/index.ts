import { pathToFileURL } from "node:url";
import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";
import { handleAuth, removeClient, type Store } from "./auth.js";
import { handleChatJoin, handleChatMessage, handleTyping } from "./chat.js";
import {
  handleVideoJoin,
  handleVideoOffer,
  handleVideoAnswer,
  handleVideoIce,
  handleVideoLeave,
} from "./signaling.js";

const PORT = 3001;

function createStore(): Store {
  return {
    clients: new Map(),
    socketToUserId: new Map(),
    chatRooms: new Map(),
    videoRooms: new Map(),
  };
}

function route(ws: WebSocket, data: unknown, store: Store): void {
  if (typeof data !== "object" || data === null) return;
  const obj = data as Record<string, unknown>;
  const type = String(obj.type ?? "").trim();
  const payload = (obj.payload ?? obj) as Record<string, unknown>;

  switch (type) {
    case "auth":
      handleAuth(ws, payload as { userId?: string }, store);
      break;
    case "join_room":
    case "chat_join":
      handleChatJoin(ws, payload as { roomId?: string }, store);
      break;
    case "message":
    case "chat_message":
      handleChatMessage(ws, payload as { roomId?: string; message?: string; text?: string }, store);
      break;
    case "typing":
      handleTyping(ws, payload as { roomId?: string; isTyping?: boolean }, store);
      break;
    case "video_join":
      handleVideoJoin(ws, payload as { roomId?: string; userId?: string; userName?: string }, store);
      break;
    case "video_offer":
      handleVideoOffer(ws, payload as { roomId?: string; fromUserId?: string; toUserId?: string; payload?: unknown }, store);
      break;
    case "video_answer":
      handleVideoAnswer(ws, payload as { roomId?: string; fromUserId?: string; toUserId?: string; payload?: unknown }, store);
      break;
    case "video_ice":
      handleVideoIce(ws, payload as { roomId?: string; fromUserId?: string; toUserId?: string; payload?: unknown }, store);
      break;
    case "video_leave":
      handleVideoLeave(ws, payload as { roomId?: string; userId?: string }, store);
      break;
    default:
      if (type) console.log("[ws] unknown type=%s", type);
  }
}

export function startServer(port: number = PORT): WebSocketServer {
  const store = createStore();
  const wss = new WebSocketServer({ port });

  wss.on("connection", (ws: WebSocket) => {
    console.log("[ws] connection");

    ws.on("message", (raw) => {
      try {
        const data = JSON.parse(raw.toString());
        route(ws, data, store);
      } catch {
        console.log("[ws] invalid JSON");
      }
    });

    ws.on("close", () => {
      removeClient(ws, store);
    });

    ws.on("error", () => {
      removeClient(ws, store);
    });
  });

  wss.on("listening", () => {
    console.log("[ws] listening on port %s", port);
  });

  return wss;
}

const isEntry = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isEntry) startServer();
