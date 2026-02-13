/**
 * Servidor WebSocket independiente: Chat, eventos Cerebro, signaling WebRTC.
 * Solo reenvía eventos; no decide nada.
 * Variables de entorno: WS_PORT, CORS_ORIGINS (orígenes permitidos).
 */
import { WebSocketServer } from "ws";
export declare function startServer(port?: number): WebSocketServer;
//# sourceMappingURL=index.d.ts.map