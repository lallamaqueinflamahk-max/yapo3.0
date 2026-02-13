"use client";

import { useState, useCallback, useEffect } from "react";
import {
  createBiometricProvider,
  type BiometricType,
  type BiometricPayload,
} from "@/lib/auth/biometric";

type ModalStatus = "idle" | "capturing" | "success" | "error" | "cancelled";

export interface BiometricModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** Tipo a simular (por defecto device para stub). */
  type?: BiometricType;
  /** Título del modal. */
  title?: string;
  /** No reintentar en bucle: un intento + un retry máximo. */
  maxAttempts?: number;
  className?: string;
}

/**
 * Modal biométrico mobile-first.
 * Muestra "Verificación requerida" → captura (stub simula) → "Verificación exitosa" o error.
 * Sin bucles infinitos: máximo maxAttempts intentos.
 */
export default function BiometricModal({
  open,
  onClose,
  onSuccess,
  type = "device",
  title = "Verificación requerida",
  maxAttempts = 2,
  className = "",
}: BiometricModalProps) {
  const [status, setStatus] = useState<ModalStatus>("idle");
  const [message, setMessage] = useState<string>("");
  const [attempts, setAttempts] = useState(0);
  const provider = createBiometricProvider();

  const runVerification = useCallback(async () => {
    if (attempts >= maxAttempts) {
      setStatus("error");
      setMessage("Máximo de intentos alcanzado. Cerrando.");
      return;
    }
    setStatus("capturing");
    setMessage("Verificá tu identidad…");
    setAttempts((a) => a + 1);

    try {
      const payload: BiometricPayload | null = await provider.capture(type);
      if (!payload) {
        setStatus("error");
        setMessage("No se pudo capturar. Intentá de nuevo.");
        return;
      }
      const result = await provider.verify(payload);
      if (result.success) {
        setStatus("success");
        setMessage("Verificación exitosa");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 500);
      } else {
        setStatus("error");
        setMessage(result.reason ?? "Verificación fallida");
      }
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Error inesperado");
    }
  }, [provider, type, attempts, maxAttempts, onSuccess, onClose]);

  useEffect(() => {
    if (open && status === "idle" && attempts === 0) {
      runVerification();
    }
  }, [open, status, attempts, runVerification]);

  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setMessage("");
      setAttempts(0);
    }
  }, [open]);

  const handleCancel = useCallback(() => {
    setStatus("cancelled");
    onClose();
  }, [onClose]);

  const handleRetry = useCallback(() => {
    setStatus("idle");
    setMessage("");
    runVerification();
  }, [runVerification]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center sm:items-center ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="biometric-modal-title"
      aria-describedby="biometric-modal-desc"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden
        onClick={handleCancel}
      />
      <div className="relative z-10 w-full max-w-sm rounded-t-2xl bg-yapo-white p-6 shadow-xl sm:rounded-2xl">
        <h2
          id="biometric-modal-title"
          className="text-lg font-semibold text-foreground"
        >
          {title}
        </h2>
        <p id="biometric-modal-desc" className="mt-2 text-sm text-foreground/80">
          {status === "capturing" && (message || "Verificá tu identidad…")}
          {status === "success" && "Verificación exitosa"}
          {status === "error" && message}
          {status === "idle" && "Verificación requerida"}
        </p>

        {status === "capturing" && (
          <div className="mt-4 flex justify-center" aria-hidden>
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-yapo-blue border-t-transparent" />
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          {status === "error" && attempts < maxAttempts && (
            <button
              type="button"
              onClick={handleRetry}
              className="min-h-[44px] rounded-xl bg-yapo-blue px-4 font-medium text-yapo-white transition-[transform,opacity] active:scale-[0.98]"
            >
              Reintentar
            </button>
          )}
          {(status === "idle" || status === "error" || status === "capturing") && (
            <button
              type="button"
              onClick={handleCancel}
              className="min-h-[44px] rounded-xl border border-yapo-blue/30 bg-transparent px-4 font-medium text-foreground transition-[transform,opacity] active:scale-[0.98]"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
