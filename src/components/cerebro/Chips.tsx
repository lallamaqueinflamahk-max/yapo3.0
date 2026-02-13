"use client";

import { useCallback } from "react";
import { MVP_CHIPS, MVP_CHIPS_SECONDARY } from "@/data/chips.mvp";
import type { ChipMvp } from "@/data/chips.mvp";
import type { CerebroIntent } from "@/lib/ai/intents";

export interface CerebroChipsProps {
  /** Al tocar un chip: emite intent estructurado para que el Cerebro decida y ejecute. */
  onIntent: (intent: CerebroIntent) => void;
  /** Controla el bottom sheet "Más opciones" (el Cerebro autoriza; el padre abre/cierra). */
  moreSheetOpen?: boolean;
  onMoreSheetClose?: () => void;
  className?: string;
}

function buildIntent(chip: ChipMvp): CerebroIntent {
  return {
    intentId: chip.intentId,
    payload: chip.payload,
    label: chip.label,
  };
}

/** Chip bubble: colorido, tap feedback claro; cada tap ejecuta el comando del Cerebro. */
function ChipBubble({
  chip,
  onTap,
}: {
  chip: ChipMvp;
  onTap: (intent: CerebroIntent) => void;
}) {
  const handleClick = useCallback(() => {
    onTap(buildIntent(chip));
  }, [chip, onTap]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border-2 border-yapo-blue/50 bg-yapo-blue-light px-4 py-2.5 text-sm font-semibold text-yapo-blue shadow-md transition-[transform,background,box-shadow,border-color] duration-150 hover:border-yapo-blue/70 hover:bg-yapo-blue-light hover:shadow-lg active:scale-95 active:border-yapo-blue active:bg-yapo-blue/20 active:shadow-[0_0_16px_rgba(0,35,149,0.3)] touch-manipulation"
      aria-label={chip.label}
    >
      <span className="text-base leading-none" aria-hidden>
        {chip.icon}
      </span>
      <span className="truncate max-w-[120px] sm:max-w-[140px]">{chip.label}</span>
    </button>
  );
}

/**
 * Set MVP de chips del Cerebro.
 * Chips redondos (bubble), scroll horizontal, tap → emit intent → Cerebro decide → ejecutar.
 * "Más opciones" abre bottom sheet con chips secundarios (controlado por padre según Cerebro).
 */
export default function Chips({
  onIntent,
  moreSheetOpen = false,
  onMoreSheetClose,
  className = "",
}: ChipsProps) {
  const handleChipTap = useCallback(
    (intent: CerebroIntent) => {
      onIntent(intent);
    },
    [onIntent]
  );

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        role="list"
        aria-label="Chips de intención"
      >
        {MVP_CHIPS.map((chip) => (
          <div key={chip.id} role="listitem" className="shrink-0">
            <ChipBubble chip={chip} onTap={handleChipTap} />
          </div>
        ))}
      </div>

      {/* Bottom sheet: Más opciones (chips secundarios) */}
      {moreSheetOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            aria-hidden
            onClick={onMoreSheetClose}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t-2 border-yapo-blue/30 bg-yapo-blue-light/40 p-4 pb-[env(safe-area-inset-bottom)] shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Más opciones"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-yapo-blue">Más opciones</h2>
              <button
                type="button"
                onClick={onMoreSheetClose}
                className="flex h-10 w-10 items-center justify-center rounded-full text-yapo-blue transition-[background] active:bg-yapo-blue/10"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {MVP_CHIPS_SECONDARY.map((chip) => (
                <ChipBubble
                  key={chip.id}
                  chip={chip}
                  onTap={(intent) => {
                    handleChipTap(intent);
                    onMoreSheetClose?.();
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
