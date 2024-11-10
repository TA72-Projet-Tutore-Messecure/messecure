import React from "react";
import { CheckIcon } from "@nextui-org/shared-icons";
import { CheckCheckIcon, Clock } from "lucide-react";
import Image from "next/image";

import {
  ImageMessageProps,
  MessageStatus,
  MessageTarget,
} from "@/types/messages";

export const ImageMessage: React.FC<ImageMessageProps> = ({
  time,
  target,
  status,
  imageUrls,
}) => {
  return (
    <div
      className={`relative base-message ${target === MessageTarget.SENDER ? "message-sender text-black bg-[#eeffde] dark:text-white dark:!bg-[#766ac8] rounded-l-xl rounded-t-xl" : "bg-white dark:bg-[#212121] rounded-xl"} px-4 py-2 flex flex-col max-w-md gap-1`}
    >
      <div className="message-content image-message">
        {imageUrls.map((url, index) => (
          <Image
            key={index}
            alt={`${index + 1}`}
            className="rounded-lg max-w-full h-auto mb-2"
            src={url}
          />
        ))}
      </div>
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
