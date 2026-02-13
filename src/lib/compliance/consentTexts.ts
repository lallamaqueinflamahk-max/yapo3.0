/**
 * Catálogo de textos de consentimiento por tipo y versión.
 * Para uso en frontend: mostrar texto vigente y enviar consentVersion al otorgar.
 * Ver docs/legal/CONSENTIMIENTOS-ESTRUCTURA.md y IMPLEMENTACION-FRONTEND.md.
 */

import type { ConsentType } from "./compliance.types";

export interface ConsentTextEntry {
  version: string;
  textShort: string;
  textLong?: string;
  effectiveFrom?: number;
}

/** Textos vigentes por tipo de consentimiento. */
export const CONSENT_TEXTS: Record<ConsentType, ConsentTextEntry> = {
  cookies_tecnicas: {
    version: "v1",
    textShort:
      "YAPÓ usa cookies técnicas para que la app funcione (sesión e idioma). No requieren consentimiento; puedes bloquearlas en tu navegador.",
  },
  login_social: {
    version: "v1",
    textShort:
      "Al continuar con la red social, YAPÓ recibirá tu nombre, correo y foto de perfil para crear tu cuenta. Solo guardamos estos datos si aceptas. Puedes revocar el acceso en Configuración o en la red social.",
  },
  datos_perfil: {
    version: "v1",
    textShort:
      "Guardaremos los datos que ingreses en tu perfil (teléfono, dirección, etc.) para ofrecerte un mejor servicio y contactarte cuando sea necesario. Puedes actualizarlos o pedir su eliminación en cualquier momento.",
  },
  biometria: {
    version: "v1",
    textShort:
      "Usamos tu rostro o huella solo para verificar que eres tú y proteger operaciones sensibles. No guardamos la imagen ni la huella; solo el resultado. Es necesario para funciones como transferencias o contratos.",
  },
  datos_territoriales: {
    version: "v1",
    textShort:
      "Usamos tu ubicación para mostrarte ofertas y servicios cercanos y el estado del semáforo en tu zona. Puedes desactivarlo en Configuración o en el dispositivo.",
  },
  ia: {
    version: "v1",
    textShort:
      "El asistente de YAPÓ (Cerebro) procesa tus consultas para guiarte. Las conversaciones pueden usarse de forma anonimizada para mejorar el servicio. Puedes revocar en Configuración > Privacidad.",
  },
  comunicaciones: {
    version: "v1",
    textShort:
      "Podemos enviarte correos y notificaciones sobre tu cuenta, ofertas y novedades. Puedes darte de baja en cualquier momento desde el enlace en los correos o en Configuración.",
  },
  reportes_pyme_enterprise: {
    version: "v1",
    textShort:
      "Tus datos laborales podrán incluirse en reportes para tu empleador o la empresa con la que tienes relación, según tu contrato y esta autorización. Solo se comparte lo necesario para ese propósito.",
  },
  reportes_gobierno: {
    version: "v1",
    textShort:
      "Podemos incluir datos anonimizados (sin identificar personas) en estadísticas para entes públicos (empleo y formalización). No se comparte tu identidad.",
  },
  uso_estadistico_anonimizado: {
    version: "v1",
    textShort:
      "Acepto que mis datos se usen en forma anonimizada y agregada para estadísticas, censo digital laboral, mejora del producto y reportes a PyMEs, empresas o Gobierno, según la Política de Privacidad. Nunca se comparte mi identidad.",
  },
};

/** Obtiene el texto vigente para un tipo de consentimiento. */
export function getConsentText(consentType: ConsentType): ConsentTextEntry {
  return CONSENT_TEXTS[consentType] ?? CONSENT_TEXTS.login_social;
}

/** Obtiene la versión vigente para un tipo (para enviar al backend al otorgar). */
export function getConsentVersion(consentType: ConsentType): string {
  return getConsentText(consentType).version;
}
