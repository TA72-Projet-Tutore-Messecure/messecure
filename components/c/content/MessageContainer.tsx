// components/c/content/MessageContainer.tsx

"use client";

import React, { useEffect, useRef } from "react";
import { MatrixEvent } from "matrix-js-sdk";

import { BaseMessage } from "@/components/c/content/messages/BaseMessage";
import { MessageStatus, MessageTarget } from "@/types/messages";
import MatrixService from "@/services/MatrixService";
import { useMatrix } from "@/context/MatrixContext";

export const MessageContainer: React.FC = () => {
  const { messages, selectedRoom } = useMatrix();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!selectedRoom) {
    return (
      <div className="flex items-center justify-center h-full">
        No conversations available.
      </div>
    );
  }

  return (
    <div className="w-full h-full py-2 flex flex-col gap-3 overflow-y-auto max-h-[80vh]">
      {messages.map((event: MatrixEvent) => {
        const sender = event.getSender();
        const content = event.getContent();
        const message = content.body || "";
        const time = event.getDate()?.toLocaleTimeString() || "";
        const target =
          sender === MatrixService.getClient().getUserId()
            ? MessageTarget.SENDER
            : MessageTarget.RECEIVER;

        return (
          <BaseMessage
            key={event.getId()}
            message={message}
            status={MessageStatus.READ}
            target={target}
            time={time}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
