/**
 * Semáforos por zona: departamentos, ciudades y barrios (Paraguay).
 * Estructura jerárquica para el mapa de semáforos en el dashboard.
 */

export type SemaphoreState = "green" | "yellow" | "red";

export interface SemaphoreBarrio {
  id: string;
  name: string;
  state: SemaphoreState;
}

export interface SemaphoreCiudad {
  id: string;
  name: string;
  state: SemaphoreState;
  barrios: SemaphoreBarrio[];
}

export interface SemaphoreDepartamento {
  id: string;
  name: string;
  state: SemaphoreState;
  ciudades: SemaphoreCiudad[];
}

/** Mapa de semáforos: departamentos con ciudades y barrios. */
export const SEMAPHORES_MAP: SemaphoreDepartamento[] = [
  {
    id: "central",
    name: "Central",
    state: "green",
    ciudades: [
      {
        id: "central-asuncion",
        name: "Asunción",
        state: "green",
        barrios: [
          { id: "asuncion-botanic", name: "Botánico", state: "green" },
          { id: "asuncion-sajonia", name: "Sajonia", state: "green" },
          { id: "asuncion-loma-pyta", name: "Loma Pytã", state: "yellow" },
          { id: "asuncion-villa-morra", name: "Villa Morra", state: "green" },
          { id: "asuncion-carmelitas", name: "Carmelitas", state: "green" },
          { id: "asuncion-san-pablo", name: "San Pablo", state: "green" },
          { id: "asuncion-recoleta", name: "Recoleta", state: "green" },
          { id: "asuncion-centro", name: "Centro", state: "green" },
        ],
      },
      {
        id: "central-lambare",
        name: "Lambaré",
        state: "green",
        barrios: [
          { id: "lambare-centro", name: "Centro", state: "green" },
          { id: "lambare-tycua", name: "Tycua", state: "green" },
          { id: "lambare-santa-ana", name: "Santa Ana", state: "green" },
          { id: "lambare-zona-sur", name: "Zona Sur", state: "green" },
        ],
      },
      {
        id: "central-fernando",
        name: "Fernando de la Mora",
        state: "yellow",
        barrios: [
          { id: "fdm-centro", name: "Centro", state: "yellow" },
          { id: "fdm-santa-rosa", name: "Santa Rosa", state: "green" },
          { id: "fdm-san-miguel", name: "San Miguel", state: "green" },
          { id: "fdm-villa-del-rosario", name: "Villa del Rosario", state: "green" },
          { id: "fdm-zona-norte", name: "Zona Norte", state: "yellow" },
        ],
      },
      {
        id: "central-luque",
        name: "Luque",
        state: "green",
        barrios: [
          { id: "luque-centro", name: "Centro", state: "green" },
          { id: "luque-viñas-cue", name: "Viñas Cué", state: "green" },
          { id: "luque-santani", name: "Santani", state: "green" },
        ],
      },
      {
        id: "central-san-lorenzo",
        name: "San Lorenzo",
        state: "green",
        barrios: [
          { id: "sanlorenzo-centro", name: "Centro", state: "green" },
          { id: "sanlorenzo-ñemby", name: "Ñemby", state: "green" },
        ],
      },
    ],
  },
  {
    id: "alto-parana",
    name: "Alto Paraná",
    state: "green",
    ciudades: [
      {
        id: "ap-cdeleste",
        name: "Ciudad del Este",
        state: "green",
        barrios: [
          { id: "cde-centro", name: "Centro", state: "green" },
          { id: "cde-monday", name: "Monday", state: "green" },
        ],
      },
      {
        id: "ap-minga",
        name: "Minga Guazú",
        state: "green",
        barrios: [
          { id: "minga-centro", name: "Centro", state: "green" },
        ],
      },
    ],
  },
  {
    id: "itapua",
    name: "Itapúa",
    state: "yellow",
    ciudades: [
      {
        id: "it-encarnacion",
        name: "Encarnación",
        state: "yellow",
        barrios: [
          { id: "enc-centro", name: "Centro", state: "yellow" },
          { id: "enc-san-isidro", name: "San Isidro", state: "green" },
        ],
      },
      {
        id: "it-cambyreta",
        name: "Cambyretá",
        state: "yellow",
        barrios: [
          { id: "camb-centro", name: "Centro", state: "yellow" },
        ],
      },
    ],
  },
  {
    id: "boqueron",
    name: "Boquerón",
    state: "red",
    ciudades: [
      {
        id: "boq-filadelfia",
        name: "Filadelfia",
        state: "red",
        barrios: [
          { id: "fil-centro", name: "Centro", state: "red" },
        ],
      },
    ],
  },
  {
    id: "paraguari",
    name: "Paraguarí",
    state: "yellow",
    ciudades: [
      {
        id: "par-paraguari",
        name: "Paraguarí",
        state: "yellow",
        barrios: [
          { id: "paraguari-centro", name: "Centro", state: "yellow" },
        ],
      },
    ],
  },
];

const stateStyles: Record<SemaphoreState, string> = {
  green: "bg-yapo-emerald text-white",
  yellow: "bg-yapo-amber text-yapo-amber-dark",
  red: "bg-yapo-red text-yapo-white",
};

export function getStateStyle(state: SemaphoreState): string {
  return stateStyles[state];
}
