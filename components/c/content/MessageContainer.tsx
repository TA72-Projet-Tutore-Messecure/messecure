// components/c/content/MessageContainer.tsx

"use client";

import React, { useEffect, useRef, useState } from "react";
import { MatrixEvent, RoomMember, Room } from "matrix-js-sdk";

import { BaseMessage } from "@/components/c/content/messages/BaseMessage";
import { MessageStatus, MessageTarget } from "@/types/messages";
import MatrixService from "@/services/MatrixService";
import { useMatrix } from "@/context/MatrixContext";

export const MessageContainer: React.FC = () => {
  const { messages, selectedRoom } = useMatrix();

  // Hooks must be called unconditionally at the top level
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [otherUserJoined, setOtherUserJoined] = useState(true);
  const [messageStatuses, setMessageStatuses] = useState<{
    [eventId: string]: MessageStatus;
  }>({});

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!selectedRoom) {
      setOtherUserJoined(true);
      setMessageStatuses({});

      return;
    }

    const client = MatrixService.getClient();
    const myUserId = client.getUserId();
    const room = selectedRoom;

    // Determine if the room is a direct message using both isDirectRoom and isDMRoomInvitedMember
    const isDirectRoom = MatrixService.isDirectRoom(selectedRoom.roomId);
    const isDM = MatrixService.isDMRoomInvitedMember(selectedRoom);
    const isDirectMessage = isDirectRoom || isDM;

    // Function to update the 'otherUserJoined' state
    const updateOtherUserJoined = () => {
      if (!isDirectMessage) {
        // For group rooms, we don't need to check if other users have joined
        setOtherUserJoined(true);

        return;
      }

      const members = room.getMembers();
      const otherMembers = members.filter(
        (member) => member.userId !== myUserId,
      );

      // Check if any of the other members have joined
      const otherUserHasJoined = otherMembers.some(
        (member) => member.membership === "join",
      );

      setOtherUserJoined(otherUserHasJoined);
    };

    // Initial check
    updateOtherUserJoined();

    // Function to update message statuses
    const updateMessageStatuses = () => {
      const newStatuses: { [eventId: string]: MessageStatus } = {};
      const otherMembers = room
        .getMembers()
        .filter((m) => m.userId !== myUserId);
      const otherUserId =
        otherMembers.length > 0 ? otherMembers[0].userId : null;

      messages.forEach((event) => {
        if (event.getSender() === myUserId) {
          // Messages sent by me
          if (otherUserJoined && otherUserId) {
            const readUpToEventId = room.getEventReadUpTo(otherUserId);

            if (isEventRead(event, readUpToEventId)) {
              newStatuses[event.getId()!] = MessageStatus.READ;
            } else {
              newStatuses[event.getId()!] = MessageStatus.DELIVERED;
            }
          } else {
            newStatuses[event.getId()!] = MessageStatus.SENT;
          }
        } else {
          // Messages sent by other users
          newStatuses[event.getId()!] = MessageStatus.READ;
        }
      });

      setMessageStatuses(newStatuses);
    };

    // Helper function to check if an event has been read
    const isEventRead = (
      event: MatrixEvent,
      readUpToEventId: string | null,
    ) => {
      if (!readUpToEventId) return false;
      const eventIndex = messages.findIndex((e) => e.getId() === event.getId());
      const readEventIndex = messages.findIndex(
        (e) => e.getId() === readUpToEventId,
      );

      return eventIndex <= readEventIndex;
    };

    // Initial status update
    updateMessageStatuses();

    // Listen for membership changes
    const handleMemberEvent = (event: MatrixEvent, member: RoomMember) => {
      if (member.userId !== myUserId) {
        if (member.membership === "join" || member.membership === "leave") {
          updateOtherUserJoined();
          updateMessageStatuses();
        }
      }
    };

    // @ts-ignore
    room.on("RoomMember.membership", handleMemberEvent);

    // Listen for read receipts
    const handleReceiptEvent = () => {
      updateMessageStatuses();
    };

    // @ts-ignore
    room.on("Room.receipt", handleReceiptEvent);

    // Listen for new messages
    const handleRoomTimeline = (event: MatrixEvent, room: Room) => {
      if (
        room.roomId === selectedRoom?.roomId &&
        event.getType() === "m.room.message"
      ) {
        updateMessageStatuses();
      }
    };

    // @ts-ignore
    room.on("Room.timeline", handleRoomTimeline);

    // Clean up listeners on unmount or when room changes
    return () => {
      // @ts-ignore
      room.removeListener("RoomMember.membership", handleMemberEvent);
      // @ts-ignore
      room.removeListener("Room.receipt", handleReceiptEvent);
      // @ts-ignore
      room.removeListener("Room.timeline", handleRoomTimeline);
    };
  }, [selectedRoom, messages]);

  // After hooks and effects, you can conditionally render
  if (!selectedRoom) {
    return (
      <div className="flex items-center justify-center h-full">
        No conversations available.
      </div>
    );
  }

  // Determine if the room is a direct message using both isDirectRoom and isDM
  const isDirectRoom = MatrixService.isDirectRoom(selectedRoom.roomId);
  const isDM = MatrixService.isDMRoomInvitedMember(selectedRoom);
  const isDirectMessage = isDirectRoom || isDM;

  return (
    <div className="relative w-full h-full py-2 flex flex-col gap-3 overflow-y-auto max-h-[80vh]">
      {!otherUserJoined && isDirectMessage && (
        <div className="w-full flex flex-row justify-center">
          <div className="relative text-black bg-orange-200 dark:text-white dark:!bg-red-600 rounded-xl px-4 py-2 flex flex-col max-w-[43%] gap-1">
            <div>The user has not joined yet.</div>
          </div>
        </div>
      )}
      {messages.map((event: MatrixEvent) => {
        const sender = event.getSender();
        const content = event.getContent();
        let message = content.body || "";
        const time = event.getDate()?.toLocaleTimeString() || "";
        const target =
          sender === MatrixService.getClient().getUserId()
            ? MessageTarget.SENDER
            : MessageTarget.RECEIVER;
        const status = messageStatuses[event.getId()!] || MessageStatus.SENT;

        // Check if the event is redacted (deleted)
        const isRedacted = event.isRedacted();

        if (isRedacted) {
          message = "message deleted";
        }

        return (
          <BaseMessage
            key={event.getId()}
            eventId={event.getId()!}
            isRedacted={isRedacted}
            message={message}
            status={status}
            target={target}
            time={time}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
