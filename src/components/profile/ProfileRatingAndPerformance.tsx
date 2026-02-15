"use client";

interface ProfileRatingAndPerformanceProps {
  rating: number;
  profession: string;
  performance: string;
}

export default function ProfileRatingAndPerformance({
  rating,
  profession,
  performance,
}: ProfileRatingAndPerformanceProps) {
  const fullStars = Math.min(5, Math.floor(rating));
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <section className="rounded-2xl border border-yapo-amber/20 bg-gradient-to-br from-yapo-white to-yapo-amber/10 p-4" aria-label="Calificación y desempeño">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-yapo-petroleo">
        Calificación y desempeño
      </h2>
      <div className="flex flex-wrap items-center gap-6">
        <div className="rounded-xl bg-yapo-amber/15 px-4 py-2">
          <p className="text-xs font-medium text-yapo-amber-dark">Calificación</p>
          <div className="mt-1 flex items-center gap-1" role="img" aria-label={`${rating} de 5 estrellas`}>
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={`text-lg ${i <= fullStars ? "text-yapo-amber" : hasHalf && i === fullStars + 1 ? "text-yapo-amber/70" : "text-gris-ui-border"}`}
              >
                ★
              </span>
            ))}
            <span className="ml-2 text-sm font-bold text-yapo-petroleo">{rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="rounded-xl bg-yapo-blue/10 px-4 py-2">
          <p className="text-xs font-medium text-yapo-blue">Profesión</p>
          <p className="mt-0.5 font-semibold text-yapo-petroleo">{profession}</p>
        </div>
        <div className="rounded-xl bg-yapo-validacion/10 px-4 py-2">
          <p className="text-xs font-medium text-yapo-validacion-dark">Desempeño</p>
          <p className="mt-0.5 font-semibold text-yapo-petroleo">{performance}</p>
        </div>
      </div>
    </section>
  );
}
