"use client";

interface VideoControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onLeave: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Botones de videollamada: colgar, mic, cámara.
 * Mobile-first, touch targets 48px+, responsive.
 */
export default function VideoControls({
  isMuted,
  isVideoOff,
  onToggleMute,
  onToggleVideo,
  onLeave,
  disabled = false,
  className = "",
}: VideoControlsProps) {
  return (
    <div
      className={`flex items-center justify-center gap-4 sm:gap-6 ${className}`}
      role="group"
      aria-label="Controles de videollamada"
    >
      {/* Mic */}
      <button
        type="button"
        onClick={onToggleMute}
        disabled={disabled}
        aria-label={isMuted ? "Activar micrófono" : "Silenciar"}
        aria-pressed={isMuted}
        className={`btn-interactive flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-md disabled:opacity-50 sm:h-12 sm:w-12 ${
          isMuted ? "bg-yapo-cta text-white border-2 border-yapo-cta-hover/50" : "bg-white/20 text-white border-2 border-white/30 hover:bg-white/30"
        }`}
      >
        <MicIcon className="h-6 w-6 sm:h-5 sm:w-5" muted={isMuted} />
      </button>

      {/* Colgar (destacado) */}
      <button
        type="button"
        onClick={onLeave}
        disabled={disabled}
        aria-label="Colgar"
        className="btn-interactive flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-yapo-cta text-white shadow-lg border-2 border-yapo-cta-hover/50 hover:bg-yapo-cta-hover disabled:opacity-50 sm:h-14 sm:w-14"
      >
        <HangUpIcon className="h-7 w-7 sm:h-6 sm:w-6" />
      </button>

      {/* Cámara */}
      <button
        type="button"
        onClick={onToggleVideo}
        disabled={disabled}
        aria-label={isVideoOff ? "Encender cámara" : "Apagar cámara"}
        aria-pressed={isVideoOff}
        className={`btn-interactive flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-md disabled:opacity-50 sm:h-12 sm:w-12 ${
          isVideoOff ? "bg-yapo-cta text-white border-2 border-yapo-cta-hover/50" : "bg-white/20 text-white border-2 border-white/30 hover:bg-white/30"
        }`}
      >
        <CameraIcon className="h-6 w-6 sm:h-5 sm:w-5" off={isVideoOff} />
      </button>
    </div>
  );
}

function MicIcon({ className, muted }: { className?: string; muted?: boolean }) {
  if (muted) {
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
        <path d="M12 2a3 3 0 013 3v6a3 3 0 01-6 0V5a3 3 0 013-3z" />
        <path d="M19 10v2a7 7 0 01-14 0v-2" />
        <path d="M12 19v3" />
        <path d="M9 22h6" />
        <path d="M2 2l20 20" />
      </svg>
    );
  }
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
      <path d="M12 2a3 3 0 013 3v6a3 3 0 01-6 0V5a3 3 0 013-3z" />
      <path d="M19 10v2a7 7 0 01-14 0v-2" />
      <path d="M12 19v3" />
      <path d="M9 22h6" />
    </svg>
  );
}

function HangUpIcon({ className }: { className?: string }) {
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
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
      <path d="M2 2l20 20" />
    </svg>
  );
}

function CameraIcon({ className, off }: { className?: string; off?: boolean }) {
  if (off) {
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
        <path d="M16 4h2a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
        <path d="M15 11l3 3-3 3" />
        <path d="M10 14l-3-3 3-3" />
        <path d="M2 2l20 20" />
      </svg>
    );
  }
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
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
