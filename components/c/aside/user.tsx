// components/c/aside/user.tsx

"use client";

import { Avatar } from "@nextui-org/react";
import Ripples from "react-ripples";
import React from "react";

interface CAsideUserProps {
  user: {
    user_id: string;
    display_name: string;
  };
  onClick: () => void;
}

export const CAsideUser: React.FC<CAsideUserProps> = ({ user, onClick }) => {
  const userName = user.display_name || user.user_id;

  return (
    // @ts-ignore
    <Ripples
      className={`w-full max-w-sm py-2 px-3 flex flex-row gap-3 items-center rounded-xl cursor-pointer flex-shrink-0 hover:bg-[#f4f4f5] dark:hover:bg-[#2c2c2c]`}
      color={"rgba(0, 0, 0, 0.1)"}
      during={1400}
      onClick={onClick}
    >
      <Avatar
        className="w-14 h-14 min-w-14 min-h-14 text-small"
        name={userName}
      />
      <div className="flex flex-col justify-between items-start w-full max-w-[17vw]">
        <div className="w-full flex flex-row items-center justify-between">
          <span className={`text-sm font-bold truncate dark:text-white`}>
            {userName}
          </span>
        </div>
        <span
          className={`truncate w-full overflow-hidden text-ellipsis text-default-500 dark:text-default-500`}
        >
          {user.user_id}
        </span>
      </div>
    </Ripples>
  );
};
