// components/c/content/ChatMessageBar.tsx

"use client";

import React, { useState } from "react";
import { FaPaperclip, FaPaperPlane } from "react-icons/fa";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { FaFaceSmile } from "react-icons/fa6";

import { useMatrix } from "@/context/MatrixContext";

export const ChatMessageBar: React.FC = () => {
  const [message, setMessage] = useState("");
  const { sendMessage, selectedRoom } = useMatrix();

  const handleSend = async () => {
    if (message.trim() !== "" && selectedRoom) {
      let messageToSend = message.trim();
      setMessage("");
      await sendMessage(messageToSend);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { // Changed from handleKeyPress to handleKeyDown
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full flex flex-row gap-1 px-32">
      <Input
        color="default"
        endContent={
          <FaPaperclip className="cursor-pointer w-5 h-5 text-gray-500 dark:text-white hover:text-[#3390ec] dark:hover:text-[#766ac8]" />
        }
        isDisabled={!selectedRoom}
        placeholder="Message"
        size="lg"
        startContent={
          <FaFaceSmile className="cursor-pointer w-5 h-5 text-gray-500 dark:text-white hover:text-[#3390ec] dark:hover:text-[#766ac8]" />
        }
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown} // Updated event handler
      />
      <Button
        type="button" // Explicitly set the button type to prevent form submission behavior
        className="rounded-xl bg-white dark:bg-[#766ac8]"
        isDisabled={!selectedRoom}
        size="lg"
        startContent={<FaPaperPlane />}
        onClick={handleSend}
      />
    </div>
  );
};

export default ChatMessageBar;
