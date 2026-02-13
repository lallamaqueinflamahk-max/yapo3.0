# Documentos Legales — YAPÓ v2

Política de Privacidad, Términos y Condiciones y sistema de consentimientos legales. Compatible con LATAM, convenios gubernamentales, stores y auditorías.

---

## Entregable consolidado (requisitos obligatorios)

| Documento | Contenido |
|-----------|-----------|
| [ENTREGABLE-LEGAL-YAPO-V2.md](./ENTREGABLE-LEGAL-YAPO-V2.md) | Checklist requisitos obligatorios, textos legales base, estructura técnica consentimientos, recomendaciones frontend, compatibilidad LATAM/gobierno/stores. |

---

## Documentos base

| Documento | Contenido |
|-----------|-----------|
| [POLITICA-DE-PRIVACIDAD.md](./POLITICA-DE-PRIVACIDAD.md) | Política de Privacidad: qué datos se recogen, qué no se vende, qué se anonimiza; censo digital laboral; uso estadístico PyME/Enterprise/Gobierno; prohibición de venta de datos identificables; derechos y conservación. |
| [TERMINOS-Y-CONDICIONES.md](./TERMINOS-Y-CONDICIONES.md) | Términos y Condiciones: aceptación, qué es YAPÓ, registro, uso permitido, servicios, billetera, contenido, privacidad, propiedad intelectual, limitación de responsabilidad, resolución de conflictos. |
| [CONSENTIMIENTOS-ESTRUCTURA.md](./CONSENTIMIENTOS-ESTRUCTURA.md) | Estructura de consentimientos: explícitos (checkbox), versionado, registro por usuario; textos por tipo; compatibilidad LATAM y acuerdos gubernamentales. |
| [IMPLEMENTACION-FRONTEND.md](./IMPLEMENTACION-FRONTEND.md) | Recomendaciones de implementación en frontend: dónde enlazar documentos, flujo de consentimiento (checkbox), versionado en UI, pantalla “Mis consentimientos”, accesibilidad. |

---

## Principios

- **Datos personales:** Solo con consentimiento explícito; registro con versión y timestamp.
- **No venta:** No se venden datos identificables.
- **Anonimización:** Estadísticas y censo laboral con datos anonimizados y agregados.
- **LATAM:** Estructura compatible con leyes de protección de datos de la región.
- **Gobierno:** Preparado para acuerdos con entes públicos (datos anonimizados; no venta de identificables).

---

## Código relacionado

- Consentimientos: `src/lib/compliance/consent.service.ts` (`giveConsent`, `revokeConsent`, `hasConsent`, `getConsents`).
- Tipos: `src/lib/compliance/compliance.types.ts` (`ConsentType`, `ConsentRecord`).
- Textos por tipo/versión: `src/lib/compliance/consentTexts.ts` (catálogo para frontend).

Revisar con asesoría jurídica antes de publicación oficial.
