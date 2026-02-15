"use client";

import { useState, useRef, useCallback } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export default function ChatInput({
  onSend,
  onTyping,
  disabled = false,
  placeholder = "Escribí un mensaje...",
  className = "",
}: ChatInputProps) {
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
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`} role="search">
      <label htmlFor="chat-input" className="sr-only">
        Mensaje
      </label>
      <input
        id="chat-input"
        type="text"
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className="min-h-[48px] flex-1 rounded-2xl border-2 border-yapo-blue/30 bg-yapo-white px-4 text-base text-foreground placeholder:text-yapo-blue/50 focus:border-yapo-blue focus:outline-none focus:ring-2 focus:ring-yapo-blue/20 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        aria-label="Enviar"
        className="btn-interactive min-h-[48px] min-w-[48px] rounded-2xl bg-yapo-cta font-semibold text-yapo-white shadow-md border-2 border-yapo-cta-hover/50 hover:bg-yapo-cta-hover disabled:opacity-50"
      >
        Enviar
      </button>
    </form>
  );
}
