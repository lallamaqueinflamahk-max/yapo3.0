import type { z } from "zod";
import { ApiError } from "./errors";

/**
 * Parsea el body JSON y valida con el schema Zod.
 * Lanza ApiError 400 si el body no es JSON o no cumple el schema.
 */
export async function validateBody<T extends z.ZodType>(
  schema: T,
  request: Request
): Promise<z.infer<T>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new ApiError(400, "Cuerpo inválido o no es JSON");
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    const first = result.error.flatten().fieldErrors;
    const msg = first
      ? Object.entries(first)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`)
          .join("; ")
      : result.error.message;
    throw new ApiError(400, msg, "VALIDATION_ERROR");
  }
  return result.data as z.infer<T>;
}

/**
 * Valida query params. Útil para GET.
 */
export function validateQuery<T extends z.ZodType>(
  schema: T,
  params: Record<string, string | string[] | undefined>
): z.infer<T> {
  const result = schema.safeParse(params);
  if (!result.success) {
    throw new ApiError(400, result.error.message, "VALIDATION_ERROR");
  }
  return result.data as z.infer<T>;
}
