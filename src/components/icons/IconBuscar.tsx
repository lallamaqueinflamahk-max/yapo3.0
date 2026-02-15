/** Icono YAPÓ: Buscar (lupa). Imagen unificada como CTA en toda la app. */
const BUSCAR_ICON = "/images/icon-buscar.png";

export default function IconBuscar({ className }: { className?: string }) {
  return (
    <span className={`inline-block shrink-0 ${className ?? "h-6 w-6"}`} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={BUSCAR_ICON} alt="" className="h-full w-full object-contain" />
    </span>
  );
}
