"use client";

import { useState, useCallback, useEffect } from "react";
import { useChat, useMessages, usePresence } from "@/lib/chat";
import type { Room } from "@/lib/chat";
import RoomList from "./RoomList";
import Conversation from "./Conversation";
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
    <div className="flex h-[calc(100dvh-7rem)] flex-col overflow-hidden bg-yapo-white">
      {selectedRoom ? (
        <Conversation
          roomId={selectedRoom.id}
          roomName={selectedRoom.name}
          roomType={selectedRoom.type}
          messages={messages}
          presence={presence}
          currentUserId={userId}
          onSend={handleSend}
          onTyping={handleTyping}
          onBack={handleBack}
          connected={connected}
        />
      ) : (
        <>
          <header className="flex shrink-0 items-center justify-between border-b border-yapo-blue/20 bg-yapo-white px-4 py-3">
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
                  className="mt-2 rounded-xl bg-yapo-blue px-4 py-2 text-sm font-medium text-yapo-white active:scale-95"
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
          </div>
        </>
      )}
    </div>
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
