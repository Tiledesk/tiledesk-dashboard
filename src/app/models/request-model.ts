export interface Request {
  recipient?: string;
  recipient_fullname?: string;
  sender_fullname?: string;
  text?: string;
  first_text?: string;
  timestamp?: number;
  membersCount?: number;
  support_status?: number;
  members?: boolean;
  requester_fullname?: string;
  requester_id?: string;
  projectid?: string;

  members_array?: any;

  id?: string;
  request_date_fromnow?: any;
  currentUserIsJoined?: boolean;
  members_as_string?: any;
  served_by?: any;
  notification_already_shown?: boolean;
  departmentName?: string;
}
