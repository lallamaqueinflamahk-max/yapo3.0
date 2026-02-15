"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const HERO_IMAGE_PRIMARY = "/images/hero-workers.png";
const HERO_IMAGE_ALT = "/hero-albanil-cocinera.jpg";

/**
 * Hero: background (Albañil + Cocinera), overlay petróleo left→right,
 * H1, párrafo, CTAs Buscar trabajo (naranja) + Publicar servicio (secondary), Trust badges.
 * Usa imagen que existe en public; fallback a gradiente si falla.
 */
export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean | null>(null);
  const [imageUrlUsed, setImageUrlUsed] = useState(HERO_IMAGE_PRIMARY);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const header = document.querySelector("header");
    const rect = el.getBoundingClientRect();
    const headerRect = header?.getBoundingClientRect();
    fetch("http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ location: "HeroSection.tsx:layout", message: "Hero layout", data: { heroTop: rect.top, heroHeight: rect.height, headerHeight: headerRect?.height ?? null, mainPaddingTop: document.querySelector("main") ? getComputedStyle(document.querySelector("main")!).paddingTop : null }, timestamp: Date.now(), hypothesisId: "H1" }) }).catch(() => {});
  }, []);

  const handleImageError = () => {
    setImageUrlUsed(HERO_IMAGE_ALT);
    setImageLoaded(false);
    fetch("http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ location: "HeroSection.tsx:image", message: "Hero image load", data: { url: HERO_IMAGE_PRIMARY, success: false, fallbackUsed: true }, timestamp: Date.now(), hypothesisId: "H2", runId: "post-fix" }) }).catch(() => {});
  };
  const handleImageLoad = () => {
    setImageLoaded(true);
    fetch("http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ location: "HeroSection.tsx:image", message: "Hero image load", data: { url: imageUrlUsed, success: true }, timestamp: Date.now(), hypothesisId: "H2", runId: "post-fix" }) }).catch(() => {});
  };

  return (
    <section ref={sectionRef} className="relative min-h-[48vh] overflow-hidden bg-[#0E2A47] sm:min-h-[52vh] md:min-h-[56vh]" aria-label="Bienvenida">
      <img src={imageUrlUsed} alt="" className="absolute h-0 w-0 opacity-0" onError={handleImageError} onLoad={handleImageLoad} />
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url('${imageUrlUsed}')`,
          backgroundPosition: "50% 20%",
          backgroundSize: "cover",
        }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#0E2A47]/55 via-[#0E2A47]/35 to-[#0E2A47]/12"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:py-16 lg:py-24">
        <h1 className="max-w-2xl text-2xl font-bold leading-tight text-white sm:text-3xl md:text-5xl">
          <span className="block">Trabajá o contratá</span>
          <span className="block">con confianza real</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-white/90 sm:text-base">
          Perfiles verificados, pagos protegidos y reputación transparente.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:mt-6 sm:flex-row">
          <Link
            href="/mapa"
            className="btn-interactive inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-yapo-cta px-5 py-3 font-semibold text-white shadow-lg border-2 border-yapo-cta-hover/50"
          >
            Buscar trabajo
          </Link>
          <Link
            href="/mapa?servicios=1"
            className="btn-interactive inline-flex min-h-[48px] items-center justify-center rounded-2xl border-2 border-white bg-white/10 px-5 py-3 font-semibold text-white shadow-md hover:bg-white/20 hover:shadow-lg"
          >
            Publicar servicio
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/90 sm:mt-6 sm:gap-4 sm:text-sm">
          <span>✔ Verificados</span>
          <span>✔ Pago protegido</span>
          <span>✔ Escudos activos</span>
        </div>
      </div>
    </section>
  );
}
