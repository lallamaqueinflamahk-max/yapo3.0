/**
 * Comportamiento por rol (RoleBehavior): intents, biometría, límites wallet, contratación.
 * Complementa permissions.ts: no lo reemplaza. El Cerebro valida primero RoleBehavior, luego catálogo/permisos.
 * Roles pueden evolucionar añadiendo intents o límites sin refactor masivo.
 *
 * --- Diferencias reales entre roles (documentación) ---
 *
 * Laborales:
 * - Valé (trabajo simple): subir desempeño, buscar trabajo, ver ranking, chat; sin cuadrilla ni territorio.
 *   Límites wallet: no transfiere (rol laboral). Biometría: 0.
 * - Capeto (oficios): todo Valé + ver cuadrilla, validar trabajos, micro-capacitar, ubicación equipo.
 *   Límites: 5M/día; biometría 1 para transferir. Puede contratar a Valé.
 * - Kavaju (técnico especializado): todo Capeto + territorio, organizar cuadrilla, asignar tareas,
 *   rendimiento del grupo, conectar con Mbareté. Límites: 20M/día; biometría 2. Puede contratar Valé, Capeto.
 * - Mbareté (empresa/líder): todo Kavaju + mapa territorial, semáforo, beneficios, reportes generales.
 *   Límites: 100M/día; biometría 3. Puede contratar Valé, Capeto, Kavaju.
 *
 * Contratantes:
 * - Cliente: buscar trabajadores, wallet, transferir; límite 10M/día; biometría 2. Contrata a todos laborales.
 * - PyME: igual; límite 50M/día; biometría 2.
 * - Enterprise: igual; sin límite diario explícito; biometría 3.
 */

import type { RoleId } from "@/lib/auth";

/** Nivel de biometría requerido para ciertas acciones (0–3). Alineado con identity.VerifiedLevel. */
export type BiometriaNivel = 0 | 1 | 2 | 3;

/** Límites de wallet por rol: transferencia diaria, si requiere biometría para transferir, etc. */
export interface LimitesWallet {
  /** Máximo a transferir por día (en unidad base). 0 = sin límite explícito en comportamiento. */
  maxTransferenciaDiaria: number;
  /** Nivel de biometría mínimo para transferir (0 = no requerido por rol). */
  requiereBiometriaParaTransferir: BiometriaNivel;
}

/** Comportamiento de un rol: intents permitidos, biometría, wallet, a quién puede contratar. */
export interface RoleBehavior {
  /** Rol al que aplica este comportamiento. */
  roleId: RoleId;
  /** Descripción breve para logs y mensajes. */
  description: string;
  /** Intents que este rol puede disparar. Si el intent no está aquí, el Cerebro deniega con explicación. */
  intentsPermitidos: string[];
  /** Nivel de biometría requerido para acciones sensibles (ej. transferencia). 0 = no exigido por rol. */
  requiereBiometriaNivel: BiometriaNivel;
  /** Límites de wallet (transferencia diaria, biometría para transferir). */
  limitesWallet: LimitesWallet;
  /** Roles a los que este rol puede “contratar” o asignar trabajo. Vacío para roles laborales. */
  puedeContratarA: RoleId[];
}

/** Valé: trabajo simple. Subir desempeño, buscar trabajo, ver ranking, chat. Sin cuadrilla ni territorio. */
const VALE_INTENTS: string[] = [
  "search.jobs",
  "search.services",
  "navigate.wallet",
  "navigate.chat",
  "navigate.profile",
  "navigate.home",
  "navigate.ranking",
  "action.post_performance",
  "action.view_balance",
  "wallet_view",
  "wallet_subsidy",
  "escudo_activate",
  "info.explain_feature",
  "action.show_more_options",
];

/** Capeto: oficios. Todo Valé + cuadrilla, validar, capacitar, ubicación equipo. */
const CAPETO_INTENTS: string[] = [
  ...VALE_INTENTS,
  "navigate.crew",
  "action.validate_tasks",
  "action.micro_train",
  "navigate.team_location",
  "wallet_transfer",
  "wallet_release_transaction",
  "wallet_block_transaction",
];

/** Kavaju: técnico especializado. Todo Capeto + organizar cuadrilla, asignar tareas, rendimiento, conectar Mbareté. */
const KAVAJU_INTENTS: IntentId[] = [
  ...CAPETO_INTENTS,
  "navigate.territory",
  "action.organize_crew",
  "action.assign_tasks",
  "navigate.group_performance",
  "action.connect_mbarete",
];

/** Mbareté: empresa/líder. Todo Kavaju + mapa, semáforo, beneficios, reportes. */
const MBARETE_INTENTS: string[] = [
  ...KAVAJU_INTENTS,
  "navigate.territory_map",
  "navigate.semaphore",
  "action.activate_benefits",
  "navigate.reports",
];

/** Contratantes: buscar trabajadores, wallet, chat, perfil; transferir con límites. */
const CONTRACTOR_INTENTS: string[] = [
  "search.workers",
  "search.services",
  "navigate.wallet",
  "navigate.chat",
  "navigate.profile",
  "navigate.home",
  "action.view_balance",
  "action.transfer_wallet",
  "wallet_view",
  "wallet_transfer",
  "wallet_subsidy",
  "wallet_release_transaction",
  "wallet_block_transaction",
  "action.open_whatsapp",
  "info.explain_feature",
  "action.show_more_options",
];

/** Comportamientos por rol. Extensible: añadir campos o nuevos roles sin refactor masivo. */
export const ROLE_BEHAVIORS: Record<RoleId, RoleBehavior> = {
  vale: {
    roleId: "vale",
    description: "Trabajo simple: desempeño, búsqueda de trabajo, ranking. Sin cuadrilla.",
    intentsPermitidos: VALE_INTENTS,
    requiereBiometriaNivel: 0,
    limitesWallet: {
      maxTransferenciaDiaria: 0,
      requiereBiometriaParaTransferir: 0,
    },
    puedeContratarA: [],
  },
  capeto: {
    roleId: "capeto",
    description: "Oficios: lidera cuadrilla de Valés; valida trabajos, capacita, ubicación equipo.",
    intentsPermitidos: CAPETO_INTENTS,
    requiereBiometriaNivel: 1,
    limitesWallet: {
      maxTransferenciaDiaria: 5_000_000,
      requiereBiometriaParaTransferir: 1,
    },
    puedeContratarA: ["vale"],
  },
  kavaju: {
    roleId: "kavaju",
    description: "Técnico especializado: organiza cuadrillas, asigna tareas, rendimiento; conecta con Mbareté.",
    intentsPermitidos: KAVAJU_INTENTS,
    requiereBiometriaNivel: 2,
    limitesWallet: {
      maxTransferenciaDiaria: 20_000_000,
      requiereBiometriaParaTransferir: 2,
    },
    puedeContratarA: ["vale", "capeto"],
  },
  mbarete: {
    roleId: "mbarete",
    description: "Empresa/líder: mapa territorial, semáforo, beneficios, reportes generales.",
    intentsPermitidos: MBARETE_INTENTS,
    requiereBiometriaNivel: 3,
    limitesWallet: {
      maxTransferenciaDiaria: 100_000_000,
      requiereBiometriaParaTransferir: 3,
    },
    puedeContratarA: ["vale", "capeto", "kavaju"],
  },
  cliente: {
    roleId: "cliente",
    description: "Contratante individual: publica ofertas, contrata trabajadores.",
    intentsPermitidos: CONTRACTOR_INTENTS,
    requiereBiometriaNivel: 1,
    limitesWallet: {
      maxTransferenciaDiaria: 10_000_000,
      requiereBiometriaParaTransferir: 2,
    },
    puedeContratarA: ["vale", "capeto", "kavaju", "mbarete"],
  },
  pyme: {
    roleId: "pyme",
    description: "PyME: gestiona ofertas y equipos; coordina con cuadrillas.",
    intentsPermitidos: CONTRACTOR_INTENTS,
    requiereBiometriaNivel: 2,
    limitesWallet: {
      maxTransferenciaDiaria: 50_000_000,
      requiereBiometriaParaTransferir: 2,
    },
    puedeContratarA: ["vale", "capeto", "kavaju", "mbarete"],
  },
  enterprise: {
    roleId: "enterprise",
    description: "Empresa grande: contratos masivos, reportes, gestión territorial.",
    intentsPermitidos: CONTRACTOR_INTENTS,
    requiereBiometriaNivel: 3,
    limitesWallet: {
      maxTransferenciaDiaria: 0,
      requiereBiometriaParaTransferir: 3,
    },
    puedeContratarA: ["vale", "capeto", "kavaju", "mbarete"],
  },
};

/** Devuelve el comportamiento del rol. Siempre devuelve un objeto (default: vale). */
export function getRoleBehavior(roleId: RoleId): RoleBehavior {
  return ROLE_BEHAVIORS[roleId] ?? ROLE_BEHAVIORS.vale;
}

/** Indica si el rol puede disparar ese intent según su comportamiento. */
export function roleAllowsIntent(roleId: RoleId, intentId: string): boolean {
  const behavior = getRoleBehavior(roleId);
  return behavior.intentsPermitidos.includes(intentId);
}

/** Devuelve los límites de wallet del rol. */
export function getLimitesWallet(roleId: RoleId): LimitesWallet {
  return getRoleBehavior(roleId).limitesWallet;
}

/** Devuelve el nivel de biometría requerido por el rol para acciones sensibles. */
export function getRequiereBiometriaNivel(roleId: RoleId): BiometriaNivel {
  return getRoleBehavior(roleId).requiereBiometriaNivel;
}

/** Indica si el rol puede contratar/asignar a otro rol. */
export function puedeContratarA(contratante: RoleId, contratado: RoleId): boolean {
  const behavior = getRoleBehavior(contratante);
  return behavior.puedeContratarA.includes(contratado);
}
