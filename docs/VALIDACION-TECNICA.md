# Validación técnica YAPÓ 3.0

Checklist técnico, casos de prueba de usuario, preparación para OpenAI + ElevenLabs y extensión futura a bancos reales.

---

## Orden recomendado de ejecución

| # | Bloque | Objetivo |
|---|--------|----------|
| **1** | **Checklist técnico** | Validar que cada capa existe y se integra bien (Cerebro, Wallet, Guard, Subsidios, Biometría, Territorio). |
| **2** | **Test cases de usuario** | Ejecutar flujos reales (Valé ve billetera, Capeto transfiere, usuario acepta subsidio, semáforo, etc.). |
| **3** | **Preparación OpenAI + ElevenLabs** | Revisar env, adapters y puntos de enganche para voz y NLP. |
| **4** | **Conexión bancos (futuro)** | Documentar extension points; no ejecutar aún. |

**Arrancar por el Bloque 1 (checklist técnico).**

---

## 1. Checklist técnico

### 1.1 Cerebro gobierna Wallet

- [x] **Intent `wallet_view`** existe en `src/lib/ai/intents/catalog.ts` y tiene `navigationTarget: "/wallet"`.
- [x] **Intent `wallet_transfer`** existe; en `decide.ts` se orquesta guard → `applyTransaction` (no se mueve dinero desde UI directa).
- [x] **Intent `wallet_subsidy`** existe y tiene `navigationTarget: "/wallet"`.
- [x] **RoleBehavior** incluye `wallet_view`, `wallet_subsidy` (y `wallet_transfer` donde corresponda) en `src/lib/roles/behaviors.ts`.
- [x] **CerebroChips** o equivalente: al recibir `result.allowed && result.navigationTarget`, hace `router.push(result.navigationTarget)` (navegación reactiva).

### 1.2 Wallet

- [x] **Modelo**: `WalletAccount` (balanceAvailable, balanceProtected), `WalletTransaction` (id, type, amount, status, createdAt) en `src/lib/wallet/account.model.ts`.
- [x] **Ledger**: `credit`, `applyLock`, `applyUnlock`; no se modifica balance sin pasar por transacción o crédito/lock.
- [x] **Servicio canónico**: `getWalletByUser`, `getBalance`, `createTransaction`, `applyTransaction` en `wallet.service.ts`; `applyTransaction` solo si el guard permite.

### 1.3 Guard

- [x] **wallet.guard.ts**: valida usuario, wallet existe, estado (locked/suspended), permisos vía **AuthorizationService** (`canWithRoles`), escudos, balance suficiente.
- [x] **Escudo territorial**: Rojo → bloqueo; Amarillo → biometría (`requiresValidation` + `requiresBiometricLevel`); Verde → permitido.
- [x] **guardResultToCerebroResult** convierte resultado del guard a forma compatible con CerebroResult (message, requiresValidation, validationType).

### 1.4 Subsidios

- [x] **Tipos**: `Subsidy`, `SubsidyConditions`, `SubsidyAcceptance` en `subsidy.types.ts`; campo `programId` opcional para gobierno.
- [x] **createSubsidy** (Mbareté/sistema); **acceptSubsidy** valida condiciones y escudos, luego `credit` + `applyLock` (acreditación en balance protegido).
- [x] **No transferibles**: documentado en tipos; aceptación registrada en `SubsidyAcceptance` (auditable).
- [x] **validateSubsidyEligibility** (pre-check sin aceptar); **getAcceptancesForAudit** (rango de fechas, subsidyId, userId).

### 1.5 Biometría

- [x] **IBiometricProvider** (stub): `isAvailable`, `capture`, `verify`, `getSupportedLevels`; niveles low/medium/high mapeados a 1/2/3.
- [x] **Modal biométrico**: estados esperando, validando, éxito, fallo; **Cancelar** aborta operación; integración con CerebroResult (`validationType: "biometric"`).

### 1.6 Territorio

- [x] **Semáforo**: `getTerritorySemaphore(location)` devuelve green/yellow/red; constantes `SEMAPHORE_STATE_LABELS`, helpers `isSemaphoreBlocked`, `isSemaphoreRequiresBiometric`.
- [x] **Wallet.guard** usa semáforo en escudo territorial (rojo → bloqueo, amarillo → biometría).
- [x] **UI**: componente semáforo visible para Capeto, Kavaju, Mbareté; solo lectura para Valé; integrado en Home para roles laborales.

### 1.7 Navegación reactiva

- [x] **useCerebroNavigation** (opcional): si `cerebroResult?.navigationTarget?.screen`, hace `router.push(buildHref(screen, params))`.
- [x] **CerebroChips** (o chips que usen decide): tras `decide()`, si `result.navigationTarget` existe, navega (string o `screen` según capa).

---

## 2. Test cases reales de usuario

Ejecutar manualmente (o automatizar después) en entorno local con `npm run dev`.

### 2.1 Rol Valé

| # | Caso | Pasos | Resultado esperado |
|---|------|--------|---------------------|
| 1 | Ver billetera | Login Valé → Home → chip "Mi billetera" (wallet_view). | Navega a `/wallet`; se ve saldo (disponible + protegido). |
| 2 | Ver subsidios | En `/wallet`, si hay subsidios para Valé, se muestra lista. | Lista de subsidios disponibles; botones "Ver condiciones", "Aceptar" / "No aceptar". |
| 3 | Aceptar subsidio | En lista subsidios → "Ver condiciones" → "Aceptar subsidio". | Mensaje de éxito; balance protegido aumenta; no se puede transferir ese monto a otro usuario. |
| 4 | Semáforo | Home → sección Semáforo territorial. | Se ve semáforo (Verde/Amarillo/Rojo) con badge "Solo lectura". |

### 2.2 Rol Capeto / Kavaju

| # | Caso | Pasos | Resultado esperado |
|---|------|--------|---------------------|
| 5 | Transferir | Login Capeto → Wallet → Enviar → usuario destino + monto → Enviar. | Si guard pide biometría: modal biométrico; tras validar, transferencia se ejecuta (hold/release) y saldo se actualiza. |
| 6 | Liberar transacción | Wallet → historial → transacción en "Retenido" → Liberar. | Cerebro intent `wallet_release_transaction`; si permitido, transacción pasa a "Liberado" y saldo destino aumenta. |
| 7 | Bloquear transacción | Wallet → historial → transacción retenida → Bloquear. | Cerebro intent `wallet_block_transaction`; transacción bloqueada; saldo origen se restaura. |
| 8 | Ir a subsidios desde Cerebro | Home → Más opciones → "Subsidios" (wallet_subsidy). | Navega a `/wallet` (subsidios visibles en la misma página). |

### 2.3 Guard y escudos

| # | Caso | Pasos | Resultado esperado |
|---|------|--------|---------------------|
| 9 | Sin sesión | Sin login → intentar ir a Wallet (URL directa o chip). | Redirección a login o mensaje "Iniciá sesión". |
| 10 | Rol sin permiso transfer | Usuario sin rol que permita `wallet_transfer` intenta enviar. | Mensaje de Cerebro: rol no permite transferir. |
| 11 | Territorio rojo (mock) | Usuario con ubicación en zona mock "roja" intenta transferir. | Guard deniega: "operaciones bloqueadas en esta zona (semáforo rojo)". |
| 12 | Territorio amarillo (mock) | Ubicación en zona "amarilla" → transferir. | Guard devuelve requiresValidation; modal biométrico; tras validar, se puede continuar. |

### 2.4 Biometría

| # | Caso | Pasos | Resultado esperado |
|---|------|--------|---------------------|
| 13 | Modal biométrico | Flujo Enviar que pida biometría → se abre modal. | Estados: esperando → validando → éxito (cierre automático) o fallo (Reintentar / Cancelar). |
| 14 | Cancelar en modal | Modal biométrico abierto → Cancelar. | Modal se cierra; operación no se realiza (no se debita). |

---

## 3. Preparación para OpenAI + ElevenLabs

### 3.1 Variables de entorno

- [ ] `NEXT_PUBLIC_AI_MODE`: `local` (default) o `openai`.
- [ ] `NEXT_PUBLIC_VOICE_MODE`: `local` (default) o `elevenlabs`.
- [ ] API keys (cuando se activen): `OPENAI_API_KEY`, `ELEVENLABS_API_KEY` (o nombres que use el proyecto) en `.env.local` / Vercel, nunca en código.

### 3.2 Puntos de enganche actuales

- **OpenAI**: `src/lib/ai/adapters/openaiEngine.ts` (inferencia de intent, contexto); `src/lib/cerebro/adapters/openai.ts` si existe.
- **ElevenLabs**: `src/lib/ai/voice/providers/elevenlabs.ts`; `src/lib/cerebro/adapters/elevenlabs.ts`.
- **Cerebro**: entrada por **intent ya resuelto** (`CerebroIntent` con `intentId` + `payload`). Para NLP: texto → `inferIntent(text)` → `decide(inferredIntent, context)`. El flujo actual ya está listo para que un adapter (OpenAI) mapee texto a `intentId` + `payload`.

### 3.3 Checklist preparación

- [ ] Catálogo de intents estable (wallet_view, wallet_transfer, wallet_subsidy, etc.) para que OpenAI mapee frases a `intentId`.
- [ ] `processInputWithIntent` o equivalente: recibe `CerebroIntent`; solo falta capa "texto → CerebroIntent" (OpenAI/Whisper).
- [ ] Voz: entrada (Whisper/u otro) → texto → intent; salida (ElevenLabs/u otro) para leer mensaje del Cerebro. Verificar que los adapters existentes se llamen desde la UI cuando `AI_MODE` / `VOICE_MODE` no sean `local`.

---

## 4. Conexión con bancos reales (más adelante)

### 4.1 Extension points

- **Ledger**: hoy en memoria (`ledger.ts`). Futuro: reemplazar o delegar en servicio bancario (webhook o API) para débitos/créditos reales.
- **Identificación de cuentas**: hoy `userId` como wallet id; con bancos hará falta mapeo `userId` ↔ `iban` o cuenta bancaria (tabla o servicio).
- **Transacciones**: `recordTransaction` y estados (pending, held, released, blocked) pueden reflejar estados del banco (pendiente, confirmada, rechazada).
- **Subsidios**: `acceptSubsidy` hoy hace `credit` + `applyLock` en ledger; con banco sería "orden de acreditación" a cuenta del usuario (y opcionalmente lock en nuestro modelo hasta condiciones).

### 4.2 Qué no tocar hasta tener banco

- Flujo Cerebro → Guard → Servicio: mantener; el servicio será el que hable con el adapter bancario.
- Auditoría: `SubsidyAcceptance`, historial de transacciones, logs de compliance; seguir igual, alimentados por el mismo flujo con origen "banco" cuando exista.

### 4.3 Orden sugerido cuando haya banco

1. Definir API o webhook del banco (crédito, débito, estado).
2. Crear `BankAdapter` (interface) e implementación concreta que llame al banco.
3. En `ledger` o en un servicio encima, sustituir escritura en memoria por llamadas al adapter (manteniendo misma semántica de estados).
4. Mantener guard, subsidios y Cerebro sin cambios; solo el "almacén" de dinero pasa a ser real.

---

## Resumen: qué ejecutar primero

1. **Ejecutá primero el Bloque 1 (checklist técnico)**: revisar cada ítem en el código y marcar los que ya cumplan; corregir los que falten.
2. Luego **Bloque 2 (test cases de usuario)**: recorrer los casos en la app (Valé, Capeto, subsidios, transferencia, guard, biometría, semáforo).
3. Después **Bloque 3 (preparación OpenAI + ElevenLabs)**: revisar env y adapters; dejar listo para activar con API keys.
4. **Bloque 4 (bancos)**: solo documentación y diseño; implementación cuando el banco esté definido.

Si querés, en el siguiente mensaje podemos bajar el Bloque 1 a pasos concretos (por archivo o por feature) y los vas tildando en la práctica.
