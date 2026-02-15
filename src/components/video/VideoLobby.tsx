"use client";

import { useState, useCallback } from "react";

export interface VideoLobbyProps {
  /** Al crear sala: roomId generado o ingresado, isHost true. */
  onCreateRoom: (roomId: string) => void;
  /** Al unirse: roomId ingresado, isHost false. */
  onJoinRoom: (roomId: string) => void;
  className?: string;
}

/**
 * Pantalla inicial de video: crear o unirse a sala.
 * Mobile-first: input + botones grandes.
 */
export default function VideoLobby({
  onCreateRoom,
  onJoinRoom,
  className = "",
}: VideoLobbyProps) {
  const [roomId, setRoomId] = useState("");

  const handleCreate = useCallback(() => {
    const id = roomId.trim() || `room-${Date.now()}`;
    onCreateRoom(id);
  }, [roomId, onCreateRoom]);

  const handleJoin = useCallback(() => {
    const id = roomId.trim();
    if (id) onJoinRoom(id);
  }, [roomId, onJoinRoom]);

  return (
    <div
      className={`flex min-h-screen flex-col items-center justify-center gap-6 bg-black px-4 py-8 sm:min-h-dvh ${className}`}
    >
      <h1 className="text-xl font-semibold text-white sm:text-2xl">
        Videollamada
      </h1>
      <p className="text-center text-sm text-white/70">
        Creá una sala nueva o unite con un código
      </p>
      <div className="flex w-full max-w-sm flex-col gap-3">
        <label htmlFor="video-room-id" className="sr-only">
          Código o nombre de sala
        </label>
        <input
          id="video-room-id"
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Código o nombre de sala"
          autoComplete="off"
          className="min-h-[48px] w-full rounded-xl border border-white/20 bg-white/10 px-4 text-base text-white placeholder:text-white/50 focus:border-yapo-blue focus:outline-none focus:ring-2 focus:ring-yapo-blue/40"
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <button
            type="button"
            onClick={handleCreate}
            className="btn-interactive min-h-[48px] flex-1 rounded-xl bg-yapo-cta font-semibold text-white shadow-md border-2 border-yapo-cta-hover/50 hover:bg-yapo-cta-hover disabled:opacity-50"
          >
            Crear sala
          </button>
          <button
            type="button"
            onClick={handleJoin}
            disabled={!roomId.trim()}
            className="btn-interactive min-h-[48px] flex-1 rounded-xl border-2 border-white/40 bg-white/15 font-semibold text-white shadow-sm hover:bg-white/25 disabled:opacity-50"
          >
            Unirse
          </button>
        </div>
      </div>
      <p className="text-center text-xs text-white/50">
        Al crear, compartí el código con quien quieras sumar a la llamada.
      </p>
    </div>
  );
}
