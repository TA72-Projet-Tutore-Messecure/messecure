// components/c/content/MessageContainer.tsx

"use client";

import React, { useEffect, useRef, useState } from "react";
import { MatrixEvent, RoomMember } from "matrix-js-sdk";

import { BaseMessage } from "@/components/c/content/messages/BaseMessage";
import { MessageStatus, MessageTarget } from "@/types/messages";
import MatrixService from "@/services/MatrixService";
import { useMatrix } from "@/context/MatrixContext";

export const MessageContainer: React.FC = () => {
  const { messages, selectedRoom } = useMatrix();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [otherUserJoined, setOtherUserJoined] = useState(true);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (selectedRoom) {
      const client = MatrixService.getClient();
      const myUserId = client.getUserId();
      const room = selectedRoom;

      // Function to update the 'otherUserJoined' state
      const updateOtherUserJoined = () => {
        const members = room.getMembers();
        const otherMembers = members.filter(
          (member) => member.userId !== myUserId
        );

        // Check if any of the other members have joined
        const otherUserHasJoined = otherMembers.some(
          (member) => member.membership === "join"
        );

        setOtherUserJoined(otherUserHasJoined);
      };

      // Initial check
      updateOtherUserJoined();

      // Listen for membership changes
      const handleMemberEvent = (event: MatrixEvent, member: RoomMember) => {
        if (member.roomId === room.roomId && member.userId !== myUserId) {
          if (member.membership === "join" || member.membership === "leave") {
            updateOtherUserJoined();
          }
        }
      };

      client.on("RoomMember.membership", handleMemberEvent);

      return () => {
        client.removeListener("RoomMember.membership", handleMemberEvent);
      };
    } else {
      setOtherUserJoined(true); // Reset state when no room is selected
    }
  }, [selectedRoom]);

  if (!selectedRoom) {
    return (
      <div className="flex items-center justify-center h-full">
        No conversations available.
      </div>
    );
  }

  return (
    <div className="w-full h-full py-2 flex flex-col gap-3 overflow-y-auto max-h-[80vh]">
      {!otherUserJoined && (
        <div className="w-full flex flex-row justify-center">
          <div
            className="relative text-black bg-orange-200 dark:text-white dark:!bg-red-600 rounded-xl  px-4 py-2 flex flex-col max-w-[43%] gap-1">
            <div>The user has not joined yet.</div>
          </div>
        </div>
      )}
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
