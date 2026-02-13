"use client";

import { useSession } from "@/lib/auth";
import type { CerebroRole } from "@/lib/ai/cerebro";
import {
  getChipsByCategory,
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  type CategoryId,
} from "@/data/category-chips";
import CategoryBubbleChip from "./CategoryBubbleChip";

export interface CategoryBubbleChipsProps {
  /** Mostrar estadísticas en tiempo real (clicks, últimos usuarios) */
  showStats?: boolean;
  /** Máximo de chips por categoría (0 = todos) */
  maxPerCategory?: number;
  /** Chip seleccionado (filtro activo) → pulso de color */
  selectedChipId?: string | null;
  /** Llamado al actualizar estadística local (preparado para backend analítica) */
  onStatsChange?: (chipId: string, clicks: number) => void;
  /** Mostrar tooltip con mini-info al hover / tap */
  showTooltip?: boolean;
  className?: string;
}

/**
 * Chips bubble MVP: 4 categorías principales 🛠️ 🚗 ❤️ 💼 + escudos.
 * Render desde mock; cada chip dispara CerebroIntent → decide() → CerebroResult.
 * Diseño bubble, redondeado, flotante; Paraguay 🇵🇾 + tonos cálidos.
 */
export default function CategoryBubbleChips({
  showStats = false,
  maxPerCategory = 5,
  className = "",
}: CategoryBubbleChipsProps) {
  const { identity } = useSession();
  const primaryRole = (identity?.roles?.[0] ?? "vale") as CerebroRole;
  const userId = identity?.userId ?? "safe-user";
  const byCategory = getChipsByCategory();

  return (
    <section
      className={`flex flex-col gap-4 ${className}`}
      aria-label="Categorías laborales y filtros"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">
        Categorías y filtros
      </h2>
      {CATEGORY_ORDER.map((categoryId) => {
        const chips = byCategory[categoryId as CategoryId];
        if (!chips?.length) return null;
        const list = maxPerCategory > 0 ? chips.slice(0, maxPerCategory) : chips;
        const label = CATEGORY_LABELS[categoryId as CategoryId];
        return (
          <div key={categoryId} className="flex flex-col gap-2">
            <h3 className="text-xs font-medium uppercase tracking-wider text-black/60">
              {label}
            </h3>
            <div className="flex flex-wrap gap-2" role="list">
              {list.map((chip) => (
                <div key={chip.id} role="listitem" className="shrink-0">
                  <CategoryBubbleChip
                    chip={chip}
                    currentRole={primaryRole}
                    userId={userId}
                    showStats={showStats}
                    showTooltip={showTooltip}
                    selected={selectedChipId === chip.id}
                    onStatsChange={onStatsChange}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
