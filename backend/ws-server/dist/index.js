/**
 * Servidor WebSocket independiente: Chat, eventos Cerebro, signaling WebRTC.
 * Solo reenvía eventos; no decide nada.
 * Variables de entorno: WS_PORT, CORS_ORIGINS (orígenes permitidos).
 */
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { createStore, joinUser, joinRoom, leaveRoom, removeClient, getUserId } from "./rooms.js";
import { send, forward } from "./forward.js";
const WS_PORT = Number(process.env.WS_PORT) || 3001;
const CORS_ORIGINS = (process.env.CORS_ORIGINS ?? process.env.CORS ?? "*")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
function isOriginAllowed(origin) {
    if (CORS_ORIGINS.length === 0 || CORS_ORIGINS.includes("*"))
        return true;
    if (!origin)
        return true;
    return CORS_ORIGINS.some((allowed) => allowed === origin || origin.startsWith(allowed));
}
function onConnection(ws, store) {
    console.log("[ws] connection");
    ws.on("message", (raw) => {
        try {
            const data = JSON.parse(raw.toString());
            route(ws, store, data);
        }
        catch {
            console.log("[ws] invalid JSON");
        }
    });
    ws.on("close", () => {
        removeClient(ws, store);
    });
    ws.on("error", () => {
        removeClient(ws, store);
    });
}
function route(ws, store, data) {
    if (typeof data !== "object" || data === null)
        return;
    const type = String(data.type ?? "").trim();
    const payload = (data.payload ?? data);
    switch (type) {
        case "auth": {
            const userId = payload.userId?.trim();
            if (userId) {
                joinUser(ws, userId, store);
                send(ws, { type: "auth_ok", userId });
            }
            break;
        }
        case "join_room": {
            const userId = getUserId(ws, store);
            const roomId = payload.roomId?.trim();
            if (userId && roomId) {
                joinRoom(userId, roomId, store);
                send(ws, { type: "room_joined", roomId });
            }
            break;
        }
        case "leave_room": {
            const userId = getUserId(ws, store);
            const roomId = payload.roomId?.trim();
            if (userId && roomId)
                leaveRoom(userId, roomId, store);
            break;
        }
        case "chat_message":
        case "wallet_event":
        case "video_offer":
        case "video_answer":
        case "video_ice":
            forward(ws, store, type, payload);
            break;
        default:
            if (type)
                console.log("[ws] unknown type=%s", type);
    }
}
export function startServer(port = WS_PORT) {
    const store = createStore();
    const wss = new WebSocketServer({ noServer: true });
    wss.on("connection", (ws) => {
        onConnection(ws, store);
    });
    const server = createServer((_req, res) => {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("YAPÓ WS Server");
    });
    server.on("upgrade", (req, socket, head) => {
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
    return wss;
}
const isMain = typeof process !== "undefined" && process.argv[1]?.endsWith("index.js");
if (isMain) {
    startServer(WS_PORT);
}
//# sourceMappingURL=index.js.map