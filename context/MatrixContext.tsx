// contexts/MatrixContext.tsx

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Room, MatrixEvent } from "matrix-js-sdk";

import MatrixService from "@/services/MatrixService";

interface MatrixContextProps {
  rooms: Room[];
  selectedRoom: Room | null;
  selectRoom: (roomId: string) => void;
  messages: MatrixEvent[];
  sendMessage: (message: string) => Promise<void>;
  refreshRooms: () => void;
  clientReady: boolean;
}

const MatrixContext = createContext<MatrixContextProps | undefined>(undefined);

export const useMatrix = () => {
  const context = useContext(MatrixContext);

  if (!context) {
    throw new Error("useMatrix must be used within a MatrixProvider");
  }

  return context;
};

export const MatrixProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<MatrixEvent[]>([]);
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    if (MatrixService.isLoggedIn()) {
      const client = MatrixService.getClient();

      if (client && client.isInitialSyncComplete()) {
        // Client is ready
        setClientReady(true);
        refreshRooms();
      } else {
        // Wait for client to be ready
        // @ts-ignore
        client.once("sync", (state) => {
          if (
            state === "PREPARED" ||
            state === "SYNCING" ||
            state === "CATCHUP"
          ) {
            setClientReady(true);
            refreshRooms();
          }
        });
      }
    }
  }, []);

  const refreshRooms = () => {
    const allRooms = MatrixService.listRooms();

    // Sort rooms by last active timestamp (most recent first)
    allRooms.sort(
      (a, b) => b.getLastActiveTimestamp() - a.getLastActiveTimestamp(),
    );

    setRooms(allRooms);

    // Automatically select the first room if none is selected
    if (allRooms.length > 0 && !selectedRoom) {
      const room = allRooms[0];

      selectRoom(room.roomId);
    }
  };

  const selectRoom = (roomId: string) => {
    const room = rooms.find((r) => r.roomId === roomId) || null;

    setSelectedRoom(room);
    if (room) {
      const timeline = room.getLiveTimeline().getEvents();

      setMessages(timeline);
    } else {
      setMessages([]);
    }
  };

  const sendMessage = async (message: string) => {
    if (selectedRoom) {
      await MatrixService.sendMessage(selectedRoom.roomId, message);
    }
  };

  // Listen for new messages
  useEffect(() => {
    if (!clientReady) return;

    const client = MatrixService.getClient();
    const onRoomTimeline = (event: MatrixEvent, room: Room) => {
      if (
        room.roomId === selectedRoom?.roomId &&
        event.getType() === "m.room.message"
      ) {
        setMessages((prevMessages) => [...prevMessages, event]);
      }
    };

    // @ts-ignore
    client.on("Room.timeline", onRoomTimeline);

    return () => {
      // @ts-ignore
      client.removeListener("Room.timeline", onRoomTimeline);
    };
  }, [selectedRoom, clientReady]);

  return (
    <MatrixContext.Provider
      value={{
        rooms,
        selectedRoom,
        selectRoom,
        messages,
        sendMessage,
        refreshRooms,
        clientReady,
      }}
    >
      {children}
    </MatrixContext.Provider>
  );
};
