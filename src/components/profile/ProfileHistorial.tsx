"use client";

interface HistorialEntry {
  id: string;
  type: string;
  title: string;
  date: string;
  detail?: string;
}

interface ProfileHistorialProps {
  entries: HistorialEntry[];
}

export default function ProfileHistorial({ entries }: ProfileHistorialProps) {
  return (
    <section className="rounded-2xl border border-yapo-blue/15 bg-yapo-white p-4" aria-label="Historial">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">
        Historial reciente
      </h2>
      {entries.length === 0 ? (
        <p className="text-sm text-foreground/70">Aún no hay historial. Tus trabajos y transacciones aparecerán acá.</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((e) => (
            <li key={e.id} className="flex flex-col gap-0.5 border-b border-yapo-blue/10 pb-2 last:border-0 last:pb-0">
              <span className="font-medium text-yapo-blue">{e.title}</span>
              <span className="text-xs text-foreground/60">{e.date}{e.detail ? ` · ${e.detail}` : ""}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
