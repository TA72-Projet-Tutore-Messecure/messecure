import React from "react";
import { Avatar } from "@nextui-org/react";
import { FaSearch } from "react-icons/fa";

import { VerticalDotsIcon } from "@/components/icons";

export const ChatHeader: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#212121] w-full flex justify-between flex-row h-[10vh] z-50 shadow items-center">
      <div className="flex flex-row items-center gap-3 ml-[2vw]">
        <Avatar
          isBordered
          className="cursor-pointer"
          color="primary"
          name="User name"
          size="md"
          src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
        />
        <h3 className="cursor-pointer text-black dark:text-white text-lg">
          Madoc Lefèvre
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
