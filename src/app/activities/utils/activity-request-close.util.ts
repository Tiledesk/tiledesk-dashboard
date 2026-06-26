import moment from 'moment';

import { ActivityRecord, RequestCloseDisplayContext } from 'app/models/activity-model';

export type RequestCloseParticipantDisplay = RequestCloseDisplayContext['participants'][number];

/** Hide closed_at in the message when it is within this many seconds of the activity row date. */
const CLOSED_AT_ACTIVITY_MIN_DIFF_SECONDS = 60;

function str(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

function formatActivityTimestamp(value: unknown): string | null {
  if (!value) {
    return null;
  }

  const formatted = moment(value);
  if (!formatted.isValid()) {
    return null;
  }

  return formatted.format('dddd, MMM DD, YYYY - HH:mm:ss');
}

function resolveClosedAtForMessage(
  closedAtValue: unknown,
  activity: ActivityRecord,
): string | null {
  const closedAtMoment = moment(closedAtValue);
  if (!closedAtMoment.isValid()) {
    return null;
  }

  const activityMoment = moment(activity.updatedAt || activity.createdAt);
  if (activityMoment.isValid()) {
    const diffSeconds = Math.abs(closedAtMoment.diff(activityMoment, 'seconds'));
    if (diffSeconds <= CLOSED_AT_ACTIVITY_MIN_DIFF_SECONDS) {
      return null;
    }
  }

  return formatActivityTimestamp(closedAtValue);
}

export function isEnrichedParticipant(entry: unknown): boolean {
  if (!entry || typeof entry === 'string') {
    return false;
  }

  if (typeof entry !== 'object') {
    return false;
  }

  const participant = entry as Record<string, unknown>;
  const meaningfulKeys = Object.keys(participant).filter((key) => key !== '_id' && key !== 'id');
  if (!meaningfulKeys.length) {
    return false;
  }

  return !!(
    participant['name'] ||
    participant['firstname'] ||
    participant['lastname'] ||
    participant['subtype'] ||
    participant['id_user']
  );
}

function participantAgentName(agent: Record<string, unknown>): string {
  const directName = str(agent['name']);
  if (directName) {
    return directName;
  }

  const idUser = agent['id_user'] as Record<string, unknown> | undefined;
  const fromIdUser = [idUser?.['firstname'], idUser?.['lastname']].filter(Boolean).join(' ').trim();
  if (fromIdUser) {
    return fromIdUser;
  }

  return [agent['firstname'], agent['lastname']].filter(Boolean).join(' ').trim();
}

function participantAgentId(agent: Record<string, unknown>): string {
  const idUser = agent['id_user'] as Record<string, unknown> | undefined;
  return str(idUser?.['_id'] || agent['_id'] || agent['id']);
}

function mapParticipatingBot(entry: unknown): RequestCloseParticipantDisplay | null {
  if (!isEnrichedParticipant(entry)) {
    return null;
  }

  const bot = entry as Record<string, unknown>;
  const name = str(bot['name']);
  if (!name) {
    return null;
  }

  return {
    type: 'bot',
    name,
    subtype: str(bot['subtype']) || 'chatbot',
    id: str(bot['_id'] || bot['id']),
  };
}

function mapParticipatingAgent(entry: unknown): RequestCloseParticipantDisplay | null {
  if (!isEnrichedParticipant(entry)) {
    return null;
  }

  const agent = entry as Record<string, unknown>;
  const name = participantAgentName(agent);
  if (!name) {
    return null;
  }

  return {
    type: 'agent',
    name,
    id: participantAgentId(agent),
  };
}

export function buildRequestCloseDisplayContext(activity: ActivityRecord): RequestCloseDisplayContext {
  const actionObj = activity.actionObj || {};
  const participatingBots = Array.isArray(actionObj['participatingBots'])
    ? actionObj['participatingBots']
    : [];
  const participatingAgents = Array.isArray(actionObj['participatingAgents'])
    ? actionObj['participatingAgents']
    : [];

  const enrichedAgents = participatingAgents
    .map(mapParticipatingAgent)
    .filter((participant): participant is RequestCloseParticipantDisplay => !!participant);

  const enrichedBots = participatingBots
    .map(mapParticipatingBot)
    .filter((participant): participant is RequestCloseParticipantDisplay => !!participant);

  const participants = enrichedAgents.length > 0 ? enrichedAgents : enrichedBots;
  const assignedAt = formatActivityTimestamp(actionObj['assigned_at']);
  const closedAt = resolveClosedAtForMessage(actionObj['closed_at'], activity);

  return {
    hasAssignmentContext: participants.length > 0,
    participants,
    assignedAt,
    closedAt,
  };
}

export function findEnrichedParticipantName(
  actionObj: Record<string, unknown> | undefined,
): { name: string; id: string; isBot: boolean } | null {
  if (!actionObj) {
    return null;
  }

  const participatingAgents = Array.isArray(actionObj['participatingAgents'])
    ? actionObj['participatingAgents']
    : [];
  for (const entry of participatingAgents) {
    if (!isEnrichedParticipant(entry)) {
      continue;
    }
    const record = entry as Record<string, unknown>;
    const idUser = record['id_user'] as Record<string, unknown> | undefined;
    const name = str(record['name'])
      || [idUser?.['firstname'], idUser?.['lastname']].filter(Boolean).join(' ').trim()
      || [record['firstname'], record['lastname']].filter(Boolean).join(' ').trim();
    if (name) {
      return {
        name,
        id: str(idUser?.['_id'] || record['_id'] || record['id']),
        isBot: false,
      };
    }
  }

  const participatingBots = Array.isArray(actionObj['participatingBots'])
    ? actionObj['participatingBots']
    : [];
  for (const entry of participatingBots) {
    if (!isEnrichedParticipant(entry)) {
      continue;
    }
    const record = entry as Record<string, unknown>;
    const name = str(record['name']);
    if (name) {
      return {
        name,
        id: str(record['_id'] || record['id']),
        isBot: true,
      };
    }
  }

  return null;
}

export function formatRequestCloseAssignmentPhrase(display: RequestCloseDisplayContext): string {
  if (!display.hasAssignmentContext) {
    return '';
  }

  if (display.participants.length === 1 && display.participants[0].type === 'bot') {
    const bot = display.participants[0];
    return `assigned to the ${bot.subtype} ${bot.name}`;
  }

  const names = display.participants.map((participant) => participant.name).join(', ');
  return `assigned to ${names}`;
}

export function renderRequestCloseMessage(
  activity: ActivityRecord,
  conversation: string,
  closedBy: string,
): string {
  const display = activity.request_close_display || buildRequestCloseDisplayContext(activity);
  let message = `The conversation ${conversation}`;

  if (display.hasAssignmentContext) {
    message += ` ${formatRequestCloseAssignmentPhrase(display)}`;
    if (display.assignedAt) {
      message += ` on ${display.assignedAt}`;
    }
  }

  message += ` was resolved by: ${closedBy}`;

  if (display.closedAt) {
    message += ` ${display.closedAt}`;
  }

  return message;
}
