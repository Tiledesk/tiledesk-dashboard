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

function readLeadFromActivity(activity: ActivityRecord): Record<string, unknown> | undefined {
  const actionLead = activity.actionObj?.['lead'];
  if (actionLead && typeof actionLead === 'object') {
    return actionLead as Record<string, unknown>;
  }

  const targetLead = activity.target?.object?.['lead'];
  if (targetLead && typeof targetLead === 'object') {
    return targetLead as Record<string, unknown>;
  }

  return undefined;
}

/** When a guest closes the conversation, actor.id or actor.name matches lead.lead_id. */
export function resolveClosedByLeadContext(activity: ActivityRecord): { fullname: string; contactId: string } | null {
  if (activity.actor?.type !== 'user') {
    return null;
  }

  const actorId = str(activity.actor?.id).trim();
  const actorName = str(activity.actor?.name).trim();
  if (!actorId && !actorName) {
    return null;
  }

  const lead = readLeadFromActivity(activity);
  if (!lead) {
    return null;
  }

  const leadId = str(lead['lead_id'] || lead['leadId']).trim();
  if (!leadId) {
    return null;
  }

  const actorMatchesLead = actorId === leadId || actorName === leadId;
  if (!actorMatchesLead) {
    return null;
  }

  const fullname = str(lead['fullname']).trim();
  const contactId = str(lead['_id']).trim();
  if (!fullname || !contactId) {
    return null;
  }

  return { fullname, contactId };
}

export function resolveClosedByFromLead(activity: ActivityRecord): string | null {
  return resolveClosedByLeadContext(activity)?.fullname ?? null;
}

function formatRequestCloseTimestamp(value: unknown): string | null {
  if (!value) {
    return null;
  }

  const formatted = moment(value);
  if (!formatted.isValid()) {
    return null;
  }

  return formatted.format('ddd, MMM DD, YYYY - HH:mm:ss');
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

export function formatRequestCloseAssignedAt(activity: ActivityRecord): string | null {
  const actionObj = activity.actionObj || {};
  return formatRequestCloseTimestamp(actionObj['assigned_at']);
}

function normalizeId(id: unknown): string {
  return str(id).includes('%2B') ? str(id).replace(/%2B/g, '+') : str(id);
}

export function isRequestCloseAssignedToActorSelf(activity: ActivityRecord): boolean {
  const actorId = normalizeId(activity.actor?.id);
  if (!actorId) {
    return false;
  }

  const display = activity.request_close_display || buildRequestCloseDisplayContext(activity);
  if (!display.hasAssignmentContext || display.participants.length !== 1) {
    return false;
  }

  const participant = display.participants[0];
  if (participant.type !== 'agent') {
    return false;
  }

  return normalizeId(participant.id) === actorId;
}

export function formatRequestCloseAssignmentPhrase(
  display: RequestCloseDisplayContext,
  activity?: ActivityRecord,
): string {
  if (!display.hasAssignmentContext) {
    return '';
  }

  if (activity && isRequestCloseAssignedToActorSelf(activity)) {
    return 'assigned to themselves';
  }

  if (display.participants.length === 1 && display.participants[0].type === 'bot') {
    const bot = display.participants[0];
    return `assigned to the ${bot.subtype} ${bot.name}`;
  }

  const names = display.participants.map((participant) => participant.name).join(', ');
  return `assigned to ${names}`;
}

export function isLegacyRequestCloseActor(activity: ActivityRecord): boolean {
  return activity.actor?.id === '_bot_unresponsive';
}

export function renderLegacyRequestCloseMessage(
  activity: ActivityRecord,
  conversation: string,
  closedBy: string,
): string {
  const display = activity.request_close_display || buildRequestCloseDisplayContext(activity);
  let message = `The conversation ${conversation}`;

  if (display.hasAssignmentContext) {
    message += ` ${formatRequestCloseAssignmentPhrase(display, activity)}`;
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

export function renderRequestCloseMessage(
  activity: ActivityRecord,
  conversation: string,
  closedBy: string,
): string {
  if (isLegacyRequestCloseActor(activity)) {
    return renderLegacyRequestCloseMessage(activity, conversation, closedBy);
  }

  const display = activity.request_close_display || buildRequestCloseDisplayContext(activity);
  const quotedConversation = conversation ? `'${conversation}'` : 'conversation';
  let message = `${closedBy} resolved conversation ${quotedConversation}`;

  if (display.hasAssignmentContext) {
    message += ` ${formatRequestCloseAssignmentPhrase(display, activity)}`;
    const assignedAt = formatRequestCloseAssignedAt(activity);
    if (assignedAt) {
      message += ` on ${assignedAt}`;
    }
  }

  return message;
}
