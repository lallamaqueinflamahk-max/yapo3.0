"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { runCerebroWithIntent } from "@/lib/ai/cerebro";
import type { CerebroContext, CerebroResult } from "@/lib/ai/cerebro";
import { ChipBubble } from "./ChipBubble";

export type ChipsRunCerebroProps = {
  userContext: CerebroContext;
};

export function ChipsRunCerebro({ userContext }: ChipsRunCerebroProps) {
  const router = useRouter();

  const emitIntent = useCallback(
    async (intentId: string, payload?: Record<string, unknown>) => {
      const result: CerebroResult = await runCerebroWithIntent(
        {
          intentId,
          payload,
          source: "chip",
        },
        userContext
      );

      if (result.navigationTarget?.screen) {
        router.push(result.navigationTarget.screen);
      }
    },
    [userContext, router]
  );

  return (
    <div className="flex gap-2 overflow-x-auto">
      <ChipBubble
        label="Electricista ahora"
        icon="⚡"
        onPress={() =>
          emitIntent("search.workers", { skill: "electricista", urgency: "now" })
        }
      />
      <ChipBubble
        label="Mi billetera"
        icon="💼"
        onPress={() => emitIntent("navigate.wallet")}
      />
    </div>
  );
}
