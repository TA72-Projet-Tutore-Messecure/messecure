import React from "react";
import { FaPaperclip, FaPaperPlane } from "react-icons/fa";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { FaFaceSmile } from "react-icons/fa6";

export const ChatMessageBar: React.FC = () => {
  return (
    <div className="w-full flex flex-row gap-1 px-32">
      <Input
        color="default"
        endContent={
          <FaPaperclip className="cursor-pointer w-5 h-5 text-gray-500 dark:text-white hover:text-[#3390ec] dark:hover:text-[#766ac8]" />
        }
        placeholder="Message"
        size="lg"
        startContent={
          <FaFaceSmile className="cursor-pointer w-5 h-5 text-gray-500 dark:text-white hover:text-[#3390ec] dark:hover:text-[#766ac8]" />
        }
      />
      <Button
        className="rounded-xl bg-white dark:bg-[#766ac8]"
        size="lg"
        startContent={<FaPaperPlane />}
      />
    </div>
  );
};

export default ChatMessageBar;
