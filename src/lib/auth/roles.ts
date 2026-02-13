/**
 * Roles canónicos YAPÓ.
 * Valé, Capeto, Kavaju, Mbareté (progresión laboral). Cliente, PyME, Enterprise (contratantes).
 */

import type { RoleId } from "./types";

export const ROLES: Record<RoleId, { name: string; description: string }> = {
  vale: {
    name: "Valé",
    description:
      "Primer escalón de la progresión laboral. Trabajador de base: crea su perfil laboral, sube videos o fotos de su desempeño, participa en el feed de su categoría y recibe ranking y calificación. Es el nivel desde el que se asciende a Capeto.",
  },
  capeto: {
    name: "Capeto",
    description:
      "Segundo nivel: lidera una pequeña cuadrilla de Valés. Todo lo del Valé, más validar el desempeño de su equipo, subir contenido audiovisual del equipo, recibir métricas de su cuadrilla y organizar mini-retos o desafíos laborales. Es el referente directo de los Valés.",
  },
  kavaju: {
    name: "Kavaju",
    description:
      "Tercer nivel: supervisa varias cuadrillas o Capetos de una zona. Todo lo del Capeto, más moderar contenido y desempeño de Valés y Capetos, recibir reportes avanzados de métricas de su área y gestionar incentivos y reconocimientos. Conecta el territorio con el nivel Mbareté.",
  },
  mbarete: {
    name: "Mbareté",
    description:
      "Máximo nivel de la progresión laboral. Todo lo del Kavaju, más control total del territorio (cuadrillas y mapas de rendimiento), gestión de la Beca Laboral (salud, cursos, insumos), prioridad en ofertas grandes y contratos de empresas, calificación y validación de Kavajus, Capetos y Valés, y acceso al Semáforo de Gestión Territorial (Verde / Amarillo / Rojo).",
  },
  cliente: {
    name: "Cliente",
    description: "Contratante individual. Publica ofertas de trabajo y contrata trabajadores (Valés, Capetos, etc.).",
  },
  pyme: {
    name: "PyME",
    description:
      "Pequeña o mediana empresa. Gestiona ofertas laborales y equipos de trabajo; puede coordinar con cuadrillas y supervisores.",
  },
  enterprise: {
    name: "Enterprise",
    description:
      "Empresa grande. Contratos masivos, reportes avanzados y gestión territorial; prioridad en licitaciones y ofertas de alto impacto.",
  },
};

export const ROLE_IDS: RoleId[] = [
  "vale",
  "capeto",
  "kavaju",
  "mbarete",
  "cliente",
  "pyme",
  "enterprise",
];

export function getRoleName(roleId: RoleId): string {
  return ROLES[roleId]?.name ?? roleId;
}

export function getRoleDescription(roleId: RoleId): string {
  return ROLES[roleId]?.description ?? "";
}

export function isValidRoleId(value: unknown): value is RoleId {
  return typeof value === "string" && ROLE_IDS.includes(value as RoleId);
}
