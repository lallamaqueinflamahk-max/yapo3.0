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
    <section className="rounded-2xl border border-yapo-blue/15 bg-yapo-white p-4" aria-label="Calificación y desempeño">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">
        Calificación y desempeño
      </h2>
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <p className="text-xs text-foreground/60">Calificación como profesional</p>
          <div className="mt-1 flex items-center gap-1" role="img" aria-label={`${rating} de 5 estrellas`}>
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={i <= fullStars ? "text-yapo-amber" : hasHalf && i === fullStars + 1 ? "text-yapo-amber/70" : "text-yapo-blue/20"}
              >
                ★
              </span>
            ))}
            <span className="ml-1 text-sm font-medium text-yapo-blue">{rating.toFixed(1)}</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-foreground/60">Profesión</p>
          <p className="mt-0.5 font-medium text-yapo-blue">{profession}</p>
        </div>
        <div>
          <p className="text-xs text-foreground/60">Desempeño</p>
          <p className="mt-0.5 font-medium text-yapo-blue">{performance}</p>
        </div>
      </div>
    </section>
  );
}
