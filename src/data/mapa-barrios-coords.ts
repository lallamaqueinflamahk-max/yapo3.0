/**
 * Coordenadas reales (lat, lng) por barrio para el mapa Leaflet.
 * Paraguay: aproximadas por ciudad/barrio para OpenStreetMap.
 */

export interface BarrioCoords {
  lat: number;
  lng: number;
  name: string;
  state: "green" | "yellow" | "red";
}

/** Centro por defecto del mapa: Asunción. */
export const MAP_CENTER_PARAGUAY: [number, number] = [-25.282, -57.635];

/** Zoom por defecto para ver área Central. */
export const MAP_ZOOM_DEFAULT = 11;

/** Barrio id → coordenadas reales (lat, lng). */
export const BARRIO_COORDS: Record<string, BarrioCoords> = {
  "asuncion-botanic": { lat: -25.268, lng: -57.595, name: "Botánico", state: "green" },
  "asuncion-sajonia": { lat: -25.292, lng: -57.595, name: "Sajonia", state: "green" },
  "asuncion-loma-pyta": { lat: -25.278, lng: -57.61, name: "Loma Pytã", state: "yellow" },
  "asuncion-villa-morra": { lat: -25.298, lng: -57.58, name: "Villa Morra", state: "green" },
  "asuncion-carmelitas": { lat: -25.288, lng: -57.62, name: "Carmelitas", state: "green" },
  "asuncion-san-pablo": { lat: -25.275, lng: -57.628, name: "San Pablo", state: "green" },
  "asuncion-recoleta": { lat: -25.272, lng: -57.645, name: "Recoleta", state: "green" },
  "asuncion-centro": { lat: -25.282, lng: -57.635, name: "Centro", state: "green" },
  "lambare-centro": { lat: -25.318, lng: -57.648, name: "Lambaré Centro", state: "green" },
  "lambare-tycua": { lat: -25.322, lng: -57.655, name: "Tycua", state: "green" },
  "lambare-santa-ana": { lat: -25.315, lng: -57.642, name: "Santa Ana", state: "green" },
  "lambare-zona-sur": { lat: -25.328, lng: -57.658, name: "Zona Sur", state: "green" },
  "fdm-centro": { lat: -25.338, lng: -57.588, name: "FDM Centro", state: "yellow" },
  "fdm-santa-rosa": { lat: -25.332, lng: -57.578, name: "Santa Rosa", state: "green" },
  "fdm-san-miguel": { lat: -25.332, lng: -57.578, name: "San Miguel", state: "green" },
  "fdm-villa-del-rosario": { lat: -25.342, lng: -57.598, name: "Villa del Rosario", state: "green" },
  "fdm-zona-norte": { lat: -25.328, lng: -57.572, name: "Zona Norte", state: "yellow" },
  "luque-centro": { lat: -25.27, lng: -57.52, name: "Luque Centro", state: "green" },
  "luque-viñas-cue": { lat: -25.265, lng: -57.51, name: "Viñas Cué", state: "green" },
  "luque-santani": { lat: -25.278, lng: -57.528, name: "Santani", state: "green" },
  "sanlorenzo-centro": { lat: -25.34, lng: -57.52, name: "San Lorenzo", state: "green" },
  "sanlorenzo-ñemby": { lat: -25.395, lng: -57.545, name: "Ñemby", state: "green" },
  "cde-centro": { lat: -25.516, lng: -54.615, name: "CDE Centro", state: "green" },
  "cde-monday": { lat: -25.51, lng: -54.605, name: "Monday", state: "green" },
  "minga-centro": { lat: -25.465, lng: -54.755, name: "Minga Guazú", state: "green" },
  "enc-centro": { lat: -27.347, lng: -55.873, name: "Encarnación Centro", state: "yellow" },
  "enc-san-isidro": { lat: -27.355, lng: -55.868, name: "San Isidro", state: "green" },
  "camb-centro": { lat: -27.228, lng: -55.782, name: "Cambyretá", state: "yellow" },
  "paraguari-centro": { lat: -25.62, lng: -57.152, name: "Paraguarí", state: "yellow" },
  "fil-centro": { lat: -22.341, lng: -60.031, name: "Filadelfia", state: "red" },
};

/** Lista de puntos para el mapa (todos los barrios con coordenadas). */
export function getPuntosMapaReal(): BarrioCoords & { id: string }[] {
  return Object.entries(BARRIO_COORDS).map(([id, c]) => ({ id, ...c }));
}
