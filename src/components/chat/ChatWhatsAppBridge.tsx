"use client";

import { useMemo, useEffect } from "react";
import IconWhatsApp from "@/components/icons/IconWhatsApp";
import { useSession, getIdentity, canAccessFeature, authorizeWithCerebro } from "@/lib/auth";
import { buildWhatsAppUrl, DEFAULT_YAPO_WHATSAPP_MESSAGE } from "@/lib/whatsapp-url";

export interface ChatWhatsAppBridgeProps {
  /** Número con código de país (ej. 595981123456). Si no se pasa, el botón se muestra deshabilitado hasta tener permiso. */
  phone?: string;
  /** Mensaje opcional (por defecto: "Hola, consulta desde YAPÓ"). */
  prefillText?: string;
  /** Accesible: título del botón. */
  label?: string;
  className?: string;
}

/**
 * Ícono WhatsApp siempre visible.
 * Deshabilitado por defecto; habilitado solo si:
 * - identity verificada (perfil con whatsappUnlocked o nivel que Cerebro acepte)
 * - permiso aprobado por Cerebro (canAccessFeature + authorizeWithCerebro).
 * Al habilitar: abre chat externo con link wa.me.
 */
export default function ChatWhatsAppBridge({
  phone = "",
  prefillText,
  label = "Contactar por WhatsApp",
  className = "",
}: ChatWhatsAppBridgeProps) {
  const { identity } = useSession();
  const profile = useMemo(
    () => (identity?.userId ? getIdentity(identity.userId) : null),
    [identity?.userId]
  );

  const decision = useMemo(() => {
    if (!profile) {
      return { allowed: false, reason: "Completá la verificación para habilitar WhatsApp." };
    }
    return authorizeWithCerebro(
      { userId: profile.userId, profile, roles: [profile.role] },
      "whatsapp",
      () => (canAccessFeature(profile, "whatsapp").allowed ? { allowed: true } : { allowed: false, reason: "El contacto por WhatsApp se habilita al completar los pasos de verificación requeridos." })
    );
  }, [profile]);

  const allowed = decision.allowed && phone.replace(/\D/g, "").length > 0;
  const href = allowed ? buildWhatsAppUrl(phone, prefillText ?? DEFAULT_YAPO_WHATSAPP_MESSAGE) : undefined;

  // #region agent log
  useEffect(() => { fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatWhatsAppBridge.tsx:mount',message:'Bridge mount',data:{allowed,hasHref:!!href,target:'_blank'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{}); }, []);
  // #endregion

  const handleWhatsAppClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatWhatsAppBridge.tsx:click',message:'WhatsApp link clicked',data:{href},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    if (!href) return;
    e.preventDefault();
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const titleText = allowed && href ? `${label}. Se abre en otra pestaña; YAPÓ sigue aquí.` : (decision.reason ?? "WhatsApp deshabilitado");

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      title={titleText}
    >
      {allowed && href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppClick}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#25D366] transition-[transform,opacity] active:scale-95 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:ring-offset-[#075e54]"
          aria-label={titleText}
        >
          <IconWhatsApp className="h-6 w-6" />
        </a>
      ) : (
        <span
          className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full text-white/40"
          aria-label={label + " (deshabilitado: completá la verificación)"}
          role="img"
        >
          <IconWhatsApp className="h-6 w-6" />
        </span>
      )}
    </span>
  );
}
