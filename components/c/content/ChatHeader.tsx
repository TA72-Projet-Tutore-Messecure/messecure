// components/c/content/ChatHeader.tsx

"use client";

import React from "react";
import { Avatar } from "@nextui-org/react";
import { FaSearch } from "react-icons/fa";

import { useMatrix } from "@/context/MatrixContext";
import { DotDropdown } from "@/components/c/content/header/DotDropdown";

export const ChatHeader: React.FC = () => {
  const { selectedRoom } = useMatrix();

  if (!selectedRoom) {
    return null;
  }

  const roomName = selectedRoom.name || selectedRoom.roomId;

  // Determine if it's a group room
  const totalMembers = selectedRoom
    .getMembers()
    // @ts-ignore
    .filter((member) => ["join", "invite"].includes(member.membership)).length;
  const isGroupRoom = totalMembers > 2;

  const displayRoomName = isGroupRoom ? `${roomName} (group)` : roomName;

  return (
    <>
      <div className="bg-white dark:bg-[#212121] w-full flex justify-between h-[10vh] z-50 shadow items-center">
        <div className="flex flex-row items-center gap-3 ml-[2vw]">
          <Avatar
            isBordered
            className="cursor-pointer"
            color="primary"
            name={roomName}
            size="md"
          />
          <h3 className="cursor-pointer text-black dark:text-white text-lg">
            {displayRoomName}
          </h3>
        </div>
        <div className="flex flex-row items-center gap-4 mr-[2vw]">
          <FaSearch className="w-5 h-5 cursor-pointer" />
          <DotDropdown />
        </div>
      </div>
    </>
  );
};

export default ChatHeader;
