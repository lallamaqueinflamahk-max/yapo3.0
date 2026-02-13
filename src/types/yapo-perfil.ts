/**
 * Estructura de datos del perfil YAPÓ (YAPÓ-METRIX).
 * Alimenta búsqueda, tarjetas y métricas.
 */

export type TipificacionYapo = "Mbareté" | "Profesional" | "Kavaju";

export interface UbicacionPerfil {
  departamento: string;
  ciudad: string;
  barrio: string;
}

export interface EstatusLaboral {
  ips: boolean;
  seguro_privado: string | null;
  disponibilidad: "Inmediata" | "En la semana" | "Agendar" | string;
}

export interface ReputacionPerfil {
  estrellas: number;
  resenas_video: number;
  proyectos_exitosos: number;
}

export interface YapoPerfil {
  perfil_id: string;
  user_id?: string;
  nombre?: string;
  avatar_url?: string | null;
  biometria: "Verificado_FaceID" | "Pendiente" | "No_verificado";
  tipificacion: TipificacionYapo;
  especialidad: string;
  ubicacion: UbicacionPerfil;
  estatus_laboral: EstatusLaboral;
  reputacion: ReputacionPerfil;
  mbarete_referido?: string | null;
  intereses_yapo?: string[];
  /** URLs de fotos/videos de últimos trabajos (Story tipo Instagram) */
  story_trabajos?: { url: string; tipo: "foto" | "video"; titulo?: string }[];
  /** Insignias: insurtech, sello_mec_snpp, referido_mbareté */
  insignias?: ("insurtech" | "sello_mec_snpp" | "referido_mbareté")[];
}

export type YapoCardVariant = "mbarete" | "profesional" | "kavaju";

export function tipificacionToVariant(tipificacion: TipificacionYapo): YapoCardVariant {
  switch (tipificacion) {
    case "Mbareté":
      return "mbarete";
    case "Profesional":
      return "profesional";
    case "Kavaju":
    default:
      return "kavaju";
  }
}
