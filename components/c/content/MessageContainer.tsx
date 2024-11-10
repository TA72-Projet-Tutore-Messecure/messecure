import React, { useEffect, useRef, useState } from "react";

import { MessageStatus, MessageTarget } from "@/types/messages";
import { DocumentMessage } from "@/components/c/content/messages/DocumentMessage";
import { BaseMessage } from "@/components/c/content/messages/BaseMessage";

export const MessageContainer: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef(null); // Ref to track the message container

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    scrollToBottom(); // Scroll to bottom when component mounts
  }, [mounted]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // @ts-ignore
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!mounted) return null; // Ensures proper client-side rendering

  return (
    <div className="w-full h-full py-2 flex flex-col gap-3 overflow-y-auto max-h-[80vh]">
      {/* Chat messages */}
      <BaseMessage
        message="Hello, this is a basic message!"
        status={MessageStatus.READ}
        target={MessageTarget.SENDER}
        time="10:30 AM"
      />
      <BaseMessage
        message="Hello, this is a basic message!"
        status={MessageStatus.READ}
        target={MessageTarget.SENDER}
        time="10:30 AM"
      />
      <BaseMessage
        message="Hello, this is a basic message!"
        status={MessageStatus.READ}
        target={MessageTarget.RECEIVER}
        time="10:30 AM"
      />
      <BaseMessage
        message="Hello, this is a basic message!"
        status={MessageStatus.READ}
        target={MessageTarget.RECEIVER}
        time="10:30 AM"
      />
      <BaseMessage
        message="Hello, this is a basic message!"
        status={MessageStatus.READ}
        target={MessageTarget.RECEIVER}
        time="10:30 AM"
      />
      <BaseMessage
        message="Hello, this is a basic message!"
        status={MessageStatus.READ}
        target={MessageTarget.RECEIVER}
        time="10:30 AM"
      />
      <BaseMessage
        message="Hello, this is a basic message!"
        status={MessageStatus.READ}
        target={MessageTarget.RECEIVER}
        time="10:30 AM"
      />
      <BaseMessage
        message="Hello, this is a basic message!"
        status={MessageStatus.READ}
        target={MessageTarget.RECEIVER}
        time="10:30 AM"
      />
      <BaseMessage
        message="Hello, this is a basic message!"
        status={MessageStatus.READ}
        target={MessageTarget.RECEIVER}
        time="10:30 AM"
      />
      <BaseMessage
        message="Hello, this is a basic message!"
        status={MessageStatus.READ}
        target={MessageTarget.RECEIVER}
        time="10:30 AM"
      />
      <BaseMessage
        message="Hello, this is a basic message!"
        status={MessageStatus.READ}
        target={MessageTarget.RECEIVER}
        time="10:30 AM"
      />
      <BaseMessage
        message="Hello, this is a basic message!"
        status={MessageStatus.READ}
        target={MessageTarget.RECEIVER}
        time="10:30 AM"
      />
      <BaseMessage
        message="Hello, this is a basic message!"
        status={MessageStatus.READ}
        target={MessageTarget.RECEIVER}
        time="10:30 AM"
      />
      <BaseMessage
        message="Hello, this is a basic message!"
        status={MessageStatus.READ}
        target={MessageTarget.RECEIVER}
        time="10:30 AM"
      />
      <BaseMessage
        message="Hello, this is a basic message!"
        status={MessageStatus.READ}
        target={MessageTarget.RECEIVER}
        time="10:30 AM"
      />
      <BaseMessage
        message="Hello, this is a basic message!"
        status={MessageStatus.READ}
        target={MessageTarget.RECEIVER}
        time="10:30 AM"
      />
      <BaseMessage
        message="Hello, this is a basic message!"
        status={MessageStatus.READ}
        target={MessageTarget.RECEIVER}
        time="10:30 AM"
      />
      <BaseMessage
        message="Hello, this is a basic message!"
        status={MessageStatus.READ}
        target={MessageTarget.RECEIVER}
        time="10:30 AM"
      />
      <BaseMessage
        message="Hello, this is a basic message!"
        status={MessageStatus.READ}
        target={MessageTarget.RECEIVER}
        time="10:30 AM"
      />
      <BaseMessage
        message="Hello, this is a basic message!"
        status={MessageStatus.READ}
        target={MessageTarget.RECEIVER}
        time="10:30 AM"
      />
      <BaseMessage
        message="Hello, this is a basic message!"
        status={MessageStatus.READ}
        target={MessageTarget.RECEIVER}
        time="10:30 AM"
      />

      <DocumentMessage
        documentLink="https://github.com/TA72-Projet-Tutore-Messecure/messecure-frontend"
        documentName="Secret.pdf"
        documentSize="2MB"
        message="This is the document for review"
        status={MessageStatus.READ}
        target={MessageTarget.SENDER}
        time="10:30 AM"
      />
      {/* End of messages placeholder */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageContainer;
