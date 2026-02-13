# Implementación en Frontend — Consentimientos y Legal

Recomendaciones para implementar en la UI la Política de Privacidad, los Términos y Condiciones y el sistema de consentimientos (checkbox, versionado, registro).

---

## 1. Dónde enlazar los documentos

- **Política de Privacidad:** Enlace visible en:
  - Pie de página / footer de la app.
  - Pantalla de registro (antes o después del paso de consentimientos).
  - Configuración > Privacidad (o “Privacidad y datos”).
  - Modales de consentimiento (“Ver Política de Privacidad”).
- **Términos y Condiciones:** Enlace visible en:
  - Registro (por ejemplo “Al registrarte aceptas los Términos y Condiciones” con enlace).
  - Footer.
  - Configuración > Legal o Ajustes.

Ruta sugerida para las páginas legales (si se sirven desde la app): `/legal/privacidad`, `/legal/terminos`. Los documentos base están en `docs/legal/` (Markdown); se pueden convertir a páginas Next.js o cargar desde CMS.

---

## 2. Flujo de consentimiento (checkbox)

### 2.1 Componente de consentimiento

- **Props recomendadas:** `consentType`, `title`, `textShort`, `version`, `onAccept`, `onDecline` (opcional), `loading`, `linkToPrivacy` (URL).
- **Comportamiento:**
  - Mostrar título y `textShort` (texto corto del consentimiento).
  - Checkbox **no marcado** por defecto; `aria-label` descriptivo.
  - Botón principal (“Aceptar”, “Continuar”) **deshabilitado** hasta que el checkbox esté marcado.
  - Enlace “Ver Política de Privacidad” (o “Ver más”) que abra la política en nueva pestaña o en modal.
  - Al hacer clic en Aceptar: llamar al backend para registrar el consentimiento (incluyendo `consentVersion`) y luego ejecutar `onAccept()` (por ejemplo cerrar modal o avanzar de paso).

### 2.2 Ejemplo de llamada al backend

```ts
// Al aceptar en la UI
const response = await fetch('/api/consent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    consentType: 'datos_territoriales',
    consentVersion: 'v1',
    granted: true,
  }),
});
// El backend debe validar sesión (userId), llamar a giveConsent(userId, consentType, { consentVersion }) y devolver éxito/error.
```

### 2.3 Cuándo mostrar cada consentimiento

| Consentimiento | Momento sugerido |
|----------------|------------------|
| `login_social` | Modal o pantalla justo antes de redirigir a OAuth (Google/Facebook/Instagram); checkbox + “Continuar con [red]”. |
| `datos_perfil` | Al guardar perfil (teléfono, dirección) por primera vez; si no hay consentimiento, mostrar modal antes de enviar el formulario. |
| `biometria` | Pantalla previa al flujo de captura biométrica; checkbox + “Iniciar verificación”. |
| `datos_territoriales` | Al activar “Usar mi ubicación” o al entrar a una pantalla que use mapa/ofertas cercanas. |
| `ia` | Primera vez que el usuario abre o usa el Cerebro; modal o paso único con checkbox. |
| `comunicaciones` | En preferencias de notificaciones o al marcar “Recibir ofertas por email”. |
| `reportes_pyme_enterprise` | Al vincularse a una empresa o en onboarding laboral. |
| `reportes_gobierno` | En Configuración > Privacidad como opción explícita. |

---

## 3. Versionado en frontend

- **Catálogo de textos:** Mantener un objeto o archivo (por ejemplo `consentTexts.ts` o JSON) que para cada `consentType` exponga la versión vigente y el texto:
  - `version`: string (ej. `"v1"`, `"2024-01"`).
  - `textShort`: string (el que se muestra en el checkbox).
  - `textLong`: string o URL (opcional, para “Ver más”).
- **Al mostrar el modal:** Usar siempre la versión vigente del catálogo. Al enviar la aceptación al backend, enviar ese mismo `version` como `consentVersion`.
- **Si cambia el texto:** Se actualiza el catálogo con una nueva `version`; los nuevos consentimientos se registrarán con esa versión. Los antiguos siguen con la versión que el usuario aceptó (queda en el registro).

---

## 4. Pantalla “Mis consentimientos” (registro por usuario)

- **Ubicación:** Configuración > Privacidad (o “Privacidad y datos”).
- **Contenido sugerido:**
  - Lista de tipos de consentimiento con estado actual: “Activo” / “Revocado” (según `hasConsent` o el último registro por tipo).
  - Para cada tipo: texto corto de qué es y botón “Revocar” si está activo (o “Activar” si se puede volver a dar y se desea ofrecer).
  - Opcional: “Historial” o “Ver qué acepté” con fecha y versión (datos que devuelva el backend desde `getConsents(userId)`).
- **Revocación:** Al revocar, llamar al backend (ej. `POST /api/consent` con `granted: false`); actualizar la UI y, si aplica, desactivar la función correspondiente (ej. dejar de usar ubicación hasta que vuelva a aceptar).

---

## 5. Accesibilidad y claridad

- **Idioma:** Textos en español (o idioma principal de la app), sin jerga legal innecesaria en los textos cortos.
- **Contraste y tamaño:** Texto legible; enlaces claros (“Política de Privacidad”, “Términos y Condiciones”).
- **Checkbox:** Asociar label al input; `aria-describedby` al texto del consentimiento si ayuda.
- **Botón Aceptar:** No confundir con “Cerrar” o “Más tarde”; el que confirma el consentimiento debe decir explícitamente “Aceptar” o “Acepto y continuar”.

---

## 6. Primera vez y registro

- En el flujo de registro (social o verificado):
  - Mostrar aceptación de Términos y Condiciones (checkbox + enlace) y, según el flujo, los consentimientos necesarios para ese paso (por ejemplo `login_social`).
  - No dar por hecho que “registrarse” implica consentimiento para todos los usos; pedir cada consentimiento en su momento (en el primer uso de la función) o agrupar en una pantalla “Privacidad y permisos” con varias casillas, cada una con su texto y versión.

---

## 7. Resumen de tareas frontend

| Tarea | Descripción |
|-------|-------------|
| Páginas legales | Rutas `/legal/privacidad` y `/legal/terminos`; contenido desde `docs/legal/` o CMS. |
| Enlaces | Footer y Configuración con enlaces a Política y Términos. |
| Componente ConsentModal | Checkbox desmarcado, texto corto, enlace a política, botón Aceptar habilitado solo al marcar; llamada a API con `consentType` y `consentVersion`. |
| Catálogo de textos | Archivo o módulo con versión y texto por `consentType`; usar en modales. |
| Momento de mostrar | Integrar modales en flujos (login social, perfil, biometría, ubicación, Cerebro, notificaciones, reportes). |
| Configuración > Privacidad | Lista de consentimientos con estado (Activo/Revocado), opción de revocar y opcional historial. |
| API | Endpoints para dar/revocar consentimiento y para listar “mis consentimientos” (o usar existentes en `consent.service` vía API routes). |

---

*Documento de recomendaciones para YAPÓ v2. Ajustar a diseño de producto y a la API real del backend.*
