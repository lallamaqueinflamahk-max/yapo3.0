"use client";

import { useState, useCallback } from "react";
import type { SubscriptionPlanId } from "./types";

export type PlanLimitReason = "offers" | "transfers" | "feature";

const PLAN_LIMITS: Record<string, { offers?: number; transfers?: number }> = {
  basico: { offers: 3, transfers: 5 },
  vale: { offers: 10, transfers: 20 },
  capeto: { offers: 25, transfers: 50 },
  kavaju: {},
  mbarete: {},
  pyme: { offers: 100 },
  enterprise: {},
};

export interface UsePlanLimitResult {
  canUse: boolean;
  reason?: PlanLimitReason;
  requiredFeature?: string;
  showUpgrade: () => void;
  hideUpgrade: () => void;
  upgradeOpen: boolean;
}

/**
 * Comprueba si el plan actual permite la acción (p. ej. más ofertas o transferencias).
 * Si no, el componente puede mostrar el modal de upgrade (SubscriptionUpgrade).
 */
export function usePlanLimit(
  planId: SubscriptionPlanId | string | null | undefined,
  options: { currentOffers?: number; currentTransfers?: number; requiredFeature?: string }
): UsePlanLimitResult {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const plan = planId ?? "basico";
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.basico;
  const { currentOffers = 0, currentTransfers = 0, requiredFeature } = options;

  const offersOk = limits.offers == null || currentOffers < limits.offers;
  const transfersOk = limits.transfers == null || currentTransfers < limits.transfers;
  const canUse = offersOk && transfersOk;

  let reason: PlanLimitReason | undefined;
  let feature = requiredFeature;
  if (!offersOk) {
    reason = "offers";
    feature = feature ?? `más de ${limits.offers} ofertas`;
  } else if (!transfersOk) {
    reason = "transfers";
    feature = feature ?? `más de ${limits.transfers} transferencias este mes`;
  }

  return {
    canUse,
    reason,
    requiredFeature: feature,
    showUpgrade: useCallback(() => setUpgradeOpen(true), []),
    hideUpgrade: useCallback(() => setUpgradeOpen(false), []),
    upgradeOpen,
  };
}
