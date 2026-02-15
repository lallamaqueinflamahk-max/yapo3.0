"use client";

import type { Room } from "@/lib/chat";

interface ChatListProps {
  rooms: Room[];
  currentRoomId?: string | null;
  onSelectRoom: (roomId: string) => void;
  className?: string;
}

export default function ChatList({
  rooms,
  currentRoomId,
  onSelectRoom,
  className = "",
}: ChatListProps) {
  return (
    <ul
      className={`flex flex-col gap-1 overflow-y-auto ${className}`}
      role="list"
      aria-label="Lista de conversaciones"
    >
      {rooms.map((room) => (
        <li key={room.id} role="listitem">
          <button
            type="button"
            onClick={() => onSelectRoom(room.id)}
            aria-current={currentRoomId === room.id}
            className={`nav-card-interactive w-full rounded-xl border-2 px-4 py-3 text-left ${
              currentRoomId === room.id
                ? "border-yapo-cta/50 bg-yapo-cta/15 text-yapo-cta font-semibold"
                : "border-transparent bg-yapo-white hover:border-yapo-blue/30 hover:bg-yapo-blue/5 text-foreground"
            }`}
          >
            <p className="text-sm font-medium truncate">{room.name}</p>
            {room.lastMessage && (
              <p className="text-xs text-yapo-blue/70 truncate mt-0.5">
                {room.lastMessage.text}
              </p>
            )}
          </button>
        </li>
      ))}
      {rooms.length === 0 && (
        <li className="px-4 py-6 text-center text-sm text-yapo-blue/60">
          No hay conversaciones
        </li>
      )}
    </ul>
  );
}
