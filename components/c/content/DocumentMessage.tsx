import React from "react";
import { CheckIcon } from "@nextui-org/shared-icons";
import { CheckCheckIcon, Clock } from "lucide-react";

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
      className={`relative base-message ${target === MessageTarget.SENDER ? "message-sender text-black bg-[#eeffde] dark:text-white dark:!bg-[#766ac8] rounded-l-xl rounded-t-xl" : "bg-white dark:bg-[#212121] rounded-xl"} px-4 py-2 flex flex-col max-w-md gap-1`}
    >
      <button
        className="message-content document-message flex items-center gap-2"
        onClick={handleDocumentClick}
      >
        <div className="document-icon text-2xl">📄</div>
        <div className="document-info">
          <div className="document-name font-semibold">{documentName}</div>
          <div className="document-size text-sm text-gray-500">
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
  );
};
