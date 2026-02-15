/** Icono YAPÓ: Inicio (casa). Imagen unificada en toda la app, igual que Billetera y Buscar. */
const INICIO_ICON = "/images/icon-inicio.png";

export default function IconHome({ className }: { className?: string }) {
  return (
    <span className={`inline-block shrink-0 ${className ?? "h-6 w-6"}`} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={INICIO_ICON}
        alt=""
        className="h-full w-full object-contain"
      />
    </span>
  );
}
