"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import VideoLobby from "@/components/video/VideoLobby";
import VideoRoom from "./VideoRoom";

export default function VideoPage() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);

  const handleCreateRoom = useCallback((id: string) => {
    setRoomId(id);
    setIsHost(true);
  }, []);

  const handleJoinRoom = useCallback((id: string) => {
    setRoomId(id);
    setIsHost(false);
  }, []);

  if (roomId) {
    return (
      <div className="min-h-screen bg-black">
        <VideoRoom
          roomId={roomId}
          userId={`user-${typeof window !== "undefined" ? Math.random().toString(36).slice(2, 9) : "local"}`}
          userName="Usuario"
          isHost={isHost}
          onLeave={() => setRoomId(null)}
        />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black px-4 py-8">
      <VideoLobby onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} className="w-full max-w-sm" />
      <p className="text-center text-sm text-white/70">
        Las videollamadas se gestionan también desde{" "}
        <Link href="/chat" className="font-semibold text-yapo-blue underline">
          Chat
        </Link>
        .
      </p>
    </main>
  );
}
