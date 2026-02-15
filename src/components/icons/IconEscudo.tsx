/** Icono YAPÓ: Escudo. Imagen unificada como CTA en toda la app. */
const ESCUDO_ICON = "/images/icon-escudo.png";

export default function IconEscudo({ className }: { className?: string }) {
  return (
    <span className={`inline-block shrink-0 ${className ?? "h-6 w-6"}`} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={ESCUDO_ICON} alt="" className="h-full w-full object-contain" />
    </span>
  );
}
