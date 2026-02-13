"use client";

import type { Message } from "@/lib/chat";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div
      className={`flex w-full ${isOwn ? "justify-end" : "justify-start"}`}
      role="listitem"
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2 ${
          isOwn
            ? "rounded-br-md bg-yapo-blue text-yapo-white"
            : "rounded-bl-md bg-yapo-blue/10 text-foreground"
        }`}
      >
        {!isOwn && (
          <p className="mb-0.5 text-xs font-medium text-yapo-blue/80">
            {message.userName}
          </p>
        )}
        <p className="text-sm leading-snug">{message.text}</p>
        <p
          className={`mt-1 text-[10px] ${isOwn ? "text-yapo-white/80" : "text-yapo-blue/60"}`}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
