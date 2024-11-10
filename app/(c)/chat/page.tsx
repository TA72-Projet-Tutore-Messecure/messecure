"use client";

import { useState, useEffect } from "react";
import { Spinner } from "@nextui-org/react";

import { MessageContainer } from "@/components/c/content/MessageContainer";
import { ChatHeader } from "@/components/c/content/ChatHeader";
import { ChatBackground } from "@/components/c/content/ChatBackground";
import { ChatMessageBar } from "@/components/c/content/ChatMessageBar";

export default function Chat() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay or fetch logic here
    const timer = setTimeout(() => setLoading(false), 1000); // Adjust time if needed

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner color="primary" label="Loading" labelColor="primary" />
      </div>
    );
  }

  return (
    <section className="h-full relative flex flex-col items-center pb-4 text-black dark:text-white">
      <ChatBackground />
      <ChatHeader />
      <MessageContainer />
      <ChatMessageBar />
    </section>
  );
}
