/**
 * Posiciones para el mapa de calor YAPÓ.
 * Cada barrio tiene coordenadas (x, y) en % del viewBox; los puntos de usuarios
 * se dibujan en rojo / amarillo / verde según estado de la zona o tipo de usuario.
 */

import type { SemaphoreState } from "@/data/semaphores-map";
import { SEMAPHORES_MAP } from "@/data/semaphores-map";

export type PuntoUsuarioTipo = "red" | "yellow" | "green";

export interface PuntoMapaCalor {
  id: string;
  x: number;
  y: number;
  tipo: PuntoUsuarioTipo;
  label?: string;
  barrioId?: string;
}

/** Posición aproximada por barrio (x, y en % 0–100) para Central y alrededores. */
const BARRIO_XY: Record<string, { x: number; y: number }> = {
  "asuncion-botanic": { x: 28, y: 22 },
  "asuncion-sajonia": { x: 35, y: 28 },
  "asuncion-loma-pyta": { x: 42, y: 18 },
  "asuncion-villa-morra": { x: 22, y: 35 },
  "asuncion-carmelitas": { x: 25, y: 42 },
  "asuncion-san-pablo": { x: 38, y: 38 },
  "asuncion-recoleta": { x: 32, y: 48 },
  "asuncion-centro": { x: 30, y: 38 },
  "lambare-centro": { x: 18, y: 52 },
  "lambare-tycua": { x: 22, y: 58 },
  "lambare-santa-ana": { x: 28, y: 55 },
  "lambare-zona-sur": { x: 15, y: 62 },
  "fdm-centro": { x: 45, y: 42 },
  "fdm-santa-rosa": { x: 48, y: 38 },
  "fdm-san-miguel": { x: 52, y: 45 },
  "fdm-villa-del-rosario": { x: 55, y: 50 },
  "fdm-zona-norte": { x: 50, y: 52 },
  "luque-centro": { x: 58, y: 35 },
  "luque-viñas-cue": { x: 62, y: 40 },
  "luque-santani": { x: 65, y: 42 },
  "sanlorenzo-centro": { x: 48, y: 58 },
  "sanlorenzo-ñemby": { x: 52, y: 62 },
  "cde-centro": { x: 78, y: 28 },
  "cde-monday": { x: 82, y: 32 },
  "minga-centro": { x: 75, y: 38 },
  "enc-centro": { x: 85, y: 55 },
  "enc-san-isidro": { x: 88, y: 52 },
  "camb-centro": { x: 82, y: 58 },
  "paraguari-centro": { x: 42, y: 72 },
  "fil-centro": { x: 25, y: 78 },
};

/**
 * Genera puntos visibles en el mapa: un barrio puede tener varios puntos (usuarios).
 * Color rojo = zona prioridad / clientes PRO, amarillo = atención / trabajadores activos, verde = estable / aliados.
 */
export function getPuntosMapaCalor(): PuntoMapaCalor[] {
  const puntos: PuntoMapaCalor[] = [];
  let idx = 0;
  for (const depto of SEMAPHORES_MAP) {
    for (const ciudad of depto.ciudades) {
      for (const barrio of ciudad.barrios) {
        const pos = BARRIO_XY[barrio.id] ?? { x: 50 + (idx % 5) * 4, y: 40 + (idx % 4) * 8 };
        const tipo = barrio.state as PuntoUsuarioTipo;
        puntos.push({
          id: `p-${barrio.id}`,
          x: pos.x,
          y: pos.y,
          tipo,
          label: barrio.name,
          barrioId: barrio.id,
        });
        idx++;
      }
    }
  }
  return puntos;
}

/**
 * Polígonos aproximados por departamento para rellenar con gradiente de calor.
 * Coordenadas en % (0–100). Orden: Central, Alto Paraná, Itapúa, Boquerón, Paraguarí.
 */
export const REGIONES_CALOR: { id: string; name: string; state: SemaphoreState; points: string }[] = [
  {
    id: "central",
    name: "Central",
    state: "green",
    points: "15,15 55,12 58,45 52,68 25,65 12,45 15,15",
  },
  {
    id: "alto-parana",
    name: "Alto Paraná",
    state: "green",
    points: "60,10 95,8 95,42 72,38 60,25 60,10",
  },
  {
    id: "itapua",
    name: "Itapúa",
    state: "yellow",
    points: "78,48 98,45 98,72 82,72 78,48",
  },
  {
    id: "boqueron",
    name: "Boquerón",
    state: "red",
    points: "8,70 35,68 38,92 10,95 8,70",
  },
  {
    id: "paraguari",
    name: "Paraguarí",
    state: "yellow",
    points: "38,72 65,70 68,92 42,92 38,72",
  },
];
