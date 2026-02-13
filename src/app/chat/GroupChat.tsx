"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useChat, useMessages, usePresence } from "@/lib/chat";
import type { Message } from "@/lib/chat";
import type { YapoPerfil } from "@/types/yapo-perfil";
import { YAPO_PERFILES_MOCK } from "@/data/yapo-perfiles-mock";
import ChatWhatsAppUI from "@/components/chat/ChatWhatsAppUI";

const FALLBACK_USER_ID = "user-default";
const DEFAULT_GROUP_ID = "group-demo";
const DEFAULT_GROUP_NAME = "Equipo YAPÓ";

/** Mock messages para demo cuando no hay datos reales (grupal). Incluye hilo tipo YAPÓ-Community: cliente pide servicio y profesional responde con tarjeta. */
function getMockGroupMessages(roomId: string, currentUserId: string): Message[] {
  return [
    {
      id: "gm-1",
      roomId,
      userId: "user-cliente",
      userName: "Cliente",
      text: "Busco electricista urgente en Sajonia",
      createdAt: new Date(Date.now() - 120_000).toISOString(),
    },
    {
      id: "gm-2",
      roomId,
      userId: "user-b",
      userName: "María González",
      text: "Hola, puedo ir hoy. Presupuesto: 180.000 Gs por instalación + materiales a parte.",
      createdAt: new Date(Date.now() - 90_000).toISOString(),
      attachedPerfilId: "PY-204851",
    },
    {
      id: "gm-3",
      roomId,
      userId: currentUserId,
      userName: "Vos",
      text: "Sí, en 10 min tengo los números.",
      createdAt: new Date(Date.now() - 60_000).toISOString(),
    },
    {
      id: "gm-4",
      roomId,
      userId: "user-a",
      userName: "Carlos R.",
      text: "Yo también estoy por Pitiantuta, 150.000 Gs mano de obra. Ver mi perfil.",
      createdAt: new Date(Date.now() - 45_000).toISOString(),
      attachedPerfilId: "PY-102938",
    },
  ];
}

function getStoredUser(): { id: string; name: string } {
  if (typeof window === "undefined") return { id: FALLBACK_USER_ID, name: "Usuario" };
  const id = localStorage.getItem("yapo_chat_user_id") ?? "user-" + Math.random().toString(36).slice(2, 11);
  if (!localStorage.getItem("yapo_chat_user_id")) localStorage.setItem("yapo_chat_user_id", id);
  return { id, name: localStorage.getItem("yapo_chat_user_name") || "Usuario" };
}

/**
 * Chat grupal. Conecta a WebSocket (NEXT_PUBLIC_WS_URL).
 * Mensajes mock cuando no hay datos reales. Estados online / escribiendo.
 */
export default function GroupChat() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId") || DEFAULT_GROUP_ID;
  const roomName = searchParams.get("name") || DEFAULT_GROUP_NAME;

  const [user] = useState(getStoredUser);
  const { id: currentUserId } = user;

  const {
    connected,
    connectionError,
    reconnect,
    joinRoom,
    leaveRoom,
    sendMessage,
    setTyping,
    messagesByRoom,
    presenceByRoom,
  } = useChat(currentUserId, user.name);

  const messagesFromWs = useMessages(roomId, messagesByRoom);
  const presence = usePresence(roomId, presenceByRoom);
  const isSomeoneTyping = Object.values(presence).some((s) => s === "typing");
  const typingUserName = Object.entries(presence).find(([, s]) => s === "typing")?.[0] || undefined;

  const messages = useMemo(() => {
    if (messagesFromWs.length > 0) return messagesFromWs;
    return getMockGroupMessages(roomId, currentUserId);
  }, [messagesFromWs.length, roomId, currentUserId, messagesFromWs]);

  const getPerfilForMessage = useCallback((perfilId: string): YapoPerfil | null => {
    const found = YAPO_PERFILES_MOCK.find((p) => p.perfil_id === perfilId) ?? null;
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chat/GroupChat.tsx:getPerfilForMessage',message:'getPerfilForMessage called',data:{perfilId,found:!!found},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    return found;
  }, []);

  useEffect(() => {
    joinRoom(roomId, roomName, "group");
    return () => leaveRoom(roomId);
  }, [roomId, roomName, joinRoom, leaveRoom]);

  const handleSend = useCallback(
    (text: string) => sendMessage(roomId, text),
    [roomId, sendMessage]
  );
  const handleTyping = useCallback(
    (isTyping: boolean) => setTyping(roomId, isTyping),
    [roomId, setTyping]
  );
  const handleBack = useCallback(() => router.push("/chat"), [router]);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-yapo-white">
      {connectionError && (
        <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-2">
          <p className="text-sm text-amber-800">{connectionError}</p>
          <button
            type="button"
            onClick={reconnect}
            className="mt-1 rounded-lg bg-yapo-blue px-3 py-1.5 text-sm font-medium text-white active:scale-95"
          >
            Reintentar
          </button>
        </div>
      )}
      <div className="flex flex-1 min-h-0 flex-col">
        <ChatWhatsAppUI
          roomId={roomId}
          roomName={roomName}
          messages={messages}
          currentUserId={currentUserId}
          isSomeoneTyping={isSomeoneTyping}
          typingUserName={typingUserName}
          onSendMessage={handleSend}
          onTyping={handleTyping}
          onBack={handleBack}
          disabled={!connected}
          getPerfilForMessage={getPerfilForMessage}
        />
      </div>
      <nav className="shrink-0 border-t border-yapo-blue/20 bg-yapo-white px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 text-sm font-medium text-yapo-blue active:opacity-80"
          >
            ← Volver al listado
          </Link>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 rounded-xl bg-yapo-blue px-4 py-2 text-sm font-semibold text-yapo-white no-underline active:scale-[0.98] active:opacity-90"
          >
            Inicio YAPÓ
          </Link>
        </div>
      </nav>
    </div>
  );
}
