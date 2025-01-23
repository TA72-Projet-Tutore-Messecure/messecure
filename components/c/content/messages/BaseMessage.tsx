// components/c/content/messages/BaseMessage.tsx

"use client";

import React, { useState } from "react";
import { CheckIcon } from "@nextui-org/shared-icons";
import { CheckCheckIcon, Clock } from "lucide-react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { FaClipboard, FaTrash } from "react-icons/fa";
import { toast } from "react-hot-toast";

import { useMatrix } from "@/context/MatrixContext";
import {
  BaseMessageProps,
  MessageStatus,
  MessageTarget,
} from "@/types/messages";

/**
 * Extend your BaseMessageProps to optionally include:
 * - senderName?: string
 * - isGroupRoom?: boolean
 *
 * Make sure your "MessageContainer" or wherever you map events
 * sets senderName and isGroupRoom for group chats from other users.
 */

export const BaseMessage: React.FC<BaseMessageProps> = ({
  time,
  target,
  status,
  message,
  eventId,
  isRedacted,
  senderName,
  isGroupRoom,
}) => {
  const { deleteMessage } = useMatrix();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsPopoverOpen(true);
  };

  const handleClosePopover = () => {
    setIsPopoverOpen(false);
  };

  const handleDeleteMessage = () => {
    if (eventId) {
      deleteMessage(eventId);
      toast.error("Message deleted.");
    }
    handleClosePopover();
  };

  const handleCopyMessage = () => {
    if (message) {
      navigator.clipboard.writeText(message);
      toast.success("Message copied to clipboard.");
    }
    handleClosePopover();
  };

  // Collect available actions
  const actions = [];

  if (message && !isRedacted) {
    actions.push(
      <DropdownItem key="copyMessage" onClick={handleCopyMessage}>
        <span className="flex flex-row gap-2 items-center">
          <FaClipboard /> Copy Message
        </span>
      </DropdownItem>,
    );
  }

  // Add "Delete" if you are the sender and the message isn't redacted
  if (target === MessageTarget.SENDER && !isRedacted) {
    actions.push(
      <DropdownItem
        key="deleteMessage"
        color="danger"
        onClick={handleDeleteMessage}
      >
        <span className="flex flex-row gap-2 items-center">
          <FaTrash /> Delete Message
        </span>
      </DropdownItem>,
    );
  }

  if (actions.length === 0) {
    actions.push(
      <DropdownItem key="noAction" isReadOnly>
        No actions available.
      </DropdownItem>,
    );
  }

  return (
    <div
      className={`w-full px-32 flex flex-row ${
        target === MessageTarget.SENDER ? "justify-end" : "justify-start"
      }`}
    >
      <Dropdown
        classNames={{
          base: "before:bg-default-200",
          content: "py-1 px-1 backdrop-blur-md bg-opacity-80",
        }}
        isOpen={isPopoverOpen}
        placement="right"
        onOpenChange={setIsPopoverOpen}
      >
        <DropdownTrigger>
          <div
            className={`relative base-message ${
              target === MessageTarget.SENDER
                ? "message-sender text-black bg-[#eeffde] dark:text-white dark:!bg-[#766ac8] rounded-l-xl rounded-t-xl"
                : "bg-white dark:bg-[#212121] rounded-xl"
            } px-3 py-2 flex flex-col max-w-[43%] gap-1`}
            onContextMenu={handleContextMenu}
          >
            {/**
             * If this is a group room, the message is from another user,
             * and we have a senderName, show it top-left in bigger, primary color text.
             */}
            {target === MessageTarget.RECEIVER && isGroupRoom && senderName && (
              <div className="text-md text-primary font-bold">{senderName}</div>
            )}

            <div
              className={`message-content break-words ${
                isRedacted ? "italic text-gray-500 dark:text-gray-400" : ""
              }`}
            >
              {message}
            </div>
            <div className="message-info w-full flex flex-row justify-end items-center gap-1">
              <span
                className={`message-time ${
                  target === MessageTarget.SENDER
                    ? "text-[#60b75e] dark:text-[#aea7de]"
                    : "text-[#47494c]"
                } text-xs`}
              >
                {time}
              </span>
              {target === MessageTarget.SENDER && !isRedacted && (
                <span className="message-status">
                  {status === MessageStatus.SENT && (
                    <Clock className="w-3 text-[#4eb25b] dark:text-white font-bold" />
                  )}
                  {status === MessageStatus.DELIVERED && (
                    <CheckIcon className="text-[#4eb25b] dark:text-white font-bold" />
                  )}
                  {status === MessageStatus.READ && (
                    <CheckCheckIcon className="w-4 text-[#4eb25b] dark:text-white font-bold" />
                  )}
                </span>
              )}
            </div>
          </div>
        </DropdownTrigger>
        <DropdownMenu aria-label="Message Actions" variant="faded">
          {actions}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
