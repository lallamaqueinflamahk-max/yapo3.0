"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CerebroResult } from "@/lib/ai/cerebro";
import { handleCerebroResult as handleCerebroResultCore } from "./cerebro-handler";
import BiometricValidationModal from "@/components/biometric/BiometricValidationModal";

type CerebroResultHandlerContextValue = {
  handleCerebroResult: (result: CerebroResult | null | undefined) => void;
  pendingValidation: CerebroResult | null;
  clearPendingValidation: () => void;
};

const CerebroResultHandlerContext = createContext<CerebroResultHandlerContextValue | null>(null);

export function useCerebroResultHandler(): CerebroResultHandlerContextValue {
  const ctx = useContext(CerebroResultHandlerContext);
  if (!ctx) {
    throw new Error("useCerebroResultHandler must be used within CerebroResultHandlerProvider");
  }
  return ctx;
}

export function CerebroResultHandlerProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pendingValidation, setPendingValidationState] = useState<CerebroResult | null>(null);

  const push = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router]
  );

  const setPendingValidation = useCallback((result: CerebroResult | null) => {
    setPendingValidationState(result);
  }, []);

  const clearPendingValidation = useCallback(() => {
    setPendingValidationState(null);
  }, []);

  const handleCerebroResult = useCallback(
    (result: CerebroResult | null | undefined) => {
      handleCerebroResultCore(result, {
        push,
        setPendingValidation,
        onShowWarning: (msg) => {
          if (typeof window !== "undefined") window.alert(msg);
        },
      });
    },
    [push, setPendingValidation]
  );

  const value = useMemo(
    () => ({ handleCerebroResult, pendingValidation, clearPendingValidation }),
    [handleCerebroResult, pendingValidation, clearPendingValidation]
  );

  const level = (pendingValidation?.requiresBiometricLevel ?? 2) as 1 | 2 | 3;
  const open = Boolean(pendingValidation?.requiresValidation);

  return (
    <CerebroResultHandlerContext.Provider value={value}>
      {children}
      {open && pendingValidation && (
        <BiometricValidationModal
          open={open}
          requiredLevel={level}
          onClose={clearPendingValidation}
          onValidated={() => {
            const nav = pendingValidation.navigation ?? pendingValidation.navigationTarget;
            clearPendingValidation();
            if (nav?.screen) {
              const params = nav.params as Record<string, string> | undefined;
              const href = params && Object.keys(params).length
                ? `${nav.screen}?${new URLSearchParams(params).toString()}`
                : nav.screen;
              router.push(href);
            }
          }}
          onAbort={clearPendingValidation}
          message={pendingValidation.message}
          validationType={pendingValidation.validationType}
        />
      )}
    </CerebroResultHandlerContext.Provider>
  );
}
