"use client";

export default function Footer() {
  const handleLink = (label: string) => {
    console.log(`[Footer] ${label}`);
  };

  return (
    <footer
      className="border-t border-yapo-blue/20 bg-yapo-white py-3 text-center text-sm text-yapo-blue/80"
      role="contentinfo"
    >
      <button
        type="button"
        onClick={() => handleLink("YAPÓ 3.0")}
        className="active:opacity-80"
      >
        YAPÓ 3.0
      </button>
      <span className="mx-1">·</span>
      <span>Identidad, reputación y confianza</span>
    </footer>
  );
}
