/**
 * Tipos del sistema de mensajería: mensajes, usuarios, rooms.
 */

export type RoomType = "private" | "group";

export type PresenceStatus = "online" | "offline" | "typing";

export interface Message {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  lastMessage?: {
    text: string;
    createdAt: string;
    userId: string;
  } | null;
}

export interface User {
  id: string;
  name: string;
  status: PresenceStatus;
  lastSeen?: string;
}

export interface PresencePayload {
  userId: string;
  userName: string;
  status: PresenceStatus;
}
