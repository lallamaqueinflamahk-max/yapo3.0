/**
 * VideoService con WebRTC + WebSocket (signaling).
 * - createRoom(roomId) / joinRoom(roomId) / leaveRoom()
 * - toggleCamera() / toggleMic()
 *
 * Protocolo de signaling (el servidor debe reenviar):
 * - Cliente envía: video_join { roomId, userId, userName }
 * - Servidor: añade a sala, envía video_participants { participants: [{ userId, userName }] } al nuevo;
 *   envía video_user_joined { userId, userName } a los demás.
 * - Cliente envía: video_leave { roomId, userId }
 * - Servidor: envía video_user_left { userId } a la sala.
 * - Cliente envía: video_offer { roomId, targetUserId, sdp }
 * - Servidor: reenvía al targetUserId como video_offer { fromUserId, userName, sdp }
 * - Cliente envía: video_answer { roomId, targetUserId, sdp }
 * - Servidor: reenvía al targetUserId como video_answer { fromUserId, sdp }
 * - Cliente envía: video_ice { roomId, targetUserId, candidate }
 * - Servidor: reenvía al targetUserId como video_ice { fromUserId, candidate }
 */

import { createSocketClient, getWebSocketUrl } from "./socketClient";

export type VideoCallStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

export interface Participant {
  id: string;
  name?: string;
  stream: MediaStream | null;
  isMuted?: boolean;
  isVideoOff?: boolean;
}

/** Eventos de signaling (enviados al servidor). */
const SIGNAL_JOIN = "video_join";
const SIGNAL_LEAVE = "video_leave";
const SIGNAL_OFFER = "video_offer";
const SIGNAL_ANSWER = "video_answer";
const SIGNAL_ICE = "video_ice";

/** Eventos de signaling (recibidos del servidor: reenvío con fromUserId). */
const SIGNAL_JOIN_IN = "video_join";
const SIGNAL_LEAVE_IN = "video_leave";
const SIGNAL_OFFER_IN = "video_offer";
const SIGNAL_ANSWER_IN = "video_answer";
const SIGNAL_ICE_IN = "video_ice";

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export interface VideoServiceOptions {
  signalingUrl?: string;
  userId?: string;
  userName?: string;
}

export interface VideoServiceHandle {
  createRoom(roomId: string): Promise<void>;
  joinRoom(roomId: string): Promise<void>;
  leaveRoom(): void;
  toggleCamera(): void;
  toggleMic(): void;
  getLocalStream(): MediaStream | null;
  getParticipants(): Participant[];
  onParticipantsChange(callback: (participants: Participant[]) => void): () => void;
  readonly status: VideoCallStatus;
  readonly roomId: string | null;
  readonly isCameraOn: boolean;
  readonly isMicOn: boolean;
}

export function createVideoService(options: VideoServiceOptions = {}): VideoServiceHandle {
  const { signalingUrl, userId: optionsUserId, userName: optionsUserName } = options;
  const userId = optionsUserId ?? (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "user-" + Date.now());
  const userName = optionsUserName ?? "Usuario";

  let status: VideoCallStatus = "idle";
  let roomId: string | null = null;
  let localStream: MediaStream | null = null;
  let isCameraOn = true;
  let isMicOn = true;
  const peerConnections = new Map<string, RTCPeerConnection>();
  const participants = new Map<string, Participant>();
  const participantListeners = new Set<(p: Participant[]) => void>();

  const socket = createSocketClient({
    url: signalingUrl?.trim() || getWebSocketUrl(),
    userId,
    autoConnect: false,
    reconnect: true,
  });

  function setStatus(next: VideoCallStatus): void {
    if (next === status) return;
    status = next;
  }

  function notifyParticipants(): void {
    const list = Array.from(participants.values());
    participantListeners.forEach((cb) => cb(list));
  }

  function addParticipant(id: string, name?: string, stream: MediaStream | null = null): void {
    participants.set(id, {
      id,
      name,
      stream,
      isMuted: false,
      isVideoOff: false,
    });
    notifyParticipants();
  }

  function removeParticipant(id: string): void {
    peerConnections.get(id)?.close();
    peerConnections.delete(id);
    participants.delete(id);
    notifyParticipants();
  }

  function createPeerConnection(remoteUserId: string, remoteUserName?: string): RTCPeerConnection {
    const pc = new RTCPeerConnection(RTC_CONFIG);

    localStream?.getTracks().forEach((track) => {
      pc.addTrack(track, localStream!);
    });

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      const p = participants.get(remoteUserId);
      if (p) {
        p.stream = stream;
        participants.set(remoteUserId, p);
      } else {
        addParticipant(remoteUserId, remoteUserName, stream);
      }
      notifyParticipants();
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(SIGNAL_ICE, {
          roomId: roomId ?? undefined,
          toUserId: remoteUserId,
          targetUserId: remoteUserId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected" || pc.connectionState === "closed") {
        removeParticipant(remoteUserId);
      }
    };

    peerConnections.set(remoteUserId, pc);
    addParticipant(remoteUserId, remoteUserName, null);
    return pc;
  }

  async function createOfferFor(remoteUserId: string, remoteUserName?: string): Promise<void> {
    const pc = createPeerConnection(remoteUserId, remoteUserName);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.send(SIGNAL_OFFER, {
      roomId: roomId ?? undefined,
      toUserId: remoteUserId,
      targetUserId: remoteUserId,
      sdp: offer,
    });
  }

  async function handleOffer(fromUserId: string, fromUserName: string | undefined, sdp: RTCSessionDescriptionInit): Promise<void> {
    const pc = createPeerConnection(fromUserId, fromUserName);
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.send(SIGNAL_ANSWER, {
      roomId: roomId ?? undefined,
      toUserId: fromUserId,
      targetUserId: fromUserId,
      sdp: answer,
    });
  }

  async function handleAnswer(fromUserId: string, sdp: RTCSessionDescriptionInit): Promise<void> {
    const pc = peerConnections.get(fromUserId);
    if (!pc) return;
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  async function handleIce(fromUserId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const pc = peerConnections.get(fromUserId);
    if (!pc) return;
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.warn("[VideoService] addIceCandidate error:", err);
    }
  }

  function setupSignaling(): void {
    socket.off(SIGNAL_JOIN_IN);
    socket.off(SIGNAL_LEAVE_IN);
    socket.off(SIGNAL_OFFER_IN);
    socket.off(SIGNAL_ANSWER_IN);
    socket.off(SIGNAL_ICE_IN);

    socket.on(SIGNAL_JOIN_IN, (data: { fromUserId?: string; userId?: string; userName?: string } | undefined) => {
      const uid = data?.fromUserId ?? data?.userId;
      if (!uid || uid === userId) return;
      createOfferFor(uid, data?.userName);
    });

    socket.on(SIGNAL_LEAVE_IN, (data: { fromUserId?: string; userId?: string } | undefined) => {
      const uid = data?.fromUserId ?? data?.userId;
      if (uid) removeParticipant(uid);
    });

    socket.on(SIGNAL_OFFER_IN, async (data: { fromUserId?: string; userName?: string; sdp?: RTCSessionDescriptionInit } | undefined) => {
      const from = data?.fromUserId;
      const sdp = data?.sdp;
      if (!from || !sdp) return;
      await handleOffer(from, data?.userName, sdp);
    });

    socket.on(SIGNAL_ANSWER_IN, async (data: { fromUserId?: string; sdp?: RTCSessionDescriptionInit } | undefined) => {
      const from = data?.fromUserId;
      const sdp = data?.sdp;
      if (!from || !sdp) return;
      await handleAnswer(from, sdp);
    });

    socket.on(SIGNAL_ICE_IN, async (data: { fromUserId?: string; candidate?: RTCIceCandidateInit } | undefined) => {
      const from = data?.fromUserId;
      const candidate = data?.candidate;
      if (!from || !candidate) return;
      await handleIce(from, candidate);
    });
  }

  async function getLocalMedia(): Promise<MediaStream> {
    if (localStream) return localStream;
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    return localStream;
  }

  async function createRoom(roomIdParam: string): Promise<void> {
    if (roomId) {
      leaveRoom();
    }
    setStatus("connecting");
    try {
      await getLocalMedia();
      await socket.connect();
      setupSignaling();
      roomId = roomIdParam;
      socket.send(SIGNAL_JOIN, {
        roomId,
        userId,
        userName,
      });
      addParticipant(userId, userName, localStream);
      setStatus("connected");
      notifyParticipants();
    } catch (err) {
      setStatus("error");
      throw err;
    }
  }

  async function joinRoom(roomIdParam: string): Promise<void> {
    if (roomId) {
      leaveRoom();
    }
    setStatus("connecting");
    try {
      await getLocalMedia();
      await socket.connect();
      setupSignaling();
      roomId = roomIdParam;
      socket.send(SIGNAL_JOIN, {
        roomId,
        userId,
        userName,
      });
      addParticipant(userId, userName, localStream);
      setStatus("connected");
      notifyParticipants();
    } catch (err) {
      setStatus("error");
      throw err;
    }
  }

  function leaveRoom(): void {
    if (roomId) {
      socket.send(SIGNAL_LEAVE, { roomId, userId });
    }
    roomId = null;
    peerConnections.forEach((pc) => pc.close());
    peerConnections.clear();
    participants.clear();
    localStream?.getTracks().forEach((t) => t.stop());
    localStream = null;
    socket.disconnect();
    setStatus("disconnected");
    notifyParticipants();
  }

  function toggleCamera(): void {
    if (!localStream) return;
    isCameraOn = !isCameraOn;
    localStream.getVideoTracks().forEach((t) => {
      t.enabled = isCameraOn;
    });
    const me = participants.get(userId);
    if (me) {
      me.isVideoOff = !isCameraOn;
      participants.set(userId, me);
      notifyParticipants();
    }
    peerConnections.forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      const track = localStream?.getVideoTracks()[0];
      if (sender && track) sender.replaceTrack(track);
    });
  }

  function toggleMic(): void {
    if (!localStream) return;
    isMicOn = !isMicOn;
    localStream.getAudioTracks().forEach((t) => {
      t.enabled = isMicOn;
    });
    const me = participants.get(userId);
    if (me) {
      me.isMuted = !isMicOn;
      participants.set(userId, me);
      notifyParticipants();
    }
    peerConnections.forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === "audio");
      const track = localStream?.getAudioTracks()[0];
      if (sender && track) sender.replaceTrack(track);
    });
  }

  return {
    createRoom,
    joinRoom,
    leaveRoom,
    toggleCamera,
    toggleMic,
    getLocalStream: () => localStream,
    getParticipants: () => Array.from(participants.values()),
    onParticipantsChange(callback: (participants: Participant[]) => void): () => void {
      participantListeners.add(callback);
      return () => participantListeners.delete(callback);
    },
    get status() {
      return status;
    },
    get roomId() {
      return roomId;
    },
    get isCameraOn() {
      return isCameraOn;
    },
    get isMicOn() {
      return isMicOn;
    },
  };
}
