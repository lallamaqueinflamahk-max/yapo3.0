"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className="border-t border-yapo-blue/20 bg-yapo-white py-4 text-center text-sm text-yapo-blue/80"
      role="contentinfo"
    >
      <Link href="/home" className="inline-flex items-center justify-center gap-2 font-semibold text-yapo-blue active:opacity-80">
        <Image src="/images/icon.png" alt="" width={24} height={24} className="h-6 w-6 object-contain" />
        YAPÓ 3.0
      </Link>
      <span className="mx-1">·</span>
      <span>Identidad, reputación y confianza</span>
      <nav className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1" aria-label="Legal">
        <Link href="/legal/privacy" className="underline hover:no-underline">Privacidad</Link>
        <Link href="/legal/terms" className="underline hover:no-underline">Términos</Link>
        <Link href="/legal/consent" className="underline hover:no-underline">Consentimiento</Link>
      </nav>
    </footer>
  );
}
