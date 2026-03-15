/**
 * Capa compartida para API REST: errores, validación, schemas.
 * Uso: import { validateBody, handleApiError, jsonError, ApiError } from "@/lib/api";
 */

export { ApiError, jsonError, handleApiError } from "./errors";
export type { ErrorPayload } from "./errors";
export { validateBody, validateQuery } from "./validate";
export {
  registerBodySchema,
  forgotPasswordBodySchema,
  resetPasswordBodySchema,
} from "./schemas/auth";
export type {
  RegisterBody,
  ForgotPasswordBody,
  ResetPasswordBody,
} from "./schemas/auth";
export { transferBodySchema } from "./schemas/wallet";
export type { TransferBody } from "./schemas/wallet";
