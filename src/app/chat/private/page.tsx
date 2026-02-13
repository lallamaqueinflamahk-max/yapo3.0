"use client";

import PrivateChat from "../PrivateChat";

/**
 * Ruta: /chat/private?with=userId&name=Nombre
 * Chat 1-1 conectado a WebSocket (NEXT_PUBLIC_WS_URL).
 */
export default function PrivateChatPage() {
  return <PrivateChat />;
}
