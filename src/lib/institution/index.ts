/**
 * Modo institucional: programas, subsidios y validaciones.
 * Lenguaje neutral: institución, programa. Sin referencias a actores concretos.
 * El Cerebro decide elegibilidad, explica el motivo y puede requerir verificación adicional.
 */

export type {
  InstitutionId,
  ProgramStatus,
  ProgramCriteria,
  DisbursementRules,
  Program,
  EligibilityResult,
  DisbursementRecord,
} from "./institution.types";

export {
  createProgram,
  getProgram,
  listPrograms,
  updateProgramStatus,
  addSpentAmount,
  createExampleLaborSubsidy,
} from "./subsidy.program";
export type { CreateProgramInput } from "./subsidy.program";

export {
  checkEligibility,
  eligibilityToMessage,
  eligibilityToCerebroShape,
  checkProgramEligibilityForCerebro,
} from "./subsidy.eligibility";
export type { EligibilityContext } from "./subsidy.eligibility";

export {
  disburse,
  getDisbursement,
  listDisbursements,
} from "./subsidy.disbursement";
export type { DisbursementInput, DisbursementResult } from "./subsidy.disbursement";
