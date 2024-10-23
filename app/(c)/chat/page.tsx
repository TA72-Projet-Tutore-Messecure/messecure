"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { Input } from "@nextui-org/input";
import { FaPaperclip, FaPaperPlane, FaSmile } from "react-icons/fa";
import { Button } from "@nextui-org/button";

import { BaseMessage } from "@/components/c/content/BaseMessage";
import { MessageStatus, MessageTarget } from "@/types/messages";
import { DocumentMessage } from "@/components/c/content/DocumentMessage";

export default function Chat() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef(null); // Ref to track the message container

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    scrollToBottom(); // Scroll to bottom when component mounts
  }, [mounted]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // @ts-ignore
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!mounted) return null; // Ensures proper client-side rendering

  const isDarkTheme = theme === "dark";

  return (
    <section className="h-full relative flex flex-col items-center py-4 gap-4 text-black dark:text-white">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: isDarkTheme
            ? 'url("/chat-background.svg")'
            : 'url("/chat-background.svg"), linear-gradient(to bottom left, rgba(217, 249, 157, 0.8), rgba(52, 211, 153, 0.8), rgba(22, 163, 74, 0.8))',
          filter: isDarkTheme ? "invert(1)" : "none",
          backgroundSize: "auto", // This ensures the entire image is visible
          backgroundRepeat: "repeat", // Prevents the image from repeating
          backgroundPosition: "center", // Keeps the image centered
        }}
      />
      <div className="w-full h-full flex flex-col gap-3 overflow-y-auto max-h-[85vh]">
        {/* Chat messages */}
        <BaseMessage
          message="Hello, this is a basic message!"
          status={MessageStatus.READ}
          target={MessageTarget.SENDER}
          time="10:30 AM"
        />
        <BaseMessage
          message="Hello, this is a basic message!"
          status={MessageStatus.READ}
          target={MessageTarget.SENDER}
          time="10:30 AM"
        />
        <BaseMessage
          message="Hello, this is a basic message!"
          status={MessageStatus.READ}
          target={MessageTarget.RECEIVER}
          time="10:30 AM"
        />
        <BaseMessage
          message="Hello, this is a basic message!"
          status={MessageStatus.READ}
          target={MessageTarget.RECEIVER}
          time="10:30 AM"
        />
        <BaseMessage
          message="Hello, this is a basic message!"
          status={MessageStatus.READ}
          target={MessageTarget.RECEIVER}
          time="10:30 AM"
        />
        <BaseMessage
          message="Hello, this is a basic message!"
          status={MessageStatus.READ}
          target={MessageTarget.RECEIVER}
          time="10:30 AM"
        />
        <BaseMessage
          message="Hello, this is a basic message!"
          status={MessageStatus.READ}
          target={MessageTarget.RECEIVER}
          time="10:30 AM"
        />
        <BaseMessage
          message="Hello, this is a basic message!"
          status={MessageStatus.READ}
          target={MessageTarget.RECEIVER}
          time="10:30 AM"
        />
        <BaseMessage
          message="Hello, this is a basic message!"
          status={MessageStatus.READ}
          target={MessageTarget.RECEIVER}
          time="10:30 AM"
        />
        <BaseMessage
          message="Hello, this is a basic message!"
          status={MessageStatus.READ}
          target={MessageTarget.RECEIVER}
          time="10:30 AM"
        />
        <BaseMessage
          message="Hello, this is a basic message!"
          status={MessageStatus.READ}
          target={MessageTarget.RECEIVER}
          time="10:30 AM"
        />
        <BaseMessage
          message="Hello, this is a basic message!"
          status={MessageStatus.READ}
          target={MessageTarget.RECEIVER}
          time="10:30 AM"
        />
        <BaseMessage
          message="Hello, this is a basic message!"
          status={MessageStatus.READ}
          target={MessageTarget.RECEIVER}
          time="10:30 AM"
        />
        <BaseMessage
          message="Hello, this is a basic message!"
          status={MessageStatus.READ}
          target={MessageTarget.RECEIVER}
          time="10:30 AM"
        />
        <BaseMessage
          message="Hello, this is a basic message!"
          status={MessageStatus.READ}
          target={MessageTarget.RECEIVER}
          time="10:30 AM"
        />
        <BaseMessage
          message="Hello, this is a basic message!"
          status={MessageStatus.READ}
          target={MessageTarget.RECEIVER}
          time="10:30 AM"
        />
        <BaseMessage
          message="Hello, this is a basic message!"
          status={MessageStatus.READ}
          target={MessageTarget.RECEIVER}
          time="10:30 AM"
        />
        <BaseMessage
          message="Hello, this is a basic message!"
          status={MessageStatus.READ}
          target={MessageTarget.RECEIVER}
          time="10:30 AM"
        />
        <BaseMessage
          message="Hello, this is a basic message!"
          status={MessageStatus.READ}
          target={MessageTarget.RECEIVER}
          time="10:30 AM"
        />
        <BaseMessage
          message="Hello, this is a basic message!"
          status={MessageStatus.READ}
          target={MessageTarget.RECEIVER}
          time="10:30 AM"
        />
        <BaseMessage
          message="Hello, this is a basic message!"
          status={MessageStatus.READ}
          target={MessageTarget.RECEIVER}
          time="10:30 AM"
        />

        <DocumentMessage
          documentLink="https://github.com/TA72-Projet-Tutore-Messecure/messecure-frontend"
          documentName="Secret.pdf"
          documentSize="2MB"
          message="This is the document for review"
          status={MessageStatus.READ}
          target={MessageTarget.SENDER}
          time="10:30 AM"
        />
        {/* End of messages placeholder */}
        <div ref={messagesEndRef} />
      </div>
      <div className="w-full flex flex-row gap-1 px-32">
        <Input
          color="default"
          endContent={<FaPaperclip className="cursor-pointer" />}
          placeholder="Message"
          size="lg"
          startContent={<FaSmile className="cursor-pointer" />}
        />
        <Button
          className="rounded-xl bg-white dark:bg-[#766ac8]"
          size="lg"
          startContent={<FaPaperPlane />}
        />
      </div>
    </section>
  );
}
