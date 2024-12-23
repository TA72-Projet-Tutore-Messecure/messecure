// components/c/content/ChatMessageBar.tsx

"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaPaperclip, FaPaperPlane } from "react-icons/fa";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { FaFaceSmile } from "react-icons/fa6";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import { toast } from "react-hot-toast";

import { useMatrix } from "@/context/MatrixContext";

export const ChatMessageBar: React.FC = () => {
  const [message, setMessage] = useState("");
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const { theme } = useTheme();
  const { sendMessage, uploadFile, selectedRoom } = useMatrix();
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (message.trim() !== "" && selectedRoom) {
      let messageToSend = message.trim();

      setMessage("");
      await sendMessage(messageToSend);
    }
  };

  const handleFileUpload = async () => {
    const input = document.createElement("input");

    input.type = "file";

    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;

      if (files && files.length > 0 && selectedRoom) {
        const file = files[0];

        try {
          await uploadFile(selectedRoom.roomId, file);
        } catch (error) {
          toast.error("Error uploading file");
        }
      }
    };

    input.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setEmojiPickerVisible(false);
      }
    };

    if (emojiPickerVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiPickerVisible]);

  return (
    <div className="w-full px-32">
      <div className="relative flex flex-row gap-1">
        {/* Emoji Picker */}
        {emojiPickerVisible && (
          <div
            ref={pickerRef}
            className="absolute bottom-full mb-2 left-0 z-50"
          >
            <EmojiPicker
              theme={theme === "light" ? Theme.LIGHT : Theme.DARK}
              onEmojiClick={(emoji) => addEmoji(emoji)}
              // Optionally, you can adjust the picker’s width and other styles here
            />
          </div>
        )}

        {/* Input Field */}
        <Input
          fullWidth
          color="default"
          endContent={
            <FaPaperclip
              className="cursor-pointer w-5 h-5 text-gray-500 dark:text-white hover:text-[#3390ec] dark:hover:text-[#766ac8]"
              onClick={handleFileUpload}
            />
          }
          isDisabled={!selectedRoom}
          placeholder="Message"
          size="lg"
          startContent={
            <FaFaceSmile
              className="cursor-pointer w-5 h-5 text-gray-500 dark:text-white hover:text-[#3390ec] dark:hover:text-[#766ac8]"
              onClick={() => setEmojiPickerVisible(!emojiPickerVisible)}
            />
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          className="rounded-xl bg-white dark:bg-[#766ac8]"
          isDisabled={!selectedRoom}
          size="lg"
          startContent={<FaPaperPlane />}
          type="button"
          onClick={handleSend}
        />
      </div>
    </div>
  );
};

export default ChatMessageBar;
