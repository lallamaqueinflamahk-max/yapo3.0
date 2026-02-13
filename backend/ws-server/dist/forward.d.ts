/**
 * Reenvío de eventos. El servidor NO decide nada; solo reenvía.
 * chat_message, wallet_event, video_offer, video_answer, video_ice.
 */
import type { WebSocket } from "ws";
import type { RoomStore } from "./rooms.js";
export declare function send(ws: WebSocket, data: object): void;
/**
 * Reenvía el mensaje al roomId (todos los miembros del room excepto opcionalmente el sender).
 */
export declare function forwardToRoom(store: RoomStore, roomId: string, message: object, excludeUserId?: string | null): void;
/**
 * Reenvía el mensaje a un usuario concreto (toUserId).
 */
export declare function forwardToUser(store: RoomStore, toUserId: string, message: object): void;
/**
 * Enruta y reenvía según tipo de evento.
 * - chat_message, wallet_event: reenvío a roomId.
 * - video_offer, video_answer, video_ice: reenvío a toUserId si existe, si no a roomId.
 */
export declare function forward(ws: WebSocket, store: RoomStore, type: string, payload: Record<string, unknown>): void;
//# sourceMappingURL=forward.d.ts.map