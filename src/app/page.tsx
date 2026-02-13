import { redirect } from "next/navigation";

/** Redirige a la pantalla principal. Evita landing técnica "YAPÓ LOCAL OK" y guía al usuario (auditoría UX). */
export default function RootPage() {
  redirect("/home");
}
