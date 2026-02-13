/**
 * Tipos para chat privado + signaling WebRTC.
 * Eventos: chat_message, video_join, video_offer, video_answer, video_ice.
 */

import type { Message } from "@/lib/chat";

export type { Message };

/** Eventos salientes (cliente → servidor). */
export type ChatRealtimeOut =
  | { type: "auth"; userId: string; userName?: string }
  | { type: "join_room"; roomId: string; roomName?: string; roomType?: "private" | "group" }
  | { type: "leave_room"; roomId: string }
  | { type: "chat_message"; roomId: string; text: string }
  | { type: "typing"; roomId: string; isTyping: boolean }
  | { type: "video_join"; roomId: string; userId: string; userName?: string }
  | { type: "video_leave"; roomId: string; userId: string }
  | { type: "video_offer"; roomId?: string; targetUserId: string; sdp: RTCSessionDescriptionInit }
  | { type: "video_answer"; roomId?: string; targetUserId: string; sdp: RTCSessionDescriptionInit }
  | { type: "video_ice"; roomId?: string; targetUserId: string; candidate: RTCIceCandidateInit };

/** Eventos entrantes (servidor → cliente). */
export type ChatRealtimeIn =
  | { type: "rooms"; rooms: unknown[] }
  | { type: "room_joined"; roomId: string }
  | { type: "messages"; roomId: string; messages: Message[] }
  | { type: "message"; message: Message }
  | { type: "chat_message"; roomId?: string; fromUserId?: string; text?: string }
  | { type: "video_join"; fromUserId?: string; userId?: string; userName?: string }
  | { type: "video_leave"; fromUserId?: string; userId?: string }
  | { type: "video_offer"; fromUserId?: string; userName?: string; sdp?: RTCSessionDescriptionInit }
  | { type: "video_answer"; fromUserId?: string; sdp?: RTCSessionDescriptionInit }
  | { type: "video_ice"; fromUserId?: string; candidate?: RTCIceCandidateInit };

export type VideoCallStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

export interface VideoParticipant {
  id: string;
  name?: string;
  stream: MediaStream | null;
  isMuted?: boolean;
  isVideoOff?: boolean;
}
