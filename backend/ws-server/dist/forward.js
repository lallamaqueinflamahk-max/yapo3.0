/**
 * Reenvío de eventos. El servidor NO decide nada; solo reenvía.
 * chat_message, wallet_event, video_offer, video_answer, video_ice.
 */
import { getUserId, getSocketsForUser, getMembersOfRoom } from "./rooms.js";
const FORWARD_TYPES = new Set([
    "chat_message",
    "wallet_event",
    "video_offer",
    "video_answer",
    "video_ice",
]);
export function send(ws, data) {
    if (ws.readyState !== 1)
        return;
    ws.send(JSON.stringify(data));
}
/**
 * Reenvía el mensaje al roomId (todos los miembros del room excepto opcionalmente el sender).
 */
export function forwardToRoom(store, roomId, message, excludeUserId) {
    const members = getMembersOfRoom(roomId, store);
    members.forEach((userId) => {
        if (excludeUserId && userId === excludeUserId)
            return;
        getSocketsForUser(userId, store).forEach((ws) => send(ws, message));
    });
}
/**
 * Reenvía el mensaje a un usuario concreto (toUserId).
 */
export function forwardToUser(store, toUserId, message) {
    getSocketsForUser(toUserId, store).forEach((ws) => send(ws, message));
}
/**
 * Enruta y reenvía según tipo de evento.
 * - chat_message, wallet_event: reenvío a roomId.
 * - video_offer, video_answer, video_ice: reenvío a toUserId si existe, si no a roomId.
 */
export function forward(ws, store, type, payload) {
    if (!FORWARD_TYPES.has(type))
        return;
    const fromUserId = getUserId(ws, store) ?? payload.fromUserId;
    const roomId = payload.roomId?.trim();
    const toUserId = payload.toUserId?.trim();
    const message = { type, ...payload, fromUserId };
    if (toUserId && ["video_offer", "video_answer", "video_ice"].includes(type)) {
        forwardToUser(store, toUserId, message);
        return;
    }
    if (roomId) {
        forwardToRoom(store, roomId, message, fromUserId ?? undefined);
    }
}
//# sourceMappingURL=forward.js.map