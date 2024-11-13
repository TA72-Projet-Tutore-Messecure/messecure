// components/c/aside/conversation.tsx

"use client";

import { Avatar } from "@nextui-org/react";
import Ripples from "react-ripples";
import React from "react";
import { Room } from "matrix-js-sdk";

interface CAsideConversationProps {
  room: Room;
  active: boolean;
  onClick: () => void;
}

export const CAsideConversation: React.FC<CAsideConversationProps> = ({
  room,
  active,
  onClick,
}) => {
  const roomName = room.name || room.roomId;
  const lastEvent = room.timeline[room.timeline.length - 1];
  const lastMessage = lastEvent?.getContent()?.body || "";
  const lastTimestamp = lastEvent?.getDate()?.toLocaleTimeString() || "";

  return (
    // @ts-ignore
    <Ripples
      className={`w-full max-w-sm py-2 px-3 flex flex-row gap-3 items-center rounded-xl cursor-pointer flex-shrink-0
                   ${
                     active
                       ? "bg-[#3390ec] dark:bg-[#8472dc]"
                       : "hover:bg-[#f4f4f5] dark:hover:bg-[#2c2c2c]"
                   }`}
      color={"rgba(0, 0, 0, 0.1)"}
      during={1400}
      onClick={onClick}
    >
      <Avatar
        className="w-14 h-14 min-w-14 min-h-14 text-small"
        name={roomName}
      />
      <div className="flex flex-col justify-between items-start w-full max-w-[17vw]">
        <div className="w-full flex flex-row items-center justify-between">
          <span
            className={`text-sm font-bold truncate ${
              active ? "text-white" : "dark:text-white"
            }`}
          >
            {roomName}
          </span>
          <span
            className={`text-xs ${
              active ? "text-white" : "dark:text-white/30"
            }`}
          >
            {lastTimestamp}
          </span>
        </div>
        <span
          className={`truncate w-full overflow-hidden text-ellipsis ${
            active ? "text-white" : "text-default-500 dark:text-default-500"
          }`}
        >
          {lastMessage}
        </span>
      </div>
    </Ripples>
  );
};
