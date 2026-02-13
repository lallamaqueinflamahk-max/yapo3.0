"use client";

import { useMemo, useState, useEffect } from "react";
import { useSession } from "@/lib/auth";
import type { CerebroRole } from "@/lib/ai/cerebro";
import type { CerebroResult } from "@/lib/ai/cerebro";
import type { CategoryChipConfig, CategoryId } from "@/data/category-chips";
import {
  getSuggestedChips,
  getRecentChipIds,
  type DynamicChipConfig,
} from "@/data/bubble-chips-dynamic";
import CategoryBubbleChip from "@/components/cerebro/CategoryBubbleChip";

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

export interface SuggestedChipsSectionProps {
  /** Profesión del usuario (desde perfil o API); mejora las sugerencias */
  profession?: string | null;
  onResult?: (result: CerebroResult) => void;
  className?: string;
}

/**
 * Chips sugeridos según rol, profesión y lo que más buscás (aprende de tus clics).
 */
export default function SuggestedChipsSection({
  profession: professionProp,
  onResult,
  className = "",
}: SuggestedChipsSectionProps) {
  const { identity } = useSession();
  const primaryRole = (identity?.roles?.[0] ?? "vale") as CerebroRole;
  const userId = identity?.userId ?? "safe-user";
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    setRecentIds(getRecentChipIds());
  }, []);

  const suggested = useMemo(
    () => getSuggestedChips(primaryRole, professionProp, recentIds),
    [primaryRole, professionProp, recentIds]
  );

  if (suggested.length === 0) return null;

  const chips = suggested.map(toCategoryChipConfig);

  return (
    <section
      className={`rounded-xl bg-yapo-white/90 p-3 shadow-sm border border-yapo-blue/10 ${className}`}
      aria-label="Sugeridos para vos"
    >
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-blue">
        Sugeridos para vos
      </h2>
      <p className="mb-3 text-xs text-foreground/80">
        Según tu rol, profesión y lo que más buscás. Tocá para buscar o activar.
      </p>
      <div className="flex flex-wrap gap-2" role="list">
        {chips.map((chip) => (
          <div key={chip.id} role="listitem" className="shrink-0">
            <CategoryBubbleChip
              chip={chip}
              currentRole={primaryRole}
              userId={userId}
              onResult={onResult}
              showStats={false}
              showTooltip
            />
          </div>
        ))}
      </div>
    </section>
  );
}
