# Estructura de Consentimientos Legales — YAPÓ v2

Diseño del sistema de consentimientos explícitos, versionado y registro por usuario. Compatible con requisitos LATAM y escalable a acuerdos gubernamentales.

---

## 1. Principios

- **Explícitos:** El usuario debe realizar una acción afirmativa (por ejemplo marcar una casilla y pulsar “Aceptar”). No se usan casillas premarcadas ni consentimiento por inacción.
- **Informados:** Cada consentimiento va acompañado de un texto claro que explica qué datos, para qué y por cuánto tiempo (o hasta revocación).
- **Granulares:** Un tipo de uso = un consentimiento. El usuario puede aceptar unos y rechazar otros.
- **Registrados:** Toda aceptación o revocación se guarda con identificación del usuario, tipo, versión del texto y fecha/hora.
- **Versionados:** Si se cambia el texto de un consentimiento, se usa una nueva versión; el registro conserva qué versión aceptó el usuario.

---

## 2. Consentimientos explícitos (checkbox)

### 2.1 Patrón de UI obligatorio

Para cada consentimiento que la ley exija como “explícito”:

1. **Texto visible** del consentimiento (corto, legible, enlace a texto completo si aplica).
2. **Checkbox desmarcado por defecto.** No se permite “marcado por defecto”.
3. **Botón “Aceptar” / “Continuar”** habilitado **solo** cuando la casilla está marcada (o cuando el usuario ha hecho la acción afirmativa elegida).
4. **No** se considera válido: scroll como aceptación, botón “Cerrar” como aceptación, o cualquier acción que no sea claramente “Sí acepto esto”.

### 2.2 Ejemplo de flujo

```
[ ] Acepto que YAPÓ use mi ubicación para mostrarme ofertas cercanas
    y el estado del semáforo en mi zona. Puedo desactivarlo en Configuración.

    [Ver más en Política de Privacidad]

    [ Aceptar ]  (habilitado solo si la casilla está marcada)
```

### 2.3 Consentimientos por tipo

Cada tipo tiene un **identificador** (código) y un **texto** que puede cambiar en el tiempo (versionado).

| Código | Nombre corto | Momento típico de solicitud |
|--------|----------------|-----------------------------|
| `cookies_tecnicas` | Cookies técnicas | Primer uso / banner cookies |
| `login_social` | Login con red social | Al pulsar “Continuar con Google/Facebook/Instagram” |
| `datos_perfil` | Datos de perfil | Al guardar teléfono, dirección u otros datos de perfil |
| `biometria` | Biometría | Antes de captura/verificación biométrica |
| `datos_territoriales` | Ubicación | Al activar uso de ubicación / mapa |
| `ia` | Uso de IA (Cerebro) | Primera interacción con el asistente |
| `comunicaciones` | Emails y notificaciones | Al activar notificaciones o newsletter |
| `reportes_pyme_enterprise` | Reportes PyME/Empresa | Onboarding laboral o al vincularse a una empresa |
| `reportes_gobierno` | Estadísticas para Gobierno | Opcional en registro o en Configuración > Privacidad |
| `uso_estadistico_anonimizado` | Uso de datos anonimizados (censo, estadísticas, reportes) | Registro o al aceptar Política de Privacidad; permite registrar aceptación explícita del uso estadístico/anonimizado. |

---

## 3. Versionado de consentimientos

### 3.1 Por qué versionar

- Si se cambia el texto (por ley, por claridad o por nuevo uso), debe quedar registrado **qué texto** vio y aceptó el usuario.
- En auditoría o reclamación se puede demostrar: “El usuario X aceptó la versión Y del consentimiento Z en la fecha T”.

### 3.2 Cómo versionar

- **Versión:** Identificador de la versión del texto (por ejemplo `v1`, `2024-01-privacidad`, o semver `1.0.0`). Debe ser único por tipo de consentimiento.
- **Al otorgar:** Se guarda en el registro: `consentType`, `consentVersion`, `granted: true`, `timestamp`, `userId`.
- **Al revocar:** Se guarda un nuevo registro con `granted: false` y `timestamp`; no se borra el historial.
- **Texto vigente:** En frontend o en un catálogo (JSON/BD) se mantiene el texto actual por tipo; el backend devuelve la versión vigente cuando se muestra el modal de consentimiento.

### 3.3 Estructura recomendada en código

- **Catálogo de textos:** Un objeto o tabla que para cada `consentType` tenga al menos: `version`, `textShort` (para checkbox), `textLong` (opcional, enlace “Ver más”), `effectiveFrom` (fecha desde la que aplica).
- **Al guardar:** Siempre enviar `consentVersion` junto con `consentType` al llamar a `giveConsent(userId, consentType, { consentVersion })`.

Referencia en código: `src/lib/compliance/consent.service.ts` (parámetro `consentVersion` en `giveConsent`).

---

## 4. Registro de aceptación por usuario

### 4.1 Qué se registra

Por cada evento de consentimiento (otorgar o revocar):

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| `id` | Sí | Identificador único del registro. |
| `userId` | Sí | Usuario que acepta o revoca. |
| `consentType` | Sí | Tipo de consentimiento (código). |
| `granted` | Sí | `true` = otorgado, `false` = revocado. |
| `timestamp` | Sí | Fecha y hora del evento (UTC recomendado). |
| `consentVersion` | Recomendado | Versión del texto que vio el usuario. |
| `purpose` | Opcional | Propósito o referencia para auditoría. |

No se guardan los datos personales del usuario en el detalle del consentimiento; solo el `userId` ya vinculado en el sistema.

### 4.2 Cómo se usa el registro

- **¿Tiene consentimiento activo?** Se toma el **último** registro para ese `userId` + `consentType` (ordenado por `timestamp` descendente). Si `granted === true`, hay consentimiento activo.
- **Exportación para el usuario:** El usuario puede solicitar “todos mis consentimientos”; se devuelve la lista de registros (o un resumen legible) para cumplir derecho de acceso.
- **Auditoría:** Los eventos pueden replicarse en un log de auditoría (acción `consent_given` / `consent_revoked`) con timestamp y actor.

Referencia: `ConsentRecord` en `src/lib/compliance/compliance.types.ts` y funciones `giveConsent`, `revokeConsent`, `hasConsent`, `getConsents` en `consent.service.ts`.

### 4.3 Regla de negocio

- **Antes de guardar datos personales** que dependan de un consentimiento, el backend debe comprobar `hasConsent(userId, consentType)`. Si es `false`, no se persisten esos datos y se puede devolver un error o redirigir al flujo de solicitud de consentimiento.

---

## 5. Textos de consentimiento (versión base)

Textos cortos para checkbox; enlace a Política de Privacidad para el detalle.

### 5.1 Cookies técnicas (informativo)

> YAPÓ usa cookies técnicas para que la app funcione (sesión e idioma). No requieren consentimiento; puedes bloquearlas en tu navegador.

*(No requiere checkbox si la ley no exige consentimiento para cookies técnicas; en ese caso solo aviso.)*

### 5.2 Login social

> Al continuar con [Google / Facebook / Instagram], YAPÓ recibirá tu nombre, correo y foto de perfil para crear tu cuenta. Solo guardamos estos datos si aceptas. Puedes revocar el acceso en Configuración o en la red social.

### 5.3 Datos de perfil

> Guardaremos los datos que ingreses en tu perfil (teléfono, dirección, etc.) para ofrecerte un mejor servicio y contactarte cuando sea necesario. Puedes actualizarlos o pedir su eliminación en cualquier momento.

### 5.4 Biometría

> Usamos tu rostro [y/o huella] solo para verificar que eres tú y proteger operaciones sensibles. No guardamos la imagen ni la huella; solo el resultado. Es necesario para funciones como transferencias o contratos.

### 5.5 Datos territoriales (ubicación)

> Usamos tu ubicación para mostrarte ofertas y servicios cercanos y el estado del semáforo en tu zona. Puedes desactivarlo en Configuración o en el dispositivo.

### 5.6 IA (Cerebro)

> El asistente de YAPÓ (Cerebro) procesa tus consultas para guiarte. Las conversaciones pueden usarse de forma anonimizada para mejorar el servicio. Puedes revocar en Configuración > Privacidad.

### 5.7 Comunicaciones

> Podemos enviarte correos y notificaciones sobre tu cuenta, ofertas y novedades. Puedes darte de baja en cualquier momento desde el enlace en los correos o en Configuración.

### 5.8 Reportes PyME / Enterprise

> Tus datos laborales podrán incluirse en reportes para tu empleador o la empresa con la que tienes relación, según tu contrato y esta autorización. Solo se comparte lo necesario para ese propósito.

### 5.9 Reportes Gobierno

> Podemos incluir datos anonimizados (sin identificar personas) en estadísticas para entes públicos (empleo y formalización). No se comparte tu identidad.

---

## 6. Aceptación de uso de datos anonimizados

- **Consentimiento específico:** El tipo `uso_estadistico_anonimizado` permite registrar que el usuario **acepta de forma explícita** que sus datos se usen en forma anonimizada y agregada para: estadísticas, censo digital laboral, mejora del producto y reportes a PyMEs, empresas o Gobierno (siempre sin identificación).
- **Momento:** Se puede solicitar en el registro (checkbox junto a la aceptación de Política de Privacidad) o en Configuración > Privacidad. Checkbox desmarcado por defecto; CTA habilitado solo al marcar.
- **Registro:** Se guarda con fecha, versión del texto y usuario, igual que el resto de consentimientos.

---

## 7. Versionado de políticas (Privacidad y Términos)

- **Política de Privacidad y Términos y Condiciones** tienen número de versión (ej. 1.0) y fecha de última actualización. Cada cambio sustancial genera una nueva versión.
- **Registro de aceptación por usuario:** Se recomienda guardar, por cada usuario que acepte los documentos legales:
  - **Documento:** `privacy_policy` o `terms`.
  - **Versión aceptada:** ej. `1.0`.
  - **Fecha y hora de aceptación:** timestamp.
  - **Identificador del usuario:** `userId` (ya vinculado en el sistema).
- **Implementación:** Tabla `policy_acceptances` (id, user_id, document_type, version, accepted_at) o, si se prefiere, eventos en `consent_records` con tipos como `politica_privacidad` / `terminos` y en `consentVersion` la versión del documento (ej. "1.0"). Así se cumple con versionado de políticas y auditoría para stores y autoridades.

---

## 8. Compatibilidad LATAM y acuerdos gubernamentales

- **LATAM:** La estructura (consentimiento explícito, registro, versionado, no venta de datos identificables) es compatible con leyes de protección de datos personales de la región (Paraguay, Argentina, Brasil, Colombia, México, etc.). Ajustar textos y plazos según cada país.
- **Acuerdos gubernamentales:** Para reportes o censo laboral con entes públicos:
  - Definir en contrato o convenio: qué datos (solo anonimizados/agregados), con qué finalidad y bajo qué garantías.
  - El registro de consentimiento `reportes_gobierno` (o equivalente) permite demostrar base legal cuando el usuario haya aceptado.
  - Mantener el principio: no venta de datos identificables; datos a gobierno solo anonimizados salvo obligación legal expresa.

---

## 9. Resumen de implementación

| Elemento | Acción |
|----------|--------|
| **Checkbox** | Siempre desmarcado por defecto; botón Aceptar habilitado solo al marcar. |
| **Versión** | Guardar `consentVersion` en cada `giveConsent`; catálogo de textos por tipo y versión. |
| **Registro** | Una fila por evento (otorgar/revocar) con userId, tipo, granted, timestamp, versión. |
| **Consulta** | `hasConsent(userId, consentType)` = último registro con `granted === true`. |
| **Guardado de datos** | No guardar datos personales que dependan de un consentimiento sin comprobar `hasConsent` antes. |

Ver también: `docs/legal/IMPLEMENTACION-FRONTEND.md` para pautas en la UI.
