"use client";

import { useState, useCallback, useEffect } from "react";
import {
  runBiometricValidation,
  isLevel1ConfirmationOnly,
  type BiometricLevel,
} from "@/lib/auth/biometric";

/** Estados visibles para el usuario: claros y sin ambigüedad. */
export type BiometricModalState = "esperando" | "validando" | "éxito" | "fallo";

export interface BiometricValidationModalProps {
  open: boolean;
  /** Nivel requerido: 1 = confirmación, 2 = local (stub), 3 = fuerte. */
  requiredLevel: BiometricLevel;
  onClose: () => void;
  /** Llamado al validar con éxito; nivel usado para continuar flujo. */
  onValidated: (level: BiometricLevel) => void;
  /** Llamado al cancelar o fallar; aborta la operación. Siempre que el usuario cancela. */
  onAbort: () => void;
  /** Mensaje opcional del Cerebro (ej. razón del escudo). */
  message?: string;
  /** Si la validación requerida es biométrica (CerebroResult.validationType === "biometric"). */
  validationType?: "biometric" | "confirmation";
  className?: string;
}

const SUCCESS_DELAY_MS = 600;

/**
 * Modal biométrico mobile-first.
 * Estados: esperando → validando → éxito | fallo.
 * Cancelar siempre aborta la operación. UX clara y confiable.
 */
export default function BiometricValidationModal({
  open,
  requiredLevel,
  onClose,
  onValidated,
  onAbort,
  message,
  validationType = "biometric",
  className = "",
}: BiometricValidationModalProps) {
  const [internalStatus, setInternalStatus] = useState<
    "idle" | "confirm" | "capturing" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const isConfirmOnly = isLevel1ConfirmationOnly(requiredLevel);

  /** Estado mostrado al usuario (esperando | validando | éxito | fallo). */
  const displayState: BiometricModalState =
    internalStatus === "success"
      ? "éxito"
      : internalStatus === "error"
        ? "fallo"
        : internalStatus === "capturing"
          ? "validando"
          : "esperando";

  const handleConfirm = useCallback(() => {
    if (requiredLevel === 1) {
      onValidated(1);
      onClose();
    }
  }, [requiredLevel, onValidated, onClose]);

  const runValidation = useCallback(async () => {
    setInternalStatus("capturing");
    setErrorMessage("");
    const result = await runBiometricValidation(requiredLevel, null);
    if (result.success) {
      setInternalStatus("success");
      setTimeout(() => {
        onValidated(requiredLevel);
        onClose();
      }, SUCCESS_DELAY_MS);
    } else {
      setInternalStatus("error");
      setErrorMessage(result.reason ?? "No se pudo verificar tu identidad.");
    }
  }, [requiredLevel, onValidated, onClose]);

  useEffect(() => {
    if (!open) {
      setInternalStatus("idle");
      setErrorMessage("");
      return;
    }
    if (isConfirmOnly) {
      setInternalStatus("confirm");
      return;
    }
    runValidation();
  }, [open, isConfirmOnly, runValidation]);

  const handleCancel = useCallback(() => {
    onAbort();
    onClose();
  }, [onAbort, onClose]);

  const handleRetry = useCallback(() => {
    setInternalStatus("idle");
    setErrorMessage("");
    if (isConfirmOnly) setInternalStatus("confirm");
    else runValidation();
  }, [isConfirmOnly, runValidation]);

  if (!open) return null;

  const title =
    validationType === "biometric"
      ? "Verificación de seguridad"
      : "Confirmar operación";

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4 ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="biometric-modal-title"
      aria-describedby="biometric-modal-desc"
    >
      <div
        className="absolute inset-0"
        aria-hidden
        onClick={handleCancel}
      />
      <div
        className="relative z-10 w-full max-w-sm rounded-t-3xl bg-yapo-white shadow-2xl pb-[env(safe-area-inset-bottom)] sm:rounded-2xl sm:pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Título */}
        <div className="border-b border-yapo-blue/15 px-5 pt-5 pb-4">
          <h2
            id="biometric-modal-title"
            className="text-xl font-bold text-yapo-blue"
          >
            {title}
          </h2>
          {message && (
            <p id="biometric-modal-desc" className="mt-2 text-sm text-foreground/80">
              {message}
            </p>
          )}
        </div>

        {/* Contenido por estado */}
        <div className="px-5 py-6">
          {displayState === "esperando" && (
            <>
              {internalStatus === "confirm" ? (
                <p className="text-base text-foreground/90">
                  ¿Confirmar que querés realizar esta operación?
                </p>
              ) : (
                <p className="text-base text-foreground/90">
                  Preparando verificación…
                </p>
              )}
            </>
          )}

          {displayState === "validando" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <span
                className="h-12 w-12 animate-spin rounded-full border-2 border-yapo-blue border-t-transparent"
                aria-hidden
              />
              <p className="text-base font-medium text-yapo-blue">
                Verificando tu identidad…
              </p>
              <p className="text-sm text-foreground/70">
                No cierres esta ventana.
              </p>
            </div>
          )}

          {displayState === "éxito" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
                aria-hidden
              >
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <p className="text-base font-semibold text-emerald-800">
                Verificación exitosa
              </p>
              <p className="text-sm text-foreground/70">
                Completando…
              </p>
            </div>
          )}

          {displayState === "fallo" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 rounded-xl border-2 border-yapo-red/20 bg-yapo-red/5 p-4">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yapo-red/15 text-yapo-red-dark"
                  aria-hidden
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
                <div>
                  <p className="font-medium text-yapo-red-dark">No se pudo verificar</p>
                  <p className="mt-1 text-sm text-foreground/80" role="alert">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Acciones: siempre claras; Cancelar = abortar */}
        <div className="flex flex-col gap-3 px-5 pb-5 sm:flex-row sm:justify-end">
          {displayState === "esperando" && internalStatus === "confirm" && (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="min-h-[52px] flex-1 rounded-2xl border-2 border-yapo-blue/30 bg-transparent px-4 font-semibold text-foreground transition-[transform] active:scale-[0.98] sm:flex-initial sm:min-w-[120px]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="min-h-[52px] flex-1 rounded-2xl bg-yapo-blue px-4 font-semibold text-yapo-white transition-[transform] active:scale-[0.98] sm:flex-initial sm:min-w-[120px]"
              >
                Confirmar
              </button>
            </>
          )}

          {displayState === "validando" && (
            <button
              type="button"
              onClick={handleCancel}
              className="min-h-[52px] w-full rounded-2xl border-2 border-yapo-blue/30 bg-transparent px-4 font-semibold text-foreground transition-[transform] active:scale-[0.98]"
              aria-label="Cancelar y no realizar la operación"
            >
              Cancelar
            </button>
          )}

          {displayState === "fallo" && (
            <>
              <button
                type="button"
                onClick={handleRetry}
                className="min-h-[52px] flex-1 rounded-2xl bg-yapo-blue px-4 font-semibold text-yapo-white transition-[transform] active:scale-[0.98] sm:flex-initial"
              >
                Reintentar
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="min-h-[52px] flex-1 rounded-2xl border-2 border-yapo-red/30 bg-transparent px-4 font-semibold text-yapo-red-dark transition-[transform] active:scale-[0.98] sm:flex-initial"
              >
                Cancelar
              </button>
            </>
          )}

          {displayState === "éxito" && (
            <p className="text-center text-sm text-foreground/60">
              Cerrando…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
