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
  | 'PROJECT_USER_AVAILABILITY_SYSTEM';

export interface ActivityActor {
  type: 'user' | 'system';
  id: string;
  name?: string;
}

export interface ActivityTarget {
  type: string;
  id: string;
  object: Record<string, any>;
}

export interface Activity {
  _id?: string;
  id_project?: string;
  createdAt?: string;
  updatedAt?: string;
  actor?: ActivityActor;
  verb?: ActivityVerb | string;
  actionObj?: Record<string, any>;
  target?: ActivityTarget;
  message?: string;
  __v?: any;

  /** Populated client-side */
  date?: string;
  displayText?: string;
  requestId?: string;
  activity_request_text?: string;
  participant_fullname?: string;
  targetOfActionIsYourself?: boolean;
  closed_by_label?: string;
}

export interface ActivitiesResponse {
  perPage: number;
  count: number;
  activities: Activity[];
}
