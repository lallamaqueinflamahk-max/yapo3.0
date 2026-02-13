"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useChat, useMessages, usePresence } from "@/lib/chat";
import type { Room } from "@/lib/chat";
import RoomList from "./RoomList";
import Conversation from "./Conversation";
import ChatWhatsAppUI from "./ChatWhatsAppUI";
import CreateRoomForm from "./CreateRoomForm";

const FALLBACK_USER_ID = "user-default";
const FALLBACK_USER_NAME = "Usuario";

function getStoredUser(): { id: string; name: string } {
  if (typeof window === "undefined") {
    return { id: FALLBACK_USER_ID, name: FALLBACK_USER_NAME };
  }
  let id = localStorage.getItem("yapo_chat_user_id");
  if (!id) {
    id = "user-" + Math.random().toString(36).slice(2, 11);
    localStorage.setItem("yapo_chat_user_id", id);
  }
  const name = localStorage.getItem("yapo_chat_user_name") || FALLBACK_USER_NAME;
  return { id, name };
}

export default function ChatLayout() {
  const [user, setUser] = useState({ id: FALLBACK_USER_ID, name: FALLBACK_USER_NAME });
  useEffect(() => {
    setUser(getStoredUser());
  }, []);
  const { id: userId, name: userName } = user;
  const {
    connected,
    connectionError,
    reconnect,
    rooms,
    messagesByRoom,
    presenceByRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    setTyping,
    createRoom,
    refreshRooms,
  } = useChat(userId, userName);

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatLayout.tsx:afterUseChat',message:'ChatLayout after useChat',data:{connected,roomsCount:rooms.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const messages = useMessages(selectedRoom?.id ?? null, messagesByRoom);
  const presence = usePresence(selectedRoom?.id ?? null, presenceByRoom);

  const handleSelectRoom = useCallback((room: Room) => {
    setSelectedRoom(room);
    joinRoom(room.id, room.name, room.type);
  }, [joinRoom]);

  const handleBack = useCallback(() => {
    if (selectedRoom) {
      leaveRoom(selectedRoom.id);
      setSelectedRoom(null);
    }
    setShowCreateForm(false);
  }, [selectedRoom, leaveRoom]);

  const handleSend = useCallback(
    (text: string) => {
      if (selectedRoom) sendMessage(selectedRoom.id, text);
    },
    [selectedRoom, sendMessage]
  );

  const handleTyping = useCallback(
    (isTyping: boolean) => {
      if (selectedRoom) setTyping(selectedRoom.id, isTyping);
    },
    [selectedRoom, setTyping]
  );

  const handleCreateRoom = useCallback(
    (name: string, type: "private" | "group") => {
      const roomId =
        type === "group"
          ? "group-" + Date.now()
          : "private-" + userId + "-" + Date.now();
      createRoom(roomId, name, type);
      setShowCreateForm(false);
      setSelectedRoom({
        id: roomId,
        name,
        type,
        lastMessage: null,
      });
    },
    [createRoom, userId]
  );

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col overflow-hidden bg-yapo-white transition-[height] duration-200 ease-out">
      {selectedRoom ? (
        <ChatWhatsAppUI
          roomId={selectedRoom.id}
          roomName={selectedRoom.name}
          messages={messages}
          currentUserId={userId}
          isSomeoneTyping={Object.values(presence).some((s) => s === "typing")}
          typingUserName={Object.entries(presence).find(([, s]) => s === "typing")?.[0] ? "Alguien" : undefined}
          onSendMessage={handleSend}
          onTyping={handleTyping}
          onBack={handleBack}
          disabled={!connected}
        />
      ) : (
        <>
          <header className="flex shrink-0 items-center justify-between gap-2 border-b border-yapo-blue/20 bg-yapo-white px-4 py-3">
            <Link
              href="/home"
              className="flex items-center gap-2 text-sm font-medium text-yapo-blue active:opacity-80"
              aria-label="Volver a Inicio YAPÓ"
            >
              <BackIcon className="h-5 w-5 shrink-0" />
              <span>Inicio YAPÓ</span>
            </Link>
            <h1 className="text-lg font-semibold text-foreground">Chat</h1>
            <button
              type="button"
              onClick={() => setShowCreateForm((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-yapo-red text-yapo-white active:scale-95 active:opacity-90"
              aria-label="Nueva conversación"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </header>
          {showCreateForm && (
            <CreateRoomForm
              onCreate={handleCreateRoom}
              onCancel={() => setShowCreateForm(false)}
            />
          )}
          <div className="flex-1 overflow-y-auto">
            {connectionError && (
              <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm text-amber-800">
                  {connectionError === "NEXT_PUBLIC_WS_URL no configurada"
                    ? "Chat en producción requiere configurar NEXT_PUBLIC_WS_URL (wss://tu-servidor-chat.com) en Vercel."
                    : "No se pudo conectar al servidor de chat."}
                </p>
                <button
                  type="button"
                  onClick={reconnect}
                  className="mt-2 rounded-xl bg-yapo-blue px-4 py-2 text-sm font-medium text-yapo-white transition-[transform,opacity] duration-150 active:scale-95"
                >
                  Reintentar
                </button>
              </div>
            )}
            <RoomList
              rooms={rooms}
              onSelectRoom={handleSelectRoom}
              connected={connected}
            />
            <div className="border-t border-yapo-blue/10 px-4 py-3">
              <p className="mb-2 text-xs font-medium text-yapo-blue/70">Volver a YAPÓ</p>
              <Link
                href="/home"
                className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-yapo-blue/30 bg-yapo-blue/10 px-4 py-3 text-sm font-semibold text-yapo-blue transition-[transform,background] active:scale-[0.98] active:bg-yapo-blue/20"
              >
                Inicio YAPÓ
              </Link>
              <p className="mb-2 text-xs font-medium text-yapo-blue/70">Acceso directo</p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/chat/private?with=user-other&name=Contacto"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-yapo-blue/30 bg-yapo-blue/5 px-4 py-2 text-sm font-medium text-yapo-blue transition-[transform,background] active:scale-95 active:bg-yapo-blue/10"
                >
                  Chat 1-1
                </a>
                <a
                  href="/chat/group?roomId=group-demo&name=Equipo%20YAPÓ"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-yapo-blue/30 bg-yapo-blue/5 px-4 py-2 text-sm font-medium text-yapo-blue transition-[transform,background] active:scale-95 active:bg-yapo-blue/10"
                >
                  Chat grupal
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function BackIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
