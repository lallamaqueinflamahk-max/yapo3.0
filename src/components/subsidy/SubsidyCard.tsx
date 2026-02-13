"use client";

import { useState } from "react";
import type { Subsidy } from "@/lib/wallet";
import type { RoleId } from "@/lib/auth";
import SubsidyConditions from "./SubsidyConditions";

const CURRENCY = "PYG";

const SOURCE_LABELS: Record<string, string> = {
  government: "Gobierno",
  enterprise: "Empresa",
  sponsor: "Sponsor",
};

export interface SubsidyCardProps {
  subsidy: Subsidy;
  userRole: RoleId;
  onAccept: (subsidyId: string) => { success: boolean; error?: string; requiresValidation?: boolean };
  onReject?: (subsidyId: string) => void;
  onAcceptSuccess?: () => void;
  className?: string;
}

/**
 * Tarjeta de subsidio: lista clara, detalle de condiciones, acciones Aceptar / Rechazar.
 * UI gubernamental: sin confusión legal.
 */
export default function SubsidyCard({
  subsidy,
  userRole,
  onAccept,
  onReject,
  onAcceptSuccess,
  className = "",
}: SubsidyCardProps) {
  const [showConditions, setShowConditions] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [rejected, setRejected] = useState(false);

  const canAccept = subsidy.status === "available" && subsidy.targetRole.includes(userRole);

  const handleAccept = () => {
    setMessage(null);
    const result = onAccept(subsidy.id);
    if (result.success) {
      setMessage({ type: "ok", text: "Acreditado en tu balance protegido." });
      onAcceptSuccess?.();
    } else {
      setMessage({
        type: "error",
        text: result.error ?? "No se pudo aceptar.",
      });
    }
  };

  const handleReject = () => {
    setMessage(null);
    setRejected(true);
    onReject?.(subsidy.id);
  };

  if (rejected) {
    return (
      <article
        className={`rounded-2xl border border-foreground/10 bg-foreground/5 p-4 ${className}`}
        aria-label={`Subsidio ${subsidy.name ?? subsidy.id} rechazado`}
      >
        <div className="flex items-center gap-3">
          <span className="text-foreground/50">●</span>
          <p className="text-sm font-medium text-foreground/70">
            {subsidy.name ?? `Subsidio ${subsidy.source}`} — No aceptado
          </p>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`rounded-2xl border border-yapo-blue/15 bg-yapo-white p-4 shadow-sm ${className}`}
      aria-label={`Subsidio ${subsidy.name ?? subsidy.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-yapo-blue">
            {subsidy.name ?? `Subsidio ${subsidy.source}`}
          </h3>
          <p className="mt-1 text-xl font-bold tabular-nums text-yapo-blue">
            {subsidy.amount.toLocaleString("es-PY", { minimumFractionDigits: 2 })} {CURRENCY}
          </p>
          <p className="mt-0.5 text-xs font-medium text-foreground/60 uppercase tracking-wide">
            {SOURCE_LABELS[subsidy.source] ?? subsidy.source}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800"
          aria-hidden
        >
          Disponible
        </span>
      </div>

      {subsidy.description && (
        <p className="mt-3 text-sm text-foreground/75 leading-relaxed">
          {subsidy.description}
        </p>
      )}

      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowConditions(!showConditions)}
          className="text-sm font-medium text-yapo-blue underline decoration-yapo-blue/40 underline-offset-2 transition-colors hover:decoration-yapo-blue"
          aria-expanded={showConditions}
        >
          {showConditions ? "Ocultar condiciones" : "Ver detalle de condiciones"}
        </button>
      </div>

      {showConditions && (
        <div className="mt-3">
          <SubsidyConditions
            conditions={subsidy.conditions}
            amount={subsidy.amount}
            targetRoleFromSubsidy={subsidy.targetRole}
            showAcceptanceNote
          />
        </div>
      )}

      {canAccept && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
          <button
            type="button"
            onClick={handleAccept}
            className="min-h-[48px] flex-1 rounded-xl bg-yapo-blue px-4 font-semibold text-yapo-white transition-[transform] active:scale-[0.98]"
          >
            Aceptar subsidio
          </button>
          <button
            type="button"
            onClick={handleReject}
            className="min-h-[48px] flex-1 rounded-xl border-2 border-foreground/20 bg-transparent px-4 font-medium text-foreground/80 transition-[transform] active:scale-[0.98]"
          >
            No aceptar
          </button>
        </div>
      )}

      {message && (
        <p
          role="alert"
          className={`mt-4 text-sm font-medium ${
            message.type === "ok" ? "text-emerald-700" : "text-yapo-red-dark"
          }`}
        >
          {message.text}
        </p>
      )}
    </article>
  );
}
