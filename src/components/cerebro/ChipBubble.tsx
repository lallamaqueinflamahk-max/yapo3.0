"use client";

import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import type { CerebroIntent } from "@/lib/ai/cerebro";

export type ChipBubbleIntentProps = {
  /** Etiqueta visible. */
  label: string;
  /** Icono (emoji o ReactNode). */
  icon: ReactNode;
  /** Intent a emitir al tocar. */
  intent: CerebroIntent;
  /** Llamado al tocar: recibe el intent; el padre ejecuta CerebroEngine y opcionalmente devuelve resultado. */
  onIntent: (intent: CerebroIntent) => void | CerebroResultLike | Promise<void | CerebroResultLike>;
  /** Estado opcional desde el padre (loading, success) para feedback visual. */
  status?: "idle" | "loading" | "success" | "denied";
};

export type CerebroResultLike = {
  allowed?: boolean;
  message?: string;
  requiresValidation?: boolean;
};

/** Chip bubble: emite intent (intentId + payload); UI Paraguay, microinteracciones. */
export function ChipBubbleIntent({
  label,
  icon,
  intent,
  onIntent,
  status: controlledStatus,
}: ChipBubbleIntentProps) {
  const [localStatus, setLocalStatus] = useState<"idle" | "loading" | "success" | "denied">("idle");
  const status = controlledStatus ?? localStatus;

  const handlePress = useCallback(() => {
    setLocalStatus("loading");
    const out = onIntent(intent);
    if (out && typeof (out as Promise<unknown>).then === "function") {
      (out as Promise<CerebroResultLike | void>).then((res) => {
        if (res?.allowed === false) setLocalStatus("denied");
        else setLocalStatus("success");
        setTimeout(() => setLocalStatus("idle"), 800);
      });
    } else {
      const res = out as CerebroResultLike | undefined;
      if (res?.allowed === false) setLocalStatus("denied");
      else setLocalStatus("success");
      setTimeout(() => setLocalStatus("idle"), 800);
    }
  }, [intent, onIntent]);

  const isDisabled = status === "loading";
  const isSuccess = status === "success";
  const isDenied = status === "denied";

  return (
    <button
      type="button"
      onClick={handlePress}
      disabled={isDisabled}
      className={`
        inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border-2 px-4 py-2.5 text-sm font-semibold
        shadow-sm transition-all duration-150 touch-manipulation
        active:scale-95
        disabled:opacity-70 disabled:pointer-events-none
        ${isSuccess ? "border-yapo-emerald bg-yapo-emerald-light text-yapo-emerald" : ""}
        ${isDenied ? "border-yapo-red/60 bg-yapo-red-light text-yapo-red" : ""}
        ${status === "idle" ? "border-yapo-blue/50 bg-yapo-blue-light text-yapo-blue shadow-md hover:shadow-lg active:bg-yapo-blue/20 active:shadow-[0_0_16px_rgba(0,35,149,0.3)]" : ""}
        ${status === "loading" ? "border-yapo-blue/40 bg-yapo-blue-light text-yapo-blue" : ""}
      `}
      aria-label={label}
      aria-busy={isDisabled}
    >
      <span className="text-base leading-none" aria-hidden>
        {status === "loading" ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-yapo-blue border-t-transparent" />
        ) : (
          icon
        )}
      </span>
      <span className="truncate max-w-[120px] sm:max-w-[140px]">{label}</span>
    </button>
  );
}

/** Props clásicas: label + icon + onPress (sin intent). Mantiene compatibilidad. */
export type ChipBubbleProps = {
  label: string;
  icon: ReactNode;
  onPress: () => void;
};

export function ChipBubble({ label, icon, onPress }: ChipBubbleProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border-2 border-yapo-blue/50 bg-yapo-blue-light px-4 py-2.5 text-sm font-semibold text-yapo-blue shadow-md transition-[transform,background,box-shadow] duration-150 active:scale-95 active:bg-yapo-blue/20 active:shadow-[0_0_16px_rgba(0,35,149,0.3)] touch-manipulation"
      aria-label={label}
    >
      {icon}
      <span className="truncate max-w-[120px] sm:max-w-[140px]">{label}</span>
    </button>
  );
}
