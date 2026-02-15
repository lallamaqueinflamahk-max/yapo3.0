"use client";

import Link from "next/link";
import Avatar from "@/components/ui/Avatar";

export interface ProfessionalCardProps {
  /** Nombre del profesional */
  name: string;
  /** Oficio o profesión (ej. "Albañil") */
  profession: string;
  /** Ciudad o zona (ej. "Asunción") */
  location?: string;
  /** Foto de perfil */
  image?: string | null;
  /** Enlace al perfil (opcional; si no se pasa, el card no es clickeable en el nombre) */
  profileHref?: string;
  /** Muestra badge "Verificado" */
  verified?: boolean;
  /** Muestra badge "Seguro" (pago protegido) */
  hasInsurance?: boolean;
  /** Texto del botón principal */
  ctaLabel?: string;
  /** URL del botón (ej. /trabajo/aceptar?profesionalId=...) o callback */
  ctaHref?: string;
  /** Si se prefiere callback en lugar de href para el botón */
  onContratar?: () => void;
  className?: string;
}

/**
 * Tarjeta de profesional: avatar, nombre, oficio • ubicación, badges Verificado/Seguro,
 * botón "Contratar con pago protegido". Usa colorimetría YAPÓ.
 */
function ProfessionalCard({
  name,
  profession,
  location,
  image = null,
  profileHref,
  verified = true,
  hasInsurance = true,
  ctaLabel = "Contratar con pago protegido",
  ctaHref,
  onContratar,
  className = "",
}: ProfessionalCardProps) {
  const subtitle = [profession, location].filter(Boolean).join(" • ");

  return (
    <div
      className={`nav-card-interactive rounded-2xl bg-yapo-white p-4 shadow-md border-2 border-gris-ui-border ${className}`}
    >
      <div className="flex items-center gap-3">
        {profileHref ? (
          <Link href={profileHref} className="shrink-0">
            <Avatar
              src={image}
              name={name}
              size="md"
              className="h-12 w-12"
            />
          </Link>
        ) : (
          <Avatar src={image} name={name} size="md" className="h-12 w-12 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          {profileHref ? (
            <Link href={profileHref} className="block font-semibold text-yapo-petroleo hover:underline">
              {name}
            </Link>
          ) : (
            <p className="font-semibold text-yapo-petroleo">{name}</p>
          )}
          <p className="text-xs text-gris-texto-light">{subtitle}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {verified && (
          <span className="rounded-full bg-yapo-validacion/15 px-2 py-1 font-medium text-yapo-validacion-dark">
            Verificado
          </span>
        )}
        {hasInsurance && (
          <span className="rounded-full bg-yapo-blue/15 px-2 py-1 font-medium text-yapo-blue">
            Seguro
          </span>
        )}
      </div>

      {(ctaHref || onContratar) && (
        <>
          {ctaHref ? (
            <Link
              href={ctaHref}
              className="btn-interactive mt-4 flex w-full items-center justify-center rounded-xl bg-yapo-cta px-3 py-2.5 font-semibold text-white shadow-md border-2 border-yapo-cta-hover/50"
            >
              {ctaLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onContratar}
              className="btn-interactive mt-4 w-full rounded-xl bg-yapo-cta px-3 py-2.5 font-semibold text-white shadow-md border-2 border-yapo-cta-hover/50"
            >
              {ctaLabel}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export { ProfessionalCard };
export default ProfessionalCard;
