"use client";

import type { Message } from "@/lib/chat";
import type { YapoPerfil } from "@/types/yapo-perfil";
import { YapoCard } from "@/components/yapo-card";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  /** Estilo WhatsApp: verde propio, gris otros. */
  variant?: "default" | "whatsapp";
  /** YAPÓ-Community: tarjeta de perfil del profesional cuando responde con presupuesto. */
  attachedPerfil?: YapoPerfil | null;
}

export default function MessageBubble({ message, isOwn, variant = "default", attachedPerfil }: MessageBubbleProps) {
  // #region agent log
  if (message.attachedPerfilId != null) {
    fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chat/MessageBubble.tsx:render',message:'MessageBubble with attachedPerfilId',data:{attachedPerfilId:message.attachedPerfilId,hasAttachedPerfil:!!attachedPerfil},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
  }
  // #endregion
  const isWhatsApp = variant === "whatsapp";
  const ownStyles = isWhatsApp
    ? "rounded-br-md bg-[#dcf8c6] text-foreground shadow-sm"
    : "rounded-br-md bg-yapo-blue text-yapo-white";
  const otherStyles = isWhatsApp
    ? "rounded-bl-md bg-white text-foreground shadow-sm"
    : "rounded-bl-md bg-yapo-blue/10 text-foreground";

  return (
    <div
      className={`flex w-full flex-col ${isOwn ? "items-end" : "items-start"}`}
      role="listitem"
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2 ${
          isOwn ? ownStyles : otherStyles
        }`}
      >
        {!isOwn && (
          <p className={`mb-0.5 text-xs font-medium ${isWhatsApp ? "text-[#075e54]" : "text-yapo-blue/80"}`}>
            {message.userName}
          </p>
        )}
        <p className="text-sm leading-snug">{message.text}</p>
        <p
          className={`mt-1 text-[10px] ${isOwn ? (isWhatsApp ? "text-foreground/60" : "text-yapo-white/80") : (isWhatsApp ? "text-foreground/50" : "text-yapo-blue/60")}`}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
      {/* Tarjeta de perfil para comparar calidad y precio (respuesta del profesional) */}
      {!isOwn && attachedPerfil && (
        <div className="mt-2 w-full max-w-[320px]">
          <YapoCard perfil={attachedPerfil} href={`/profile/${attachedPerfil.perfil_id}`} compact />
        </div>
      )}
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
