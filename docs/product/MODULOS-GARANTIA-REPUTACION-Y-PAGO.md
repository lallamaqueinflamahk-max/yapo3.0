# Módulos de Garantía, Reputación y Pago — YAPÓ

**Objetivo de producto:** Que YAPÓ no "venda contactos", sino que **garantice la ejecución** del trabajo.  
**Enfoque:** Resolver fallos de competidores locales (no-show, desconfianza en el pago, perfiles falsos, feed lleno de inactivos) con lógica técnica y de negocio clara, sin ser autoritarios.

---

## 1. Módulo de Garantía de Asistencia (No-Show)

### 1.1 Problema
Profesionales o clientes no se presentan: se pierde tiempo, dinero y confianza. Penalizar solo con ban o multa genera rechazo; no penalizar destruye la disciplina.

### 1.2 Principios de diseño
- **Proporcionalidad:** Primera falta = advertencia suave; patrones repetidos = consecuencias crecientes.
- **Transparencia:** Reglas visibles en términos y en la app (ej. "Si no te presentás, tu Mbarete Score puede bajar").
- **Reconocimiento al cumplimiento:** Quien cumple mejora visibilidad y acceso a Escudo de Pago.

### 1.3 Reglas de negocio

| Evento | Quién falta | Acción automática | Comunicación |
|--------|-------------|-------------------|--------------|
| Primera no-asistencia (por año móvil) | Profesional o Cliente | Registro en historial; **sin penalización numérica**. | Notificación: "Marcamos que no te presentaste. La próxima vez puede afectar tu puntaje." |
| Segunda no-asistencia (mismo año) | Profesional | -0.05 en componente **Cumplimiento** del Mbarete Score. | "Tu cumplimiento bajó por no asistencia repetida." |
| Segunda no-asistencia | Cliente | Idem; además el profesional puede reportar "cliente no show" y recibir compensación simbólica (badge o prioridad en feed). | Cliente: "Tu historial de asistencia se actualizó." |
| Tercera+ no-asistencia | Cualquiera | -0.10 por evento en Cumplimiento; posible **reducción de visibilidad** en feed (ver §3). | Email + in-app. |
| Patrón grave (ej. >5 en 6 meses) | Profesional/Cliente | Revisión manual; posible restricción temporal de "Buscar profesionales" o de recibir ofertas con Escudo de Pago. | Comunicación desde soporte. |

**Descuento de no-show:**  
- Si el trabajo se pactó con **Escudo de Pago Intermediado** (§2), el no-show puede activar liberación parcial a favor del que sí asistió (ej. 20% por gastos/tiempo), según reglas del contrato del escudo.  
- Sin escudo: **no hay transferencia de dinero** por no-show; solo impacto en reputación y visibilidad.

### 1.4 Definiciones técnicas

- **Cita/Orden:** entidad con `profesionalId`, `clienteId`, `fechaHoraAcordada`, `estado`: `programada | confirmada | iniciada | completada | no_show_profesional | no_show_cliente | cancelada`.
- **Marcación de no-show:**  
  - Por **cliente:** "El profesional no vino" (con opción de evidencia: foto, mensaje).  
  - Por **profesional:** "El cliente no estaba".  
  - Ventana: hasta 24–48 h después de la fecha acordada.  
  - Si ambos marcan no-show, se considera conflicto y se registra para revisión; no se aplica penalización automática hasta resolución.
- **Historial de asistencia:** tabla o agregado por usuario: `userId`, `anoMovil`, `noShowCount`, `ultimaNoShowAt`, `penalizacionAplicada`.

### 1.5 Integración con el resto del ecosistema
- **Mbarete Score:** el componente "Cumplimiento" consume eventos de no-show (§3).
- **Escudo de Pago:** solo aplica compensación económica si el trabajo estaba bajo escudo (§2).
- **Feed/visibilidad:** el score afecta orden y filtros (§3).

---

## 2. Escudo de Pago Intermediado (Garantía en custodia)

### 2.1 Objetivo
El dinero se deposita en garantía y se libera por **hitos** acordados (ej. 50% al iniciar, 50% al finalizar), reduciendo riesgo para cliente y profesional.

### 2.2 Flujo de estados (maquina de estados)

```
[Cliente inicia] → CREADO
     ↓ (cliente deposita monto total en custodia)
  EN_CUSTODIA
     ↓ (profesional marca "Trabajo iniciado" O sistema detecta check-in)
  INICIADO  →  [Liberar 50% al profesional]
     ↓ (profesional o cliente marca "Trabajo finalizado" + opcional confirmación cliente)
  FINALIZADO  →  [Liberar 50% restante al profesional]
     ↓ (o: disputa / cancelación)
  DISPUTA | CANCELADO  →  [Reglas de devolución/corte]
```

### 2.3 Reglas de negocio

| Estado | Quién puede hacer | Acción |
|--------|-------------------|--------|
| CREADO | Cliente | Depositar monto en "custodia" (wallet hold). Monto bloqueado en wallet del cliente. |
| EN_CUSTODIA | Profesional | Marcar "Inicié el trabajo" (check-in). Requiere ubicación o foto opcional. |
| EN_CUSTODIA | Cliente | Cancelar antes de iniciar → devolución 100% (menos posible fee pequeño si hay política). |
| INICIADO | Sistema | Liberar primer hito (ej. 50%) al profesional. |
| INICIADO | Profesional / Cliente | Marcar "Trabajo finalizado". |
| FINALIZADO | Sistema | Liberar segundo hito (50%) al profesional. Cliente puede tener ventana (ej. 24 h) para disputar. |
| DISPUTA | Soporte / Reglas | Resolución manual o por reglas (ej. 50/50, 100% cliente, 100% profesional según evidencia). |
| NO_SHOW | Sistema | Si se declara no-show del profesional: devolución total al cliente (+ posible penalización en score del profesional). Si no-show del cliente: liberar primer hito al profesional como compensación parcial (opcional). |

### 2.4 Hitos configurables
- Por defecto: **50% al iniciar**, **50% al finalizar**.
- Permiso futuro (PyME/Enterprise): hitos custom (ej. 30% / 40% / 30%) definidos en el "contrato" del encargo.

### 2.5 Modelo técnico (alineado con FASE-2 y wallet existente)

- **Escudo tipo:** `PAGO_INTERMEDIADO` (nuevo tipo además de SALUD, FINTECH, COMUNIDAD, SUBSIDIO).
- **Entidad:** `OrdenConEscudo` o `EscrowOrder`:
  - `id`, `clienteId`, `profesionalId`, `montoTotal`, `moneda` (PYG),
  - `estado`: `creado | en_custodia | iniciado | finalizado | disputa | cancelado`,
  - `hitos`: `[{ porcentaje, liberadoAt?, destinatario }]`,
  - `walletHoldId` (referencia al "hold" en wallet),
  - `createdAt`, `updatedAt`, `finalizadoAt`.
- **Wallet:** usar concepto **held** (saldo retenido): al depositar, `debit` del cliente y creación de "hold" asociado a la orden. Al liberar hito, `release` de una parte del hold hacia el profesional (`credit` profesional, reducción del hold).
- **API sugerida:**
  - `POST /api/escudo-pago/orden` — Crear orden (cliente). Body: `profesionalId`, `montoTotal`, `hitos?`.
  - `POST /api/escudo-pago/orden/:id/depositar` — Cliente deposita → estado EN_CUSTODIA.
  - `POST /api/escudo-pago/orden/:id/iniciar` — Profesional marca inicio → liberar primer hito.
  - `POST /api/escudo-pago/orden/:id/finalizar` — Marcar fin → liberar segundo hito.
  - `POST /api/escudo-pago/orden/:id/disputar` — Abrir disputa.
  - `GET /api/escudo-pago/orden/:id` — Estado actual (cliente o profesional).

### 2.6 Mensaje de pitch
"El dinero no pasa de mano en mano a la ligera: queda en garantía hasta que se cumplan los hitos. Vos trabajás tranquilo; el cliente paga tranquilo."

---

## 3. Sistema de Reputación "Cultura Paraguaya" — Mbarete Score

### 3.1 Objetivo
Un puntaje que refleje **velocidad**, **certificación** y **cumplimiento**, y que afecte la **visibilidad** en el feed de búsqueda de profesionales (no solo "cuántos hay", sino "quiénes son más mbarete").

### 3.2 Dimensiones del Mbarete Score (0–1 por dimensión; promedio o ponderado = score global)

| Dimensión | Qué mide | Fuente de datos | Peso sugerido |
|-----------|----------|------------------|---------------|
| **Velocidad** | Tiempo de respuesta y de llegada | Tiempo desde oferta/contacto hasta "acepté" / "llegué"; tiempo desde "inicié" hasta "finalicé" en órdenes con escudo. | 0.25 |
| **Certificación** | Formación y verificación oficial | Cédula verificada (Filtro de Calidad §4), cursos/badges completados, documento de identidad verificado. | 0.35 |
| **Cumplimiento** | Asistencia y cierre de acuerdos | No-show (penalización §1), trabajos completados vs. abandonados, disputas resueltas a favor. | 0.40 |

Fórmula ejemplo:  
`MbareteScore = 0.25 * Velocidad + 0.35 * Certificación + 0.40 * Cumplimiento`  
Cada componente se normaliza a [0, 1] (ej. Velocidad = 1 si responde en <30 min en promedio; 0 si siempre >24 h).

### 3.3 Cómo afecta la visibilidad en el feed

- **Ordenamiento:** En "Buscar profesionales" (mapa/feed), los resultados se ordenan por:
  - Relevancia (zona, categoría, filtros),
  - **Luego** por `MbareteScore` descendente (y opcionalmente por rating explícito 1–5).
- **Filtro "Solo verificados":** Usuarios con Certificación por debajo de umbral (ej. sin cédula verificada) pueden quedar en segunda página o detrás de un toggle "Incluir no verificados" (por defecto: mostrar solo verificados o destacar verificados primero).
- **Badges en UI:** "Mbarete" (score >0.8), "En crecimiento" (0.5–0.8), "Nuevo" (pocos datos). No mostrar "Malo"; sí "Completá tu perfil para subir".

### 3.4 Modelo técnico

- **Tabla o vista:** `MbareteScore` por usuario: `userId`, `velocidad`, `certificacion`, `cumplimiento`, `scoreGlobal`, `updatedAt`. Valores calculados por job o en tiempo real (según volumen).
- **Eventos que actualizan:**  
  - Certificación: cuando se verifica cédula (§4) o se otorgan badges.  
  - Cumplimiento: cuando se registra no-show (§1) o se cierra orden con escudo (§2).  
  - Velocidad: cuando se acepta oferta, se hace check-in o se finaliza orden.
- **API:** `GET /api/reputation/score/:userId` (público para perfil); internamente el feed usa el score para ordenar.

### 3.5 Mensaje de pitch
"No es solo un número: es Velocidad, Certificación y Cumplimiento. Los que más cumplen aparecen primero."

---

## 4. Filtro de Calidad vs. Cantidad (Validación biométrica y legal)

### 4.1 Objetivo
Evitar que YAPÓ se llene de usuarios inactivos o estafadores: **validación por Cédula de Identidad** (y opcionalmente biometría) como filtro de calidad sin cerrar la puerta a nuevos usuarios.

### 4.2 Niveles de verificación (gradual, no autoritario)

| Nivel | Nombre | Requisito | Qué desbloquea |
|-------|--------|-----------|----------------|
| 0 | Sin verificar | Solo registro | Perfil visible con indicador "No verificado"; puede aparecer en búsqueda pero **por debajo** de verificados (ver §3). |
| 1 | Email/teléfono | Email o teléfono confirmado | Mismo; refuerza recuperación de cuenta. |
| 2 | Cédula verificada | Cédula de Identidad (número + foto/documento) verificada contra fuente oficial o proceso manual. | Sube componente **Certificación** del Mbarete Score; badge "ID verificado"; prioridad en feed; acceso a Escudo de Pago Intermediado (como profesional o cliente). |
| 3 | Biometría (opcional) | Huella o rostro según dispositivo. | Requerido para acciones sensibles (ej. liberar hitos grandes, retiros wallet) si la política lo exige. |

### 4.3 Reglas de negocio

- **No bloquear por no verificar:** Cualquiera puede registrarse y usar la app; la verificación **mejora** posición y acceso, no es obligatoria para entrar.
- **Incentivo claro:** "Completá la verificación de tu cédula para aparecer primero y poder recibir pagos con garantía."
- **Datos mínimos para cédula:** Número de cédula, nombre completo, fecha de nacimiento (y foto del documento si no hay API oficial). Comparación con base del TRIBUTARIO/DGP si hay convenio; si no, revisión manual o flujo asistido.
- **Usuarios inactivos:** Después de N meses sin login ni actividad, el perfil puede pasar a "inactivo" y **no** mostrarse en resultados por defecto (o mostrarse al final). Reactivación con un login.

### 4.4 Flujo técnico (Cédula)

1. Usuario en perfil: "Verificar mi identidad".
2. Formulario: número de cédula, nombre, fecha nacimiento, subida de foto (frontal/dorso) si aplica.
3. Envío a `POST /api/identity/verify-id` (o similar).
4. Backend:  
   - Si hay API oficial: consulta y comparación; resultado `verified | rejected | manual_review`.  
   - Si no: estado `pending_review`; cola para soporte; cuando se aprueba, actualizar usuario `documentVerified: true` y actualizar **Certificación** en Mbarete Score.
5. UI: badge "ID verificado" en perfil y en resultados de búsqueda.

### 4.5 Integración con biometría existente
- El proyecto ya tiene referencias a biometría (`@/lib/auth/biometric`, `@/lib/security/biometrics`, etc.). Usar para:
  - Confirmación de liberación de hitos (Escudo de Pago) si el monto supera umbral.
  - Confirmación de retiro de wallet por montos altos.
- La verificación de **cédula** es independiente y es la base del "Filtro de Calidad"; la biometría es una capa extra para acciones críticas.

### 4.6 Mensaje de pitch
"No vendemos contactos anónimos: priorizamos a quienes se identifican. Verificación con cédula para más visibilidad y para pagos con garantía."

---

## 5. Resumen: Cómo encaja el pitch

| Módulo | Fallo que resuelve | Mensaje corto |
|--------|--------------------|----------------|
| Garantía de Asistencia | No-show sin consecuencias | "Las inasistencias se registran y afectan el puntaje; no castigamos la primera vez, pero la disciplina importa." |
| Escudo de Pago Intermediado | Dinero en mano sin garantía | "El dinero queda en garantía y se libera por hitos; garantizamos la ejecución del pago." |
| Mbarete Score | Feed lleno de cualquiera | "Ordenamos por Velocidad, Certificación y Cumplimiento; los que más cumplen aparecen primero." |
| Filtro de Calidad | Estafadores e inactivos | "Priorizamos identidad verificada con cédula; no vendemos contactos, garantizamos ejecución." |

**Frase de cierre:**  
"YAPÓ no vende contactos: **garantiza la ejecución** del trabajo — con asistencia clara, pago en custodia por hitos, reputación Mbarete y verificación de identidad."

---

## 6. Próximos pasos técnicos sugeridos

1. **Schema DB:** Añadir tablas/columnas para: citas/órdenes, no-show, `MbareteScore`, `EscrowOrder`, y flags `documentVerified` en User/Profile.
2. **APIs:** Implementar rutas para Escudo de Pago (§2.5), reputación (score), identity verify (§4.4), y registro de no-show (§1.4).
3. **Feed/Búsqueda:** En `/api/mapa/zonas/profesionales` (y donde se arme el feed), ordenar por `MbareteScore` y filtrar/ponderar por `documentVerified`.
4. **UI:** Pantallas de "Mi asistencia", "Órdenes con garantía", "Mi Mbarete Score" y "Verificar identidad" en perfil.
