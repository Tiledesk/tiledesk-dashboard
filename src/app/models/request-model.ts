export interface Request {
    recipient?: string;
    recipient_fullname?: string;
    sender_fullname?: string;
    text?: string;
    timestamp?: number;
    membersCount?: number;
    support_status?: number;
    members?: boolean;
    requester_fullname?: string;
    request_date_fromnow?: any;
  }
