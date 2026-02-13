/**
 * Handler central: conecta CerebroResult con navegación real y ejecución de acciones.
 * - result.navigation | result.navigationTarget → router.push
 * - result.actions → ejecutar (NAVIGATE, OPEN_MODAL, EXECUTE_WALLET, REQUEST_BIOMETRY, SHOW_WARNING, ACTIVATE_ESCUDO)
 * - result.requiresValidation → bloquear UI (caller debe mostrar modal biométrico / confirmación)
 */

import type { CerebroResult, CerebroAction } from "@/lib/ai/cerebro";

export interface CerebroHandlerDeps {
  /** Navegar a una ruta (ej. router.push(href)). */
  push: (href: string) => void;
  /** Cuando requiresValidation es true, llamar para bloquear UI y mostrar modal. */
  setPendingValidation: (result: CerebroResult | null) => void;
  /** Abrir un modal por id (opcional). */
  onOpenModal?: (modalId: string, payload?: Record<string, unknown>) => void;
  /** Mostrar advertencia/toast (opcional). */
  onShowWarning?: (message: string) => void;
}

function buildHref(screen: string, params?: Record<string, unknown>): string {
  if (!params || Object.keys(params).length === 0) return screen;
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) {
      search.set(k, String(v));
    }
  }
  const qs = search.toString();
  return qs ? `${screen}?${qs}` : screen;
}

function executeAction(
  action: CerebroAction,
  deps: CerebroHandlerDeps
): void {
  const { push, setPendingValidation, onOpenModal, onShowWarning } = deps;
  switch (action.type) {
    case "NAVIGATE": {
      const screen = action.payload?.screen as string | undefined;
      if (screen) push(buildHref(screen, action.payload?.params as Record<string, unknown> | undefined));
      break;
    }
    case "OPEN_MODAL":
      onOpenModal?.(
        (action.payload?.modalId as string) ?? "default",
        action.payload as Record<string, unknown>
      );
      break;
    case "EXECUTE_WALLET":
      push("/wallet");
      break;
    case "REQUEST_BIOMETRY":
      setPendingValidation({
        message: "Se requiere verificación para continuar.",
        requiresValidation: true,
        validationType: "biometric",
        requiresBiometricLevel: (action.payload?.level as 0 | 1 | 2 | 3) ?? 2,
      });
      break;
    case "SHOW_WARNING":
      onShowWarning?.((action.payload?.message as string) ?? "Atención");
      break;
    case "ACTIVATE_ESCUDO":
      push(action.payload?.screen ? buildHref(action.payload.screen as string) : "/wallet");
      break;
    default:
      break;
  }
}

/**
 * Procesa un CerebroResult: navegación, acciones y bloqueo por validación.
 * - Si result.navigation o result.navigationTarget → push a esa pantalla.
 * - Si result.actions → ejecuta cada acción (NAVIGATE, OPEN_MODAL, etc.).
 * - Si result.requiresValidation → setPendingValidation(result) para que el layout bloquee UI y muestre modal.
 */
export function handleCerebroResult(result: CerebroResult | null | undefined, deps: CerebroHandlerDeps): void {
  if (!result) return;

  if (result.requiresValidation) {
    deps.setPendingValidation(result);
    return;
  }

  const nav = result.navigation ?? result.navigationTarget;
  if (nav?.screen) {
    deps.push(buildHref(nav.screen, nav.params));
  }

  const actions = result.actions ?? [];
  for (const action of actions) {
    executeAction(action, deps);
  }
}
