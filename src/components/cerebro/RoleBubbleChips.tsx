"use client";

import { useSession } from "@/lib/auth";
import type { CerebroRole } from "@/lib/ai/cerebro";
import { getChipsForRole } from "@/data/role-chips";
import RoleBubbleChip from "./RoleBubbleChip";

export interface RoleBubbleChipsProps {
  /** Mostrar mini-estadísticas (clicks, usuarios recientes) en cada chip */
  showStats?: boolean;
  className?: string;
}

/**
 * Fila de chips bubble por rol: Valé (verde/soft), Capeto (azul/bounce),
 * Kavaju (naranja/glow), Mbareté (rojo/pulse). Cada chip emite CerebroIntent
 * y recibe CerebroResult (navegación, opciones secundarias).
 */
export default function RoleBubbleChips({ showStats = false, className = "" }: RoleBubbleChipsProps) {
  const { identity } = useSession();
  const primaryRole = (identity?.roles?.[0] ?? "vale") as CerebroRole;
  const userId = identity?.userId ?? "safe-user";
  const chips = getChipsForRole(primaryRole);

  return (
    <section
      className={`flex flex-col gap-3 ${className}`}
      aria-label="Chips por rol"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">
        Acciones por rol
      </h2>
      <div
        className="flex flex-wrap gap-2"
        role="list"
      >
        {chips.map((chip) => (
          <div key={chip.id} role="listitem" className="shrink-0">
            <RoleBubbleChip
              chip={chip}
              currentRole={primaryRole}
              userId={userId}
              showStats={showStats}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
