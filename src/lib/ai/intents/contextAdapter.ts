/**
 * Adaptador: CerebroContext (UI/buildCerebroContext) → DecideContext (decide).
 * Permite usar el mismo contexto en buildCerebroContext y en decide(context, intent).
 */

import type { CerebroContext } from "@/lib/ai/cerebroContext";
import type { DecideContext } from "./types";
import type { RoleId } from "@/lib/auth";

/**
 * Convierte CerebroContext a DecideContext para decide(context, intent).
 * Los roles se tipan como RoleId[]; permissions e history se pasan tal cual.
 */
export function toDecideContext(ctx: CerebroContext): DecideContext {
  return {
    user: ctx.user
      ? {
          userId: ctx.user.userId,
          roles: ctx.roles as RoleId[],
          verified: ctx.user.verified,
        }
      : null,
    screen: ctx.screen,
    permissions: ctx.permissions,
    history: ctx.memory?.map((e) => ({ intentId: undefined, at: e.at ?? Date.now() })),
  };
}
