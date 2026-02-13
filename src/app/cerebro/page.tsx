"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CerebroBar } from "@/components/cerebro";

function CerebroContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim() ?? undefined;
  return (
    <main className="flex min-h-screen flex-col bg-yapo-white">
      <CerebroBar initialQuery={q} />
    </main>
  );
}

export default function CerebroPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen flex-col bg-yapo-white items-center justify-center text-foreground/70">Cargando…</main>}>
      <CerebroContent />
    </Suspense>
  );
}
