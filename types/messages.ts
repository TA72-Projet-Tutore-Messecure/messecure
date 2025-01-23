// types.ts
export enum MessageTarget {
  RECEIVER = "RECEIVER",
  SENDER = "SENDER",
}

export enum MessageStatus {
  SENT = "Sent",
  DELIVERED = "Delivered",
  READ = "Read",
}

export interface BaseMessageProps {
  time: string; // Time of posting
  target: MessageTarget; // Message target
  status: MessageStatus; // Message status
  message: string; // Message content
  senderName?: string;
  isGroupRoom?: boolean;
  eventId: string;
  isRedacted: boolean;
}

// types.ts (add the following)
export interface DocumentMessageProps extends BaseMessageProps {
  documentName: string;
  documentSize: string;
  documentLink: string;
}

// types.ts (add the following)
export interface ImageMessageProps extends BaseMessageProps {
  imageUrls: string[]; // Array of image URLs
}
