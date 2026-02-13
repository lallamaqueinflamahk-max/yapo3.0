"use client";

import { useSearchParams } from "next/navigation";
import { CerebroBar } from "@/components/cerebro";

export default function CerebroPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim() ?? undefined;

  return (
    <main className="flex min-h-screen flex-col bg-yapo-white">
      <CerebroBar initialQuery={q} />
    </main>
  );
}
