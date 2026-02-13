"use client";

import IconWhatsApp from "@/components/icons/IconWhatsApp";
import { canAccessFeature } from "@/lib/auth";
import type { IdentityProfile } from "@/lib/auth";
import { buildWhatsAppUrl as buildUrl } from "@/lib/whatsapp-url";

/** Re-export para compatibilidad. Usa api.whatsapp.com/send/?phone=...&text=... */
export const buildWhatsAppUrl = buildUrl;

/** Nombre del evento que se dispara al abrir el enlace de WhatsApp (detail: { phone }). */
export const EVENT_WHATSAPP_OPENED = "whatsapp:opened";

function dispatchWhatsAppOpened(phone: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(EVENT_WHATSAPP_OPENED, { detail: { phone } })
  );
}

export interface WhatsAppProfileLinkProps {
  /** Perfil de identidad: el ícono se muestra solo si canAccessFeature(profile, 'whatsapp').allowed. */
  profile: IdentityProfile | null;
  /** Número con código de país (ej. 595981123456). */
  phone?: string;
  /** Mensaje opcional prellenado al abrir WhatsApp. */
  prefillText?: string;
  /** Texto accesible para el enlace. */
  label?: string;
  className?: string;
}

/**
 * Ícono de WhatsApp visible solo si canAccessFeature(profile, 'whatsapp') === true.
 * Enlace a wa.me/<phone>; al abrir se dispara el evento whatsapp:opened.
 */
export default function WhatsAppProfileLink({
  profile,
  phone = "",
  prefillText,
  label = "Contactar por WhatsApp",
  className = "",
}: WhatsAppProfileLinkProps) {
  const allowed =
    profile !== null &&
    canAccessFeature(profile, "whatsapp").allowed &&
    phone.replace(/\D/g, "").length > 0;

  if (!allowed) {
    return null;
  }

  const href = buildWhatsAppUrl(phone, prefillText);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.open(href, "_blank", "noopener,noreferrer");
    dispatchWhatsAppOpened(phone);
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center rounded-full p-2 text-[#25D366] transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 ${className}`}
      aria-label={label}
      title={label}
      onClick={handleClick}
    >
      <IconWhatsApp className="h-6 w-6" />
    </a>
  );
}
