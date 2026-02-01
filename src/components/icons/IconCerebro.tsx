/** Icono personalizado YAPÓ: Cerebro (forma de nube/mente) */
export default function IconCerebro({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 4a4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4z" />
      <path d="M12 12c-2 0-3 1.5-3 4v2h6v-2c0-2.5-1-4-3-4z" />
      <path d="M8 16h2M14 16h2M10 18v2M14 18v2" />
      <path d="M9 10h.01M15 10h.01" />
    </svg>
  );
}
