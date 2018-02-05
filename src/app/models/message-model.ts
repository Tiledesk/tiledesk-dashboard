export interface Message {
    channel_type?: string;
    language?: string;
    metadata?: any;
    recipient?: string;
    recipient_fullname?: string;
    sender?: string;
    sender_fullname?: string;
    status?: number;
    text?: string;
    timestamp?: number;
    type?: string;
  }
