"use client";

import { useState, useRef, useCallback } from "react";

interface ChatInputWhatsAppProps {
  onSend: (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * Input fijo tipo WhatsApp: texto + enviar + botón micrófono (placeholder futuro).
 */
export default function ChatInputWhatsApp({
  onSend,
  onTyping,
  disabled = false,
  placeholder = "Mensaje",
  className = "",
}: ChatInputWhatsAppProps) {
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
      className={`flex min-h-[48px] w-full items-center gap-2 ${className}`}
      role="search"
    >
      <label htmlFor="chat-whatsapp-input" className="sr-only">
        Escribir mensaje
      </label>
      <input
        id="chat-whatsapp-input"
        type="text"
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className="min-h-[44px] min-w-0 flex-1 rounded-2xl border border-black/10 bg-white px-4 text-base text-foreground placeholder:text-black/40 focus:border-[#075e54] focus:outline-none focus:ring-2 focus:ring-[#075e54]/30 disabled:opacity-60"
      />
      <button
        type="button"
        disabled
        aria-label="Micrófono (próximamente)"
        title="Micrófono (próximamente)"
        className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-transparent text-black/40 transition-opacity disabled:cursor-not-allowed"
      >
        <MicIcon className="h-6 w-6" />
      </button>
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        aria-label="Enviar"
        className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-[#075e54] text-white transition-[transform,opacity] active:scale-95 disabled:opacity-50"
      >
        <SendIcon className="h-5 w-5" />
      </button>
    </form>
  );
}

function MicIcon({ className }: { className?: string }) {
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
      <path d="M12 2a3 3 0 013 3v6a3 3 0 01-6 0V5a3 3 0 013-3z" />
      <path d="M19 10v2a7 7 0 01-14 0v-2" />
      <path d="M12 19v3" />
      <path d="M9 22h6" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}
