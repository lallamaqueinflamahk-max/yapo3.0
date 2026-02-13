"use client";

import { useRef, useEffect } from "react";
import type { Message } from "@/lib/chat";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

interface ChatRoomProps {
  roomId: string;
  roomName?: string;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
  className?: string;
}

export default function ChatRoom({
  roomId,
  roomName,
  messages,
  currentUserId,
  onSendMessage,
  onTyping,
  className = "",
}: ChatRoomProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {roomName && (
        <header className="shrink-0 border-b border-yapo-blue/20 px-4 py-3">
          <h1 className="text-lg font-semibold text-yapo-blue">{roomName}</h1>
        </header>
      )}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
        role="log"
        aria-label="Mensajes"
      >
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.userId === currentUserId}
          />
        ))}
        {messages.length === 0 && (
          <p className="text-center text-sm text-yapo-blue/50 py-8">
            No hay mensajes. Escribí para empezar.
          </p>
        )}
      </div>
      <div className="shrink-0 border-t border-yapo-blue/20 p-3">
        <ChatInput
          onSend={onSendMessage}
          onTyping={onTyping}
          placeholder="Escribí un mensaje..."
          disabled={!roomId}
        />
      </div>
    </div>
  );
}
