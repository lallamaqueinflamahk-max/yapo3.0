"use client";

import { CerebroBar } from "@/components/cerebro";

export default function CerebroPageClient({
  initialQuery,
}: {
  initialQuery?: string | null;
}) {
  return <CerebroBar initialQuery={initialQuery} />;
}
