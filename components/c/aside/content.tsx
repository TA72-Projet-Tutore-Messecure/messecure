// components/c/aside/content.tsx

"use client";

import React from "react";
import { toast } from "react-hot-toast";

import { CAsideConversation } from "@/components/c/aside/conversation";
import { CAsideUser } from "@/components/c/aside/user";
import { useMatrix } from "@/context/MatrixContext";
import MatrixService from "@/services/MatrixService";

interface CAsideContentProps {
  searchTerm: string;
  searchResults: any[];
  setSearchTerm: (term: string) => void;
}

export const CAsideContent: React.FC<CAsideContentProps> = ({
  searchTerm,
  searchResults,
  setSearchTerm,
}) => {
  const { rooms, selectedRoom, selectRoom, clientReady, refreshRooms } =
    useMatrix();

  const handleStartDM = async (userId: string) => {
    try {
      // Clear the search term
      setSearchTerm("");

      // Start direct message (will return existing room if it exists)
      const roomId = await MatrixService.startDirectMessage(userId);

      // Refresh rooms
      await refreshRooms();

      // Select the room
      selectRoom(roomId);
    } catch (error) {
      toast.error("Failed to start direct message");
    }
  };

  const handleAcceptInvitation = async (roomId: string) => {
    try {
      await MatrixService.acceptInvitation(roomId);
      await refreshRooms();
      selectRoom(roomId);
    } catch (error) {
      //console.error(error);
      toast.error("Failed to accept invitation");
    }
  };

  const handleDeclineInvitation = async (roomId: string) => {
    try {
      await MatrixService.declineInvitation(roomId);
      await refreshRooms();

      // If the declined room was selected, deselect it
      if (selectedRoom?.roomId === roomId) {
        selectRoom(null);
      }
    } catch (error) {
      //console.error(error);
      toast.error("Failed to decline invitation");
    }
  };

  if (!clientReady) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading rooms...
      </div>
    );
  }

  return (
    <div className="w-full max-w-full flex flex-col items-center py-2 px-2 overflow-y-auto">
      {searchTerm.trim() !== "" && searchResults.length > 0
        ? searchResults.map((user) => (
            <CAsideUser
              key={user.user_id}
              user={user}
              onClick={() => handleStartDM(user.user_id)}
            />
          ))
        : rooms.map((room) => {
            // Determine if the room is a direct message
            const isDirectRoom = MatrixService.isDirectRoom(room.roomId);
            const isDM = MatrixService.isDMRoomInvitedMember(room);
            const isDirectMessage = isDirectRoom || isDM;

            return (
              <CAsideConversation
                key={room.roomId}
                active={selectedRoom?.roomId === room.roomId}
                // @ts-ignore
                isDirectMessage={isDirectMessage} // Pass this prop if needed
                room={room}
                onAccept={() => handleAcceptInvitation(room.roomId)}
                onClick={() => {
                  if (room.getMyMembership() === "invite") {
                    // Do nothing on click; user must accept or decline
                  } else {
                    selectRoom(room.roomId);
                  }
                }}
                onDecline={() => handleDeclineInvitation(room.roomId)}
              />
            );
          })}
    </div>
  );
};
