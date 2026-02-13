"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type { RoleId } from "@/lib/auth";

const STORAGE_KEY_SAVED = "yapo-reels-saved";

export interface ReelItem {
  id: string;
  title: string;
  subtitle?: string;
  href?: string;
  tag?: string;
  /** Imagen de la tarjeta (path o URL). Primeras 2 con priority. */
  image?: string;
  /** Distancia en km (se muestra en esquina con fondo semi-transparente). */
  distanceKm?: number;
}

interface YapoReelsProps {
  role: RoleId | null;
  city?: string | null;
  onLike?: (item: ReelItem) => void;
  onDislike?: (item: ReelItem) => void;
}

/** Genera reels mock por rol (Layout Maestro: tarjetas verticales, imagen, distancia KM). */
function getReelsForRole(role: RoleId | null, city: string): ReelItem[] {
  const zone = city || "tu zona";
  const defaultImg = "/images/icon.png";
  switch (role) {
    case "vale":
    case "capeto":
    case "kavaju":
      return [
        { id: "r1", title: `Top 3 empleos en ${zone}`, subtitle: "Ofertas actualizadas hoy", href: "/trabajo", tag: "Empleo", image: defaultImg, distanceKm: 2 },
        { id: "r2", title: "Habilidades en demanda", subtitle: "Cursos según tu perfil", href: "/profile/curriculum", tag: "Habilidad", image: defaultImg, distanceKm: 5 },
        { id: "r3", title: "Empresas que te buscan", subtitle: "Vacantes abiertas", href: "/mapa", tag: "Empresas", image: defaultImg, distanceKm: 8 },
      ];
    case "mbarete":
      return [
        { id: "m1", title: "Tu equipo y ganancias", subtitle: "Resumen del mes", href: "/dashboard", tag: "Panel", image: defaultImg },
        { id: "m2", title: "Reclutar en tu zona", subtitle: "Oferta o talento", href: "/trabajo", tag: "Reclutamiento", image: defaultImg, distanceKm: 1 },
      ];
    case "cliente":
      return [
        { id: "c1", title: "Profesionales mejor calificados", subtitle: "Para tu proyecto", href: "/mapa", tag: "Talentos", image: defaultImg, distanceKm: 3 },
        { id: "c2", title: "Historias de éxito", subtitle: "Talento perfecto", href: "/comunidad", tag: "Casos", image: defaultImg },
        { id: "c3", title: `Nuevos talentos en ${zone}`, subtitle: "Recién registrados", href: "/mapa", tag: "Nuevos", image: defaultImg, distanceKm: 4 },
      ];
    case "pyme":
    case "enterprise":
      return [
        { id: "p1", title: "5 candidatos recientes", subtitle: "Para tu vacante", href: "/dashboard", tag: "Candidatos", image: defaultImg },
        { id: "p2", title: "Tendencias salariales", subtitle: "Tu sector", href: "/dashboard", tag: "Tendencias", image: defaultImg },
        { id: "p3", title: "Gestión de talento", subtitle: "Mejora tu equipo", href: "/cerebro", tag: "Consejos", image: defaultImg },
      ];
    default:
      return [
        { id: "d1", title: "Descubrí ofertas y talentos", subtitle: "Mapa o Buscador YAPÓ", href: "/mapa", tag: "Explorar", image: defaultImg, distanceKm: 0 },
      ];
  }
}

const CARD_WIDTH = 200;
const CARD_IMAGE_HEIGHT = 120;
const BUTTON_SIZE = 44;

export default function YapoReels({ role, city, onLike, onDislike }: YapoReelsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SAVED);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        return new Set(Array.isArray(arr) ? arr : []);
      }
    } catch {
      // ignore
    }
    return new Set();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify([...saved]));
    } catch {
      // ignore
    }
  }, [saved]);

  const zone = city ?? "tu zona";
  const reels = getReelsForRole(role, zone).filter((r) => !dismissed.has(r.id));

  const handleLike = useCallback(
    (item: ReelItem) => {
      setSaved((s) => new Set(s).add(item.id));
      onLike?.(item);
    },
    [onLike]
  );

  const handleDislike = useCallback(
    (item: ReelItem) => {
      setDismissed((d) => new Set(d).add(item.id));
      onDislike?.(item);
    },
    [onDislike]
  );

  if (reels.length === 0) return null;

  return (
    <section
      className="w-full overflow-x-auto overflow-y-hidden pb-2 scrollbar-hide"
      aria-label="YAPÓ Reels - Descubrimiento"
    >
      <div className="flex gap-3 px-1">
        {reels.map((item, index) => (
          <article
            key={item.id}
            className="relative flex w-[200px] flex-shrink-0 flex-col overflow-hidden rounded-xl border-2 border-yapo-blue/20 bg-yapo-white shadow-md transition-[transform,box-shadow] duration-75 active:scale-[0.98]"
          >
            {/* Imagen superior (tarjeta vertical) — priority en las 2 primeras */}
            <div className="relative h-[120px] w-full bg-yapo-blue-light/20">
              {item.image ? (
                <Image
                  src={item.image}
                  alt=""
                  width={CARD_WIDTH}
                  height={CARD_IMAGE_HEIGHT}
                  className="object-cover"
                  priority={index < 2}
                  sizes="200px"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-yapo-blue/20 to-yapo-blue-light/30" />
              )}
              {/* Distancia en km — esquina con fondo semi-transparente */}
              {item.distanceKm != null && (
                <span
                  className="absolute right-2 top-2 rounded-md bg-black/50 px-2 py-0.5 text-xs font-bold text-white backdrop-blur-sm"
                  aria-label={`A ${item.distanceKm} km`}
                >
                  {item.distanceKm} km
                </span>
              )}
            </div>
            <div className="relative flex flex-1 flex-col p-3 pr-12">
              {item.tag && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-yapo-blue/70">{item.tag}</span>
              )}
              <p className="mt-0.5 font-semibold text-yapo-blue line-clamp-2">{item.title}</p>
              {item.subtitle && <p className="mt-0.5 text-xs text-yapo-blue/80 line-clamp-1">{item.subtitle}</p>}
              {item.href && (
                <a
                  href={item.href}
                  className="mt-2 inline-block text-xs font-medium text-yapo-blue underline underline-offset-2"
                >
                  Ver más
                </a>
              )}
            </div>
            {/* Guardar (historial Cerebro sin recargar) y Descartar — feedback <100ms */}
            <div className="absolute right-1 top-1/2 flex -translate-y-1/2 flex-col gap-1">
              <button
                type="button"
                onClick={() => handleLike(item)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-yapo-blue-light/50 text-yapo-blue transition-[transform,opacity] duration-75 hover:bg-yapo-blue-light active:scale-95"
                style={{ minHeight: BUTTON_SIZE, minWidth: BUTTON_SIZE }}
                aria-label="Guardar"
                title="Guardar"
              >
                <span
                  className={`text-lg ${saved.has(item.id) ? "text-yapo-red" : "text-yapo-blue/80"}`}
                  aria-hidden
                >
                  {saved.has(item.id) ? "❤️" : "🤍"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleDislike(item)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-yapo-blue/10 text-yapo-blue/70 transition-[transform,opacity] duration-75 hover:bg-yapo-blue/20 active:scale-95"
                style={{ minHeight: BUTTON_SIZE, minWidth: BUTTON_SIZE }}
                aria-label="Descartar"
                title="Descartar"
              >
                <span className="text-lg" aria-hidden>
                  ✕
                </span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
