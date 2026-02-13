"use client";

import Link from "next/link";
import type { IdentityProfile, VerificationLevel } from "@/lib/auth";
import {
  canAccessFeature,
  FEATURE_IDS,
  type FeatureId,
} from "@/lib/auth";

/** Etiquetas humanas para nivel de verificación (nada técnico). */
const VERIFICATION_LABELS: Record<VerificationLevel, string> = {
  unverified: "Sin verificar",
  basic: "Básica",
  verified: "Verificada",
  trusted: "Confiable",
};

/** Etiquetas humanas para badges. */
const BADGE_LABELS: Record<string, string> = {
  kyc_basic: "Verificación básica",
  kyc_verified: "Verificación por documento",
  kyc_trusted: "Verificación completa",
  biometric: "Biometría",
  whatsapp: "WhatsApp",
  trust_25: "Confianza 25%",
  trust_50: "Confianza 50%",
  trust_75: "Confianza 75%",
  trust_100: "Confianza 100%",
};

/** Texto del CTA por feature bloqueado. */
const CTA_LABELS: Record<FeatureId, string> = {
  wallet_transfer: "Verificate para desbloquear transferencias",
  video_call: "Verificate para desbloquear videollamadas",
  whatsapp: "Verificate para desbloquear WhatsApp",
  territory_control: "Verificate para desbloquear control de territorio",
};

function getBadgeLabel(id: string): string {
  return BADGE_LABELS[id] ?? id;
}

export interface TrustStatusProps {
  profile: IdentityProfile | null;
  /** Ruta a la que llevan los CTAs de verificación (ej. /profile o /verification). */
  verificationHref?: string;
}

export default function TrustStatus({
  profile,
  verificationHref = "/profile",
}: TrustStatusProps) {
  if (!profile) {
    return (
      <section
        className="rounded-2xl border-2 border-[var(--yapo-blue)]/20 bg-[var(--yapo-white)] p-6 shadow-sm"
        aria-label="Estado de confianza"
      >
        <h2 className="text-lg font-semibold text-[var(--yapo-blue)]">
          Tu estado de confianza
        </h2>
        <p className="mt-3 text-sm text-[var(--foreground)]/80">
          Completá tu perfil para ver tu nivel de verificación y desbloquear
          más funciones.
        </p>
        <Link
          href={verificationHref}
          className="mt-4 inline-flex w-full justify-center rounded-xl bg-[var(--yapo-red)] px-4 py-3 font-semibold text-[var(--yapo-white)] shadow-sm active:opacity-90"
        >
          Ir a mi perfil
        </Link>
      </section>
    );
  }

  const levelLabel = VERIFICATION_LABELS[profile.verificationLevel];
  const blockedFeatures = FEATURE_IDS.filter((id) => {
    const result = canAccessFeature(profile, id);
    return !result.allowed;
  });

  return (
    <section
      className="rounded-2xl border-2 border-[var(--yapo-blue)]/20 bg-[var(--yapo-white)] p-6 shadow-sm"
      aria-label="Estado de confianza"
    >
      <h2 className="text-lg font-semibold text-[var(--yapo-blue)]">
        Tu estado de confianza
      </h2>

      {/* Nivel de verificación */}
      <div className="mt-4">
        <p className="text-sm font-medium text-[var(--foreground)]/80">
          Nivel de verificación
        </p>
        <p className="mt-1 text-base font-semibold text-[var(--yapo-blue)]">
          {levelLabel}
        </p>
      </div>

      {/* Trust score */}
      <div className="mt-5">
        <p className="text-sm font-medium text-[var(--foreground)]/80">
          Puntuación de confianza
        </p>
        <div className="mt-2 flex items-center gap-3">
          <div
            className="h-3 flex-1 overflow-hidden rounded-full bg-[var(--yapo-blue)]/15"
            role="progressbar"
            aria-valuenow={profile.trustScore}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-[var(--yapo-blue)] transition-[width]"
              style={{ width: `${Math.min(100, Math.max(0, profile.trustScore))}%` }}
            />
          </div>
          <span className="min-w-[2.5rem] text-right text-sm font-semibold tabular-nums text-[var(--yapo-blue)]">
            {profile.trustScore}
          </span>
        </div>
      </div>

      {/* Badges */}
      {profile.badges.length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-medium text-[var(--foreground)]/80">
            Logros
          </p>
          <ul className="mt-2 flex flex-wrap gap-2" role="list">
            {profile.badges.map((id) => (
              <li key={id}>
                <span className="inline-flex rounded-full border border-[var(--yapo-blue)]/30 bg-[var(--yapo-blue)]/10 px-3 py-1.5 text-sm font-medium text-[var(--yapo-blue)]">
                  {getBadgeLabel(id)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTAs: Verificate para desbloquear X */}
      {blockedFeatures.length > 0 && (
        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-[var(--foreground)]/80">
            Desbloqueá más funciones
          </p>
          {blockedFeatures.map((featureId) => (
            <Link
              key={featureId}
              href={verificationHref}
              className="flex w-full items-center justify-center rounded-xl border-2 border-[var(--yapo-red)]/50 bg-[var(--yapo-red)]/10 px-4 py-3 text-sm font-semibold text-[var(--yapo-red)] transition-colors active:bg-[var(--yapo-red)]/20"
            >
              {CTA_LABELS[featureId]}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
