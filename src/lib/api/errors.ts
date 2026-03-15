/**
 * Errores y respuestas estándar para API REST.
 * Uso: throw new ApiError(400, "mensaje") y en catch handleApiError(e, response).
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ErrorPayload {
  error: string;
  code?: string;
  errors?: Array<{ path: string; message: string }>;
}

/**
 * Devuelve un Response con body JSON de error (compatible con Route Handlers).
 */
export function jsonError(
  status: number,
  message: string,
  opts?: { code?: string; errors?: Array<{ path: string; message: string }> }
) {
  const body: ErrorPayload = { error: message };
  if (opts?.code) body.code = opts.code;
  if (opts?.errors?.length) body.errors = opts.errors;
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Maneja errores en route handlers: ApiError → status y mensaje; ZodError → 400 y errors.
 * Uso: try { ... } catch (e) { return handleApiError(e); }
 */
export function handleApiError(e: unknown): Response {
  if (e instanceof ApiError) {
    return jsonError(e.status, e.message, { code: e.code });
  }
  if (e && typeof e === "object" && "name" in e && (e as { name: string }).name === "ZodError") {
    const zod = e as { errors: Array<{ path: (string | number)[]; message: string }> };
    const errors = (zod.errors ?? []).map((err) => ({
      path: err.path.join("."),
      message: err.message,
    }));
    return jsonError(400, "Error de validación", { errors });
  }
  const message = e instanceof Error ? e.message : "Error interno";
  return jsonError(500, message);
}
