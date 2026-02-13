"use client";

import { useState, useCallback } from "react";
import { decide } from "@/lib/ai/cerebro";
import type { CerebroResult } from "@/lib/ai/cerebro";
import type { RoleId } from "@/lib/auth";
import type { BiometricLevel } from "@/lib/auth/biometric";
import { setBiometricValidated } from "@/lib/security";
import Button from "@/components/ui/Button";
import { BiometricValidationModal } from "@/components/biometric";

const CURRENCY = "PYG";

export interface SendFlowProps {
  currentUserId: string;
  /** Rol principal para CerebroContext (wallet_transfer). */
  role: RoleId;
  onSuccess?: () => void;
  onClose: () => void;
}

/**
 * Flujo Enviar controlado por Cerebro: intent wallet_transfer.
 * Muestra mensaje, requiresValidation (biometría) y estado final; no mueve balances desde UI.
 */
export default function SendFlow({
  currentUserId,
  role,
  onSuccess,
  onClose,
}: SendFlowProps) {
  const [toUserId, setToUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CerebroResult | null>(null);
  const [biometricOpen, setBiometricOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<{ toUserId: string; amount: number } | null>(
    null
  );
  const [pendingBiometricLevel, setPendingBiometricLevel] = useState<BiometricLevel>(2);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setResult(null);
      const to = toUserId.trim();
      const amt = parseFloat(amount.replace(",", "."));

      if (!to) {
        setResult({
          message: "Indicá a quién querés transferir.",
          requiresValidation: false,
        });
        return;
      }
      if (!Number.isFinite(amt) || amt <= 0) {
        setResult({
          message: "El monto debe ser un número positivo.",
          requiresValidation: false,
        });
        return;
      }
      if (to === currentUserId) {
        setResult({
          message: "No podés transferirte a vos mismo.",
          requiresValidation: false,
        });
        return;
      }

      setLoading(true);
      try {
        const cerebroResult = decide(
          {
            intentId: "wallet_transfer",
            payload: { toUserId: to, amount: amt },
            source: "system",
          },
          {
            userId: currentUserId,
            role,
            currentScreen: "/wallet",
          }
        );
        setResult(cerebroResult);
        if (cerebroResult.state?.transactionId && cerebroResult.state?.status === "completed") {
          setToUserId("");
          setAmount("");
          onSuccess?.();
        }
        if (
          cerebroResult.requiresValidation === true &&
          (cerebroResult.requiresBiometricLevel != null || cerebroResult.message)
        ) {
          setPendingPayload({ toUserId: to, amount: amt });
          setPendingBiometricLevel((cerebroResult.requiresBiometricLevel ?? 2) as BiometricLevel);
          setBiometricOpen(true);
        }
      } catch (err) {
        setResult({
          message: err instanceof Error ? err.message : "Error al procesar la transferencia.",
          requiresValidation: false,
        });
      } finally {
        setLoading(false);
      }
    },
    [currentUserId, role, onSuccess]
  );

  const handleBiometricValidated = useCallback(
    (level: BiometricLevel) => {
      if (!pendingPayload) return;
      setBiometricValidated(level);
      const cerebroResult = decide(
        {
          intentId: "wallet_transfer",
          payload: { toUserId: pendingPayload.toUserId, amount: pendingPayload.amount },
          source: "system",
        },
        {
          userId: currentUserId,
          role,
          currentScreen: "/wallet",
          biometricValidated: { level, at: Date.now() },
        }
      );
      setBiometricOpen(false);
      setPendingPayload(null);
      setResult(cerebroResult);
      if (cerebroResult.state?.transactionId && cerebroResult.state?.status === "completed") {
        setToUserId("");
        setAmount("");
        onSuccess?.();
      }
    },
    [currentUserId, role, pendingPayload, onSuccess]
  );

  const handleBiometricAbort = useCallback(() => {
    setBiometricOpen(false);
    setPendingPayload(null);
  }, []);

  const requiresBiometric = result?.requiresValidation === true && !!result?.message;
  const showBiometricModal = biometricOpen && pendingPayload !== null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-flow-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90dvh] w-full flex-col rounded-t-3xl bg-yapo-white shadow-2xl sm:max-w-md sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-yapo-blue/15 p-4">
          <h2 id="send-flow-title" className="text-lg font-bold text-yapo-blue">
            Enviar
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-full text-foreground/70 transition-[transform,color] active:scale-95 active:text-yapo-red"
            aria-label="Cerrar"
          >
            <span className="text-xl">×</span>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto p-4">
          <p className="mb-4 text-sm text-foreground/70">
            La transferencia se valida con el Cerebro (guard y permisos).
          </p>
          <label className="block mb-3">
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
          <label className="block mb-4">
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

          {result?.message && (
            <div
              role="alert"
              className={`mb-4 rounded-xl border-2 p-4 ${
                requiresBiometric
                  ? "border-amber-400 bg-amber-50 text-amber-900"
                  : result.state?.transactionId
                    ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                    : "border-yapo-red/30 bg-yapo-red/5 text-yapo-red-dark"
              }`}
            >
              <p className="text-sm font-medium">{result.message}</p>
              {requiresBiometric && (
                <p className="mt-2 text-xs opacity-90">
                  Completá la validación biométrica en Perfil o Billetera para poder enviar.
                </p>
              )}
              {result.state?.transactionId && (
                <p className="mt-2 text-xs opacity-90">
                  Transacción: {String(result.state.transactionId)}
                </p>
              )}
            </div>
          )}

          <div className="mt-auto flex gap-3 pt-4">
            <Button
              type="button"
              variant="white"
              onClick={onClose}
              className="flex-1 min-h-[52px] rounded-2xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="red"
              disabled={loading}
              className="flex-1 min-h-[52px] rounded-2xl"
            >
              {loading ? "Enviando…" : "Enviar"}
            </Button>
          </div>
        </form>
      </div>

      {showBiometricModal && pendingPayload && (
        <BiometricValidationModal
          open={true}
          requiredLevel={pendingBiometricLevel}
          message={result?.message}
          validationType={result?.validationType ?? "biometric"}
          onClose={handleBiometricAbort}
          onValidated={handleBiometricValidated}
          onAbort={handleBiometricAbort}
        />
      )}
    </div>
  );
}
