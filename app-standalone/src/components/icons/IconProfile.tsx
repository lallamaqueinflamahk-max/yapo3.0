/** Icono personalizado YAPÓ: Perfil (cabeza + hombros) */
export default function IconProfile({ className }: { className?: string }) {
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
      <circle cx="12" cy="7" r="3" />
      <path d="M5 20v-1a5 5 0 0110 0v1" />
    </svg>
  );
}
