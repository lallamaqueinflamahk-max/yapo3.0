/**
 * VideoService: videollamadas multiusuario con WebRTC + WebSocket (signaling).
 * Conecta a NEXT_PUBLIC_WS_URL (getWebSocketUrl).
 * Señalización WebRTC vía WebSocket (offer/answer/ice).
 * Logs de eventos WS en consola para debugging (localhost, Vercel, ngrok).
 */

import {
  createVideoService as createRealtimeVideoService,
  getWebSocketUrl,
} from "@/lib/realtime";
import type {
  VideoServiceHandle,
  VideoServiceOptions,
  VideoCallStatus,
  Participant,
} from "@/lib/realtime";

const LOG = "[VideoService]";

export type { VideoServiceHandle, VideoServiceOptions, VideoCallStatus, Participant };

/**
 * Crea el servicio de video (WebRTC + signaling por WebSocket).
 * createRoom / joinRoom / leaveRoom; toggleCamera / toggleMic.
 * Eventos de signaling se loguean en consola.
 */
export function createVideoService(options: VideoServiceOptions = {}): VideoServiceHandle {
  const signalingUrl = options.signalingUrl?.trim() || getWebSocketUrl();
  if (typeof window !== "undefined" && signalingUrl) {
    console.log(`${LOG} signaling WS_URL=${signalingUrl}`);
  }

  const service = createRealtimeVideoService({
    ...options,
    signalingUrl: signalingUrl || undefined,
  });

  const originalCreateRoom = service.createRoom.bind(service);
  const originalJoinRoom = service.joinRoom.bind(service);
  const originalLeaveRoom = service.leaveRoom.bind(service);

  return {
    createRoom(roomId: string) {
      if (typeof window !== "undefined") {
        console.log(`${LOG} createRoom / video_join`, { roomId });
      }
      return originalCreateRoom(roomId);
    },
    joinRoom(roomId: string) {
      if (typeof window !== "undefined") {
        console.log(`${LOG} joinRoom / video_join`, { roomId });
      }
      return originalJoinRoom(roomId);
    },
    leaveRoom() {
      if (typeof window !== "undefined") {
        console.log(`${LOG} video_leave`, { roomId: service.roomId });
      }
      originalLeaveRoom();
    },
    toggleCamera: service.toggleCamera.bind(service),
    toggleMic: service.toggleMic.bind(service),
    getLocalStream: service.getLocalStream.bind(service),
    getParticipants: service.getParticipants.bind(service),
    onParticipantsChange: service.onParticipantsChange.bind(service),
    get status() {
      return service.status;
    },
    get roomId() {
      return service.roomId;
    },
    get isCameraOn() {
      return service.isCameraOn;
    },
    get isMicOn() {
      return service.isMicOn;
    },
  };
}

/** Resuelve la URL WebSocket (NEXT_PUBLIC_WS_URL). */
export { getWebSocketUrl } from "@/lib/realtime";
