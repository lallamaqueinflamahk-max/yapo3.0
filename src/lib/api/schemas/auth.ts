import { z } from "zod";
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from "@/lib/auth-next/constants";

export const registerBodySchema = z.object({
  email: z
    .string()
    .min(1, "Email es obligatorio")
    .email("Email inválido")
    .transform((s) => s.trim().toLowerCase()),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`)
    .max(PASSWORD_MAX_LENGTH, `Máximo ${PASSWORD_MAX_LENGTH} caracteres`),
  name: z
    .string()
    .max(200)
    .optional()
    .nullish()
    .transform((s) => (s?.trim() || undefined)),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;

/** Schema para recuperación de contraseña (solo email). */
export const forgotPasswordBodySchema = z.object({
  email: z
    .string()
    .min(1, "Email es obligatorio")
    .email("Email inválido")
    .transform((s) => s.trim().toLowerCase()),
});

/** Schema para restablecer contraseña (token + email + nueva contraseña). */
export const resetPasswordBodySchema = z.object({
  token: z.string().min(1, "Token es obligatorio").transform((s) => s.trim()),
  email: z
    .string()
    .min(1, "Email es obligatorio")
    .email("Email inválido")
    .transform((s) => s.trim().toLowerCase()),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`)
    .max(PASSWORD_MAX_LENGTH, `Máximo ${PASSWORD_MAX_LENGTH} caracteres`),
});

export type ForgotPasswordBody = z.infer<typeof forgotPasswordBodySchema>;
export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>;
