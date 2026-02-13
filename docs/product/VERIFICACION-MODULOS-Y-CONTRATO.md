# Verificación de módulos y contrato digital rápido

## Estado de ejecución de los módulos (doc vs código)

Comprobación respecto a `MODULOS-GARANTIA-REPUTACION-Y-PAGO.md`.

---

### 1. Garantía de Asistencia (No-Show)

| Elemento | En doc | En código | Estado |
|----------|--------|-----------|--------|
| Estados de cita (programada, no_show_*, etc.) | §1.4 | `src/features/asistencia/types.ts` (CITA_ESTADOS, CitaEstado) | ✅ Tipos |
| Constantes de penalización (-0.05, -0.10) | §1.3 | `src/features/asistencia/types.ts` (NO_SHOW_PENALTY) | ✅ Tipos |
| API registrar no-show / historial | §1.4 | No existe | ❌ Pendiente |
| UI marcar "no se presentó" / historial asistencia | §1.5 | No existe | ❌ Pendiente |
| Integración con Mbarete (Cumplimiento) | §1.5 | Solo tipos de reputation; no cálculo | ⏳ Parcial |

**Conclusión:** Lógica y tipos listos; faltan API, DB y UI para que se **ejecute** el flujo de no-show.

---

### 2. Escudo de Pago Intermediado

| Elemento | En doc | En código | Estado |
|----------|--------|-----------|--------|
| Estados (creado → en_custodia → iniciado → finalizado) | §2.2 | `src/features/escudo-pago/types.ts` (EscrowOrderState, EscrowOrder) | ✅ Tipos |
| Hitos por defecto 50% / 50% | §2.4 | `src/features/escudo-pago/types.ts` (DEFAULT_HITOS) | ✅ Tipos |
| API crear orden, depositar, iniciar, finalizar, disputar | §2.5 | No existe (`/api/escudo-pago/*` no está) | ❌ Pendiente |
| Wallet hold/release (FASE-2) | §2.5 | `src/lib/wallet` tiene ledger/hold; no enlazado a escudo | ⏳ Parcial |

**Conclusión:** Modelo de datos listo; **no se ejecuta** el flujo de pago en custodia hasta tener APIs y uso del wallet hold.

---

### 3. Mbarete Score (reputación)

| Elemento | En doc | En código | Estado |
|----------|--------|-----------|--------|
| Dimensiones (Velocidad, Certificación, Cumplimiento) y pesos | §3.2 | `src/features/reputation/types.ts` (MBARETE_WEIGHTS, MbareteScore) | ✅ Tipos |
| Umbrales badges (Mbarete, En crecimiento) | §3.3 | `src/features/reputation/types.ts` (MBARETE_BADGE_THRESHOLDS) | ✅ Tipos |
| API GET score / cálculo | §3.4 | No existe (`/api/reputation/score/*` no está) | ❌ Pendiente |
| Ordenar feed por score | §3.3 | Mapa ordena por **documentVerified + rating** (proxy de calidad) | ✅ Proxy en UI |
| Mostrar badge Mbarete en perfil/feed | §3.3 | No se muestra score ni badge "Mbarete" | ❌ Pendiente |

**Conclusión:** Definición de métricas lista; el feed **sí** prioriza calidad (verificado + rating). Falta cálculo real del score y badges "Mbarete".

---

### 4. Filtro de Calidad (cédula y biometría)

| Elemento | En doc | En código | Estado |
|----------|--------|-----------|--------|
| Niveles 0–3 (sin verificar, email, cédula, biometría) | §4.2 | Implícito: `documentVerified` en perfil/mock | ✅ En datos |
| Mostrar "ID verificado" en perfil y búsqueda | §4.3 | Perfil público y mapa muestran badge 🪪 / "Documento verificado" | ✅ En UI |
| Ordenar por verificados primero | §3 / §4 | Mapa y `getProfesionalesPorBarrio` ordenan por documentVerified + rating | ✅ En ejecución |
| API verificación cédula (POST verify-id) | §4.4 | No existe; registro tiene tipos para cédula en `registration.types.ts` | ❌ Pendiente |
| Biometría para acciones sensibles | §4.5 | Existe `@/lib/auth/biometric`, `@/lib/security/biometrics` | ✅ Código base |

**Conclusión:** La **visibilidad** por calidad (verificados primero + badge ID) **sí se ejecuta**. Falta el flujo completo de verificación de cédula (API + revisión).

---

## Resumen ejecutivo

- **Se ejecuta hoy:**  
  - Orden del feed por calidad (documentVerified + rating).  
  - Badge "ID verificado" en perfil y en lista de profesionales del mapa.  
  - Tipos y constantes de los cuatro módulos listos para usar en backend.

- **No se ejecuta aún (solo doc + tipos):**  
  - Registro de no-show y aplicación de penalizaciones.  
  - Flujo de pago en custodia (crear orden, depositar, hitos).  
  - Cálculo y exposición del Mbarete Score y badges.  
  - Verificación de cédula vía API y actualización de `documentVerified`.

El pitch ("YAPÓ garantiza la ejecución") está **parcialmente** respaldado en producto: prioridad a verificados y orden por calidad sí; garantía de asistencia, pago por hitos y score explícito requieren las APIs y UI indicadas en §6 del doc principal.

---

## Contrato digital rápido (reglas claras antes del trabajo)

Borrador del **contrato digital** que se generaría automáticamente cuando el cliente acepta un presupuesto en la app. Cubre "reglas claras antes del trabajo" y se alinea con Garantía de Asistencia y Escudo de Pago.

### Cuándo se genera
- El **cliente** acepta una oferta/presupuesto del **profesional** dentro de YAPÓ (ej. botón "Aceptar presupuesto").
- Opcional: solo si el trabajo se pacta con **Escudo de Pago Intermediado** (dinero en custodia por hitos).

### Contenido mínimo (cláusulas tipo)

1. **Partes**  
   - Cliente: nombre, usuario YAPÓ, contacto.  
   - Profesional: nombre, usuario YAPÓ, profesión/rubro.

2. **Objeto**  
   - Descripción breve del trabajo acordado (ej. "Instalación eléctrica residencial en [dirección]").

3. **Fecha, lugar y horario**  
   - Fecha y hora de inicio acordada.  
   - Dirección o zona de ejecución.

4. **Precio y forma de pago**  
   - Monto total (PYG).  
   - Si aplica Escudo de Pago: "El pago se realizará a través de YAPÓ. El cliente deposita el monto en garantía; se libera [50% al iniciar / 50% al finalizar] según los hitos acordados."

5. **Asistencia y no-show**  
   - "Las partes se comprometen a asistir en la fecha y hora acordadas. Las inasistencias sin aviso pueden ser registradas en YAPÓ y afectar el historial y puntaje de la parte que no asista, según las reglas de la plataforma."

6. **Aceptación**  
   - "Al aceptar este presupuesto, el cliente acepta los Términos y Condiciones de YAPÓ y este acuerdo. El profesional confirma disponibilidad y compromiso de ejecución."

7. **Id de acuerdo**  
   - Código único (ej. `YAPO-ORD-2025-XXXX`) para soporte y disputas.

### Implementación técnica sugerida
- Al aceptar presupuesto: crear registro en tabla `Acuerdo` o `Orden` (id, clienteId, profesionalId, descripcion, monto, hitos?, estado, createdAt).  
- Generar PDF o vista imprimible con las cláusulas anteriores rellenadas (plantilla con variables).  
- Si se usa Escudo de Pago: enlazar el mismo id de orden con `EscrowOrder` para el flujo de custodia.

### Redacción tipo (copy para pantalla)
- **Título:** "Acuerdo de trabajo — YAPÓ"  
- **Subtítulo:** "Reglas claras antes de empezar. Este acuerdo se genera al aceptar el presupuesto."  
- **CTA post-aceptar:** "Descargar acuerdo" / "Enviar por correo".

Con esto se cubre el punto de **reglas claras antes del trabajo** y se deja listo para enlazar con Garantía de Asistencia y Escudo de Pago cuando esas APIs estén implementadas.
