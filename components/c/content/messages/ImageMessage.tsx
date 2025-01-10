"use client";

import React, { useState, useEffect } from "react";
import { CheckIcon } from "@nextui-org/shared-icons";
import { CheckCheckIcon, Clock } from "lucide-react";
import { FaTrash, FaEllipsisV } from "react-icons/fa";
import { toast } from "react-hot-toast";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalContent,
} from "@nextui-org/react";
import Image from "next/image";

import { MessageStatus, MessageTarget } from "@/types/messages";
import { useMatrix } from "@/context/MatrixContext";
import MatrixService from "@/services/MatrixService";

interface ImageMessageProps {
  eventId: string;
  isRedacted: boolean;
  time: string;
  target: MessageTarget;
  status: MessageStatus;
  imageLink: string; // mxc:// link
  imageName?: string; // optional for alt text
}

export const ImageMessage: React.FC<ImageMessageProps> = ({
  eventId,
  isRedacted,
  time,
  target,
  status,
  imageLink,
  imageName = "image",
}) => {
  const { deleteMessage } = useMatrix();

  // Local state for the actual blob URL (preview)
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // For larger preview modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // For action menu (3 dots)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // 1. Fetch the media (blob) as soon as we have `imageLink`
  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;

    const fetchImage = async () => {
      try {
        const blob = await MatrixService.fetchMediaAsBlob(imageLink);

        if (!isMounted) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      } catch (error) {
        toast.error("Failed to fetch image.");
      }
    };

    if (imageLink && imageLink !== "#") {
      fetchImage();
    }

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imageLink]);

  // 2. Handle the 3‑dots menu
  const handleDeleteMessage = () => {
    if (eventId) {
      deleteMessage(eventId);
      toast.error("Message deleted.");
    }
    setIsPopoverOpen(false);
  };

  // 3. Clicking on the image => open bigger preview
  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  // 4. If the message is redacted, display a placeholder
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
          } flex flex-col gap-1 max-w-[33%] py-3 px-3`}
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

  // === Non-redacted path ===
  // Common classes for both SENDER / RECEIVER
  const containerWrapperClass = `w-full px-32 flex flex-row ${
    target === MessageTarget.SENDER ? "justify-end" : "justify-start"
  }`;
  const containerClass = `relative base-message ${
    target === MessageTarget.SENDER
      ? "message-sender text-black bg-[#eeffde] dark:text-white dark:!bg-[#766ac8] rounded-l-xl rounded-t-xl"
      : "bg-white dark:bg-[#212121] rounded-xl"
  } flex flex-col gap-1 max-w-[33%] py-3 px-3`;
  const messageTimeClass = `message-time ${
    target === MessageTarget.SENDER
      ? "text-[#60b75e] dark:text-[#aea7de]"
      : "text-[#47494c]"
  } text-xs`;

  // Only show "delete" action for the sender
  const actions = [];

  if (target === MessageTarget.SENDER) {
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

  // SENDER path => show 3 dots for the action menu
  if (target === MessageTarget.SENDER) {
    return (
      <>
        <div className={containerWrapperClass} data-event-id={eventId}>
          <div
            className={`${containerClass} relative`}
            style={{ position: "relative" }}
          >
            {/* The clickable image -> opens the big preview */}
            <button
              className="message-content image-message flex items-center justify-center"
              onClick={handleImageClick}
            >
              {blobUrl ? (
                <Image
                  alt={imageName}
                  className="rounded-lg max-w-full h-auto cursor-pointer mr-4"
                  height={200}
                  src={blobUrl}
                  width={200}
                />
              ) : (
                <div className="text-sm italic text-gray-500">
                  Loading image...
                </div>
              )}
            </button>

            {/* The 3 dots icon in top/right corner -> opens the dropdown menu */}
            <div className="absolute top-2 right-2">
              <Dropdown isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <DropdownTrigger>
                  <button>
                    <FaEllipsisV className="text-gray-600 dark:text-gray-200 hover:text-gray-900 transition-colors" />
                  </button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Message Actions" variant="faded">
                  {actions}
                </DropdownMenu>
              </Dropdown>
            </div>

            <div className="message-info w-full flex flex-row justify-end items-center gap-1 mt-1">
              <span className={messageTimeClass}>{time}</span>
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
        </div>

        {/* Modal for bigger preview */}
        {isModalOpen && (
          <Modal
            isOpen
            className="bg-opacity-90 backdrop-blur-sm"
            onClose={() => setIsModalOpen(false)}
          >
            <ModalContent>
              <div className="flex flex-col items-center">
                {blobUrl ? (
                  <Image
                    alt={imageName}
                    className="rounded-lg max-w-full h-auto"
                    height={600}
                    src={blobUrl}
                    width={600}
                  />
                ) : (
                  <div className="text-sm italic text-gray-500">
                    Loading image...
                  </div>
                )}
              </div>
            </ModalContent>
          </Modal>
        )}
      </>
    );
  }

  // RECEIVER path => no 3 dots, just the image -> bigger preview on click
  return (
    <>
      <div className={containerWrapperClass} data-event-id={eventId}>
        <div className={containerClass}>
          <button
            className="message-content image-message flex items-center justify-center"
            onClick={handleImageClick}
          >
            {blobUrl ? (
              <Image
                alt={imageName}
                className="rounded-lg max-w-full h-auto cursor-pointer"
                height={200}
                src={blobUrl}
                width={200}
              />
            ) : (
              <div className="text-sm italic text-gray-500">
                Loading image...
              </div>
            )}
          </button>

          <div className="message-info w-full flex flex-row justify-end items-center gap-1 mt-1">
            <span className={messageTimeClass}>{time}</span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Modal
          isOpen
          className="bg-opacity-90 backdrop-blur-sm"
          onClose={() => setIsModalOpen(false)}
        >
          <ModalContent>
            <div className="flex flex-col items-center">
              {blobUrl ? (
                <Image
                  alt={imageName}
                  className="rounded-lg max-w-full h-auto"
                  height={600}
                  src={blobUrl}
                  width={600}
                />
              ) : (
                <div className="text-sm italic text-gray-500">
                  Loading image...
                </div>
              )}
            </div>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};
