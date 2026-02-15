"use client";

import { useState, useCallback } from "react";
import Button from "@/components/ui/Button";

export interface RecibirSectionProps {
  userId: string;
  className?: string;
}

/**
 * Sección Recibir: muestra tu usuario para que te envíen; opción copiar.
 * No mueve balances; solo informa.
 */
export default function RecibirSection({ userId, className = "" }: RecibirSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(userId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [userId]);

  return (
    <section
      className={`rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-4 shadow-sm ${className}`}
      aria-label="Recibir"
    >
      <h2 className="text-sm font-semibold text-yapo-blue">Recibir</h2>
      <p className="mt-1 text-xs text-foreground/70">
        Tu usuario para que te envíen transferencias:
      </p>
      <div className="mt-3 flex items-center gap-2 rounded-xl border-2 border-yapo-blue/15 bg-background/50 px-4 py-3">
        <code className="flex-1 truncate text-sm font-medium text-yapo-blue" title={userId}>
          {userId}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="btn-interactive min-h-[44px] min-w-[44px] shrink-0 rounded-xl bg-yapo-blue/15 font-semibold text-yapo-blue shadow-sm border-2 border-yapo-blue/30 hover:bg-yapo-blue/25"
          aria-label="Copiar usuario"
        >
          {copied ? "✓" : "Copiar"}
        </button>
      </div>
    </section>
  );
}
