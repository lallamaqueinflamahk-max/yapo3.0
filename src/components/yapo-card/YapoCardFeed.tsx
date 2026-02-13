"use client";

import type { YapoPerfil } from "@/types/yapo-perfil";
import YapoCard from "./YapoCard";

interface YapoCardFeedProps {
  perfiles: YapoPerfil[];
  onContratar?: (perfilId: string) => void;
  /** Si true, muestra en horizontal scroll tipo feed; si false, grid/lista */
  scrollHorizontal?: boolean;
}

export default function YapoCardFeed({
  perfiles,
  onContratar,
  scrollHorizontal = true,
}: YapoCardFeedProps) {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'yapo-card/YapoCardFeed.tsx:render',message:'YapoCardFeed render',data:{perfilesLength:perfiles?.length??-1,scrollHorizontal},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  if (scrollHorizontal) {
    return (
      <div
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
        role="list"
        aria-label="Feed de profesionales YAPÓ"
      >
        {perfiles.map((p) => (
          <div
            key={p.perfil_id}
            className="w-[min(320px,85vw)] shrink-0 snap-start"
            role="listitem"
          >
            <YapoCard perfil={p} onContratar={onContratar} compact />
          </div>
        ))}
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Listado de profesionales YAPÓ">
      {perfiles.map((p) => (
        <li key={p.perfil_id}>
          <YapoCard perfil={p} onContratar={onContratar} />
        </li>
      ))}
    </ul>
  );
}
