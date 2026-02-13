/**
 * Mock de perfiles YAPÓ para UI (tarjetas y feed).
 * En producción vendría de API / búsqueda por zonificación.
 */

import type { YapoPerfil } from "@/types/yapo-perfil";

export const YAPO_PERFILES_MOCK: YapoPerfil[] = [
  {
    perfil_id: "PY-102938",
    biometria: "Verificado_FaceID",
    tipificacion: "Kavaju",
    especialidad: "Plomería y Destranque",
    nombre: "Carlos R.",
    avatar_url: null,
    ubicacion: {
      departamento: "Central",
      ciudad: "Fernando de la Mora",
      barrio: "Pitiantuta",
    },
    estatus_laboral: {
      ips: false,
      seguro_privado: "Yapo_Insurtech_Basico",
      disponibilidad: "Inmediata",
    },
    reputacion: {
      estrellas: 4.8,
      resenas_video: 12,
      proyectos_exitosos: 145,
    },
    mbarete_referido: "Juan_Perez_Lider",
    intereses_yapo: ["Capacitación Electricidad", "Crédito Rueda Solidaria"],
    story_trabajos: [
      { url: "/images/icon.png", tipo: "foto", titulo: "Destranque cañería" },
      { url: "/images/logo.png", tipo: "foto", titulo: "Cambio llave" },
      { url: "/images/icon.png", tipo: "video", titulo: "Instalación baño" },
    ],
    insignias: ["insurtech", "referido_mbareté"],
  },
  {
    perfil_id: "PY-204851",
    biometria: "Verificado_FaceID",
    tipificacion: "Mbareté",
    especialidad: "Electricidad industrial y domiciliaria",
    nombre: "María González",
    avatar_url: null,
    ubicacion: {
      departamento: "Central",
      ciudad: "Asunción",
      barrio: "Sajonia",
    },
    estatus_laboral: {
      ips: true,
      seguro_privado: "Yapo_Insurtech_Premium",
      disponibilidad: "En la semana",
    },
    reputacion: {
      estrellas: 4.9,
      resenas_video: 28,
      proyectos_exitosos: 312,
    },
    insignias: ["insurtech", "sello_mec_snpp", "referido_mbareté"],
  },
  {
    perfil_id: "PY-301662",
    biometria: "Verificado_FaceID",
    tipificacion: "Profesional",
    especialidad: "Enfermería domiciliaria",
    nombre: "Ana Martínez",
    avatar_url: null,
    ubicacion: {
      departamento: "Central",
      ciudad: "Lambaré",
      barrio: "Santa Ana",
    },
    estatus_laboral: {
      ips: true,
      seguro_privado: null,
      disponibilidad: "Agendar",
    },
    reputacion: {
      estrellas: 5,
      resenas_video: 45,
      proyectos_exitosos: 189,
    },
    insignias: ["sello_mec_snpp"],
  },
  {
    perfil_id: "PY-405123",
    biometria: "Pendiente",
    tipificacion: "Kavaju",
    especialidad: "Limpieza y orden",
    nombre: "Rosa B.",
    avatar_url: null,
    ubicacion: {
      departamento: "Central",
      ciudad: "Asunción",
      barrio: "Sajonia",
    },
    estatus_laboral: {
      ips: false,
      seguro_privado: "Yapo_Insurtech_Basico",
      disponibilidad: "Inmediata",
    },
    reputacion: {
      estrellas: 4.6,
      resenas_video: 5,
      proyectos_exitosos: 67,
    },
    insignias: ["insurtech"],
  },
];
