/**
 * Resolución de acción: identificar acción, verificar permiso,
 * devolver navegación, CTA y explicación.
 */

import { ACTIONS } from "@/lib/auth";
import type { CerebroContext } from "@/lib/ai/cerebroContext";

export interface IntentResolution {
  actionId: string | null;
  actionLabel: string | null;
  allowed: boolean;
  navigation: { path: string; label: string } | null;
  cta: string | null;
  explanation: string | null;
}

const TEXT_TO_ACTION: Array<{
  keywords: string[];
  actionId: string;
  label: string;
  path: string;
}> = [
  {
    keywords: ["transferir", "transferencia", "enviar dinero", "enviar plata", "enviar yap"],
    actionId: ACTIONS.wallet_transfer,
    label: "Transferir",
    path: "/wallet",
  },
  {
    keywords: ["billetera", "wallet", "saldo", "pagos", "cobrar", "dinero"],
    actionId: ACTIONS.wallet_view,
    label: "Billetera",
    path: "/wallet",
  },
  {
    keywords: ["perfil", "mi perfil", "cuenta", "mis datos"],
    actionId: ACTIONS.profile_view,
    label: "Perfil",
    path: "/profile",
  },
  {
    keywords: ["abrir chat", "ver chat", "ir al chat", "chat", "mensajes", "hablar", "contacto", "escribir"],
    actionId: ACTIONS.chat_open,
    label: "Abrir chat",
    path: "/chat",
  },
  {
    keywords: ["nueva conversación", "nuevo chat", "crear chat", "nueva sala"],
    actionId: ACTIONS.chat_new,
    label: "Nueva conversación",
    path: "/chat",
  },
  {
    keywords: ["videollamada", "llamar por video", "iniciar videollamada", "crear llamada"],
    actionId: ACTIONS.video_call,
    label: "Videollamada",
    path: "/video",
  },
  {
    keywords: ["unirse a llamada", "entrar a videollamada", "unirme a la llamada"],
    actionId: ACTIONS.video_join,
    label: "Unirse a llamada",
    path: "/video",
  },
  {
    keywords: ["inicio", "home", "principal"],
    actionId: ACTIONS.home_view,
    label: "Inicio",
    path: "/home",
  },
  {
    keywords: ["oferta", "crear oferta", "publicar oferta"],
    actionId: ACTIONS.offer_create,
    label: "Crear oferta",
    path: "/home",
  },
  {
    keywords: ["subir desempeño", "video desempeño", "foto desempeño"],
    actionId: ACTIONS.upload_performance,
    label: "Subir desempeño",
    path: "/home",
  },
  {
    keywords: ["semáforo", "territorio", "gestión territorial"],
    actionId: ACTIONS.territory_semaphore,
    label: "Semáforo de gestión",
    path: "/home",
  },
  {
    keywords: ["admin", "dashboard", "panel"],
    actionId: ACTIONS.admin_dashboard,
    label: "Panel admin",
    path: "/home",
  },
];

function identifyAction(text: string): {
  actionId: string;
  label: string;
  path: string;
} | null {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return null;
  for (const entry of TEXT_TO_ACTION) {
    const match = entry.keywords.some((kw) =>
      normalized.includes(kw.toLowerCase())
    );
    if (match) return { actionId: entry.actionId, label: entry.label, path: entry.path };
  }
  return null;
}

export function resolveUserIntent(
  text: string,
  context: CerebroContext
): IntentResolution {
  const action = identifyAction(text);
  if (!action) {
    return {
      actionId: null,
      actionLabel: null,
      allowed: true,
      navigation: null,
      cta: null,
      explanation: null,
    };
  }

  const allowed = context.permissions.includes(action.actionId);
  const navigation = { path: action.path, label: action.label };

  if (allowed) {
    return {
      actionId: action.actionId,
      actionLabel: action.label,
      allowed: true,
      navigation,
      cta: null,
      explanation: null,
    };
  }

  const denied = context.permissionDeniedMessages?.[action.actionId];
  const requiredRoleNames = denied?.requiredRoleNames ?? [];
  const roleList =
    requiredRoleNames.length > 0
      ? requiredRoleNames.join(" o ")
      : "un rol con permiso";
  return {
    actionId: action.actionId,
    actionLabel: action.label,
    allowed: false,
    navigation,
    cta: "¿Querés iniciar verificación?",
    explanation: `Necesitás rol ${roleList}.`,
  };
}
