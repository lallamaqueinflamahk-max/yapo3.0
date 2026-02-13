/**
 * Tipos de eventos que el servidor solo reenvía.
 * No decide nada; solo forward.
 */
export type WsEventType = "auth" | "auth_ok" | "join_room" | "leave_room" | "room_joined" | "chat_message" | "wallet_event" | "video_offer" | "video_answer" | "video_ice" | "video_leave";
export interface WsMessage {
    type: string;
    roomId?: string;
    userId?: string;
    toUserId?: string;
    fromUserId?: string;
    payload?: unknown;
    [key: string]: unknown;
}
export interface ForwardPayload {
    type: WsEventType;
    roomId?: string;
    toUserId?: string;
    fromUserId?: string;
    payload?: unknown;
    [key: string]: unknown;
}
//# sourceMappingURL=types.d.ts.map