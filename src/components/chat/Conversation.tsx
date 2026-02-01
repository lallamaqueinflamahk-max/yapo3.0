"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/lib/chat";
import type { PresenceStatus } from "@/lib/chat";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import OnlineStatus from "./OnlineStatus";

interface ConversationProps {
  roomId: string;
  roomName: string;
  roomType: "private" | "group";
  messages: Message[];
  presence: Record<string, PresenceStatus>;
  currentUserId: string;
  onSend: (text: string) => void;
  onTyping: (isTyping: boolean) => void;
  onBack: () => void;
  connected: boolean;
}

export default function Conversation({
  roomId,
  roomName,
  messages,
  presence,
  currentUserId,
  onSend,
  onTyping,
  onBack,
  connected,
}: ConversationProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const otherOnline = Object.entries(presence).filter(
    ([id, s]) => id !== currentUserId && s === "online"
  );
  const otherTyping = Object.entries(presence).filter(
    ([id, s]) => id !== currentUserId && s === "typing"
  );
  const statusForHeader: PresenceStatus =
    otherTyping.length > 0 ? "typing" : otherOnline.length > 0 ? "online" : "offline";

  return (
    <div className="flex h-full flex-col bg-yapo-white">
      <header className="flex shrink-0 items-center gap-3 border-b border-yapo-blue/20 bg-yapo-white px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-yapo-blue active:bg-yapo-blue/10"
          aria-label="Volver"
        >
          <BackIcon className="h-6 w-6" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold text-foreground">
            {roomName}
          </h1>
          <OnlineStatus status={statusForHeader} />
        </div>
      </header>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4"
        role="log"
        aria-label="Mensajes"
      >
        <div className="flex flex-col gap-2">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.userId === currentUserId}
            />
          ))}
        </div>
        {otherTyping.length > 0 && <TypingIndicator />}
      </div>

      <MessageInput
        onSend={onSend}
        onTyping={onTyping}
        disabled={!connected}
        placeholder="Escribí un mensaje..."
      />
    </div>
  );
}

function BackIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}
