# Contrato Flash y Módulo de Contratación Inteligente YAPÓ

**Objetivo:** Implementar la generación automática de contratos y la gestión de garantías para eliminar el "trabajo mal hecho" y los "adelantos sin retorno".

**Relación:** Usuario → Contrato → Garantía (Escudo) → Liberación de Pago.

---

## 1. Contenido base del Contrato Flash

Este es el texto que se genera automáticamente en PDF cuando el cliente presiona **"Aceptar Trabajo"**:

---

**ACUERDO DE EJECUCIÓN LABORAL - YAPÓ**

1. **LAS PARTES:** [Nombre del Profesional] (C.I. verificado) y [Nombre del Cliente] (C.I. verificado).

2. **EL TRABAJO:** [Descripción del servicio, ej: Reparación de AA].

3. **EL MONTO:** Gs. [Monto acordado]. Este monto es final e inmutable una vez aceptado.

4. **EL ESCUDO YAPÓ:** El pago se encuentra en custodia de la plataforma. Se liberará al confirmar la finalización mediante código QR o validación mutua en la App.

5. **GARANTÍA:** El profesional otorga una garantía de cumplimiento de [X] días sobre la mano de obra.

6. **PENALIDAD:** El incumplimiento de horario o abandono de obra genera una penalidad de [Monto/Puntos] en el sistema de reputación Mbareté.

*Al aceptar en la App, ambas partes dan por firmado este contrato con validez legal según la Ley de Firma Digital vigente en Paraguay.*

---

**Implementación:** El texto y la función de reemplazo de variables están en `src/lib/compliance/contrato-flash-template.ts`. Al disparar "Aceptar Propuesta", el backend concatena Perfil (Nombre, C.I., Dirección) + Propuesta (Monto, Descripción) y llama a `renderContratoFlash(variables)` para generar el cuerpo; luego se genera el PDF (servicio de PDF o librería) y se asocia al Acuerdo/Orden.

---

## 2. Trigger de Contrato

- **Evento:** El cliente presiona **"Aceptar Propuesta"** (o "Aceptar Trabajo").
- **Lógica:**
  1. Validar que ambos (cliente y profesional) tengan C.I. verificada si la política lo exige.
  2. Obtener del **Perfil:** nombre, C.I., dirección (cliente y profesional).
  3. Obtener de la **Propuesta:** monto, descripción técnica, garantía en días (por categoría o estándar), penalidad (monto o puntos).
  4. Crear registro **Contrato** (o **Acuerdo**) con: `id`, `clienteId`, `profesionalId`, `descripcion`, `montoTotal`, `moneda`, `garantiaDias`, `penalidadDescripcion`, `estado: "aceptado"`, `contratoPdfUrl` (o blob), `createdAt`.
  5. Llamar a `renderContratoFlash({ nombreProfesional, ciProfesional, nombreCliente, ciCliente, descripcionTrabajo, montoAcordado, moneda, garantiaDias, penalidadDescripcion })` y generar PDF.
  6. Si la propuesta es con Escudo YAPÓ: crear **EscrowOrder** (Garantía), debitar al cliente y poner el monto en custodia; vincular `contratoId` ↔ `escrowOrderId`.
  7. Enviar copia del contrato (enlace o adjunto) a cliente y profesional.

**Flujo de base de datos:** `Usuario` (cliente, profesional) → **Contrato** (generado al aceptar) → **Garantía (Escudo)** (EscrowOrder, fondos en custodia) → **Liberación de Pago** (por hitos).

---

## 3. Check-in Biométrico / QR (trabajo "Iniciado")

- **Regla:** El trabajo **no** se considera **"Iniciado"** hasta que el profesional llegue al lugar y el **cliente escanee un código QR** generado en el celular del profesional (o validación mutua en la App). Esto activa el **Escudo YAPÓ** (bloqueo de fondos ya realizado; el check-in libera el primer hito).
- **Flujo:**
  1. La app del **profesional** muestra un **QR único** por orden (ordenId + nonce/token).
  2. El **cliente** escanea ese QR desde su app (pantalla "Confirmar inicio de obra").
  3. Al escanear, el backend registra `inicioObraAt`, opcionalmente ubicación del cliente/profesional, y marca la orden como **iniciada**.
  4. El sistema libera el **primer hito** (ej. 50%) al profesional según las reglas del Escudo.
- **Alternativa:** Validación mutua en la App (cliente y profesional confirman "Inicio" en la misma pantalla de la orden). En ese caso no hay QR físico; el backend considera "iniciado" cuando ambas partes han confirmado.

---

## 4. Gestión de Adelantos — Hito de Materiales (Cero Riesgo)

- **Regla:** Si el trabajo requiere **materiales**, el sistema puede permitir un **"Hito de Materiales"**. El dinero de ese hito se libera **solo** cuando el profesional **sube la foto de la factura legal** de compra a la App.
- **Lógica:**
  1. En la propuesta/contrato se puede definir un hito adicional, ej.: 30% materiales, 35% inicio obra, 35% finalización (o 20% materiales, 40% inicio, 40% fin).
  2. Al crearse la orden con escudo, una parte del monto se asocia al hito "materiales".
  3. El profesional, desde la app, sube **foto de la factura** (y opcionalmente descripción). El sistema guarda el adjunto y marca el hito como "pendiente de revisión" o "en verificación".
  4. Cuando un mediador o regla automática (ej. OCR de factura) valida la factura, el sistema libera ese porcentaje al profesional.
- **Modelo de datos:** En `EscrowHito` se puede tener `tipo: "inicio" | "materiales" | "finalizacion"` y para tipo materiales: `evidenciaFacturaUrl`, `evidenciaVerificadaAt`.

---

## 5. Garantía Post-Servicio — Retención de Seguridad 24 h

- **Regla:** Establecer un periodo de **"Retención de Seguridad"** de **24 horas** después de finalizado el trabajo. Si el cliente **no reporta fallas** en ese plazo, el dinero se libera **totalmente** al profesional.
- **Lógica:**
  1. Cuando el profesional marca "Trabajo finalizado" (y opcionalmente el cliente confirma o califica), el sistema **no** libera de inmediato el último hito.
  2. Se registra `finalizadoAt` y se programa una liberación automática a `finalizadoAt + 24 horas`.
  3. Si el cliente abre una **disputa** o "Reportar falla" dentro de esas 24 h, la liberación se **suspende** y se aplica el protocolo de arbitraje.
  4. Si a las 24 h no hay disputa, el sistema libera el saldo pendiente al profesional (job o cron).
- **Constante:** `RETENCION_SEGURIDAD_POST_SERVICIO_MS = 24 * 60 * 60 * 1000` (24 h en ms).

---

## 6. Reputación con Dolo — "Muerte Digital"

- **Regla:** Si hay **evidencia de estafa o abandono**, el sistema debe ejecutar una **"Muerte Digital"** del perfil: bloqueo de la cuenta y **vinculación del número de C.I.** para que esa persona **no pueda volver a crear una cuenta** en YAPÓ con otra identidad.
- **Lógica:**
  1. Tras resolución de arbitraje o reporte grave, un rol autorizado (soporte/mediador) puede marcar al usuario como **bloqueado por dolo** (ej. `user.estado: "bloqueado_dolo"`, tabla `UserBloqueo` con `ciVinculada`, `motivo`, `evidencia`).
  2. En el **registro** y en la **verificación de C.I.**, el sistema consulta si la C.I. ya está vinculada a un usuario bloqueado por dolo. Si es así, se **rechaza** el registro o la verificación (no se permite crear nueva cuenta con esa C.I.).
  3. La cuenta bloqueada no puede iniciar sesión ni aparecer en búsquedas; los contratos/órdenes en curso se resuelven según protocolo (devolución al cliente o retención).
- **Modelo de datos:** Tabla `CedulasBloqueadas` o campo en tabla de usuarios: `ciBloqueadaPorDolo`, `bloqueadoAt`, `bloqueadoPorUserId`, `evidenciaResolucionId`.

---

## 7. Flujo de base de datos (resumen)

| Entidad        | Relación        | Descripción |
|----------------|-----------------|-------------|
| **Usuario**    | —               | Cliente y profesional (perfil, C.I., dirección). |
| **Propuesta**  | Usuario         | Monto, descripción, garantía días; creada por profesional. |
| **Contrato**   | Usuario, Propuesta | Generado al "Aceptar Propuesta"; PDF, monto inmutable, garantía. |
| **Garantía (Escudo)** | Contrato, Usuario | EscrowOrder: fondos en custodia, hitos (inicio, materiales opcional, finalización). |
| **Liberación de Pago** | EscrowOrder, WalletTransaction | Por cada hito cumplido (QR inicio, factura materiales, 24 h post-servicio sin disputa). |
| **CedulasBloqueadas** | —               | C.I. vinculada a "muerte digital"; se consulta en registro. |

---

## 8. Constantes técnicas sugeridas

- **Retención post-servicio:** 24 h antes de liberar el último hito.
- **Ventana de disputa:** 24 h tras "Trabajo finalizado" (coincide con retención).
- **Hitos por defecto:** 50% inicio (QR/validación mutua), 50% finalización (tras 24 h sin disputa); opcional hito "materiales" con liberación por factura verificada.

Este documento es la especificación para el equipo de desarrollo; la plantilla del contrato y la función de render están en `src/lib/compliance/contrato-flash-template.ts`.

---

## 9. Contrato Flash — texto base y prompt para desarrollo (referencia)

**Texto que se genera en PDF al presionar "Aceptar Trabajo":**

```
ACUERDO DE EJECUCIÓN LABORAL - YAPÓ

1. LAS PARTES: [Nombre del Profesional] (C.I. verificado) y [Nombre del Cliente] (C.I. verificado).
2. EL TRABAJO: [Descripción del servicio, ej: Reparación de AA].
3. EL MONTO: Gs. [Monto acordado]. Este monto es final e inmutable una vez aceptado.
4. EL ESCUDO YAPÓ: El pago se encuentra en custodia de la plataforma. Se liberará al confirmar la finalización mediante código QR o validación mutua en la App.
5. GARANTÍA: El profesional otorga una garantía de cumplimiento de [X] días sobre la mano de obra.
6. PENALIDAD: El incumplimiento de horario o abandono de obra genera una penalidad de [Monto/Puntos] en el sistema de reputación Mbareté.

Al aceptar en la App, ambas partes dan por firmado este contrato con validez legal según la Ley de Firma Digital vigente en Paraguay.
```

**Prompt para arquitectura / equipo de desarrollo (resumen ejecutivo):**

- **Trigger de Contrato:** Al "Aceptar Propuesta", concatenar Perfil (Nombre, CI, Dirección) + Propuesta (Monto, Descripción) → generar Contrato Flash.
- **Check-in QR:** El trabajo no se considera "Iniciado" hasta que el cliente escanee el QR del profesional → activa Escudo YAPÓ (bloqueo de fondos).
- **Hito de Materiales:** Si aplica, el dinero se libera solo cuando el profesional sube foto de la factura legal.
- **Garantía post-servicio:** Retención de seguridad 24 h; si el cliente no reporta fallas, se libera el pago al profesional.
- **Reputación con dolo:** Evidencia de estafa/abandono → "Muerte Digital" del perfil, C.I. vinculada para impedir nueva cuenta.
- **Resultado:** Flujo Usuario → Contrato → Garantía (Escudo) → Liberación de Pago.
