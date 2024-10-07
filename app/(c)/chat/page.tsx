"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { BaseMessage } from "@/components/c/content/BaseMessage";
import { MessageStatus, MessageTarget } from "@/types/messages";
import { DocumentMessage } from "@/components/c/content/DocumentMessage";

export default function Chat() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Ensures proper client-side rendering

  const isDarkTheme = theme === "dark";

  return (
    <section className="h-full relative flex flex-col items-center justify-center gap-4 py-8 md:py-10 text-black dark:text-white">
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
      <div className="relative z-10">
        <div className="w-full h-full flex flex-col gap-3">
          <BaseMessage
            message="Hello, this is a basic message!Hello, this is a basic message!Hello, this is a basic message!Hello, this is a basic message!Hello, this is a basic message!"
            status={MessageStatus.READ}
            target={MessageTarget.SENDER}
            time="10:30 AM"
          />
          <BaseMessage
            message="Hello, this is a basic message!Hello, this is a basic message!Hello, this is a basic message!Hello, this is a basic message!Hello, this is a basic message!"
            status={MessageStatus.READ}
            target={MessageTarget.RECEIVER}
            time="10:30 AM"
          />
          <DocumentMessage
            documentLink="https://github.com/TA72-Projet-Tutore-Messecure/messecure-frontend"
            documentName="Secret.pdf"
            documentSize="2MB"
            message="This is the document for toto"
            status={MessageStatus.READ}
            target={MessageTarget.SENDER}
            time="10:30 AM"
          />
        </div>
      </div>
    </section>
  );
}
