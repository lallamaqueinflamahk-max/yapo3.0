"use client";

import { useMemo, useState, useEffect } from "react";
import { useSession } from "@/lib/auth";
import type { CerebroRole } from "@/lib/ai/cerebro";
import type { CerebroResult } from "@/lib/ai/cerebro";
import type { CategoryChipConfig, CategoryId } from "@/data/category-chips";
import {
  getDynamicChips,
  getSuggestedChips,
  getRecentChipIds,
  CATEGORY_FILTER_ORDER,
  CATEGORY_FILTER_LABELS,
  type DynamicChipConfig,
  type CategoryFilter,
} from "@/data/bubble-chips-dynamic";
import CategoryBubbleChip from "./CategoryBubbleChip";

/** Convierte chip dinámico (rol + categoría + escudos) a config del chip de categoría para reutilizar CategoryBubbleChip. */
function toCategoryChipConfig(d: DynamicChipConfig): CategoryChipConfig {
  return {
    id: d.id,
    category: d.category as CategoryId,
    subcategory: d.label,
    label: d.label,
    icon: d.icon,
    color: d.category,
    intentId: d.intentId,
    payload: d.payload,
    jobsCount: d.jobsCount,
  };
}

export interface BubbleChipsDynamicProps {
  /** Filtro por categoría: "all" o una categoría concreta */
  filterCategory?: CategoryFilter | "all";
  /** Override de chips (mock en tiempo real) */
  chipsOverride?: DynamicChipConfig[];
  /** Mostrar estadísticas en tiempo real (clicks, últimos usuarios) */
  showStats?: boolean;
  /** Chip seleccionado (filtro activo) → pulso */
  selectedChipId?: string | null;
  /** Callback cuando decide() devuelve resultado (navegación, feed, escudos) */
  onResult?: (result: CerebroResult) => void;
  /** Llamado al actualizar estadística local */
  onStatsChange?: (chipId: string, clicks: number) => void;
  /** Mostrar tooltip con mini-info al hover / tap */
  showTooltip?: boolean;
  /** Mostrar pestañas de filtro por categoría (mobile-first) */
  showCategoryTabs?: boolean;
  className?: string;
}

/**
 * Chips bubble dinámicos filtrados por rol (Valé, Capeto, Kavaju, Mbareté),
 * categoría (🛠️ 🚗 ❤️ 💼) y escudos. Render desde JSON mock; cada chip emite
 * CerebroIntent → decide() → CerebroResult. Soporta actualización en tiempo real vía chipsOverride.
 */
export default function BubbleChipsDynamic({
  filterCategory: filterCategoryProp,
  chipsOverride,
  showStats = true,
  selectedChipId = null,
  onResult,
  onStatsChange,
  showTooltip = true,
  showCategoryTabs = true,
  className = "",
}: BubbleChipsDynamicProps) {
  const { identity } = useSession();
  const primaryRole = (identity?.roles?.[0] ?? "vale") as CerebroRole;
  const userId = identity?.userId ?? "safe-user";

  const [localFilter, setLocalFilter] = useState<CategoryFilter | "all">(
    filterCategoryProp ?? "all"
  );
  const filterCategory = filterCategoryProp ?? localFilter;
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    setRecentIds(getRecentChipIds());
  }, []);

  const chips = getDynamicChips(primaryRole, filterCategory, chipsOverride);
  const suggestedChips = useMemo(
    () => getSuggestedChips(primaryRole, undefined, recentIds).map(toCategoryChipConfig),
    [primaryRole, recentIds]
  );
  const byCategory = useMemo(() => {
    const map: Record<CategoryFilter, CategoryChipConfig[]> = {
      oficios: [],
      movilidad: [],
      cuidados: [],
      profesional: [],
      escudos: [],
    };
    for (const d of chips) {
      const cfg = toCategoryChipConfig(d);
      map[d.category].push(cfg);
    }
    return map;
  }, [chips]);

  return (
    <section
      className={`flex flex-col gap-4 ${className}`}
      aria-label="Categorías y escudos por rol"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">
        Categorías y escudos
      </h2>

      {showCategoryTabs && suggestedChips.length > 0 && filterCategory === "all" && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-medium uppercase tracking-wider text-yapo-blue/80">
            Sugeridos para vos (por rol y lo que más buscás)
          </h3>
          <div className="flex flex-wrap gap-2" role="list">
            {suggestedChips.slice(0, 6).map((chip) => (
              <div key={chip.id} role="listitem" className="shrink-0">
                <CategoryBubbleChip
                  chip={chip}
                  currentRole={primaryRole}
                  userId={userId}
                  onResult={onResult}
                  showStats={showStats}
                  showTooltip={showTooltip}
                  selected={selectedChipId === chip.id}
                  onStatsChange={(id, clicks) => {
                    onStatsChange?.(id, clicks);
                    setRecentIds(getRecentChipIds());
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {showCategoryTabs && (
        <div
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
          role="tablist"
          aria-label="Filtrar por categoría"
        >
          <button
            type="button"
            role="tab"
            aria-selected={filterCategory === "all"}
            onClick={() => setLocalFilter("all")}
            className={`
              shrink-0 rounded-full border-2 px-4 py-2 text-xs font-semibold
              transition-[transform,box-shadow] active:scale-[0.98]
              ${filterCategory === "all"
                ? "border-yapo-blue bg-yapo-blue-light text-yapo-blue shadow-[0_4px_14px_rgba(0,35,149,0.2)]"
                : "border-yapo-blue/20 bg-yapo-white text-yapo-blue/80 hover:border-yapo-blue/40 hover:bg-yapo-blue-light/50"}
            `}
          >
            Todas
          </button>
          {CATEGORY_FILTER_ORDER.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={filterCategory === cat}
              onClick={() => setLocalFilter(cat)}
              className={`
                shrink-0 rounded-full border-2 px-4 py-2 text-xs font-semibold
                transition-[transform,box-shadow] active:scale-[0.98]
                ${filterCategory === cat
                  ? "border-yapo-blue bg-yapo-blue-light text-yapo-blue shadow-[0_4px_14px_rgba(0,35,149,0.2)]"
                  : "border-yapo-blue/20 bg-yapo-white text-yapo-blue/80 hover:border-yapo-blue/40 hover:bg-yapo-blue-light/50"}
              `}
            >
              {CATEGORY_FILTER_LABELS[cat]}
            </button>
          ))}
        </div>
      )}

      {CATEGORY_FILTER_ORDER.map((categoryId) => {
        const list = byCategory[categoryId];
        if (!list?.length) return null;
        const label = CATEGORY_FILTER_LABELS[categoryId];
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
                    onResult={onResult}
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
