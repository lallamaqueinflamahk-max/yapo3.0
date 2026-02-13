"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useChat, useMessages, usePresence } from "@/lib/chat";
import type { Message } from "@/lib/chat";
import ChatWhatsAppUI from "@/components/chat/ChatWhatsAppUI";

const FALLBACK_USER_ID = "user-default";
const FALLBACK_OTHER_ID = "user-other";

/** Mock messages para demo cuando no hay datos reales (1-1). */
function getMockMessages(roomId: string, currentUserId: string, otherName: string): Message[] {
  return [
    {
      id: "mock-1",
      roomId,
      userId: FALLBACK_OTHER_ID,
      userName: otherName,
      text: "Hola, ¿cómo estás?",
      createdAt: new Date(Date.now() - 60_000).toISOString(),
    },
    {
      id: "mock-2",
      roomId,
      userId: currentUserId,
      userName: "Vos",
      text: "Bien, ¿y vos?",
      createdAt: new Date(Date.now() - 45_000).toISOString(),
    },
    {
      id: "mock-3",
      roomId,
      userId: FALLBACK_OTHER_ID,
      userName: otherName,
      text: "Acá trabajando. ¿Querés coordinar para mañana?",
      createdAt: new Date(Date.now() - 30_000).toISOString(),
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
 * Chat privado 1-1. Conecta a WebSocket (NEXT_PUBLIC_WS_URL).
 * Mensajes mock cuando no hay datos reales. Estados online / escribiendo.
 */
export default function PrivateChat() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const withUserId = searchParams.get("with") || FALLBACK_OTHER_ID;
  const otherName = searchParams.get("name") || "Contacto";

  const [user] = useState(getStoredUser);
  const { id: currentUserId, name: currentUserName } = user;

  const roomId = useMemo(() => {
    const a = currentUserId;
    const b = withUserId;
    return a < b ? `private-${a}-${b}` : `private-${b}-${a}`;
  }, [currentUserId, withUserId]);

  const roomName = otherName;
  const roomType = "private" as const;

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
  } = useChat(currentUserId, currentUserName);

  const messagesFromWs = useMessages(roomId, messagesByRoom);
  const presence = usePresence(roomId, presenceByRoom);
  const isSomeoneTyping = Object.values(presence).some((s) => s === "typing");
  const typingUserName = Object.entries(presence).find(([, s]) => s === "typing")?.[0] || undefined;

  const messages = useMemo(() => {
    if (messagesFromWs.length > 0) return messagesFromWs;
    return getMockMessages(roomId, currentUserId, otherName);
  }, [messagesFromWs.length, roomId, currentUserId, otherName, messagesFromWs]);

  useEffect(() => {
    joinRoom(roomId, roomName, roomType);
    return () => leaveRoom(roomId);
  }, [roomId, roomName, roomType, joinRoom, leaveRoom]);

  const handleSend = useCallback(
    (text: string) => {
      sendMessage(roomId, text);
    },
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
