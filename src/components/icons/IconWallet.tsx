/** Icono YAPÓ: Billetera (imagen unificada en toda la app) */
const BILLETERA_ICON = "/images/icon-billetera.png";

export default function IconWallet({ className }: { className?: string }) {
  return (
    <span className={`inline-block shrink-0 ${className ?? "h-6 w-6"}`} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={BILLETERA_ICON}
        alt=""
        className="h-full w-full object-contain"
      />
    </span>
  );
}
