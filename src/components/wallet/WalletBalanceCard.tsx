"use client";

import type { BalanceData } from "@/lib/wallet";

const CURRENCY = "PYG";

function formatAmount(value: number): string {
  return value.toLocaleString("es-PY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export interface WalletBalanceCardProps {
  /** Balance canónico (disponible, protegido, total). Solo lectura. */
  balance: BalanceData | null;
  loading?: boolean;
  error?: string;
  /** Estado de la wallet (locked/suspended) para mensaje contextual */
  walletEstado?: "active" | "locked" | "suspended";
}

/**
 * Tarjeta de saldo: Disponible y Protegido.
 * Mobile-first, táctil; nunca modifica balance desde la UI.
 */
export default function WalletBalanceCard({
  balance,
  loading,
  error,
  walletEstado,
}: WalletBalanceCardProps) {
  if (loading) {
    return (
      <section
        className="rounded-3xl border-2 border-yapo-blue/20 bg-gradient-to-b from-yapo-blue/5 to-yapo-white p-6 shadow-md"
        aria-busy="true"
      >
        <div className="h-24 animate-pulse rounded-2xl bg-yapo-blue/10" />
        <p className="mt-3 text-sm text-foreground/60">Cargando saldo…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className="rounded-3xl border-2 border-yapo-red/30 bg-yapo-white p-6 shadow-md"
        role="alert"
      >
        <p className="text-yapo-red-dark">{error}</p>
      </section>
    );
  }

  if (!balance) {
    return (
      <section className="rounded-3xl border-2 border-yapo-blue/20 bg-yapo-white p-6 shadow-md">
        <p className="text-foreground/60">Sin saldo para mostrar.</p>
      </section>
    );
  }

  const isLocked = walletEstado === "locked" || walletEstado === "suspended";

  return (
    <section
      className="nav-card-interactive rounded-3xl border-2 border-yapo-blue/25 bg-gradient-to-b from-yapo-blue/10 to-yapo-white p-6 shadow-md hover:border-yapo-cta/30"
      aria-label="Saldo de billetera"
    >
      {isLocked && (
        <p className="mb-3 rounded-xl bg-amber-100 px-3 py-2 text-sm font-medium text-amber-800">
          Billetera {walletEstado === "locked" ? "bloqueada" : "suspendida"}
        </p>
      )}
      <div className="space-y-5">
        <div>
          <p className="text-sm font-medium text-yapo-blue/80">Disponible</p>
          <p
            className="mt-1 text-3xl font-bold tabular-nums text-yapo-blue sm:text-4xl"
            data-testid="balance-disponible"
          >
            {formatAmount(balance.disponible)}{" "}
            <span className="text-xl font-semibold text-yapo-blue/90 sm:text-2xl">
              {CURRENCY}
            </span>
          </p>
        </div>
        <div className="border-t border-yapo-blue/20 pt-4">
          <p className="text-sm font-medium text-yapo-blue/70">Protegido</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-yapo-blue/90">
            {formatAmount(balance.protegido)} {CURRENCY}
          </p>
        </div>
        {balance.total !== balance.disponible + balance.protegido ? null : (
          <p className="text-xs text-foreground/50">
            Total: {formatAmount(balance.total)} {CURRENCY}
          </p>
        )}
      </div>
    </section>
  );
}
