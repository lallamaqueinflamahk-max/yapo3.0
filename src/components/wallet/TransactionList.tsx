"use client";

import { useState } from "react";
import type { Transaction, TransactionStatus } from "@/lib/wallet";

const CURRENCY = "PYG";

function formatAmount(value: number): string {
  return value.toLocaleString("es-PY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Estilos por estado: Pending=amarillo, Held=azul, Released=verde, Blocked=rojo */
const STATUS_STYLES: Record<TransactionStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-300",
  held: "bg-yapo-blue/15 text-yapo-blue border-yapo-blue/40",
  released: "bg-emerald-100 text-emerald-800 border-emerald-300",
  blocked: "bg-yapo-red/15 text-yapo-red-dark border-yapo-red/40",
  audit: "bg-foreground/10 text-foreground/80 border-foreground/20",
};

const STATUS_LABELS: Record<TransactionStatus, string> = {
  pending: "Pendiente",
  held: "Retenido",
  released: "Liberado",
  blocked: "Bloqueado",
  audit: "Auditoría",
};

interface TransactionListProps {
  transactions: Transaction[];
  currentUserId: string;
  onRelease?: (txId: string) => { success: boolean; error?: string };
  onBlock?: (txId: string) => { success: boolean; error?: string };
  onReleaseSuccess?: () => void;
  onBlockSuccess?: () => void;
  loading?: boolean;
  error?: string;
}

/**
 * Historial de transacciones con estados visuales.
 * Pending=amarillo, Held=azul, Released=verde, Blocked=rojo.
 * Botón Liberar pasa por Cerebro; si no autorizado: "requiere validación superior".
 */
export default function TransactionList({
  transactions,
  currentUserId,
  onRelease,
  onBlock,
  onReleaseSuccess,
  onBlockSuccess,
  loading,
  error,
}: TransactionListProps) {
  if (loading) {
    return (
      <section
        className="rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-6 shadow-sm"
        aria-busy="true"
      >
        <h2 className="text-lg font-semibold text-yapo-blue">Historial</h2>
        <p className="mt-2 text-foreground/60">Cargando…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className="rounded-2xl border-2 border-yapo-red/30 bg-yapo-white p-6 shadow-sm"
        role="alert"
      >
        <h2 className="text-lg font-semibold text-yapo-blue">Historial</h2>
        <p className="mt-2 text-yapo-red-dark">{error}</p>
      </section>
    );
  }

  const sorted = [...transactions].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <section
      className="rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-6 shadow-sm"
      aria-label="Historial de transacciones"
    >
      <h2 className="text-lg font-semibold text-yapo-blue">Historial</h2>
      {sorted.length === 0 ? (
        <p className="mt-3 text-sm text-foreground/60">Aún no hay movimientos.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {sorted.map((tx) => {
            const isOut = tx.from === currentUserId;
            const counterpart = isOut ? tx.to : tx.from;
            const statusStyle = STATUS_STYLES[tx.status] ?? STATUS_STYLES.audit;
            const statusLabel = STATUS_LABELS[tx.status] ?? tx.status;
            const canRelease = tx.status === "held" && isOut && onRelease;
            const canBlock = (tx.status === "pending" || tx.status === "held") && isOut && onBlock;

            return (
              <li
                key={tx.id}
                className="flex flex-col gap-2 rounded-xl border border-yapo-blue/10 bg-background/50 px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">
                      {isOut ? "A" : "De"}: {counterpart}
                    </span>
                    <span className="ml-2 text-xs text-foreground/50">
                      {new Date(tx.createdAt).toLocaleString("es-PY")}
                    </span>
                  </div>
                  <span
                    className={`tabular-nums font-semibold ${isOut ? "text-yapo-red-dark" : "text-yapo-blue"}`}
                  >
                    {isOut ? "−" : "+"}
                    {formatAmount(tx.amount)} {CURRENCY}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex min-h-[28px] items-center rounded-lg border px-2 py-1 text-xs font-medium ${statusStyle}`}
                  >
                    {statusLabel}
                  </span>
                  {canRelease && (
                    <ReleaseButton
                      txId={tx.id}
                      onRelease={onRelease}
                      onSuccess={onReleaseSuccess}
                    />
                  )}
                  {canBlock && (
                    <BlockButton
                      txId={tx.id}
                      onBlock={onBlock}
                      onSuccess={onBlockSuccess}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ReleaseButton({
  txId,
  onRelease,
  onSuccess,
}: {
  txId: string;
  onRelease: (txId: string) => { success: boolean; error?: string };
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleClick = () => {
    setMsg(null);
    setLoading(true);
    const result = onRelease(txId);
    setLoading(false);
    if (result.success) {
      setMsg("Liberado.");
      onSuccess?.();
    } else {
      const requiresValidation =
        (result.error ?? "").toLowerCase().includes("cerebro") ||
        (result.error ?? "").toLowerCase().includes("autoriz");
      setMsg(
        requiresValidation ? "Requiere validación superior." : result.error ?? "Error al liberar."
      );
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="min-h-[36px] rounded-lg border border-emerald-400 bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-800 transition-[transform] active:scale-95 disabled:opacity-70"
      >
        {loading ? "…" : "Liberar"}
      </button>
      {msg && (
        <span
          className={`text-xs ${msg === "Liberado." ? "text-emerald-700" : "text-yapo-red-dark"}`}
        >
          {msg}
        </span>
      )}
    </div>
  );
}

function BlockButton({
  txId,
  onBlock,
  onSuccess,
}: {
  txId: string;
  onBlock: (txId: string) => { success: boolean; error?: string };
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    const result = onBlock(txId);
    setLoading(false);
    if (result.success) onSuccess?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="min-h-[36px] rounded-lg border border-yapo-red/40 bg-yapo-red/10 px-3 py-1.5 text-xs font-medium text-yapo-red-dark transition-[transform] active:scale-95 disabled:opacity-70"
    >
      {loading ? "…" : "Bloquear"}
    </button>
  );
}
