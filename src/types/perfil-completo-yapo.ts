/**
 * Perfil completo del profesional para vista pública (datos ficticios / censo).
 * Incluye identidad, conectividad, perfil laboral, estudios, preclasificación, etc.
 */

export interface IdentidadPerfil {
  nombreCompleto: string;
  cedulaOcr: string;
  biometriaFacialHuella: "Verificado" | "Pendiente" | "No verificado";
}

export interface ConectividadPerfil {
  whatsappOtp: string | null;
  email: string | null;
  facebook: string | null;
  instagram: string | null;
}

export interface PerfilLaboralExtendido {
  oficioPrincipal: string;
  oficioSecundario: string | null;
  anosExperiencia: number;
  ubicacionGpsResidencia: string;
  certificadoVidaResidencia: "Sí" | "Pendiente" | "No";
}

export type NivelEstudiosTipo = "SNPP" | "SINAFOCAL" | "Otro título" | "Empírico";

export interface NivelEstudiosPerfil {
  tipo: NivelEstudiosTipo;
  fotoTituloUrl: string | null;
}

export type SituacionLaboral = "desempleado" | "contratado" | "trabajador_independiente";

export type GrupoPreclasificacion = "A" | "B" | "C";

export interface PerfilCompletoYapo {
  userId: string;
  identidad: IdentidadPerfil;
  conectividad: ConectividadPerfil;
  perfilLaboral: PerfilLaboralExtendido;
  nivelEstudios: NivelEstudiosPerfil;
  seguroPrevisionSocial: boolean;
  situacionLaboral: SituacionLaboral;
  respaldoConfianza: string[];
  promotorYapo: string;
  gestorZona: string;
  cedulaOperadorYapo: string;
  grupoPreclasificacion: GrupoPreclasificacion;
}
