"use client";

import GroupChat from "../GroupChat";

/**
 * Ruta: /chat/group?roomId=xxx&name=NombreGrupo
 * Chat grupal conectado a WebSocket (NEXT_PUBLIC_WS_URL).
 */
export default function GroupChatPage() {
  return <GroupChat />;
}
