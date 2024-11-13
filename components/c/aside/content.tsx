// components/c/aside/content.tsx

"use client";

import React from "react";

import { CAsideConversation } from "@/components/c/aside/conversation";
import { useMatrix } from "@/context/MatrixContext";

export const CAsideContent: React.FC = () => {
  const { rooms, selectedRoom, selectRoom, clientReady } = useMatrix();

  if (!clientReady) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading rooms...
      </div>
    );
  }

  return (
    <div className="w-full max-w-full flex flex-col items-center py-2 px-2 overflow-y-auto">
      {rooms.map((room) => (
        <CAsideConversation
          key={room.roomId}
          active={selectedRoom?.roomId === room.roomId}
          room={room}
          onClick={() => selectRoom(room.roomId)}
        />
      ))}
    </div>
  );
};
