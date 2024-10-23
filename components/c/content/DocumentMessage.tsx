import React from "react";
import { CheckIcon } from "@nextui-org/shared-icons";
import { CheckCheckIcon, Clock } from "lucide-react";
import { FaFile } from "react-icons/fa";

import {
  DocumentMessageProps,
  MessageStatus,
  MessageTarget,
} from "@/types/messages";

export const DocumentMessage: React.FC<DocumentMessageProps> = ({
  time,
  target,
  status,
  documentName,
  documentSize,
  documentLink,
}) => {
  const handleDocumentClick = () => {
    window.open(documentLink, "_blank");
  };

  return (
    <div
      className={`w-full px-32 flex flex-row ${target === MessageTarget.SENDER ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`relative base-message ${target === MessageTarget.SENDER ? "message-sender text-black bg-[#eeffde] dark:text-white dark:!bg-[#766ac8] rounded-l-xl rounded-t-xl" : "bg-white dark:bg-[#212121] rounded-xl"} flex flex-col gap-1 max-w-[33%] pt-3 px-3`}
      >
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
            </div>{" "}
            {/* Added truncate here */}
            <div className="document-size text-left text-sm">
              {documentSize}
            </div>
          </div>
        </button>
        <div className="message-info w-full flex flex-row justify-end items-center gap-1">
          <span
            className={`message-time ${target === MessageTarget.SENDER ? "text-[#60b75e] dark:text-[#aea7de]" : "text-[#47494c]"} text-xs`}
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
};
