"use client";

import type { Subsidy } from "@/lib/wallet";
import type { RoleId } from "@/lib/auth";
import SubsidyCard from "./SubsidyCard";

export interface SubsidyListProps {
  subsidies: Subsidy[];
  userRole: RoleId;
  onAccept: (subsidyId: string) => { success: boolean; error?: string; requiresValidation?: boolean };
  onReject?: (subsidyId: string) => void;
  onAcceptSuccess?: () => void;
  emptyMessage?: string;
  className?: string;
}

/**
 * Lista de subsidios disponibles. UI clara, sin confusión legal.
 * Cada ítem: detalle de condiciones (expandible) y acciones Aceptar / Rechazar.
 */
export default function SubsidyList({
  subsidies,
  userRole,
  onAccept,
  onReject,
  onAcceptSuccess,
  emptyMessage = "No hay subsidios disponibles para tu perfil.",
  className = "",
}: SubsidyListProps) {
  const available = subsidies.filter((s) => s.status === "available");

  return (
    <section
      className={`rounded-2xl border border-yapo-blue/10 bg-yapo-white p-5 shadow-sm ${className}`}
      aria-label="Subsidios disponibles"
    >
      <h2 className="text-lg font-semibold text-yapo-blue">
        Subsidios disponibles
      </h2>
      <p className="mt-1.5 text-sm text-foreground/70">
        El monto se acredita en tu balance protegido. No son transferibles a otras personas.
      </p>

      {available.length === 0 ? (
        <p className="mt-5 text-sm text-foreground/60" role="status">
          {emptyMessage}
        </p>
      ) : (
        <ul className="mt-5 space-y-4" role="list">
          {available.map((subsidy) => (
            <li key={subsidy.id}>
              <SubsidyCard
                subsidy={subsidy}
                userRole={userRole}
                onAccept={onAccept}
                onReject={onReject}
                onAcceptSuccess={onAcceptSuccess}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
