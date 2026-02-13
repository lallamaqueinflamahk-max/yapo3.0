"use client";

import { useRef, useEffect } from "react";

interface ParticipantTileProps {
  id: string;
  name?: string;
  stream?: MediaStream | null;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isLocal?: boolean;
  /** Destacar (cámara propia): borde y etiqueta "Vos" */
  highlighted?: boolean;
  className?: string;
}

export default function ParticipantTile({
  id,
  name,
  stream,
  isMuted = false,
  isVideoOff = false,
  isLocal = false,
  highlighted = false,
  className = "",
}: ParticipantTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  const showHighlight = highlighted || isLocal;

  return (
    <div
      className={`relative flex min-h-0 w-full overflow-hidden rounded-xl bg-black/90 ${className}`}
      data-participant-id={id}
    >
      <div
        className={`relative flex flex-1 flex-col ${showHighlight ? "ring-2 ring-inset ring-yapo-blue ring-offset-2 ring-offset-black/50 rounded-xl" : ""}`}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`h-full min-h-[120px] w-full object-cover ${isVideoOff ? "hidden" : ""}`}
        />
        {isVideoOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-yapo-blue/10">
            <span className="text-4xl text-yapo-blue/50" aria-hidden>
              👤
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/80 to-transparent p-2">
          <span className="truncate rounded bg-black/60 px-2 py-1 text-xs font-medium text-white">
            {name ?? (isLocal ? "Vos" : "Participante")}
          </span>
          {isMuted && (
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/60 text-white"
              aria-label="Silenciado"
            >
              <MicOffIcon className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function MicOffIcon({ className }: { className?: string }) {
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
