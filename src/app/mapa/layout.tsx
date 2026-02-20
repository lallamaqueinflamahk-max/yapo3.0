import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function MapaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-yapo-blue-light/30 text-yapo-blue">
          Cargando mapa…
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
