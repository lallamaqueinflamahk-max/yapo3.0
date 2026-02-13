"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Message } from "@/lib/chat";
import type { YapoPerfil } from "@/types/yapo-perfil";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatInputWhatsApp from "./ChatInputWhatsApp";
import ChatWhatsAppBridge from "./ChatWhatsAppBridge";

const INPUT_BAR_HEIGHT = 64;
const SAFE_BOTTOM = "env(safe-area-inset-bottom, 0px)";

interface ChatWhatsAppUIProps {
  roomId: string;
  roomName: string;
  messages: Message[];
  currentUserId: string;
  isSomeoneTyping?: boolean;
  typingUserName?: string;
  onSendMessage: (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
  onBack?: () => void;
  disabled?: boolean;
  /** Número WhatsApp (código país) para el bridge; si no se pasa, el ícono se muestra deshabilitado. */
  whatsAppPhone?: string;
  /** YAPÓ-Community: resuelve perfil para mensajes con attachedPerfilId (respuesta con tarjeta). */
  getPerfilForMessage?: (perfilId: string) => YapoPerfil | null | undefined;
  className?: string;
}

/**
 * UI mobile-first tipo WhatsApp:
 * - Mensajes en burbujas
 * - Scroll automático al último mensaje
 * - Indicador "escribiendo"
 * - Input fijo abajo + botón micrófono (placeholder)
 */
export default function ChatWhatsAppUI({
  roomId,
  roomName,
  messages,
  currentUserId,
  isSomeoneTyping = false,
  typingUserName,
  onSendMessage,
  onTyping,
  onBack,
  disabled = false,
  whatsAppPhone,
  getPerfilForMessage,
  className = "",
}: ChatWhatsAppUIProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isSomeoneTyping]);

  // #region agent log
  useEffect(() => { fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatWhatsAppUI.tsx:header',message:'Chat header with YAPÓ link',data:{hasYapoLink:true,yapoHref:'/home'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{}); }, []);
  // #endregion

  return (
    <div
      className={`flex h-full min-h-0 flex-col bg-[#e5ddd5] ${className}`}
      style={{ paddingBottom: `calc(${INPUT_BAR_HEIGHT}px + ${SAFE_BOTTOM})` }}
    >
      {/* Header fijo: salida a YAPÓ siempre visible */}
      <header className="flex shrink-0 items-center gap-2 border-b border-black/10 bg-[#075e54] px-3 py-3 shadow-sm">
        <Link
          href="/home"
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white/25 px-2.5 py-2 text-sm font-semibold text-white no-underline hover:bg-white/35 active:opacity-90"
          aria-label="Volver a Inicio YAPÓ"
        >
          <BackIcon className="h-5 w-5" />
          <span>YAPÓ</span>
        </Link>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/90 active:bg-white/20"
            aria-label="Volver al listado"
          >
            <BackIcon className="h-6 w-6" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold text-white">{roomName}</h1>
          <p className="text-xs text-white/80">
            {isSomeoneTyping ? (typingUserName ? `${typingUserName} está escribiendo...` : "escribiendo...") : "en línea"}
          </p>
        </div>
        <ChatWhatsAppBridge phone={whatsAppPhone ?? ""} prefillText="Hola, consulta desde YAPÓ" label="Contactar por WhatsApp" />
      </header>

      {/* Área de mensajes con scroll automático */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3"
        role="log"
        aria-label="Mensajes"
      >
        <div className="flex flex-col gap-1">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.userId === currentUserId}
              variant="whatsapp"
              attachedPerfil={msg.attachedPerfilId ? getPerfilForMessage?.(msg.attachedPerfilId) ?? null : undefined}
            />
          ))}
          {isSomeoneTyping && (
            <TypingIndicator userName={typingUserName} className="py-1" />
          )}
          <div ref={bottomRef} aria-hidden className="h-2 shrink-0" />
        </div>
        {messages.length === 0 && !isSomeoneTyping && (
          <p className="py-8 text-center text-sm text-black/40">
            No hay mensajes. Escribí para empezar.
          </p>
        )}
      </div>

      {/* Input fijo abajo */}
      <div
        className="fixed bottom-0 left-0 right-0 z-10 flex items-center gap-2 border-t border-black/10 bg-[#f0f0f0] px-2 py-2"
        style={{ paddingBottom: `max(0.5rem, ${SAFE_BOTTOM})` }}
      >
        <ChatInputWhatsApp
          onSend={onSendMessage}
          onTyping={onTyping}
          placeholder="Mensaje"
          disabled={disabled || !roomId}
        />
      </div>
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
