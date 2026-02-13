"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import { getProfessionalById } from "@/data/top-professionals-mock";
import { CATEGORY_AREA_LABELS, type CategoryArea } from "@/data/top-professionals-mock";

const CATEGORY_ICONS: Record<CategoryArea, string> = {
  oficios: "🛠️",
  movilidad: "🚗",
  cuidados: "❤️",
  profesional: "💼",
};

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <span className="inline-flex items-center gap-0.5 text-yapo-amber-dark text-2xl" aria-label={`${rating} de 5 estrellas`}>
      {Array.from({ length: full }, (_, i) => <span key={`f-${i}`} aria-hidden>★</span>)}
      {half ? <span className="text-yapo-amber-dark/70" aria-hidden>★</span> : null}
      {Array.from({ length: empty }, (_, i) => <span key={`e-${i}`} className="text-yapo-amber-dark/30" aria-hidden>★</span>)}
    </span>
  );
}

export default function ProfesionalPage({ params }: { params: Promise<{ id: string }> }) {
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const [contactSent, setContactSent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    params.then((p) => {
      if (!cancelled) setResolvedId(p.id ?? null);
    });
    return () => { cancelled = true; };
  }, [params]);

  const pro = resolvedId ? getProfessionalById(resolvedId) : null;

  if (resolvedId !== null && !pro) {
    return (
      <main className="flex min-h-screen flex-col bg-yapo-blue-light/30 p-4 pb-24 pt-6">
        <Link href="/home" className="text-yapo-blue underline">← Volver al inicio</Link>
        <p className="mt-6 rounded-xl border border-yapo-amber/30 bg-yapo-amber/10 p-4 text-yapo-amber-dark">
          Profesional no encontrado.
        </p>
      </main>
    );
  }

  if (!pro) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-yapo-blue-light/30 p-4">
        <p className="text-foreground/70">Cargando...</p>
      </main>
    );
  }

  const categoryLabel = CATEGORY_AREA_LABELS[pro.category];
  const icon = CATEGORY_ICONS[pro.category];
  const chatHref = `/chat?to=${encodeURIComponent(pro.id)}`;

  const handleContactar = () => {
    setContactSent(true);
    setTimeout(() => router.push(chatHref), 1500);
  };

  return (
    <main className="flex min-h-screen flex-col bg-yapo-blue-light/30 px-4 pb-24 pt-6">
      {contactSent && (
        <div
          role="status"
          className="fixed bottom-24 left-4 right-4 z-50 rounded-xl bg-yapo-emerald px-4 py-3 text-center font-medium text-white shadow-lg"
          aria-live="polite"
        >
          Mensaje enviado ✓ Te respondemos pronto
        </div>
      )}
      <div className="mb-4">
        <Link href="/home#profesionales" className="text-yapo-blue underline">← Volver a profesionales</Link>
      </div>
      <section className="rounded-2xl border-2 border-yapo-blue/15 bg-yapo-white p-6 shadow-lg">
        <div className="flex flex-col items-center gap-4 text-center">
          <Avatar name={pro.name} size="lg" className="h-20 w-20 border-4 border-yapo-blue/20" />
          <div>
            <h1 className="text-xl font-bold text-yapo-blue">{pro.name}</h1>
            <p className="mt-1 flex items-center justify-center gap-2 text-yapo-blue/90">
              <span aria-hidden>{icon}</span>
              {pro.role} · {categoryLabel}
            </p>
          </div>
          {pro.rating != null && (
            <div className="flex flex-col items-center gap-1">
              <Stars rating={pro.rating} />
              <span className="text-sm text-yapo-blue/80">{pro.rating} / 5</span>
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-3 text-sm text-yapo-blue/70">
            {pro.distanceKm != null && <span>A {pro.distanceKm} km</span>}
            {pro.jobsCount != null && <span>{pro.jobsCount} trabajos realizados</span>}
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleContactar}
            className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-yapo-red px-4 py-3 text-base font-bold text-white shadow-md transition-[transform,opacity] duration-75 active:scale-[0.98]"
          >
            Escribir mensaje
          </button>
          <Link
            href="/mapa"
            className="flex min-h-[44px] items-center justify-center rounded-xl border-2 border-yapo-blue/30 text-yapo-blue font-semibold transition-[opacity] duration-75 active:opacity-90"
          >
            Ver en el mapa
          </Link>
        </div>
      </section>
    </main>
  );
}
