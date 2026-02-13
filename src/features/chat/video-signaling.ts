/**
 * Signaling WebRTC 1:1 sobre el mismo socket que chat.
 * Maneja video_join, video_offer, video_answer, video_ice.
 */

import type { VideoCallStatus, VideoParticipant } from "./types";
import type { ChatRealtimeIn, ChatRealtimeOut } from "./types";

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export interface VideoSignalingDeps {
  userId: string;
  userName: string;
  send: (event: ChatRealtimeOut) => void;
  subscribe: (fn: (event: ChatRealtimeIn) => void) => () => void;
}

export interface VideoSignalingHandle {
  startCall(roomId: string): Promise<void>;
  leaveCall(): void;
  toggleCamera(): void;
  toggleMic(): void;
  getStatus(): VideoCallStatus;
  getParticipants(): VideoParticipant[];
  onParticipantsChange(cb: (p: VideoParticipant[]) => void): () => void;
}

export function createVideoSignaling(deps: VideoSignalingDeps): VideoSignalingHandle {
  const { userId, userName, send, subscribe } = deps;
  let status: VideoCallStatus = "idle";
  let roomId: string | null = null;
  let localStream: MediaStream | null = null;
  let isCameraOn = true;
  let isMicOn = true;
  const peerConnections = new Map<string, RTCPeerConnection>();
  const participants = new Map<string, VideoParticipant>();
  const participantListeners = new Set<(p: VideoParticipant[]) => void>();

  function setStatus(s: VideoCallStatus): void {
    status = s;
  }

  function notifyParticipants(): void {
    const list = Array.from(participants.values());
    participantListeners.forEach((cb) => cb(list));
  }

  function addParticipant(id: string, name?: string, stream: MediaStream | null = null): void {
    participants.set(id, { id, name, stream, isMuted: false, isVideoOff: false });
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
    localStream?.getTracks().forEach((t) => pc.addTrack(t, localStream!));

    pc.ontrack = (e) => {
      const stream = e.streams[0];
      const p = participants.get(remoteUserId);
      if (p) {
        p.stream = stream;
        participants.set(remoteUserId, p);
      } else {
        addParticipant(remoteUserId, remoteUserName, stream);
      }
      notifyParticipants();
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        send({
          type: "video_ice",
          roomId: roomId ?? undefined,
          targetUserId: remoteUserId,
          candidate: e.candidate.toJSON(),
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
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
    send({
      type: "video_offer",
      roomId: roomId ?? undefined,
      targetUserId: remoteUserId,
      sdp: offer,
    });
  }

  async function handleOffer(
    fromUserId: string,
    fromUserName: string | undefined,
    sdp: RTCSessionDescriptionInit
  ): Promise<void> {
    const pc = createPeerConnection(fromUserId, fromUserName);
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    send({
      type: "video_answer",
      roomId: roomId ?? undefined,
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
      console.warn("[video-signaling] addIceCandidate:", err);
    }
  }

  const unsub = subscribe((event: ChatRealtimeIn) => {
    if (event.type === "video_join") {
      const uid = event.fromUserId ?? event.userId;
      if (!uid || uid === userId) return;
      createOfferFor(uid, event.userName);
    }
    if (event.type === "video_leave") {
      const uid = event.fromUserId ?? event.userId;
      if (uid) removeParticipant(uid);
    }
    if (event.type === "video_offer") {
      const from = event.fromUserId;
      const sdp = event.sdp;
      if (!from || !sdp) return;
      handleOffer(from, event.userName, sdp);
    }
    if (event.type === "video_answer") {
      const from = event.fromUserId;
      const sdp = event.sdp;
      if (!from || !sdp) return;
      handleAnswer(from, sdp);
    }
    if (event.type === "video_ice") {
      const from = event.fromUserId;
      const candidate = event.candidate;
      if (!from || !candidate) return;
      handleIce(from, candidate);
    }
  });

  async function getLocalMedia(): Promise<MediaStream> {
    if (localStream) return localStream;
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    return localStream;
  }

  async function startCall(roomIdParam: string): Promise<void> {
    if (roomId) leaveCall();
    setStatus("connecting");
    try {
      await getLocalMedia();
      roomId = roomIdParam;
      send({ type: "video_join", roomId, userId, userName });
      addParticipant(userId, userName, localStream);
      setStatus("connected");
      notifyParticipants();
    } catch (err) {
      setStatus("error");
      throw err;
    }
  }

  function leaveCall(): void {
    if (roomId) {
      send({ type: "video_leave", roomId, userId });
    }
    roomId = null;
    peerConnections.forEach((pc) => pc.close());
    peerConnections.clear();
    participants.clear();
    localStream?.getTracks().forEach((t) => t.stop());
    localStream = null;
    setStatus("disconnected");
    notifyParticipants();
    unsub();
  }

  function toggleCamera(): void {
    if (!localStream) return;
    isCameraOn = !isCameraOn;
    localStream.getVideoTracks().forEach((t) => (t.enabled = isCameraOn));
    const me = participants.get(userId);
    if (me) {
      me.isVideoOff = !isCameraOn;
      participants.set(userId, me);
      notifyParticipants();
    }
  }

  function toggleMic(): void {
    if (!localStream) return;
    isMicOn = !isMicOn;
    localStream.getAudioTracks().forEach((t) => (t.enabled = isMicOn));
    const me = participants.get(userId);
    if (me) {
      me.isMuted = !isMicOn;
      participants.set(userId, me);
      notifyParticipants();
    }
  }

  return {
    startCall,
    leaveCall,
    toggleCamera,
    toggleMic,
    getStatus: () => status,
    getParticipants: () => Array.from(participants.values()),
    onParticipantsChange(cb: (p: VideoParticipant[]) => void): () => void {
      participantListeners.add(cb);
      return () => participantListeners.delete(cb);
    },
  };
}
