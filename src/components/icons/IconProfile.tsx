/** Icono YAPÓ: Perfil (silueta usuario). Imagen unificada como los demás CTA del navbar. */
const PERFIL_ICON = "/images/icon-perfil.png";

export default function IconProfile({ className }: { className?: string }) {
  return (
    <span className={`inline-block shrink-0 ${className ?? "h-6 w-6"}`} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={PERFIL_ICON}
        alt=""
        className="h-full w-full object-contain"
      />
    </span>
  );
}
