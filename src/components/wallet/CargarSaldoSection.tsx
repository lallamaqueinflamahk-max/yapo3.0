"use client";

import { useState } from "react";

const MIN_PYG = 1000;
const DEFAULT_PYG = 50000;

export interface CargarSaldoSectionProps {
  userId: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

/**
 * Sección "Cargar saldo": monto + proveedor (Stripe/Pagopar), llama a create-intent y redirige al checkout.
 * UX: validación local, loading, mensaje de error con reintento.
 */
export default function CargarSaldoSection({
  userId,
  onSuccess,
  onError,
  className = "",
}: CargarSaldoSectionProps) {
  const [amount, setAmount] = useState(String(DEFAULT_PYG));
  const [provider, setProvider] = useState<"pagopar" | "stripe">("pagopar");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isStripe = provider === "stripe";
  const minAmount = isStripe ? 1 : MIN_PYG;
  const unitLabel = isStripe ? "USD" : "PYG";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const num = isStripe ? Number(amount) : Math.round(Number(amount));
    if (Number.isNaN(num) || num < minAmount) {
      setError(`Monto mínimo ${minAmount} ${unitLabel}`);
      return;
    }
    setLoading(true);
    try {
      const amountCents = isStripe ? Math.round(num * 100) : num;
      const currency = isStripe ? "usd" : "PYG";
      const res = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents,
          currency,
          provider,
          successUrl: `${typeof window !== "undefined" ? window.location.origin : ""}/wallet?payment=success`,
          cancelUrl: `${typeof window !== "undefined" ? window.location.origin : ""}/wallet?payment=cancelled`,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        checkoutUrl?: string;
        error?: string;
        code?: string;
      };
      if (!res.ok) {
        const msg = data.error ?? "No se pudo iniciar el pago";
        setError(msg);
        onError?.(msg);
        return;
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        onSuccess?.();
        return;
      }
      setError("No se recibió enlace de pago. Reintentá.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className={`rounded-2xl border-2 border-yapo-emerald/20 bg-yapo-white p-4 shadow-sm ${className}`}
      aria-label="Cargar saldo"
    >
      <h2 className="text-sm font-semibold text-yapo-emerald-dark">Cargar saldo</h2>
      <p className="mt-1 text-xs text-foreground/70">
        Recargá tu billetera con tarjeta o medios de pago locales (Paraguay: Pagopar; internacional: Stripe).
      </p>
      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
        <label className="block">
          <span className="text-xs font-medium text-foreground/80">Monto ({unitLabel})</span>
          <input
            type="number"
            min={minAmount}
            step={isStripe ? 0.01 : 1000}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-xl border-2 border-yapo-blue/20 bg-background px-4 py-2 text-sm"
            disabled={loading}
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground/80">Proveedor</span>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as "pagopar" | "stripe")}
            className="rounded-lg border border-yapo-blue/20 bg-background px-3 py-1.5 text-sm"
            disabled={loading}
          >
            <option value="pagopar">Pagopar (Paraguay)</option>
            <option value="stripe">Stripe (internacional)</option>
          </select>
        </label>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[44px] rounded-xl bg-yapo-emerald font-semibold text-white border-2 border-yapo-emerald-dark/30 hover:bg-yapo-emerald-dark disabled:opacity-60"
        >
          {loading ? "Redirigiendo…" : "Ir a pagar"}
        </button>
      </form>
    </section>
  );
}
