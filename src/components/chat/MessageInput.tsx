"use client";

import { useState, useRef, useCallback } from "react";

interface MessageInputProps {
  onSend: (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function MessageInput({
  onSend,
  onTyping,
  disabled = false,
  placeholder = "Escribí un mensaje...",
}: MessageInputProps) {
  const [text, setText] = useState("");
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTypingTimeout = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);
    if (onTyping) {
      onTyping(true);
      clearTypingTimeout();
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
        typingTimeoutRef.current = null;
      }, 1500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    clearTypingTimeout();
    onTyping?.(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 border-t border-yapo-blue/20 bg-yapo-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      role="search"
    >
      <input
        type="text"
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className="min-h-[44px] flex-1 rounded-xl border-2 border-yapo-blue/30 bg-yapo-white px-4 text-base text-foreground placeholder:text-yapo-blue/50 focus:border-yapo-blue focus:outline-none focus:ring-2 focus:ring-yapo-blue/20"
        aria-label="Mensaje"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="btn-interactive flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-yapo-cta font-semibold text-yapo-white shadow-md border-2 border-yapo-cta-hover/50 hover:bg-yapo-cta-hover disabled:opacity-50"
        aria-label="Enviar"
      >
        <SendIcon className="h-5 w-5" />
      </button>
    </form>
  );
}

function SendIcon({ className }: { className?: string }) {
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
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}
