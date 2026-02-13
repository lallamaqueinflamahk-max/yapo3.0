"use client";

import type { SubsidyConditions as SubsidyConditionsType } from "@/lib/wallet";

const CURRENCY = "PYG";

const ROLE_LABELS: Record<string, string> = {
  vale: "Valé",
  capeto: "Capeto",
  kavaju: "Kavaju",
  mbarete: "Mbareté",
  cliente: "Cliente",
  pyme: "PyME",
  enterprise: "Enterprise",
};

function formatRoles(roles: string[] | undefined): string {
  if (!roles?.length) return "Según perfil";
  return roles.map((r) => ROLE_LABELS[r] ?? r).join(", ");
}

export interface SubsidyConditionsProps {
  conditions: SubsidyConditionsType;
  amount?: number;
  /** Roles destinatarios del subsidio (subsidy.targetRole) si conditions.targetRoles está vacío. */
  targetRoleFromSubsidy?: string[];
  showAcceptanceNote?: boolean;
  className?: string;
}

/**
 * Detalle de condiciones del subsidio. Solo lectura; sin confusión legal.
 */
export default function SubsidyConditions({
  conditions,
  amount,
  targetRoleFromSubsidy,
  showAcceptanceNote = true,
  className = "",
}: SubsidyConditionsProps) {
  const {
    targetRoles,
    requiredBiometricLevel,
    description,
    allowedTerritoryIds,
    minTrustScore,
  } = conditions;
  const destinatarios = targetRoles?.length
    ? formatRoles(targetRoles)
    : targetRoleFromSubsidy?.length
      ? formatRoles(targetRoleFromSubsidy)
      : "Según perfil";

  return (
    <div
      className={`rounded-xl border border-yapo-blue/15 bg-yapo-white/90 p-4 text-sm ${className}`}
      aria-label="Detalle de condiciones del subsidio"
    >
      <h3 className="font-semibold text-yapo-blue">
        Detalle de condiciones
      </h3>

      {amount != null && amount > 0 && (
        <p className="mt-3 text-foreground/90">
          <span className="font-medium text-foreground">Monto:</span>{" "}
          {amount.toLocaleString("es-PY", { minimumFractionDigits: 2 })} {CURRENCY}
        </p>
      )}

      <p className="mt-2 text-foreground/80">
        <span className="font-medium text-foreground">Destinatarios:</span>{" "}
        {destinatarios}
      </p>

      {requiredBiometricLevel != null && requiredBiometricLevel > 0 && (
        <p className="mt-2 text-foreground/80">
          <span className="font-medium text-foreground">Verificación requerida:</span>{" "}
          nivel {requiredBiometricLevel}
        </p>
      )}

      {minTrustScore != null && (
        <p className="mt-2 text-foreground/80">
          <span className="font-medium text-foreground">Puntuación mínima:</span>{" "}
          {minTrustScore}
        </p>
      )}

      {allowedTerritoryIds?.length ? (
        <p className="mt-2 text-foreground/80">
          <span className="font-medium text-foreground">Territorios:</span>{" "}
          {allowedTerritoryIds.join(", ")}
        </p>
      ) : null}

      {description && (
        <p className="mt-3 text-foreground/75 leading-relaxed">
          {description}
        </p>
      )}

      {showAcceptanceNote && (
        <p className="mt-3 text-xs text-foreground/60">
          Al aceptar, declarás cumplir con estas condiciones.
        </p>
      )}
    </div>
  );
}
