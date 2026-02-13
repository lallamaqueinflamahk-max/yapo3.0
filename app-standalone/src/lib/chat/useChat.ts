"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createChatSocket, getWebSocketUrl } from "./socket";
import type { Message, Room, PresencePayload } from "./types";

const WS_URL = getWebSocketUrl();

export function useChat(userId: string, userName: string) {
  const socketRef = useRef(createChatSocket(WS_URL));
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, Message[]>>({});
  const [presenceByRoom, setPresenceByRoom] = useState<Record<string, Record<string, PresencePayload["status"]>>({});
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
    },
    []
  );

  const leaveRoom = useCallback((roomId: string) => {
    if (currentRoomRef.current === roomId) currentRoomRef.current = null;
    socketRef.current.send({ type: "leave_room", roomId });
  }, []);

  const sendMessage = useCallback((roomId: string, text: string) => {
    socketRef.current.send({ type: "message", roomId, text });
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
  messagesByRoom: Record<string, Message[]>
): Message[] {
  if (!roomId) return [];
  return messagesByRoom[roomId] ?? [];
}

export function usePresence(
  roomId: string | null,
  presenceByRoom: Record<string, Record<string, PresencePayload["status"]>>
): Record<string, PresencePayload["status"]> {
  if (!roomId) return {};
  return presenceByRoom[roomId] ?? {};
}
