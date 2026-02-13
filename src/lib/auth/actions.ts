/**
 * Acciones canónicas del sistema YAPÓ.
 * Constantes para chequeo de permisos por acción.
 */

import type { ActionId } from "./types";

/** Acciones canónicas de la plataforma */
export const ACTIONS = {
  home_view: "home:view",
  profile_view: "profile:view",
  wallet_view: "wallet:view",
  wallet_transfer: "wallet:transfer",
  chat_open: "chat:open",
  chat_new: "chat:new",
  chat_private: "chat:private",
  chat_group: "chat:group",
  video_call: "video:call",
  video_join: "video:join",
  offer_create: "offer:create",
  offer_apply: "offer:apply",
  upload_performance: "upload:performance",
  territory_semaphore: "territory:semaphore",
  admin_dashboard: "admin:dashboard",
} as const;

export type { ActionId };
