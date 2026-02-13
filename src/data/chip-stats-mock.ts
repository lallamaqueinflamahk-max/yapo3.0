/**
 * Mock de estadísticas en tiempo real para chips bubble.
 * Estructura: chipId, rol, categoría, contadorClicks, últimosUsuarios.
 * Preparado para reemplazo por WebSocket o API.
 */

export interface ChipRecentUser {
  id: string;
  name: string;
  initials: string;
  /** Color de fondo del mini-avatar (hex o Tailwind) */
  color: string;
}

/** Mock: últimos usuarios que interactuaron (para mini-avatars) */
export const MOCK_RECENT_USERS: ChipRecentUser[] = [
  { id: "u1", name: "Vos", initials: "V", color: "#002395" },
  { id: "u2", name: "María", initials: "M", color: "#D52B1E" },
  { id: "u3", name: "Juan", initials: "J", color: "#0d9488" },
  { id: "u4", name: "Ana", initials: "A", color: "#7c3aed" },
  { id: "u5", name: "Carlos", initials: "C", color: "#ea580c" },
];

export interface ChipStatsMock {
  chipId: string;
  rol: string;
  categoría: string;
  contadorClicks: number;
  últimosUsuarios: ChipRecentUser[];
}

/** Genera últimos usuarios mock rotando según el contador (simula llegada en tiempo real). */
export function getMockRecentUsers(clickCount: number, currentUserName = "Vos"): ChipRecentUser[] {
  const others = MOCK_RECENT_USERS.filter((u) => u.name !== currentUserName);
  const current = MOCK_RECENT_USERS.find((u) => u.name === currentUserName) ?? MOCK_RECENT_USERS[0];
  const take = Math.min(3, 1 + (clickCount % 3));
  const list = [current, ...others].slice(0, 4);
  return list.slice(0, take);
}
