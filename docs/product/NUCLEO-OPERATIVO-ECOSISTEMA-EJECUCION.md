# Núcleo operativo — Ecosistema de Ejecución Garantizada

**Contexto:** Actualización del núcleo de YAPÓ (Paraguay): pasar de **"Anuncios de Servicios"** a **"Ecosistema de Ejecución Garantizada"**.

**Documento técnico:** Lógica de los 4 pilares diferenciales, User Flows y texto legal simplificado para transacciones.

---

## 1. Escudo YAPÓ (Protocolo Anti-Estafa)

### 1.1 Flujo de pago (escrow)

- El **cliente** paga al aceptar el presupuesto; el dinero **no** va al profesional de inmediato.
- El monto queda **retenido por YAPÓ** en una cuenta de custodia (escrow) vinculada a la orden.
- Solo se libera al profesional cuando se cumplen los **hitos** acordados (ver 1.2).

**Regla de negocio:** Sin aceptación de presupuesto no hay cargo; una vez aceptado, el débito es inmediato y el saldo pasa a "retenido" hasta liberación por hitos.

### 1.2 Hitos de liberación

| Hito | Disparador | Acción del sistema | % sugerido |
|------|------------|--------------------|------------|
| **Inicio de obra** | Escaneo de **QR de inicio** en el lugar (o check-in con geolocalización + foto opcional). El profesional escanea el QR generado para esa orden en la app. | Liberar **50%** del monto retenido al profesional. | 50% |
| **Finalización y calificación** | El profesional marca "Trabajo finalizado" y el **cliente califica** (estrellas + opcional comentario) o confirma cierre en un plazo máximo (ej. 24 h). | Liberar el **50%** restante al profesional. | 50% |

**Lógica técnica:**

- **QR de inicio:** Al crear la orden con escudo, el sistema genera un código único (ordenId + nonce). La app del profesional muestra "Escanear QR en el lugar" y el cliente puede mostrar el QR desde su app (pantalla "Orden YAPO-ORD-XXX") o se muestra un QR fijo en domicilio/obra. El profesional escanea → backend registra `inicioObraAt`, ubicación (si hay permiso) → dispara liberación del primer hito.
- **Alternativa sin QR:** Check-in con "Estoy en el lugar" + geolocalización + foto de la obra/domicilio como evidencia; el sistema considera eso equivalente al escaneo de QR para liberar el primer hito.
- **Ventana de disputa:** Tras "Trabajo finalizado", el cliente tiene **24 h** para disputar. Si no disputa, a las 24 h se libera automáticamente el segundo hito. Si disputa, se aplica el protocolo de arbitraje (1.3).

### 1.3 Resolución de conflictos (trabajo "a medias")

Cuando cliente o profesional declara que el trabajo quedó a medias o no cumplido:

1. **Apertura de disputa:** Cualquiera de las dos partes puede abrir una disputa desde la orden (botón "Trabajo a medias / No cumplido"). Obligatorio: **subir evidencia fotográfica** (estado del trabajo, materiales, domicilio).
2. **Retención:** YAPÓ **mantiene el fondo retenido** hasta resolución. No se libera ningún hito pendiente hasta que un mediador resuelva.
3. **Arbitraje:** Un mediador (rol interno o tercero) revisa: contrato digital, descripción técnica, fotos de inicio (si hay), fotos de la disputa, mensajes en el chat de la orden. Decisiones posibles:
   - **100% profesional** (trabajo considerado cumplido).
   - **100% cliente** (devolución total al cliente).
   - **Reparto** (ej. 50% profesional / 50% cliente, o 70/30 según grado de avance).
4. **Ejecución:** El sistema libera o devuelve según el fallo del mediador. Una sola vez por orden.

**User Flow (resumen):**

```
Cliente acepta presupuesto → Paga → Dinero en custodia
  → Profesional va al lugar → Escanea QR inicio (o check-in + foto)
  → Sistema libera 50% al profesional
  → Profesional finaliza → Cliente califica (o 24 h sin disputa)
  → Sistema libera 50% restante
  [Si disputa] → Evidencia fotográfica → Mediador → Resolución → Liberación/Devolución según fallo
```

---

## 2. Sistema "Compromiso de Hierro" (Anti-Plantón)

### 2.1 Penalidad por cancelación tardía

- **Regla:** Si el **profesional** o el **cliente** cancela una **cita confirmada** con **menos de 2 horas** de antelación respecto de la hora acordada, el sistema debita automáticamente un **"Token de Irresponsabilidad"** de su saldo en billetera YAPÓ.
- **Valor del token:** Definido por política (ej. equivalente a un monto fijo en PYG o a un porcentaje del valor del trabajo). Ejemplo: 50.000 PYG o 5% del monto del acuerdo, lo que sea mayor, con tope máximo.
- **Excepciones:** Cancelación por fuerza mayor (ej. categoría "emergencia" seleccionada y documentación posterior); en ese caso no se debita el token pero se registra para revisión.
- **Flujo técnico:** Al cambiar estado de la cita a "cancelada", el sistema comprueba: `(fechaHoraAcordada - ahora) < 2 horas` y si quien canceló fue profesional o cliente; si aplica, ejecuta `debit(userId, tokenAmount, "Token de Irresponsabilidad - cancelación tardía - Orden X")`.

### 2.2 Métrica "Cumplidor" (%)

- **Cálculo:** Para cada usuario (profesional o cliente), se calcula **Cumplidor %** = (cantidad de citas cumplidas / cantidad de citas confirmadas) en una ventana móvil (ej. últimos 90 días). "Cumplidas" = estado completado o trabajo iniciado/finalizado según tipo; "confirmadas" = citas que llegaron a estado confirmado (no canceladas antes de confirmación).
- **Actualización:** Tras cada cita completada, cancelada o no-show, se recalcula el porcentaje y se persiste (ej. en perfil o tabla `UserMetrics`).

### 2.3 Penalidad técnica por bajo cumplimiento

- **Regla:** Si el **Cumplidor %** de un usuario baja **por debajo del 80%**, el algoritmo **oculta sus anuncios** (o su perfil en resultados de búsqueda) durante **48 horas** como penalidad técnica.
- **Aplicación:** En el feed de "Buscar profesionales" y en cualquier listado donde se rankee por visibilidad, se filtra: `cumplidorPercent >= 80 OR (cumplidorPercent < 80 AND ultimaPenalizacion48h + 48h < now)`. Tras 48 h se vuelve a mostrar; si vuelve a bajar de 80%, se repite el ocultamiento.
- **Comunicación:** Al usuario se le notifica: "Tu índice Cumplidor bajó del 80%. Tus anuncios no se mostrarán durante 48 horas. Mejorá tu asistencia para volver a aparecer."

**User Flow (resumen):**

```
Cita confirmada → Usuario cancela con < 2 h de antelación
  → Sistema debita "Token de Irresponsabilidad" de su billetera
  → Se registra evento para métrica Cumplidor

Cada cita completada/cancelada/no-show → Recalcular Cumplidor %
  → Si Cumplidor % < 80% → Ocultar anuncios 48 h → Notificar usuario
  → Tras 48 h → Volver a mostrar en búsqueda
```

---

## 3. Contrato Digital Flash (Reglas Claras)

### 3.1 Generación automática al "Aceptar Trabajo"

Al hacer clic en **"Aceptar Trabajo"** (aceptar presupuesto) en la app:

1. El sistema genera un **contrato digital** (PDF o documento descargable) con los datos fijados en ese momento.
2. **No** se permite editar monto ni descripción técnica después de aceptar (no al regateo post-servicio).

### 3.2 Contenido obligatorio del contrato

| Campo | Origen | Descripción |
|-------|--------|-------------|
| **Identidad verificada (C.I.)** | Base de datos / verificación previa | Nombres y número de C.I. (o RUC si empresa) de **ambas** partes (cliente y profesional). Solo si están verificados; si no, se indica "Pendiente de verificación" y se limita el uso de Escudo YAPÓ si aplica política. |
| **Descripción técnica exacta** | Presupuesto aceptado | Texto inmutable, ej.: "Reparación de Split 12.000 BTU, incluye mano de obra y diagnóstico". |
| **Monto final** | Presupuesto aceptado | Monto en PYG (y moneda). **Inmutable** tras la aceptación. |
| **Garantía técnica** | Política de la categoría o estándar YAPÓ | "Garantía técnica de X días obligatoria" (ej. 30 días para reparaciones, 90 para instalaciones). El profesional se obliga a corregir sin costo adicional en ese plazo si el defecto es por su ejecución. |
| **Fecha/hora de inicio acordada** | Elegida al aceptar | Lugar y, si aplica, dirección. |
| **Hitos de pago** | Si es con Escudo YAPÓ | "50% al escaneo de QR de inicio de obra, 50% al finalizar y calificar". |
| **ID de acuerdo** | Sistema | Código único (ej. YAPO-ORD-2025-XXXX). |
| **Aceptación de términos** | Legal | Referencia a que ambas partes aceptan los Términos y Condiciones de YAPÓ y las reglas de la transacción (ver §6). |

### 3.3 User Flow

```
Cliente recibe presupuesto → Revisa descripción y monto
  → Clic "Aceptar Trabajo"
  → Pantalla de confirmación: "Se generará el contrato y se descontará el monto a custodia"
  → Acepta términos transaccionales (checkbox + "Aceptar")
  → Sistema: crea orden, genera PDF contrato, debita cliente (escrow)
  → Cliente y profesional reciben copia del contrato (descarga / enlace en app)
  → Flujo continúa con Escudo YAPÓ (QR inicio, finalización, etc.)
```

---

## 4. Filtro "Mbareté" (Prestigio Real — Profesional Matriculado)

### 4.1 Sello "Profesional Matriculado"

- Para oficios regulados (ej. **electricistas — ANDE**, **plomeros / gasistas — MOPC** u otros que se sumen), YAPÓ integra un sello de **"Profesional Matriculado"**.
- **Verificación:** El profesional sube o vincula su matrícula/certificado (número, entidad emisora, vigencia). YAPÓ puede verificar contra lista pública o proceso manual. Si es válido, se asigna el sello al perfil (ej. badge "Matriculado ANDE" / "Matriculado MOPC").
- **Datos almacenados:** `userId`, `tipoMatricula` (ej. "ANDE", "MOPC"), `numeroMatricula`, `vigenciaHasta`, `verificadoAt`.

### 4.2 Prioridad en el feed

- En la búsqueda de profesionales (feed / mapa), los que tienen sello **Profesional Matriculado** reciben **prioridad** en el ordenamiento: mismo criterio actual (ej. verificados, rating) pero con un **boost** para matriculados (aparecen antes que no matriculados en igualdad de otras condiciones).
- Opción de filtro explícito: "Solo matriculados" (ANDE, MOPC, etc.).

### 4.3 Tasa de servicio más alta

- YAPÓ puede permitir que los profesionales con sello **Matriculado** cobren una **tasa de servicio** o tarifa mínima más alta (ej. en el presupuesto), según reglas de negocio. Ejemplo: categoría "Electricista matriculado ANDE" con precio mínimo sugerido mayor que "Electricista" sin matrícula. La lógica se aplica en la configuración de categorías y en la UI de creación de presupuesto (sugerencia o obligación según política).

**User Flow (resumen):**

```
Profesional en perfil → Sección "Matriculación"
  → Elige entidad (ANDE, MOPC, …) → Sube número y vigencia (o enlace)
  → Backend verifica (manual o API) → Si OK: sello "Profesional Matriculado" en perfil
  → En búsqueda: aparece antes (boost) y opción "Solo matriculados"
  → Al crear presupuesto: puede aplicar tarifa/categoría "Matriculado" (tasa más alta permitida)
```

---

## 5. User Flows consolidados (por pilar)

### 5.1 Escudo YAPÓ (una transacción completa)

1. Cliente busca profesional → Elige y recibe presupuesto.
2. Cliente toca **"Aceptar Trabajo"** → Acepta términos → Sistema genera contrato digital y debita monto a custodia.
3. Profesional recibe notificación → Va al lugar → **Escanea QR de inicio** (o check-in + foto) → Sistema libera **50%** al profesional.
4. Profesional termina → Marca "Trabajo finalizado" → Cliente **califica** (o pasan 24 h sin disputa) → Sistema libera **50%** restante.
5. *Si hay disputa:* Cliente o profesional abre disputa y sube fotos → Mediador revisa → Sistema libera/devolución según fallo.

### 5.2 Compromiso de Hierro (cancelación y cumplimiento)

1. Cita en estado "confirmada" → Usuario cancela con **menos de 2 h** antes → Sistema debita **Token de Irresponsabilidad** de su billetera y registra el evento.
2. Tras cada cita (cumplida/cancelada/no-show) → Se recalcula **Cumplidor %**.
3. Si **Cumplidor % < 80%** → Anuncios ocultos **48 h** → Notificación al usuario → Tras 48 h se vuelven a mostrar.

### 5.3 Contrato Digital Flash

1. Cliente toca **"Aceptar Trabajo"** en el presupuesto.
2. Pantalla de resumen: identidad (C.I.), descripción técnica, monto final, garantía X días, hitos de pago.
3. Checkbox "Acepto los términos de la transacción y el contrato digital".
4. Confirmar → Sistema genera PDF contrato, crea orden, debita a custodia; ambas partes reciben copia.

### 5.4 Filtro Mbareté (matriculado)

1. Profesional en **Mi perfil** → "Agregar matrícula" → Elige ANDE / MOPC (u otra) → Ingresa número y vigencia.
2. Sistema verifica → Si es válido, badge "Profesional Matriculado" en perfil.
3. En **Buscar profesionales**: matriculados aparecen primero; filtro "Solo matriculados" disponible.
4. Al publicar presupuesto: puede elegir categoría/tarifa "Matriculado" (tasa más alta permitida).

---

## 6. Texto legal simplificado (aceptación al transaccionar)

Texto que el usuario debe aceptar (checkbox o botón) antes de confirmar "Aceptar Trabajo" o antes de que se debite el Token de Irresponsabilidad, según corresponda.

### 6.1 Aceptación al aceptar trabajo (Escudo YAPÓ + Contrato)

**Título:** Aceptación del trabajo y condiciones de pago en custodia

**Texto simplificado:**

- "Al aceptar este trabajo, el monto acordado será descontado de mi billetera YAPÓ y retenido en custodia hasta que se cumplan los hitos de liberación (50% al inicio de obra verificada, 50% al finalizar y calificar)."
- "Recibo un contrato digital con mi identidad y la del profesional, la descripción técnica, el monto final y la garantía técnica de [X] días. No se permite modificar el monto ni la descripción después de aceptar."
- "Acepto los Términos y Condiciones de YAPÓ y las reglas de resolución de conflictos: en caso de desacuerdo, YAPÓ retendrá el fondo hasta que un mediador resuelva con base en la evidencia (contrato, fotos, mensajes)."

**Checkbox:** "He leído y acepto lo anterior y acepto el contrato digital."

### 6.2 Aceptación de penalidad por cancelación tardía (Compromiso de Hierro)

**Texto (visible en Términos o al confirmar cita):**

- "Si cancelo una cita confirmada con menos de 2 horas de antelación, YAPÓ debitará de mi billetera un Token de Irresponsabilidad según la política vigente. Mi índice Cumplidor se calcula por mis citas cumplidas; si baja del 80%, mis anuncios no se mostrarán durante 48 horas."

**Checkbox (al confirmar cita):** "Entiendo las reglas de cancelación y del índice Cumplidor."

### 6.3 Uso de identidad y matrícula (Filtro Mbareté)

**Texto (en perfil / verificación):**

- "Al cargar mi C.I. y/o matrícula profesional (ANDE, MOPC u otra), autorizo a YAPÓ a verificarlas y mostrarlas en mi perfil y en el contrato digital cuando corresponda. La matrícula puede darme prioridad en búsquedas y permitir tarifas según la política de la plataforma."

---

## 7. Resumen técnico para implementación

| Pilar | Entidades / eventos clave | APIs / jobs sugeridos |
|-------|---------------------------|-------------------------|
| Escudo YAPÓ | Orden, EscrowOrder, hitos, disputa, mediador | POST orden, depositar, escanear QR / check-in inicio, finalizar, disputar, resolver; job 24h auto-liberar 2º hito |
| Compromiso de Hierro | Cita, cancelación, Token, Cumplidor % | POST cancelar cita (comprobar 2h, debitar token), job recalcular Cumplidor; filtro feed por cumplidor + ventana 48h |
| Contrato Flash | Acuerdo, PDF, campos inmutables | Generar PDF al aceptar; almacenar contratoId en Orden; campos descripcion, monto, garantiaDias en Acuerdo |
| Filtro Mbareté | UserMatricula (ANDE, MOPC), vigencia | POST verificar matrícula, GET sellos; en feed: boost matriculados, filtro "Solo matriculados"; en presupuesto: tarifa/categoría matriculado |

Este documento se integra con `MODULOS-GARANTIA-REPUTACION-Y-PAGO.md` y `VERIFICACION-MODULOS-Y-CONTRATO.md` para un único núcleo operativo del ecosistema de ejecución garantizada.
