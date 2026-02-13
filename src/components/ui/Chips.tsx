"use client";

import { useCallback, useState } from "react";
import type { ChipItem } from "@/lib/ai/chipData";
import type { CerebroIntent } from "@/lib/ai/engine/cerebroIntent";

export interface ChipsProps {
  /** Chips visibles (máx 8 recomendado). */
  items: ChipItem[];
  /** Chips adicionales para "más" (bottom sheet). */
  moreItems?: ChipItem[];
  /** Al tocar un chip: emite el intent (no string suelto). */
  onIntent: (intent: CerebroIntent) => void;
  /** Clases del contenedor. */
  className?: string;
}

/** Íconos por nombre (SVG inline, Paraguay-friendly). */
function ChipIcon({ name, className }: { name: string; className?: string }) {
  const c = className ?? "h-5 w-5";
  switch (name) {
    case "wallet":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={c} aria-hidden>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={c} aria-hidden>
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      );
    case "profile":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={c} aria-hidden>
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "briefcase":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={c} aria-hidden>
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
        </svg>
      );
    case "users":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={c} aria-hidden>
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      );
    case "help":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={c} aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </svg>
      );
    case "search":
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={c} aria-hidden>
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      );
  }
}

const variantStyles = {
  red: "border-yapo-red/40 bg-yapo-red/10 text-yapo-red active:scale-95 active:bg-yapo-red/20 active:shadow-[0_0_12px_rgba(213,43,30,0.3)]",
  blue: "border-yapo-blue/40 bg-yapo-blue/10 text-yapo-blue active:scale-95 active:bg-yapo-blue/20 active:shadow-[0_0_12px_rgba(0,56,168,0.25)]",
  white: "border-yapo-blue/30 bg-yapo-white text-yapo-blue shadow-sm active:scale-95 active:border-yapo-blue/50 active:shadow-[0_0_12px_rgba(0,56,168,0.15)]",
};

/**
 * Chip pill 100% redondo (bubble), Paraguay (rojo, blanco, azul), ícono + texto.
 * Tap-friendly, animación al touch (scale + glow suave).
 */
function Chip({
  item,
  onIntent,
}: {
  item: ChipItem;
  onIntent: (intent: CerebroIntent) => void;
}) {
  const variant = item.variant ?? "blue";
  const handleClick = useCallback(() => {
    onIntent(item.intent);
  }, [item, onIntent]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border-2 px-4 py-2.5 text-sm font-semibold transition-[transform,background,box-shadow] duration-150 touch-manipulation ${variantStyles[variant]}`}
      aria-label={item.label}
    >
      <ChipIcon name={item.icon} />
      <span className="truncate max-w-[120px] sm:max-w-[140px]">{item.label}</span>
    </button>
  );
}

/**
 * Lista de chips: scroll horizontal, máx 8 visibles, botón "más" que abre bottom sheet.
 */
export default function Chips({ items, moreItems = [], onIntent, className = "" }: ChipsProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const hasMore = moreItems.length > 0;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        role="list"
        aria-label="Chips de intención"
      >
        {items.map((item) => (
          <div key={item.id} role="listitem" className="shrink-0">
            <Chip item={item} onIntent={onIntent} />
          </div>
        ))}
        {hasMore && (
          <div className="shrink-0" role="listitem">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border-2 border-dashed border-yapo-blue/50 bg-yapo-blue/5 text-yapo-blue transition-[transform,background] active:scale-95 active:bg-yapo-blue/15"
              aria-label="Ver más chips"
            >
              <span className="text-lg font-bold">+</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom sheet: más chips */}
      {sheetOpen && hasMore && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            aria-hidden
            onClick={() => setSheetOpen(false)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-yapo-blue/20 bg-yapo-white p-4 pb-[env(safe-area-inset-bottom)] shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Más opciones"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-yapo-blue">Más opciones</h2>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-yapo-blue transition-[background] active:bg-yapo-blue/10"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {moreItems.map((item) => (
                <Chip key={item.id} item={item} onIntent={(intent) => { onIntent(intent); setSheetOpen(false); }} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
