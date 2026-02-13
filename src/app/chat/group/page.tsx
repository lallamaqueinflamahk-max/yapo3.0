"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Chat grupal eliminado: solo WhatsApp.
 * Redirige a /chat (pantalla WhatsApp).
 */
export default function GroupChatPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/chat");
  }, [router]);
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-foreground/70">
      Redirigiendo a mensajes…
    </div>
  );
}
