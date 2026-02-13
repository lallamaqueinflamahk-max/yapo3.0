/**
 * Configuración de los 4 escudos (README §4 y FASE-2).
 * Nombres oficiales: Insurtech, Fintech, Regalos, Comunidad.
 * API/DB usa: SALUD, FINTECH, SUBSIDIO, COMUNIDAD (mapeo en wallet-db).
 */

import type { EscudoConfig, EscudoId } from "./types";
import type { CerebroRole } from "@/lib/ai/cerebro";

const ALL_LABOR_ROLES: CerebroRole[] = ["vale", "capeto", "kavaju", "mbarete"];
const ALL_ROLES: CerebroRole[] = [
  "vale",
  "capeto",
  "kavaju",
  "mbarete",
  "cliente",
  "pyme",
  "enterprise",
];

/** Los 4 escudos: Insurtech (salud), Fintech (pagos), Regalos (beneficios/premios), Comunidad (red laboral). */
export const ESCUDOS_CONFIG: Record<EscudoId, EscudoConfig> = {
  insurtech: {
    id: "insurtech",
    label: "Insurtech",
    description: "Salud y acceso a farmacias y clínicas privadas. Servicios de salud confiables dentro de YAPÓ.",
    icon: "🛡️",
    allowedRoles: ALL_ROLES,
    allowedZoneStates: ["green", "yellow"],
    layer: "security",
  },
  fintech: {
    id: "fintech",
    label: "Fintech",
    description: "Pagos, ahorro y gestión financiera segura. Todo el flujo de dinero validado.",
    icon: "💰",
    allowedRoles: ALL_ROLES,
    allowedZoneStates: ["green", "yellow"],
    layer: "security",
  },
  regalos: {
    id: "regalos",
    label: "Regalos",
    description: "Beneficios, premios y reconocimientos laborales. Incentivos y recompensas por desempeño.",
    icon: "🎁",
    allowedRoles: ALL_ROLES,
    allowedZoneStates: ["green", "yellow"],
    layer: "benefit",
  },
  comunidad: {
    id: "comunidad",
    label: "Comunidad",
    description: "Conexión y soporte dentro de la red laboral. Interacciones, validación de desempeño, ranking y referidos.",
    icon: "👥",
    allowedRoles: ALL_LABOR_ROLES,
    allowedZoneStates: ["green", "yellow", "red"],
    layer: "benefit",
  },
};

/** Orden en UI (README §4): Insurtech, Fintech, Regalos, Comunidad */
export const ESCUDO_IDS: EscudoId[] = ["insurtech", "fintech", "regalos", "comunidad"];
