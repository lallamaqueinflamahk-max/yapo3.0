"use client";

import type { Room } from "@/lib/chat";

interface RoomListProps {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
  connected: boolean;
  className?: string;
}

export default function RoomList({
  rooms,
  onSelectRoom,
  connected,
  className = "",
}: RoomListProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      {!connected && (
        <p className="px-4 py-2 text-sm text-amber-600" role="status">
          Conectando...
        </p>
      )}
      <ul className="flex flex-col" role="list">
        {rooms.length === 0 && connected && (
          <li className="px-4 py-6 text-center text-sm text-yapo-blue/70">
            No hay conversaciones. Creá una nueva o unite a una sala.
          </li>
        )}
        {rooms.map((room) => (
          <li key={room.id} role="listitem">
            <button
              type="button"
              onClick={() => onSelectRoom(room)}
              className="flex w-full items-center gap-3 border-b border-yapo-blue/10 px-4 py-3 text-left transition-[transform,background] duration-150 active:scale-[0.995] active:bg-yapo-blue/5"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yapo-blue/20 text-lg font-semibold text-yapo-blue">
                {room.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{room.name}</p>
                {room.lastMessage && (
                  <p className="truncate text-sm text-yapo-blue/70">
                    {room.lastMessage.text}
                  </p>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
