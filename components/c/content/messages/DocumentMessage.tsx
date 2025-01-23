// components/c/content/messages/DocumentMessage.tsx

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
import { FaFile, FaTrash } from "react-icons/fa";
import { toast } from "react-hot-toast";

import { useMatrix } from "@/context/MatrixContext";
import {
  DocumentMessageProps,
  MessageStatus,
  MessageTarget,
} from "@/types/messages";
import MatrixService from "@/services/MatrixService";

/**
 * Extend your DocumentMessageProps to optionally include:
 * - senderName?: string
 * - isGroupRoom?: boolean
 */

export const DocumentMessage: React.FC<
  DocumentMessageProps & {
    senderName?: string;
    isGroupRoom?: boolean;
  }
> = ({
  eventId,
  isRedacted,
  time,
  target,
  status,
  documentName,
  documentSize,
  documentLink,
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

  // handle click => download
  const handleDocumentClick = async () => {
    try {
      const blob = await MatrixService.fetchMediaAsBlob(documentLink);
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;
      a.download = documentName;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error("Failed to download the document.");
    }
  };

  // If redacted => placeholder
  if (isRedacted) {
    return (
      <div
        className={`w-full px-32 flex flex-row ${
          target === MessageTarget.SENDER ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`relative base-message ${
            target === MessageTarget.SENDER
              ? "message-sender text-black bg-[#eeffde] dark:text-white dark:!bg-[#766ac8] rounded-l-xl rounded-t-xl"
              : "bg-white dark:bg-[#212121] rounded-xl"
          } px-3 py-2 flex flex-col max-w-[33%] gap-1`}
        >
          <div className="message-deleted text-gray-500 dark:text-gray-400">
            Message deleted
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
            {target === MessageTarget.SENDER && (
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
      </div>
    );
  }

  // Container classes
  const containerWrapperClass = `w-full px-32 flex flex-row ${
    target === MessageTarget.SENDER ? "justify-end" : "justify-start"
  }`;
  const containerClass = `relative base-message ${
    target === MessageTarget.SENDER
      ? "message-sender text-black bg-[#eeffde] dark:text-white dark:!bg-[#766ac8] rounded-l-xl rounded-t-xl"
      : "bg-white dark:bg-[#212121] rounded-xl"
  } px-3 py-2 flex flex-col max-w-[33%] gap-1`;

  // Prepare dropdown actions
  const actions = [];

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

  // SENDER path => show 3 dots for action menu
  if (target === MessageTarget.SENDER) {
    return (
      <div className={containerWrapperClass} data-event-id={eventId}>
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
            <div className={containerClass} onContextMenu={handleContextMenu}>
              {/* If from me -> just the doc name + download */}
              <button
                className="message-content document-message flex items-center gap-2 w-full h-full"
                onClick={handleDocumentClick}
              >
                <div className="document-icon text-2xl">
                  <FaFile />
                </div>
                <div className="document-info max-w-60">
                  <div className="document-name font-semibold truncate">
                    {documentName}
                  </div>
                  <div className="document-size text-left text-sm">
                    {documentSize}
                  </div>
                </div>
              </button>

              {/* time + status at bottom-right */}
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
              </div>
            </div>
          </DropdownTrigger>

          <DropdownMenu aria-label="Message Actions" variant="faded">
            {actions}
          </DropdownMenu>
        </Dropdown>
      </div>
    );
  }

  // RECEIVER path => if group & from user => show senderName top-left in bigger text
  return (
    <div className={containerWrapperClass} data-event-id={eventId}>
      <div className={containerClass}>
        {target === MessageTarget.RECEIVER && isGroupRoom && senderName && (
          <div className="text-md text-primary font-bold">{senderName}</div>
        )}

        <button
          className="message-content document-message flex items-center gap-2 w-full h-full"
          onClick={handleDocumentClick}
        >
          <div className="document-icon text-2xl">
            <FaFile />
          </div>
          <div className="document-info max-w-60">
            <div className="document-name font-semibold truncate">
              {documentName}
            </div>
            <div className="document-size text-left text-sm">
              {documentSize}
            </div>
          </div>
        </button>

        <div className="message-info w-full flex flex-row justify-end items-center gap-1">
          <span
            className={`message-time ${
              // @ts-ignore
              target === MessageTarget.SENDER
                ? "text-[#60b75e] dark:text-[#aea7de]"
                : "text-[#47494c]"
            } text-xs`}
          >
            {time}
          </span>
        </div>
      </div>
    </div>
  );
};
