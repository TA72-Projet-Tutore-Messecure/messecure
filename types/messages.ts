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
  id: string; // Identifier of the message
}

// types.ts (add the following)
export interface DocumentMessageProps extends BaseMessageProps {
  documentName: string;
  documentSize: string; // e.g., '2 MB'
  documentLink: string; // URL to redirect when clicked
}

// types.ts (add the following)
export interface ImageMessageProps extends BaseMessageProps {
  imageUrls: string[]; // Array of image URLs
}
