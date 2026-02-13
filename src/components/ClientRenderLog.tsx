"use client";

import { useEffect } from "react";

/** Log cuando el cliente hidrata (primer componente cliente en el árbol). */
export function ClientRenderLog() {
  useEffect(() => {
    fetch("http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "ClientRenderLog.tsx",
        message: "client hydrated",
        data: {},
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "H1",
      }),
    }).catch(() => {});
  }, []);
  return null;
}
