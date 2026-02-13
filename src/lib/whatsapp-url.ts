/**
 * URL oficial de la API de WhatsApp para abrir chat:
 * https://api.whatsapp.com/send/?phone=...&text=...&type=phone_number&app_absent=0
 */
const WHATSAPP_API_BASE = "https://api.whatsapp.com/send/";

export const DEFAULT_YAPO_WHATSAPP_MESSAGE = "Hola, consulta desde YAPÓ";

/**
 * Construye la URL para abrir WhatsApp con número y mensaje opcional.
 * @param phone Número con código de país (ej. 595981555555)
 * @param text Mensaje prellenado (opcional)
 */
export function buildWhatsAppUrl(phone: string, text?: string): string {
  const clean = phone.replace(/\D/g, "");
  const params = new URLSearchParams();
  params.set("phone", clean);
  params.set("type", "phone_number");
  params.set("app_absent", "0");
  if (text?.trim()) {
    params.set("text", text.trim());
  }
  return `${WHATSAPP_API_BASE}?${params.toString()}`;
}
