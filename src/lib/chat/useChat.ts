"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createChatSocket, getWebSocketUrl } from "./socket";
import type { Message, Room, PresencePayload } from "./types";

const WS_URL = getWebSocketUrl();

export function useChat(userId: string, userName: string) {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useChat.ts:entry',message:'useChat called',data:{userId,userNameSlice:(userName||'').slice(0,20)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  const socketRef = useRef(createChatSocket(WS_URL));
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [messagesByRoom, setMessagesByRoom] = useState<{ [key: string]: Message[] }>({});
  const [presenceByRoom, setPresenceByRoom] = useState<{ [key: string]: { [key: string]: PresencePayload["status"] } }>({});
  const currentRoomRef = useRef<string | null>(null);

  const connect = useCallback(() => {
    setConnectionError(null);
    const socket = socketRef.current;
    socket
      .connect()
      .then(() => {
        setConnected(true);
        socket.send({ type: "auth", userId, userName });
        socket.send({ type: "get_rooms" });
      })
      .catch((err: Error) => {
        setConnected(false);
        setConnectionError(err.message ?? "No se pudo conectar");
      });
  }, [userId, userName]);

  useEffect(() => {
    const socket = socketRef.current;
    const unsub = socket.subscribe((event) => {
      switch (event.type) {
        case "rooms":
          setRooms(event.rooms);
          break;
        case "room_joined":
          currentRoomRef.current = event.roomId;
          socket.send({ type: "get_rooms" });
          break;
        case "messages":
          setMessagesByRoom((prev) => ({ ...prev, [event.roomId]: event.messages }));
          break;
        case "message":
          setMessagesByRoom((prev) => ({
            ...prev,
            [event.message.roomId]: [...(prev[event.message.roomId] ?? []), event.message],
          }));
          break;
        case "chat_message": {
          const roomId = event.roomId ?? currentRoomRef.current;
          const fromUserId = event.fromUserId ?? "unknown";
          const message: Message = {
            id: `msg-${Date.now()}-${fromUserId}`,
            roomId: roomId ?? "",
            userId: fromUserId,
            userName: fromUserId,
            text: event.text ?? "",
            createdAt: new Date().toISOString(),
          };
          if (roomId) {
            setMessagesByRoom((prev) => ({
              ...prev,
              [roomId]: [...(prev[roomId] ?? []), message],
            }));
            setPresenceByRoom((prev) => ({
              ...prev,
              [roomId]: {
                ...(prev[roomId] ?? {}),
                [fromUserId]: "online",
              },
            }));
          }
          break;
        }
        case "typing":
        case "user_typing": {
          const roomId = event.roomId ?? currentRoomRef.current;
          const uid = event.fromUserId ?? event.userId ?? "unknown";
          const isTyping = event.isTyping ?? (event as { isTyping?: boolean }).isTyping ?? true;
          if (!roomId) break;
          setPresenceByRoom((prev) => ({
            ...prev,
            [roomId]: {
              ...(prev[roomId] ?? {}),
              [uid]: isTyping ? "typing" : "online",
            },
          }));
          break;
        }
        case "presence": {
          const roomId = "roomId" in event ? event.roomId : currentRoomRef.current;
          if (!roomId) break;
          setPresenceByRoom((prev) => ({
            ...prev,
            [roomId]: {
              ...(prev[roomId] ?? {}),
              [event.userId]: event.status,
            },
          }));
          break;
        }
        default:
          break;
      }
    });

    connect();

    return () => {
      unsub();
      socket.disconnect();
      setConnected(false);
      setConnectionError(null);
    };
  }, [userId, userName, connect]);

  const joinRoom = useCallback(
    (roomId: string, roomName?: string, roomType?: "private" | "group") => {
      currentRoomRef.current = roomId;
      socketRef.current.send({
        type: "join_room",
        roomId,
        roomName,
        roomType,
      });
      setRooms((prev) => {
        const exists = prev.some((r) => r.id === roomId);
        if (exists) return prev;
        return [
          ...prev,
          {
            id: roomId,
            name: roomName ?? roomId,
            type: roomType ?? "group",
            lastMessage: null,
          },
        ];
      });
    },
    []
  );

  const leaveRoom = useCallback((roomId: string) => {
    if (currentRoomRef.current === roomId) currentRoomRef.current = null;
    socketRef.current.send({ type: "leave_room", roomId });
  }, []);

  const sendMessage = useCallback((roomId: string, text: string) => {
    socketRef.current.send({ type: "chat_message", roomId, text });
  }, []);

  const setTyping = useCallback((roomId: string, isTyping: boolean) => {
    socketRef.current.send({ type: "typing", roomId, isTyping });
  }, []);

  const refreshRooms = useCallback(() => {
    socketRef.current.send({ type: "get_rooms" });
  }, []);

  const createRoom = useCallback(
    (roomId: string, name: string, type: "private" | "group" = "group") => {
      joinRoom(roomId, name, type);
    },
    [joinRoom]
  );

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useChat.ts:exit',message:'useChat return',data:{roomsCount:rooms.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  return {
    connected,
    connectionError,
    reconnect: connect,
    rooms,
    messagesByRoom,
    presenceByRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    setTyping,
    refreshRooms,
    createRoom,
  };
}

export function useMessages(
  roomId: string | null,
  messagesByRoom: { [key: string]: Message[] }
): Message[] {
  if (!roomId) return [];
  return messagesByRoom[roomId] ?? [];
}

export function usePresence(
  roomId: string | null,
  presenceByRoom: { [key: string]: { [key: string]: PresencePayload["status"] } }
): { [key: string]: PresencePayload["status"] } {
  if (!roomId) return {};
  return presenceByRoom[roomId] ?? {};
}
