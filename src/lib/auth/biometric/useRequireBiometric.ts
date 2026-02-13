"use client";

import { useState, useCallback } from "react";
import { useSession } from "@/lib/auth/context";
import { SAFE_MODE_CLIENT } from "@/lib/auth/dev/safeMode";
import { actionRequiresBiometric } from "./actions";
import type { ActionId } from "@/lib/auth/types";

export interface UseRequireBiometricResult {
  /** Si la acción requiere biometría (y no estamos en SAFE MODE). */
  requiresBiometric: (actionId: ActionId) => boolean;
  /**
   * Ejecuta el flujo: si SAFE MODE o no requiere biometría, llama onVerified de inmediato.
   * Si requiere biometría, abre el modal; onVerified se llama al verificar con éxito.
   */
  requestVerification: (actionId: ActionId, onVerified: () => void) => void;
  /** Control del modal: abierto y callbacks. */
  modalOpen: boolean;
  modalClose: () => void;
  modalOnSuccess: () => void;
  /** Pendiente: onVerified a llamar cuando el modal termine con éxito. */
  pendingCallback: (() => void) | null;
}

/**
 * Hook para flujos que pueden requerir biometría.
 * SAFE MODE nunca bloquea: onVerified se ejecuta sin mostrar modal.
 */
export function useRequireBiometric(): UseRequireBiometricResult {
  const { isSafeMode: sessionIsSafe } = useSession();
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  const skipBiometric = sessionIsSafe || SAFE_MODE_CLIENT;

  const requiresBiometric = useCallback((actionId: ActionId) => {
    if (skipBiometric) return false;
    return actionRequiresBiometric(actionId);
  }, [skipBiometric]);

  const requestVerification = useCallback(
    (actionId: ActionId, onVerified: () => void) => {
      if (skipBiometric || !actionRequiresBiometric(actionId)) {
        onVerified();
        return;
      }
      setPendingCallback(() => onVerified);
      setModalOpen(true);
    },
    [skipBiometric]
  );

  const modalClose = useCallback(() => {
    setModalOpen(false);
    setPendingCallback(null);
  }, []);

  const modalOnSuccess = useCallback(() => {
    pendingCallback?.();
    setPendingCallback(null);
    setModalOpen(false);
  }, [pendingCallback]);

  return {
    requiresBiometric,
    requestVerification,
    modalOpen,
    modalClose,
    modalOnSuccess,
    pendingCallback,
  };
}
