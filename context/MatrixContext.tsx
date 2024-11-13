"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Room, MatrixEvent, SyncState } from "matrix-js-sdk";
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

/**
 * Utility function to determine if an event is a message event.
 * @param event - The MatrixEvent to check.
 * @returns True if the event is of type 'm.room.message'; otherwise, false.
 */
const isMessageEvent = (event: MatrixEvent): boolean => {
  return event.getType() === "m.room.message";
};

export const MatrixProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                          children,
                                                                        }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<MatrixEvent[]>([]);
  const [clientReady, setClientReady] = useState(false);

  /**
   * Refreshes the list of rooms by fetching them from the Matrix client
   * and sorting them by their last active timestamp.
   */
  const refreshRooms = useCallback(() => {
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
  }, [selectedRoom]);

  /**
   * Selects a room by its ID and fetches its message timeline.
   * Filters out non-message events to prevent empty messages.
   * @param roomId - The ID of the room to select.
   */
  const selectRoom = useCallback(
    (roomId: string) => {
      const room = rooms.find((r) => r.roomId === roomId) || null;

      setSelectedRoom(room);
      if (room) {
        // Fetch live timeline events and filter only message events
        const timeline = room
          .getLiveTimeline()
          .getEvents()
          .filter(isMessageEvent);

        setMessages(timeline);
      } else {
        setMessages([]);
      }
    },
    [rooms],
  );

  /**
   * Sends a message to the currently selected room.
   * @param message - The message content to send.
   */
  const sendMessage = useCallback(
    async (message: string) => {
      if (selectedRoom) {
        await MatrixService.sendMessage(selectedRoom.roomId, message);
      }
    },
    [selectedRoom],
  );

  /**
   * Initializes the Matrix client and sets up event listeners.
   */
  useEffect(() => {
    if (MatrixService.isLoggedIn()) {
      const client = MatrixService.getClient();

      if (client && client.isInitialSyncComplete()) {
        // Client is ready
        setClientReady(true);
        refreshRooms();
      } else {
        // Wait for client to be ready
        const onSync = (state: SyncState) => {
          if (
            state === "PREPARED" ||
            state === "SYNCING" ||
            state === "CATCHUP"
          ) {
            setClientReady(true);
            refreshRooms();
          }
        };

        // @ts-ignore
        client.on("sync", onSync);

        // Cleanup listener on unmount
        return () => {
          // @ts-ignore
          client.removeListener("sync", onSync);
        };
      }
    }
  }, [refreshRooms]);

  /**
   * Listens for new message events in the selected room and updates the messages state.
   */
  useEffect(() => {
    if (!clientReady) return;

    const client = MatrixService.getClient();

    /**
     * Handler for new events in the room's timeline.
     * @param event - The new MatrixEvent.
     * @param room - The Room where the event occurred.
     */
    const onRoomTimeline = (event: MatrixEvent, room: Room) => {
      if (
        room.roomId === selectedRoom?.roomId &&
        isMessageEvent(event)
      ) {
        setMessages((prevMessages) => [...prevMessages, event]);
      }
    };

    // @ts-ignore
    client.on("Room.timeline", onRoomTimeline);

    // Cleanup listener on unmount or when dependencies change
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
