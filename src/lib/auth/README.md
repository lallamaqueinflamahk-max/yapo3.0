# Sistema de roles y permisos YAPÓ

## Separación

- **Autenticación**: quién es el usuario (identidad, sesión, login, biometría).
- **Autorización**: qué puede hacer (roles, permisos por acción).

## Roles

| ID         | Nombre    | Descripción breve |
|-----------|-----------|--------------------|
| vale      | Valé      | Usuario básico laboral |
| capeto    | Capeto    | Lidera cuadrilla de Valés |
| kavaju    | Kavaju    | Supervisa varias cuadrillas/zona |
| mbarete   | Mbareté   | Máximo nivel: territorio, Beca, Semáforo |
| cliente   | Cliente   | Contratante individual |
| pyme      | PyME      | Pequeña o mediana empresa |
| enterprise| Enterprise| Empresa grande |

## Permisos por acción

Cada acción (ej. `wallet:transfer`, `territory:semaphore`) tiene una lista de roles que pueden ejecutarla. Si la lista está vacía, cualquier usuario autenticado puede.

- **Autenticación**: `IAuthProvider`, `ISessionStore`, login por password o sesión.
- **Autorización**: `IAuthorizationService`, `can(identity, actionId)`, `canWithRoles(roles, actionId)`.
- **Biometría**: `IBiometricProvider` (stub listo para WebAuthn / dispositivo).

## Uso

```ts
import {
  createAuthProvider,
  createAuthorizationService,
  can,
  ACTIONS,
} from "@/lib/auth";

const auth = createAuthProvider();
const result = await auth.login({ userId: "user-1", password: "yapo123" });
if (result.success) {
  const { identity, session } = result;
  const check = can(identity, ACTIONS.territory_semaphore);
  if (check.allowed) {
    // Permitir acceso a Semáforo de Gestión
  }
}
```

## Biometría

`createBiometricProvider()` devuelve un stub. Para producción:

1. Implementar `IBiometricProvider` con WebAuthn o API del dispositivo.
2. `capture("fingerprint" | "face" | "voice")` → enviar assertion al backend.
3. Backend valida y devuelve identidad; luego se crea sesión como con password.
