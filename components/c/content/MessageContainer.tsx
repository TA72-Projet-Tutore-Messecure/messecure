// components/c/content/MessageContainer.tsx

"use client";

import React, { useEffect, useRef, useState } from "react";
import { MatrixEvent, RoomMember, Room } from "matrix-js-sdk";

import { BaseMessage } from "@/components/c/content/messages/BaseMessage";
import { DocumentMessage } from "@/components/c/content/messages/DocumentMessage";
import { ImageMessage } from "@/components/c/content/messages/ImageMessage";
import { MessageStatus, MessageTarget } from "@/types/messages";
import MatrixService from "@/services/MatrixService";
import { useMatrix } from "@/context/MatrixContext";

export const MessageContainer: React.FC = () => {
  const { messages, selectedRoom } = useMatrix();

  // Refs and state hooks
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [otherUserJoined, setOtherUserJoined] = useState(true);
  const [messageStatuses, setMessageStatuses] = useState<{
    [eventId: string]: MessageStatus;
  }>({});

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Effect to handle room selection and event listeners
  useEffect(() => {
    if (!selectedRoom) {
      setOtherUserJoined(true);
      setMessageStatuses({});

      return;
    }

    const client = MatrixService.getClient();
    const myUserId = client.getUserId();
    const room = selectedRoom;

    // Determine if the room is a direct message
    const isDirectRoom = MatrixService.isDirectRoom(selectedRoom.roomId);
    const isDM = MatrixService.isDMRoomInvitedMember(selectedRoom);
    const isDirectMessage = isDirectRoom || isDM;

    // Function to update the 'otherUserJoined' state
    const updateOtherUserJoined = () => {
      if (!isDirectMessage) {
        // For group rooms, no need to check other users
        setOtherUserJoined(true);

        return;
      }

      const members = room.getMembers();
      const otherMembers = members.filter(
        (member) => member.userId !== myUserId,
      );

      // Check if any other member has joined
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
          // Messages sent by others
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

    // Event listeners
    const handleMemberEvent = (event: MatrixEvent, member: RoomMember) => {
      if (member.userId !== myUserId) {
        if (member.membership === "join" || member.membership === "leave") {
          updateOtherUserJoined();
          updateMessageStatuses();
        }
      }
    };

    const handleReceiptEvent = () => {
      updateMessageStatuses();
    };

    const handleRoomTimeline = (event: MatrixEvent, room: Room) => {
      if (
        room.roomId === selectedRoom?.roomId &&
        event.getType() === "m.room.message"
      ) {
        updateMessageStatuses();
      }
    };

    // Attach listeners
    // @ts-ignore
    room.on("RoomMember.membership", handleMemberEvent);
    // @ts-ignore
    room.on("Room.receipt", handleReceiptEvent);
    // @ts-ignore
    room.on("Room.timeline", handleRoomTimeline);

    // Cleanup listeners
    return () => {
      // @ts-ignore
      room.removeListener("RoomMember.membership", handleMemberEvent);
      // @ts-ignore
      room.removeListener("Room.receipt", handleReceiptEvent);
      // @ts-ignore
      room.removeListener("Room.timeline", handleRoomTimeline);
    };
  }, [selectedRoom, messages]);

  // Conditional rendering when no room is selected
  if (!selectedRoom) {
    return (
      <div className="flex items-center justify-center h-full">
        No conversations available.
      </div>
    );
  }

  // Determine if the room is a direct message
  const isDirectRoom = MatrixService.isDirectRoom(selectedRoom.roomId);
  const isDM = MatrixService.isDMRoomInvitedMember(selectedRoom);
  const isDirectMessage = isDirectRoom || isDM;
  const isGroupRoom = !isDirectMessage;

  return (
    <div className="relative w-full h-full py-2 flex flex-col gap-3 overflow-y-auto max-h-[80vh]">
      {messages.map((event: MatrixEvent) => {
        const sender = event.getSender();
        const content = event.getContent();
        const msgType = content.msgtype;
        const isRedacted = event.isRedacted();
        const dateObj = event.getDate();
        const time = dateObj
          ? dateObj.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "";

        // Determine whether this message was sent by me or not
        const currentUserId = MatrixService.getClient().getUserId();
        const target =
          sender === currentUserId
            ? MessageTarget.SENDER
            : MessageTarget.RECEIVER;

        // If you have status logic, pull from your existing code
        const status = messageStatuses[event.getId()!] ?? MessageStatus.SENT;

        // If it's a group room and the message is from another user, show their name
        let senderName: string | undefined = undefined;

        if (isGroupRoom && target === MessageTarget.RECEIVER) {
          // You can use the event's RoomMember display name or fallback to userId
          senderName = event.sender?.name || event.getSender();
        }

        // Render based on msgType
        if (msgType === "m.file" && !isRedacted) {
          // Document message
          const documentName = content.body || "Untitled";
          const documentSize = content.info?.size
            ? formatFileSize(content.info.size)
            : "Unknown size";
          const documentLink = content.url || "#";

          return (
            <DocumentMessage
              key={event.getId()}
              documentLink={documentLink}
              documentName={documentName}
              documentSize={documentSize}
              eventId={event.getId()!}
              isGroupRoom={isGroupRoom}
              isRedacted={false}
              message={""}
              senderName={senderName}
              status={status}
              target={target}
              time={time}
            />
          );
        } else if (msgType === "m.image" && !isRedacted) {
          // Image message
          const imageLink = content.url || "#";
          const imageName = content.body || "image";

          return (
            <ImageMessage
              key={event.getId()}
              eventId={event.getId()!}
              imageLink={imageLink}
              isGroupRoom={isGroupRoom}
              isRedacted={false}
              status={status}
              target={target}
              time={time}
              imageName={imageName}
              /** pass these new props */
              senderName={senderName}
            />
          );
        } else if (isRedacted) {
          // Redacted message => show placeholder
          return (
            <BaseMessage
              key={event.getId()}
              eventId={event.getId()!}
              isGroupRoom={isGroupRoom}
              isRedacted={true}
              status={status}
              target={target}
              time={time}
              message="Message deleted"
              /** pass these new props */
              senderName={senderName}
            />
          );
        } else {
          // Regular text message
          const message = content.body || "";

          return (
            <BaseMessage
              key={event.getId()}
              eventId={event.getId()!}
              isGroupRoom={isGroupRoom}
              isRedacted={false}
              status={status}
              target={target}
              time={time}
              message={message}
              /** pass these new props */
              senderName={senderName}
            />
          );
        }
      })}

      <div ref={messagesEndRef} />
    </div>
  );
};

// Helper function to format file size
const formatFileSize = (sizeInBytes: number): string => {
  if (sizeInBytes >= 1e9) {
    return `${(sizeInBytes / 1e9).toFixed(2)} GB`;
  }
  if (sizeInBytes >= 1e6) {
    return `${(sizeInBytes / 1e6).toFixed(2)} MB`;
  }
  if (sizeInBytes >= 1e3) {
    return `${(sizeInBytes / 1e3).toFixed(2)} KB`;
  }

  return `${sizeInBytes} Bytes`;
};
