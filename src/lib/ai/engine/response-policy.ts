/**
 * Política de respuesta del Cerebro: NUNCA decir "no sé".
 * Siempre orientar, sugerir o derivar dentro del ecosistema YAPÓ.
 */

import { CEREBRO_RULES } from "./rules";

const ORIENTATION_MESSAGES = [
  "Te guío: probá buscando en Inicio o en Cerebro con otras palabras.",
  "Revisá la sección que más se acerque a lo que necesitás (Inicio, Billetera, Perfil, Chat).",
  "En YAPÓ podés encontrar trabajos, gestionar tu perfil y tu billetera; decime en qué te ayudo.",
  "Si no encontrás lo que buscás, probá en Inicio (trabajos) o en tu Perfil.",
] as const;

/**
 * Devuelve un mensaje de orientación dentro del ecosistema YAPÓ.
 * Nunca devuelve frases prohibidas (ej. "no sé", "no tengo información").
 */
export function getOrientationMessage(query: string): string {
  const forbidden = CEREBRO_RULES.forbiddenPhrases;
  const idx = Math.abs(simpleHash(query)) % ORIENTATION_MESSAGES.length;
  return ORIENTATION_MESSAGES[idx];
}

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}

/**
 * Comprueba que un mensaje no contenga frases prohibidas.
 * Si contiene, reemplaza por mensaje de orientación.
 */
export function ensureNoForbiddenPhrase(message: string, query: string): string {
  const lower = message.toLowerCase();
  const hasForbidden = CEREBRO_RULES.forbiddenPhrases.some((phrase) =>
    lower.includes(phrase.toLowerCase())
  );
  if (hasForbidden) return getOrientationMessage(query);
  return message;
}
