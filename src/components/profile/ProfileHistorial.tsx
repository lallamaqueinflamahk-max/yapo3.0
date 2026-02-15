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
    <section className="rounded-2xl border border-yapo-blue-soft/25 bg-gradient-to-b from-yapo-white to-yapo-blue-light/30 p-4" aria-label="Historial">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-yapo-petroleo">
        Historial reciente
      </h2>
      {entries.length === 0 ? (
        <p className="rounded-xl bg-yapo-blue-light/30 px-4 py-3 text-sm text-gris-texto">Aún no hay historial. Tus trabajos y transacciones aparecerán acá.</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((e, i) => (
            <li key={e.id} className={`flex flex-col gap-0.5 rounded-xl px-3 py-2 ${i % 2 === 0 ? "bg-yapo-blue-light/30" : "bg-yapo-white/90"}`}>
              <span className="font-semibold text-yapo-petroleo">{e.title}</span>
              <span className="text-xs text-yapo-blue">{e.date}{e.detail ? ` · ${e.detail}` : ""}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
