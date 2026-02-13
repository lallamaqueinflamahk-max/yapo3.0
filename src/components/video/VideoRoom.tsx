"use client";

import { useState, useEffect, useCallback } from "react";
import { createVideoService, type Participant } from "@/lib/realtime";
import ParticipantTile from "./ParticipantTile";
import VideoControls from "./VideoControls";

const CONTROLS_HEIGHT = 88;
const SAFE_BOTTOM = "env(safe-area-inset-bottom, 0px)";

interface VideoRoomProps {
  roomId: string;
  userId: string;
  userName?: string;
  isHost?: boolean;
  onLeave?: () => void;
  className?: string;
}

/**
 * Pantalla de videollamada mobile-first:
 * - Participantes en grid
 * - Cámara propia destacada (primera, con borde)
 * - Botones: colgar, mic, cámara
 * - Responsive
 */
export default function VideoRoom({
  roomId,
  userId,
  userName,
  isHost = false,
  onLeave,
  className = "",
}: VideoRoomProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [service] = useState(() =>
    createVideoService({ userId, userName })
  );

  useEffect(() => {
    const unsub = service.onParticipantsChange(setParticipants);
    return unsub;
  }, [service]);

  useEffect(() => {
    if (isHost) {
      service.createRoom(roomId).catch(() => {});
    } else {
      service.joinRoom(roomId).catch(() => {});
    }
    return () => service.leaveRoom();
  }, [service, roomId, isHost]);

  const handleToggleMute = useCallback(() => service.toggleMic(), [service]);
  const handleToggleVideo = useCallback(() => service.toggleCamera(), [service]);
  const handleLeave = useCallback(() => {
    service.leaveRoom();
    onLeave?.();
  }, [service, onLeave]);

  const isMuted = !service.isMicOn;
  const isVideoOff = !service.isCameraOn;
  const localParticipant = participants.find((p) => p.id === userId);
  const remoteParticipants = participants.filter((p) => p.id !== userId);

  return (
    <div
      className={`flex min-h-screen flex-col bg-black text-white sm:min-h-dvh ${className}`}
      style={{
        paddingBottom: `calc(${CONTROLS_HEIGHT}px + ${SAFE_BOTTOM})`,
      }}
    >
      {/* Header mínimo */}
      <header className="shrink-0 flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h1 className="text-base font-semibold text-white">Llamada</h1>
        <span className="text-xs text-white/70">
          {participants.length} {participants.length === 1 ? "participante" : "participantes"}
        </span>
      </header>

      {/* Grid de participantes: cámara propia destacada primero */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-2">
          {localParticipant && (
            <div className="relative min-h-[180px] sm:min-h-[200px]">
              <ParticipantTile
                key={localParticipant.id}
                id={localParticipant.id}
                name={localParticipant.name ?? userName ?? "Vos"}
                stream={localParticipant.stream}
                isMuted={localParticipant.isMuted ?? isMuted}
                isVideoOff={localParticipant.isVideoOff ?? isVideoOff}
                isLocal
                highlighted
              />
            </div>
          )}
          {remoteParticipants.map((p) => (
            <div key={p.id} className="relative min-h-[180px] sm:min-h-[200px]">
              <ParticipantTile
                id={p.id}
                name={p.name}
                stream={p.stream}
                isMuted={p.isMuted}
                isVideoOff={p.isVideoOff}
              />
            </div>
          ))}
        </div>
        {participants.length === 0 && (
          <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-white/60">
            <span className="text-4xl" aria-hidden>📹</span>
            <p className="text-sm">Conectando...</p>
          </div>
        )}
      </div>

      {/* Controles fijos abajo */}
      <div
        className="fixed bottom-0 left-0 right-0 z-10 flex items-center justify-center border-t border-white/10 bg-black/90 px-4 py-4 backdrop-blur-sm"
        style={{ paddingBottom: `max(1rem, ${SAFE_BOTTOM})` }}
      >
        <VideoControls
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          onToggleMute={handleToggleMute}
          onToggleVideo={handleToggleVideo}
          onLeave={handleLeave}
        />
      </div>
    </div>
  );
}
