/**
 * Programas institucionales: definición, criterios y estado.
 * Un programa puede definir criterios (rol, territorio, trustScore, biometría) y reglas de desembolso.
 */

import type {
  Program,
  ProgramCriteria,
  DisbursementRules,
  ProgramStatus,
  InstitutionId,
} from "./institution.types";

const programs = new Map<string, Program>();

function nextProgramId(): string {
  return `prg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface CreateProgramInput {
  institutionId: InstitutionId;
  name: string;
  description: string;
  criteria: ProgramCriteria;
  disbursementRules: DisbursementRules;
  totalBudget?: number;
}

/**
 * Crea un programa. Estado inicial: active.
 */
export function createProgram(input: CreateProgramInput): Program {
  const id = nextProgramId();
  const now = Date.now();
  const program: Program = {
    id,
    institutionId: input.institutionId,
    name: input.name,
    description: input.description,
    status: "active",
    criteria: input.criteria,
    disbursementRules: input.disbursementRules,
    totalBudget: input.totalBudget,
    spentAmount: 0,
    createdAt: now,
    updatedAt: now,
  };
  programs.set(id, program);
  return program;
}

/**
 * Obtiene un programa por ID.
 */
export function getProgram(programId: string): Program | null {
  return programs.get(programId) ?? null;
}

/**
 * Lista programas (opcionalmente por institución o estado).
 */
export function listPrograms(options?: {
  institutionId?: InstitutionId;
  status?: ProgramStatus;
}): Program[] {
  let list = Array.from(programs.values());
  if (options?.institutionId) {
    list = list.filter((p) => p.institutionId === options.institutionId);
  }
  if (options?.status) {
    list = list.filter((p) => p.status === options.status);
  }
  return list;
}

/**
 * Actualiza el estado del programa (active | paused | closed).
 */
export function updateProgramStatus(
  programId: string,
  status: ProgramStatus
): Program | null {
  const program = programs.get(programId);
  if (!program) return null;
  program.status = status;
  program.updatedAt = Date.now();
  return program;
}

/**
 * Incrementa el monto gastado del programa (llamado por disbursement).
 */
export function addSpentAmount(programId: string, amount: number): void {
  const program = programs.get(programId);
  if (!program) return;
  program.spentAmount = (program.spentAmount ?? 0) + amount;
  program.updatedAt = Date.now();
}

/**
 * Ejemplo real: subsidio laboral para trabajadores (Valé, Capeto) con verificación y territorio.
 * Criterios: rol laboral, trustScore mínimo, biometría nivel 2; depósito único; bloqueo de uso indebido.
 */
export function createExampleLaborSubsidy(institutionId: string): Program {
  return createProgram({
    institutionId,
    name: "Subsidio laboral – apoyo al empleo",
    description:
      "Apoyo económico para trabajadores registrados (Valé, Capeto) con perfil verificado y buena trayectoria. Un solo desembolso por usuario. Fondos destinados a gasto en formación o herramientas.",
    criteria: {
      allowedRoles: ["vale", "capeto"],
      allowedTerritories: [], // vacío = todo el territorio
      minTrustScore: 10,
      requiredBiometricLevel: 2,
    },
    disbursementRules: {
      maxAmountPerUser: 500_000,
      maxAmountPerDisbursement: 500_000,
      blockMisuse: true,
      allowedUseCategories: ["formacion", "herramientas", "transporte"],
    },
    totalBudget: 50_000_000,
  });
}
