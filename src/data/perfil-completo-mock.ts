/**
 * Mock de perfiles completos (identidad, conectividad, laboral, estudios, preclasificación).
 * Por userId / perfil_id para la vista pública del profesional.
 */

import type { PerfilCompletoYapo } from "@/types/perfil-completo-yapo";

const MOCK_BASE: Omit<PerfilCompletoYapo, "userId">[] = [
  {
    identidad: { nombreCompleto: "Carlos Ramón Rodríguez", cedulaOcr: "4.123.456", biometriaFacialHuella: "Verificado" },
    conectividad: { whatsappOtp: "595981123456", email: "carlos.r@ejemplo.com", facebook: "carlos.plomero", instagram: "carlos_plomeria" },
    perfilLaboral: { oficioPrincipal: "Plomería", oficioSecundario: "Destranque", anosExperiencia: 5, ubicacionGpsResidencia: "-25.338, -57.588 (FdM)", certificadoVidaResidencia: "Sí" },
    nivelEstudios: { tipo: "Empírico", fotoTituloUrl: null },
    seguroPrevisionSocial: false,
    situacionLaboral: "trabajador_independiente",
    respaldoConfianza: ["Juan Pérez (Mbareté)", "Vecino Pitiantuta"],
    promotorYapo: "Miguel Gamarra",
    gestorZona: "Juan Pérez",
    cedulaOperadorYapo: "5.001.002",
    grupoPreclasificacion: "B",
  },
  {
    identidad: { nombreCompleto: "María González López", cedulaOcr: "3.987.654", biometriaFacialHuella: "Verificado" },
    conectividad: { whatsappOtp: "595982654321", email: "maria.gonzalez@ejemplo.com", facebook: "maria.electricista", instagram: null },
    perfilLaboral: { oficioPrincipal: "Electricidad industrial y domiciliaria", oficioSecundario: null, anosExperiencia: 8, ubicacionGpsResidencia: "-25.292, -57.595 (Sajonia, Asunción)", certificadoVidaResidencia: "Sí" },
    nivelEstudios: { tipo: "SNPP", fotoTituloUrl: "/images/cert-snpp-ejemplo.png" },
    seguroPrevisionSocial: true,
    situacionLaboral: "trabajador_independiente",
    respaldoConfianza: ["Líder zona Sajonia"],
    promotorYapo: "Miguel Gamarra",
    gestorZona: "Ana Martínez",
    cedulaOperadorYapo: "5.001.003",
    grupoPreclasificacion: "A",
  },
  {
    identidad: { nombreCompleto: "Ana Martínez Fernández", cedulaOcr: "4.555.111", biometriaFacialHuella: "Verificado" },
    conectividad: { whatsappOtp: "595983111222", email: "ana.m@ejemplo.com", facebook: null, instagram: "ana.enfermeria" },
    perfilLaboral: { oficioPrincipal: "Enfermería domiciliaria", oficioSecundario: "Cuidado de adultos mayores", anosExperiencia: 6, ubicacionGpsResidencia: "-25.315, -57.642 (Santa Ana, Lambaré)", certificadoVidaResidencia: "Sí" },
    nivelEstudios: { tipo: "Otro título", fotoTituloUrl: null },
    seguroPrevisionSocial: true,
    situacionLaboral: "contratado",
    respaldoConfianza: ["Hospital de Lambaré"],
    promotorYapo: "Miguel Gamarra",
    gestorZona: "Juan Pérez",
    cedulaOperadorYapo: "5.001.004",
    grupoPreclasificacion: "A",
  },
  {
    identidad: { nombreCompleto: "Rosa Benítez", cedulaOcr: "4.222.333", biometriaFacialHuella: "Pendiente" },
    conectividad: { whatsappOtp: "595984333444", email: null, facebook: "rosa.limpieza", instagram: null },
    perfilLaboral: { oficioPrincipal: "Limpieza y orden", oficioSecundario: "Planchado", anosExperiencia: 3, ubicacionGpsResidencia: "-25.292, -57.595 (Sajonia)", certificadoVidaResidencia: "Pendiente" },
    nivelEstudios: { tipo: "Empírico", fotoTituloUrl: null },
    seguroPrevisionSocial: false,
    situacionLaboral: "desempleado",
    respaldoConfianza: [],
    promotorYapo: "Miguel Gamarra",
    gestorZona: "Ana Martínez",
    cedulaOperadorYapo: "5.001.005",
    grupoPreclasificacion: "C",
  },
];

const USER_IDS = ["PY-102938", "PY-204851", "PY-301662", "PY-405123", "prof-1", "prof-2", "prof-3", "prof-4", "prof-5", "prof-6", "prof-7", "prof-8", "prof-9", "prof-10"];

export function getPerfilCompletoByUserId(userId: string): PerfilCompletoYapo | null {
  const idx = USER_IDS.indexOf(userId);
  if (idx < 0 || idx >= MOCK_BASE.length) {
    const fallbackIdx = userId.startsWith("PY-") ? 0 : userId.startsWith("prof-") ? parseInt(userId.replace("prof-", ""), 10) - 1 : -1;
    if (fallbackIdx >= 0 && fallbackIdx < MOCK_BASE.length) {
      return { userId, ...MOCK_BASE[fallbackIdx] };
    }
    return { userId, ...MOCK_BASE[0] };
  }
  return { userId, ...MOCK_BASE[idx % MOCK_BASE.length] };
}
