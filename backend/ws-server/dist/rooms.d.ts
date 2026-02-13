/**
 * Rooms por usuario y por grupo.
 * - user rooms: userId -> Set<WebSocket> (un usuario puede tener varias conexiones)
 * - group rooms: roomId -> Set<userId> (miembros del room)
 * El servidor solo reenvía; no decide.
 */
import type { WebSocket } from "ws";
export interface RoomStore {
    /** userId -> Set<WebSocket> */
    userSockets: Map<string, Set<WebSocket>>;
    /** WebSocket -> userId */
    socketToUser: Map<WebSocket, string>;
    /** roomId -> Set<userId> */
    roomMembers: Map<string, Set<string>>;
}
export declare function createStore(): RoomStore;
export declare function joinUser(ws: WebSocket, userId: string, store: RoomStore): void;
export declare function joinRoom(userId: string, roomId: string, store: RoomStore): void;
export declare function leaveRoom(userId: string, roomId: string, store: RoomStore): void;
export declare function removeClient(ws: WebSocket, store: RoomStore): void;
export declare function getUserId(ws: WebSocket, store: RoomStore): string | null;
/** Sockets de un usuario (puede haber varios). */
export declare function getSocketsForUser(userId: string, store: RoomStore): Set<WebSocket>;
/** UserIds en un room. */
export declare function getMembersOfRoom(roomId: string, store: RoomStore): Set<string>;
//# sourceMappingURL=rooms.d.ts.map