// components/c/content/ChatHeader.tsx

"use client";

import React from "react";
import { Avatar } from "@nextui-org/react";
import { FaSearch } from "react-icons/fa";

import { VerticalDotsIcon } from "@/components/icons";
import { useMatrix } from "@/context/MatrixContext";

export const ChatHeader: React.FC = () => {
  const { selectedRoom } = useMatrix();

  if (!selectedRoom) {
    return null;
  }

  const roomName = selectedRoom.name || selectedRoom.roomId;

  return (
    <div className="bg-white dark:bg-[#212121] w-full flex justify-between flex-row h-[10vh] z-50 shadow items-center">
      <div className="flex flex-row items-center gap-3 ml-[2vw]">
        <Avatar
          isBordered
          className="cursor-pointer"
          color="primary"
          name={roomName}
          size="md"
        />
        <h3 className="cursor-pointer text-black dark:text-white text-lg">
          {roomName}
        </h3>
      </div>
      <div className="flex flex-row gap-4 mr-[2vw]">
        <FaSearch className="w-5 h-5 cursor-pointer" />
        <VerticalDotsIcon className="w-6 h-6 cursor-pointer" />
      </div>
    </div>
  );
};

export default ChatHeader;
