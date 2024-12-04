// context/MatrixContext.tsx

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Room, MatrixEvent, SyncState } from "matrix-js-sdk";
import { toast } from "react-hot-toast";

import MatrixService from "@/services/MatrixService";
import { usePathname, useRouter } from "next/navigation";

interface MatrixContextProps {
  rooms: Room[];
  selectedRoom: Room | null;
  selectRoom: (roomId: string | null) => void;
  messages: MatrixEvent[];
  sendMessage: (message: string) => Promise<void>;
  deleteMessage: (eventId: string) => Promise<void>;
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
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Refreshes the list of rooms by fetching them from the Matrix client
   * and sorting them by their last active timestamp.
   * Also removes any direct message rooms where the invitation was declined.
   */
  const refreshRooms = useCallback(async () => {
    const client = MatrixService.getClient();
    const myUserId = client.getUserId();
    let allRooms = client.getRooms();

    // Rooms to leave
    const roomsToLeave: string[] = [];

    // Filter rooms and identify rooms to leave
    allRooms = allRooms.filter((room) => {
      const myMembership = room.getMyMembership();
      const isJoinedOrInvited = myMembership === "join" || myMembership === "invite";

      if (!isJoinedOrInvited) {
        // Skip rooms where user is not joined or invited
        return false;
      }

      // Check if it's a direct message room
      const isDirect = MatrixService.isDirectRoom(room.roomId);
      const isDM = MatrixService.isDMRoomInvitedMember(room);
      const direct = isDirect || isDM;

      if (direct) {
        const members = room.getMembers();
        const otherMembers = members.filter((member) => member.userId !== myUserId);

        // Check the membership status of the other user
        if (otherMembers.length === 1) {
          const otherMember = otherMembers[0];

          if (otherMember.membership === "leave") {
            // The other user has declined the invitation or left the DM
            roomsToLeave.push(room.roomId);

            return false; // Exclude this room from the rooms list
          } else if (
            otherMember.membership === "invite" ||
            otherMember.membership === "join"
          ) {
            // The other user is still invited or has joined
            return true; // Include this room
          } else {
            // Other memberships like "ban" or "knock", handle as needed
            return true; // For now, include the room
          }
        } else {
          // No other members or multiple members (group chat), include the room
          return true;
        }
      }

      return true; // Include this room
    });

    // Leave rooms where the invitation was declined
    for (const roomId of roomsToLeave) {
      try {
        await client.leave(roomId);
      } catch (error) {
        toast.error(`Failed to leave room ${roomId}`);
      }
    }

    // Refresh rooms after leaving
    allRooms = client.getRooms();

    // Filter and sort again after leaving
    allRooms = allRooms.filter((room) => {
      const myMembership = room.getMyMembership();

      return myMembership === "join" || myMembership === "invite";
    });

    allRooms.sort(
      (a, b) => b.getLastActiveTimestamp() - a.getLastActiveTimestamp()
    );

    setRooms(allRooms);

    // Log room data
    allRooms.forEach((room) => {
      const roomId = room.roomId;
      const roomName = room.name || roomId;
      const members = room.getMembers().map((member) => ({
        userId: member.userId,
        membership: member.membership,
      }));
      const isDirect = MatrixService.isDirectRoom(roomId);
      const isDM = MatrixService.isDMRoomInvitedMember(room);

      console.log("Room Data:", {
        roomId,
        roomName,
        isDirect,
        isDM,
        members,
      });
    });
  }, []);

  /**
   * Selects a room by its ID and fetches its message timeline.
   * Filters out non-message events to prevent empty messages.
   * @param roomId - The ID of the room to select.
   */
  const selectRoom = useCallback((roomId: string | null) => {
    if (roomId === null) {
      setSelectedRoom(null);
      setMessages([]);

      return;
    }

    // Get the room directly from the client
    const room = MatrixService.getClient().getRoom(roomId) || null;

    setSelectedRoom(room);
    if (room) {
      // Fetch live timeline events and filter only message events
      const timeline = room.getLiveTimeline().getEvents().filter(isMessageEvent);

      setMessages(timeline);
    } else {
      setMessages([]);
    }
    if (pathname !== "/chat") {
      router.push("/chat");
    }
  }, []);

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
    [selectedRoom]
  );

  /**
   * Deletes a message in the currently selected room.
   * @param eventId - The ID of the event (message) to delete.
   */
  const deleteMessage = useCallback(
    async (eventId: string) => {
      if (selectedRoom) {
        try {
          await MatrixService.deleteMessage(selectedRoom.roomId, eventId);
          // Update the messages state
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.getId() === eventId
                ? selectedRoom.findEventById(eventId) || msg
                : msg
            )
          );
        } catch (error) {
          toast.error("Failed to delete message");
        }
      }
    },
    [selectedRoom]
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
          if (state === "PREPARED" || state === "SYNCING" || state === "CATCHUP") {
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
      if (room.roomId === selectedRoom?.roomId && isMessageEvent(event)) {
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

  /**
   * Listens for changes in room memberships to refresh rooms.
   */
  useEffect(() => {
    if (!clientReady) return;

    const client = MatrixService.getClient();

    /**
     * Handler for membership changes.
     */
    const onRoomMember = () => {
      refreshRooms();
    };
    // @ts-ignore
    client.on("RoomMember.membership", onRoomMember);

    return () => {
      // @ts-ignore
      client.removeListener("RoomMember.membership", onRoomMember);
    };
  }, [clientReady, refreshRooms]);

  return (
    <MatrixContext.Provider
      value={{
        rooms,
        selectedRoom,
        selectRoom,
        messages,
        sendMessage,
        deleteMessage,
        refreshRooms,
        clientReady,
      }}
    >
      {children}
    </MatrixContext.Provider>
  );
};
