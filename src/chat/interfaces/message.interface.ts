export interface IMessage {
  id: string;
  userId: string;
  content: string;
  room: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  updatedAt: Date;
}

export interface IProcessedMessage extends IMessage {
  processedContent: string;
  processingTimestamp: Date;
}
