export interface ActivityFilterOption {
  id: string;
  name: string;
  group: string;
}

export const ACTIVITY_FILTER_OPTIONS: ActivityFilterOption[] = [
  { id: 'REQUEST_CREATE', name: 'New conversation', group: 'Conversations' },
  { id: 'REQUEST_CLOSE', name: 'Conversation closed', group: 'Conversations' },
  { id: 'REQUEST_ASSIGNED_AUTO', name: 'Auto assignment', group: 'Assignments' },
  { id: 'REQUEST_ASSIGNED_SELF', name: 'Agent joined conversation', group: 'Assignments' },
  { id: 'REQUEST_ASSIGNED_MANUAL', name: 'Manual assignment', group: 'Assignments' },
  { id: 'REQUEST_UNASSIGNED', name: 'Agent unassigned', group: 'Assignments' },
  { id: 'PROJECT_USER_INVITE', name: 'Teammate invited', group: 'Team' },
  { id: 'PROJECT_USER_UPDATE', name: 'Teammate updated', group: 'Team' },
  { id: 'PROJECT_USER_DELETE', name: 'Teammate removed', group: 'Team' },
  { id: 'PROJECT_USER_AVAILABILITY_SELF', name: 'Availability changed (self)', group: 'Team' },
  { id: 'PROJECT_USER_AVAILABILITY_SYSTEM', name: 'Availability changed (system)', group: 'Team' },
  { id: 'FAQ_KB_CREATE', name: 'Chatbot created', group: 'Chatbot' },
  { id: 'FAQ_KB_DELETE', name: 'Chatbot deleted', group: 'Chatbot' },
  { id: 'FAQ_KB_PUBLISH', name: 'Chatbot published', group: 'Chatbot' },
  { id: 'KB_NAMESPACE_CREATE', name: 'Namespace created', group: 'Knowledge Base' },
  { id: 'KB_NAMESPACE_DELETE', name: 'Namespace deleted', group: 'Knowledge Base' },
  { id: 'KB_CONTENTS_ADD', name: 'Contents added', group: 'Knowledge Base' },
  { id: 'KB_CONTENTS_DELETE', name: 'Contents deleted', group: 'Knowledge Base' },
  { id: 'KB_CONTENT_DELETE', name: 'Content deleted', group: 'Knowledge Base' },
];

export const ACTIVITY_ICON_BY_VERB: Record<string, string> = {
  PROJECT_USER_INVITE: 'assets/img/user-plus-solid.svg',
  PROJECT_USER_DELETE: 'assets/img/user-minus-solid.svg',
  PROJECT_USER_UPDATE: 'assets/img/user-edit-solid.svg',
  PROJECT_USER_AVAILABILITY_SELF: 'assets/img/user-edit-solid.svg',
  PROJECT_USER_AVAILABILITY_SYSTEM: 'assets/img/user-edit-solid.svg',
  REQUEST_CREATE: 'assets/img/comment-medical-solid.svg',
  REQUEST_CLOSE: 'assets/img/comment-resolved.svg',
  REQUEST_ASSIGNED_AUTO: 'assets/img/comment-medical-solid.svg',
  REQUEST_ASSIGNED_SELF: 'assets/img/comment-medical-solid.svg',
  REQUEST_ASSIGNED_MANUAL: 'assets/img/user-edit-solid.svg',
  REQUEST_UNASSIGNED: 'assets/img/user-minus-solid.svg',
  FAQ_KB_CREATE: 'assets/img/user-plus-solid.svg',
  FAQ_KB_DELETE: 'assets/img/avatar_bot_tiledesk.svg',
  FAQ_KB_PUBLISH: 'assets/img/user-plus-solid.svg',
  KB_NAMESPACE_CREATE: 'assets/img/user-plus-solid.svg',
  KB_NAMESPACE_DELETE: 'assets/img/user-minus-solid.svg',
  KB_CONTENTS_ADD: 'assets/img/user-plus-solid.svg',
  KB_CONTENTS_DELETE: 'assets/img/user-minus-solid.svg',
  KB_CONTENT_DELETE: 'assets/img/user-minus-solid.svg',
};

export const DEFAULT_ACTIVITY_ICON = 'assets/img/user-edit-solid.svg';
