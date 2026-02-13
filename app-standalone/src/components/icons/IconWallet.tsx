/** Icono personalizado YAPÓ: Billetera (sobre con franja) */
export default function IconWallet({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 9h20" />
      <path d="M16 13h.01" />
    </svg>
  );
}
