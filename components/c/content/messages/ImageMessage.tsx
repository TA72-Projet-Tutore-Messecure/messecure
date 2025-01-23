// components/c/content/messages/ImageMessage.tsx

"use client";

import React, { useState, useEffect } from "react";
import { CheckIcon } from "@nextui-org/shared-icons";
import { CheckCheckIcon, Clock } from "lucide-react";
import { FaEllipsisV, FaTrash } from "react-icons/fa";
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

import { useMatrix } from "@/context/MatrixContext";
import { MessageStatus, MessageTarget } from "@/types/messages";
import MatrixService from "@/services/MatrixService";

/**
 * For ImageMessage props, also accept:
 * - senderName?: string
 * - isGroupRoom?: boolean
 */

interface ImageMessageProps {
  eventId: string;
  isRedacted: boolean;
  time: string;
  target: MessageTarget;
  status: MessageStatus;
  imageLink: string; // e.g. mxc://
  imageName?: string;
  senderName?: string; // if group & from other user
  isGroupRoom?: boolean; // indicates group
}

export const ImageMessage: React.FC<ImageMessageProps> = ({
  eventId,
  isRedacted,
  time,
  target,
  status,
  imageLink,
  imageName = "image",
  senderName,
  isGroupRoom,
}) => {
  const { deleteMessage } = useMatrix();

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // fetch image as blob => local object url
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

  // handle delete
  const handleDeleteMessage = () => {
    if (eventId) {
      deleteMessage(eventId);
      toast.error("Message deleted.");
    }
    setIsPopoverOpen(false);
  };

  // handle big preview
  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  // Redacted => placeholder
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

  // shared container classes
  const containerWrapperClass = `w-full px-32 flex flex-row ${
    target === MessageTarget.SENDER ? "justify-end" : "justify-start"
  }`;
  const containerClass = `relative base-message ${
    target === MessageTarget.SENDER
      ? "message-sender text-black bg-[#eeffde] dark:text-white dark:!bg-[#766ac8] rounded-l-xl rounded-t-xl"
      : "bg-white dark:bg-[#212121] rounded-xl"
  } px-3 py-2 flex flex-col max-w-[33%] gap-1`;

  // actions for the sender
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

  // SENDER path => 3-dot action menu
  if (target === MessageTarget.SENDER) {
    return (
      <>
        <div className={containerWrapperClass} data-event-id={eventId}>
          <div
            className={`${containerClass} relative`}
            style={{ position: "relative" }}
          >
            {/* (If from me, we typically don't show my own name. ) */}

            {/* clickable image => open big preview */}
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

            {/* 3-dot icon => dropdown */}
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

            {/* time + status */}
            <div className="message-info w-full flex flex-row justify-end items-center gap-1 mt-1">
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
        </div>

        {/* big preview modal */}
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

  // RECEIVER path => if group & from other => top-left name
  return (
    <>
      <div className={containerWrapperClass} data-event-id={eventId}>
        <div className={`${containerClass} relative`}>
          {target === MessageTarget.RECEIVER && isGroupRoom && senderName && (
            <div className="text-md text-primary font-bold">{senderName}</div>
          )}

          {/* clickable image => big preview */}
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

          {/* time bottom-right */}
          <div className="message-info w-full flex flex-row justify-end items-center gap-1 mt-1">
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

      {/* big preview modal */}
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
