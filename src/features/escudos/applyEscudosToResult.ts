/**
 * Aplica escudos activos al CerebroResult.
 * Los escudos modifican mensaje, severidad y acciones.
 */

import type { CerebroResult, CerebroAction } from "@/lib/ai/cerebro";
import type { EscudoId } from "./types";
import { getEscudosForRoleAndZone } from "./getEscudosForRoleAndZone";
import type { CerebroRole } from "@/lib/ai/cerebro";
import type { ZoneState } from "./types";

/**
 * Aplica los escudos activos al resultado del Cerebro.
 * Añade sufijo al mensaje, ajusta severidad y/o acciones según cada escudo activo.
 */
export function applyEscudosToResult(
  result: CerebroResult,
  activeEscudoIds: EscudoId[],
  role: CerebroRole,
  zoneState: ZoneState
): CerebroResult {
  if (!activeEscudoIds.length) return result;

  const { available } = getEscudosForRoleAndZone(role, zoneState, activeEscudoIds);
  const activeEscudos = available.filter((e) => activeEscudoIds.includes(e.id));

  let message = result.message ?? "";
  let severity = result.severity ?? result.allowed ? "green" : "red";
  const actions = [...(result.actions ?? [])];

  for (const escudo of activeEscudos) {
    const mod = escudo.resultModifier;
    if (!mod) continue;
    if (mod.messageSuffix) message = message ? `${message}${mod.messageSuffix}` : mod.messageSuffix.trim();
    if (mod.severityOverride && result.allowed !== false) severity = mod.severityOverride;
    if (mod.extraActions?.length) {
      for (const a of mod.extraActions) {
        actions.push({
          type: a.type as CerebroAction["type"],
          payload: a.payload,
          label: a.label,
        });
      }
    }
  }

  return {
    ...result,
    message: message || result.message,
    severity,
    actions: actions.length ? actions : result.actions,
  };
}
