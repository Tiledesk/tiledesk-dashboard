export interface ActivityFilterOption {
  id: string;
  name: string;
  group: string;
}

export interface ActivityFilterOptionDefinition {
  id: string;
  groupKey: 'Conversations' | 'Assignments' | 'Team' | 'Chatbot' | 'KnowledgeBase';
}

export const ACTIVITY_FILTER_OPTION_DEFINITIONS: ActivityFilterOptionDefinition[] = [
  { id: 'REQUEST_CREATE', groupKey: 'Conversations' },
  { id: 'REQUEST_CLOSE', groupKey: 'Conversations' },
  { id: 'REQUEST_ASSIGNED_AUTO', groupKey: 'Assignments' },
  { id: 'REQUEST_ASSIGNED_SELF', groupKey: 'Assignments' },
  { id: 'REQUEST_ASSIGNED_MANUAL', groupKey: 'Assignments' },
  { id: 'REQUEST_UNASSIGNED', groupKey: 'Assignments' },
  { id: 'PROJECT_USER_INVITE', groupKey: 'Team' },
  { id: 'PROJECT_USER_UPDATE', groupKey: 'Team' },
  { id: 'PROJECT_USER_DELETE', groupKey: 'Team' },
  { id: 'PROJECT_USER_AVAILABILITY_SELF', groupKey: 'Team' },
  { id: 'PROJECT_USER_AVAILABILITY_SYSTEM', groupKey: 'Team' },
  { id: 'FAQ_KB_CREATE', groupKey: 'Chatbot' },
  { id: 'FAQ_KB_DELETE', groupKey: 'Chatbot' },
  { id: 'FAQ_KB_PUBLISH', groupKey: 'Chatbot' },
  { id: 'KB_NAMESPACE_CREATE', groupKey: 'KnowledgeBase' },
  { id: 'KB_NAMESPACE_DELETE', groupKey: 'KnowledgeBase' },
  { id: 'KB_CONTENTS_ADD', groupKey: 'KnowledgeBase' },
  { id: 'KB_CONTENTS_DELETE', groupKey: 'KnowledgeBase' },
  { id: 'KB_CONTENT_DELETE', groupKey: 'KnowledgeBase' },
];

export const ACTIVITY_ICON_BY_VERB: Record<string, string> = {
  PROJECT_USER_INVITE: 'assets/img/activities/user-plus-solid_v2.svg',
  PROJECT_USER_DELETE: 'assets/img/activities/user-minus-solid_v2.svg',
  PROJECT_USER_UPDATE: 'assets/img/activities/user-edit-solid_v2.svg',
  PROJECT_USER_AVAILABILITY_SELF: 'assets/img/activities/user-edit-solid_v2.svg',
  PROJECT_USER_AVAILABILITY_SYSTEM: 'assets/img/activities/user-edit-solid_v2.svg',
  REQUEST_CREATE: 'assets/img/activities/comment-medical-solid_v2.svg',
  REQUEST_CLOSE: 'assets/img/activities/comment-resolved_v2.svg',
  REQUEST_ASSIGNED_AUTO: 'assets/img/activities/comment-medical-solid_v2.svg',
  REQUEST_ASSIGNED_SELF: 'assets/img/activities/comment-medical-solid_v2.svg',
  REQUEST_ASSIGNED_MANUAL: 'assets/img/activities/user-edit-solid_v2.svg',
  REQUEST_UNASSIGNED: 'assets/img/activities/user-minus-solid_v2.svg',
  FAQ_KB_CREATE: 'assets/img/activities/flow-add.svg',
  FAQ_KB_DELETE: 'assets/img/activities/flow-removed.svg',
  FAQ_KB_PUBLISH: 'assets/img/activities/flow-published.svg',
  KB_NAMESPACE_CREATE: 'assets/img/activities/create-namespace.svg',
  KB_NAMESPACE_DELETE: 'assets/img/activities/delete-namespace.svg',
  KB_CONTENTS_ADD: 'assets/img/activities/content-add.svg',
  KB_CONTENTS_DELETE: 'assets/img/activities/contents-delete.svg',
  KB_CONTENT_DELETE: 'assets/img/activities/content-delete.svg',
};

export const DEFAULT_ACTIVITY_ICON = 'assets/img/activities/user-edit-solid_v2.svg';
export const MANUAL_ASSIGNMENT_BOT_ACTOR_ICON = 'assets/img/activities/chatbot-plus.svg';
export const REQUEST_CLOSE_BOT_ACTOR_ICON = 'assets/img/activities/chatbot-minus.svg';
export const SYSTEM_EDIT_ACTIVITY_ICON = 'assets/img/activities/system-edit.svg';
export const SYSTEM_UNASSIGNED_ACTIVITY_ICON = 'assets/img/activities/system-unassigned.svg';
export const SYSTEM_ASSIGNED_ACTIVITY_ICON = 'assets/img/activities/system-assigned.svg';
