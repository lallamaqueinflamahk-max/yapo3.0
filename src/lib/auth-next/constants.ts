/**
 * Constantes centralizadas del sistema de autenticación.
 * Usar en NextAuth config, registro, recuperación de contraseña y sesiones.
 */

/** Duración de la sesión JWT en segundos (30 días). */
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

/** Mínimo de caracteres para contraseña (registro y reset). */
export const PASSWORD_MIN_LENGTH = 8;

/** Máximo de caracteres para contraseña (evitar DoS). */
export const PASSWORD_MAX_LENGTH = 128;

/** Horas de validez del token de recuperación de contraseña. */
export const PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 24;

/** Mensaje estándar al solicitar reset (no revelar si el email existe). */
export const PASSWORD_RESET_REQUEST_MESSAGE =
  "Si el email existe, recibirás un enlace para restablecer la contraseña.";
