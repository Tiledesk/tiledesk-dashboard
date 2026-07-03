export type ActivityVerb =
  | 'REQUEST_CREATE'
  | 'REQUEST_CLOSE'
  | 'REQUEST_ASSIGNED_AUTO'
  | 'REQUEST_ASSIGNED_SELF'
  | 'REQUEST_ASSIGNED_MANUAL'
  | 'REQUEST_UNASSIGNED'
  | 'PROJECT_USER_INVITE'
  | 'PROJECT_USER_UPDATE'
  | 'PROJECT_USER_DELETE'
  | 'PROJECT_USER_AVAILABILITY_SELF'
  | 'PROJECT_USER_AVAILABILITY_SYSTEM'
  | 'FAQ_KB_CREATE'
  | 'FAQ_KB_DELETE'
  | 'FAQ_KB_PUBLISH'
  | 'KB_NAMESPACE_CREATE'
  | 'KB_NAMESPACE_DELETE'
  | 'KB_CONTENTS_ADD'
  | 'KB_CONTENTS_DELETE'
  | string;

export interface ActivityActor {
  type?: 'user' | 'system' | string;
  id?: string;
  name?: string;
}

export interface ActivityTarget {
  type?: string;
  id?: string;
  object?: Record<string, unknown>;
}

export interface RequestCloseDisplayContext {
  hasAssignmentContext: boolean;
  participants: Array<{
    type: 'bot' | 'agent';
    name: string;
    subtype?: string;
    id?: string;
  }>;
  assignedAt: string | null;
  closedAt: string | null;
}

export interface UnassignedParticipantDisplay {
  name: string;
  profileId: string;
  firstname?: string;
  lastname?: string;
  avatarView?: {
    initials: string;
    background: string;
  } | null;
}

export interface ActivityRecord {
  _id?: string;
  id_project?: string;
  createdAt?: string;
  updatedAt?: string;
  actor?: ActivityActor;
  verb?: ActivityVerb;
  actionObj?: Record<string, unknown>;
  target?: ActivityTarget;
  message?: string;
  date?: string;
  renderedMessage?: string;
  activity_request_text?: string;
  closed_by_label?: string;
  /** Mongo lead _id for guest who closed the conversation (REQUEST_CLOSE). */
  closed_by_contact_id?: string;
  participant_fullname?: string;
  /** Assignee user/bot id for REQUEST_CREATE link navigation */
  request_create_assignee_id?: string;
  targetOfActionIsYourself?: boolean;
  request_close_display?: RequestCloseDisplayContext;
  unassigned_participant_display?: UnassignedParticipantDisplay;
  /** Set client-side when REQUEST_ASSIGNED_MANUAL actor is a bot. */
  manual_assignment_actor_is_bot?: boolean;
}

export interface ActivitiesListResponse {
  perPage?: number;
  count?: number;
  activities?: ActivityRecord[];
}

/** @deprecated Use ActivityRecord — kept for backward compatibility */
export interface Activity {
  actionObj?: Record<string, unknown>;
  actor?: ActivityActor | string;
  createdAt?: string;
  id_project?: string;
  target?: ActivityTarget | string;
  updatedAt?: string;
  verb?: string;
  message?: string;
  __v?: unknown;
  _id?: string;
}
