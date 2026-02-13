/**
 * Contexto del Cerebro: user, roles, permissions, screen, memory.
 * Separación estricta: solo tipo y construcción; sin lógica de motor.
 */

/** Identidad mínima del usuario (userId + roles + verificación). */
export interface CerebroUser {
  userId: string;
  roles: string[];
  /** Usuario verificado (requerido para algunas acciones, ej. transferencias). */
  verified?: boolean;
}

/** Entrada del historial corto (última consulta/respuesta). */
export interface CerebroMemoryEntry {
  /** Consulta del usuario. */
  query?: string;
  /** Respuesta del asistente. */
  message?: string;
  /** Timestamp opcional. */
  at?: number;
}

/** Contexto completo del Cerebro para el motor y la UI. */
export interface CerebroContext {
  /** Usuario actual (null si no hay sesión). */
  user: CerebroUser | null;
  /** Roles del usuario (ids). */
  roles: string[];
  /** IDs de acciones permitidas (ej. wallet:transfer, home:view). */
  permissions: string[];
  /** Pantalla actual / ruta (ej. /wallet, /cerebro). */
  screen: string;
  /** Historial corto (últimas consultas/respuestas). */
  memory: CerebroMemoryEntry[];
  /** Por acción denegada: nombres de roles para mensaje (ej. "Cliente, PyME"). */
  permissionDeniedMessages?: Record<string, { requiredRoleNames: string[] }>;
}

/** Input para construir el contexto. */
export interface BuildCerebroContextInput {
  /** Identidad actual (null si no hay sesión). */
  identity: CerebroUser | null;
  /** Roles del usuario (ids). Si no se pasan, se usan identity.roles. */
  roles?: string[];
  /** IDs de acciones que el usuario puede ejecutar. */
  permissions: string[];
  /** Pantalla actual / ruta (ej. /home, /wallet). */
  screen: string;
  /** Historial corto (últimas N entradas). */
  memory?: CerebroMemoryEntry[];
  /** Por acción denegada: nombres de roles para el mensaje. */
  permissionDeniedMessages?: CerebroContext["permissionDeniedMessages"];
}

/**
 * Construye el contexto del Cerebro a partir de identity, roles, permisos, pantalla e historial.
 */
export function buildCerebroContext(input: BuildCerebroContextInput): CerebroContext {
  const roles = input.roles ?? input.identity?.roles ?? [];
  return {
    user: input.identity,
    roles,
    permissions: input.permissions,
    screen: input.screen,
    memory: input.memory ?? [],
    permissionDeniedMessages: input.permissionDeniedMessages,
  };
}
