"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const CITIES = ["Asunción", "Ciudad del Este", "Encarnación", "Luque", "Fernando de la Mora", "Otra"];

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (city) params.set("ciudad", city);
    router.push(`/mapa${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 mt-4" aria-label="Búsqueda">
      <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-3 shadow-lg flex items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar trabajo o servicio…"
          className="min-w-0 flex-1 px-3 py-2 outline-none text-[#4B5563] placeholder:text-[#6B7280]"
          aria-label="Buscar trabajo o servicio"
        />
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="hidden border-0 bg-transparent px-2 py-2 text-sm text-[#4B5563] sm:block"
          aria-label="Ciudad"
        >
          <option value="">Ciudad</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-[#F57C2A] px-4 py-2 text-white hover:bg-[#FF8A3D] active:scale-[0.98]"
          aria-label="Buscar"
        >
          🔍
        </button>
      </form>
    </section>
  );
}
