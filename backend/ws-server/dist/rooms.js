/**
 * Rooms por usuario y por grupo.
 * - user rooms: userId -> Set<WebSocket> (un usuario puede tener varias conexiones)
 * - group rooms: roomId -> Set<userId> (miembros del room)
 * El servidor solo reenvía; no decide.
 */
export function createStore() {
    return {
        userSockets: new Map(),
        socketToUser: new Map(),
        roomMembers: new Map(),
    };
}
export function joinUser(ws, userId, store) {
    const id = (userId ?? "").toString().trim();
    if (!id)
        return;
    store.socketToUser.set(ws, id);
    if (!store.userSockets.has(id)) {
        store.userSockets.set(id, new Set());
    }
    store.userSockets.get(id).add(ws);
}
export function joinRoom(userId, roomId, store) {
    const uid = (userId ?? "").toString().trim();
    const rid = (roomId ?? "").toString().trim();
    if (!uid || !rid)
        return;
    if (!store.roomMembers.has(rid)) {
        store.roomMembers.set(rid, new Set());
    }
    store.roomMembers.get(rid).add(uid);
}
export function leaveRoom(userId, roomId, store) {
    const rid = (roomId ?? "").toString().trim();
    if (!rid)
        return;
    const members = store.roomMembers.get(rid);
    if (members && userId)
        members.delete((userId ?? "").toString().trim());
}
export function removeClient(ws, store) {
    const userId = store.socketToUser.get(ws);
    store.socketToUser.delete(ws);
    if (userId) {
        const set = store.userSockets.get(userId);
        if (set) {
            set.delete(ws);
            if (set.size === 0)
                store.userSockets.delete(userId);
        }
        store.roomMembers.forEach((members) => members.delete(userId));
    }
}
export function getUserId(ws, store) {
    return store.socketToUser.get(ws) ?? null;
}
/** Sockets de un usuario (puede haber varios). */
export function getSocketsForUser(userId, store) {
    return store.userSockets.get((userId ?? "").toString().trim()) ?? new Set();
}
/** UserIds en un room. */
export function getMembersOfRoom(roomId, store) {
    return store.roomMembers.get((roomId ?? "").toString().trim()) ?? new Set();
}
//# sourceMappingURL=rooms.js.map