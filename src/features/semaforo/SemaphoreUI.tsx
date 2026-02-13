"use client";

import type { SemaphoreState, SemaphoreResult } from "./types";
import { SEMAPHORE_STATE_LABELS } from "./types";

const DESCRIPTIONS: Record<SemaphoreState, string> = {
  green: "Operaciones permitidas según tu rol",
  yellow: "Algunas acciones requieren validación",
  red: "Acciones sensibles bloqueadas",
};

const STYLES: Record<
  SemaphoreState,
  { dot: string; card: string; label: string; bg: string }
> = {
  green: {
    dot: "bg-emerald-500",
    card: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800",
    label: "text-emerald-800 dark:text-emerald-200",
    bg: "bg-emerald-500",
  },
  yellow: {
    dot: "bg-amber-500",
    card: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
    label: "text-amber-800 dark:text-amber-200",
    bg: "bg-amber-500",
  },
  red: {
    dot: "bg-red-500",
    card: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
    label: "text-red-800 dark:text-red-200",
    bg: "bg-red-500",
  },
};

export interface SemaphoreUIProps {
  /** Estado actual del semáforo (verde / amarillo / rojo). */
  state: SemaphoreState;
  /** Razón o mensaje opcional (ej. desde SemaphoreResult.reason). */
  reason?: string | null;
  /** Si se muestra compacto (solo punto + etiqueta) o card completo. */
  variant?: "badge" | "card";
  /** Clases adicionales. */
  className?: string;
  /** Accesibilidad: aria-label. */
  "aria-label"?: string;
}

/**
 * UI visible del semáforo: Verde / Amarillo / Rojo.
 * variant badge = punto + texto; variant card = bloque con descripción.
 */
export default function SemaphoreUI({
  state,
  reason,
  variant = "card",
  className = "",
  "aria-label": ariaLabel,
}: SemaphoreUIProps) {
  const styles = STYLES[state];
  const label = SEMAPHORE_STATE_LABELS[state];
  const description = DESCRIPTIONS[state];
  const message = reason ?? description;

  if (variant === "badge") {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${styles.card} ${styles.label} ${className}`}
        role="status"
        aria-label={ariaLabel ?? `Semáforo ${label}`}
      >
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${styles.dot}`} aria-hidden />
        {label}
      </span>
    );
  }

  return (
    <section
      className={`rounded-xl border p-4 ${styles.card} ${className}`}
      aria-label={ariaLabel ?? "Estado del semáforo"}
      role="status"
    >
      <div className="flex items-center gap-3">
        <span
          className={`h-10 w-10 shrink-0 rounded-full ${styles.dot}`}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className={`font-semibold ${styles.label}`}>{label}</p>
          <p className="mt-0.5 text-sm text-foreground/70">{message}</p>
        </div>
      </div>
    </section>
  );
}

export interface SemaphoreFromResultProps {
  result: SemaphoreResult;
  variant?: "badge" | "card";
  className?: string;
}

/** Envuelve SemaphoreUI con un SemaphoreResult (estado + razón). */
export function SemaphoreFromResult({
  result,
  variant = "card",
  className,
}: SemaphoreFromResultProps) {
  return (
    <SemaphoreUI
      state={result.state}
      reason={result.reason}
      variant={variant}
      className={className}
    />
  );
}
