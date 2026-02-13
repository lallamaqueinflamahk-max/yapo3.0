"use client";

import { useState } from "react";

const CURRENCY = "PYG";

interface TransferFormProps {
  currentUserId: string;
  onRequestTransfer: (to: string, amount: number) => { success: boolean; transactionId?: string; error?: string };
  onApplyHold: (txId: string) => { success: boolean; error?: string };
  onSuccess?: () => void;
}

/**
 * Formulario: usuario destino, monto, Enviar.
 * Al enviar: requestTransfer() luego holdTransaction(). Nunca modifica balance directo.
 */
export default function TransferForm({
  currentUserId,
  onRequestTransfer,
  onApplyHold,
  onSuccess,
}: TransferFormProps) {
  const [toUserId, setToUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const to = toUserId.trim();
    const amt = parseFloat(amount.replace(",", "."));

    if (!to) {
      setMessage({ type: "error", text: "Ingresá el usuario destinatario." });
      return;
    }
    if (Number.isNaN(amt) || amt <= 0) {
      setMessage({ type: "error", text: "Monto debe ser un número positivo." });
      return;
    }
    if (to === currentUserId) {
      setMessage({ type: "error", text: "No podés transferirte a vos mismo." });
      return;
    }

    setLoading(true);
    try {
      const result = onRequestTransfer(to, amt);
      if (!result.success) {
        setMessage({ type: "error", text: result.error ?? "Error al solicitar transferencia." });
        setLoading(false);
        return;
      }
      if (!result.transactionId) {
        setMessage({ type: "error", text: "No se creó la transacción." });
        setLoading(false);
        return;
      }
      const holdResult = onApplyHold(result.transactionId);
      if (!holdResult.success) {
        setMessage({ type: "error", text: holdResult.error ?? "Error al retener fondos." });
        setLoading(false);
        return;
      }
      setMessage({ type: "ok", text: "Transferencia enviada (retenida). El destinatario verá el monto al liberarse." });
      setToUserId("");
      setAmount("");
      onSuccess?.();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error en la transferencia",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-6 shadow-sm"
      aria-label="Transferencia"
    >
      <h2 className="text-lg font-semibold text-yapo-blue">Transferir</h2>
      <p className="mt-1 text-sm text-foreground/70">
        Usuario destino y monto. No es dinero real; lógica real.
      </p>
      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-foreground/80">Usuario destino</span>
          <input
            type="text"
            value={toUserId}
            onChange={(e) => setToUserId(e.target.value)}
            placeholder="ej. user-2"
            className="mt-1 min-h-[48px] w-full rounded-xl border-2 border-yapo-blue/20 bg-background px-4 py-3 text-base outline-none focus:border-yapo-blue"
            disabled={loading}
            autoComplete="off"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-foreground/80">Monto ({CURRENCY})</span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            className="mt-1 min-h-[48px] w-full rounded-xl border-2 border-yapo-blue/20 bg-background px-4 py-3 tabular-nums outline-none focus:border-yapo-blue"
            disabled={loading}
          />
        </label>
      </div>
      {message && (
        <p
          role="alert"
          className={`mt-3 text-sm ${message.type === "ok" ? "text-yapo-blue" : "text-yapo-red-dark"}`}
        >
          {message.text}
        </p>
      )}
      <div className="mt-6">
        <button
          type="submit"
          disabled={loading}
          className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-yapo-red px-4 py-3 font-semibold text-yapo-white transition-[transform] active:scale-[0.98] disabled:opacity-70"
        >
          {loading ? "Enviando…" : "Enviar"}
        </button>
      </div>
    </form>
  );
}
