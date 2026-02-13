# FASE 2 — Wallet + Escudos

**Objetivo:** Billetera persistida en PostgreSQL y escudos (Shields) por usuario. Validación servidor obligatoria; ninguna acción de wallet sin perfil OK. SAFE MODE usa wallet en memoria y marca transacciones como DEV_ONLY.

---

## 1. Reglas

- **Ninguna acción wallet sin `profileStatus === "OK"`.**  
  El guard `validateWalletAccess()` comprueba sesión, consentimiento vigente y perfil OK. Si el perfil está incompleto, las rutas `/api/wallet*` devuelven 403.

- **Server-side enforcement obligatorio.**  
  Todas las validaciones (sesión, consentimiento, perfil, rol, monto) se hacen en servidor. No se confía en datos del cliente.

- **SAFE MODE:**  
  Si `YAPO_SAFE_MODE=true` o `SAFE_MODE=true`, las rutas de wallet usan el ledger en memoria (`@/lib/wallet`). No se persiste en DB. Las respuestas incluyen `devOnly: true` y las transacciones se marcan como DEV_ONLY.

- **Roles:**  
  Transferencias permitidas para los roles: vale, capeto, kavaju, mbarete, cliente, pyme, enterprise. La comprobación se hace en `canTransfer(role)` en el guard.

- **Escudos (Shields):**  
  Tipos: SALUD, FINTECH, COMUNIDAD, SUBSIDIO. Se asignan y revocan por usuario; `hasShield(userId, shieldType)` indica si el usuario tiene el escudo activo. CerebroResult puede incluir `requiresShield?: ShieldType` y `walletAction?: "VIEW" | "TRANSFER" | "BLOCKED"` (integración futura).

---

## 2. Modelos Prisma (FASE 2)

- **Wallet:** id, userId (unique), balance (Decimal), status (ACTIVE | FROZEN), createdAt. Relación 1:1 con User.
- **WalletTransaction:** id, walletId, type (CREDIT | DEBIT | TRANSFER), amount, reason?, createdAt, devOnly (para SAFE MODE / no persistido).
- **Shield:** id, type (SALUD | FINTECH | COMUNIDAD | SUBSIDIO), level, territoryId?, active.
- **UserShield:** id, userId, shieldId, status (ACTIVE | SUSPENDED), createdAt. Unique (userId, shieldId).

No se modifican User, Profile ni Consent existentes; solo se añade la relación User → Wallet y User → UserShield.

---

## 3. Servicios

- **`src/lib/wallet-db/service.ts`**  
  - `getOrCreateWallet(userId)`  
  - `getWallet(userId)`  
  - `credit(userId, amount, reason)`  
  - `debit(userId, amount, reason)`  
  - `transfer(fromUserId, toUserId, amount, reason?)`  
  - `getTransactions(userId, limit)`  
  Validación de permisos por rol se hace en las API routes (guard).

- **`src/lib/wallet-db/shields.ts`**  
  - `assignShield(userId, shieldType)`  
  - `revokeShield(userId, shieldType)`  
  - `hasShield(userId, shieldType)`  
  - `getUserShields(userId)`  

- **`src/lib/wallet-db/guard.ts`**  
  - `validateWalletAccess()` → sesión, consentimiento, perfil OK; en SAFE MODE devuelve `allowed: true, safeMode: true`.  
  - `canTransfer(role)` → indica si el rol puede transferir.

---

## 4. API Routes

| Método | Ruta | Descripción | Validaciones |
|--------|------|-------------|--------------|
| GET | /api/wallet | Balance y escudos del usuario | validateWalletAccess |
| POST | /api/wallet/transfer | Transferencia (body: toUserId, amount, reason?) | validateWalletAccess, canTransfer, monto |
| GET | /api/wallet/transactions | Historial (query: limit?) | validateWalletAccess |
| GET | /api/wallet/shields | Escudos activos | validateWalletAccess |
| POST | /api/wallet/shields | Asignar/revocar (body: action, shieldType) | validateWalletAccess |

Todas comprueban sesión, consentimiento y perfil OK en servidor. En SAFE MODE no se persiste en DB y se devuelve `devOnly: true` donde corresponda.

---

## 5. UI mínima (/wallet)

- **Balance:** Tarjeta con saldo (GET /api/wallet → wallet.balance). Compatible con WalletBalanceCard (disponible = total, protegido = 0).
- **Escudos activos:** Lista de badges por tipo (SALUD, FINTECH, COMUNIDAD, SUBSIDIO) desde GET /api/wallet → shields.
- **Transferencia:** Formulario con campo “Usuario destino (userId)” y “Monto”; submit → POST /api/wallet/transfer. Botón real, no mock.
- **Historial:** Lista de transacciones desde GET /api/wallet/transactions (tipo, monto, reason, fecha, badge [DEV] si devOnly).

Si SAFE MODE está activo, se muestra badge “DEV” y las transacciones se marcan como [DEV].

---

## 6. SAFE MODE

- **Detección:** `SAFE_MODE_ENABLED` en servidor (`@/lib/auth/dev/safeMode`).
- **Comportamiento:**  
  - GET /api/wallet: balance y escudos desde ledger en memoria; `shields: []`; `devOnly: true`.  
  - GET /api/wallet/transactions: transacciones del ledger filtradas por userId; cada ítem con `devOnly: true`.  
  - POST /api/wallet/transfer: requestTransfer + holdTransaction + releaseTransaction (Cerebro) sobre el ledger en memoria; respuesta `devOnly: true`.  
  - POST /api/wallet/shields: responde OK sin persistir; `devOnly: true`.
- No se escribe en tablas Wallet, WalletTransaction, Shield, UserShield cuando SAFE MODE está activo.

---

## 7. Seguridad

- No confiar en datos del cliente: userId, monto y destino se validan en servidor.
- Prisma solo en servidor (API routes y lib wallet-db); no se expone en client.
- Rutas existentes y layout no se modifican; auth y Cerebro no se refactorizan.

---

## 8. Pendiente FASE 3

- Integración explícita de CerebroResult (`requiresShield`, `walletAction`) en flujos de wallet (bloqueo/permiso por escudo).
- Límites por rol o por escudo (máximo por transferencia, diario, etc.).
- Escudos por territorio (territoryId) y reglas de activación.
- Congelar/descongelar wallet (status FROZEN) desde admin o flujos de cumplimiento.
- Auditoría y retención de transacciones (export, reportes).
- Posible crédito inicial o subsidios vía `credit()` desde flujos de negocio (FASE 3).
