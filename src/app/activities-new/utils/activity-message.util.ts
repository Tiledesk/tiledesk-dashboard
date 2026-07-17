import { ActivityRecord } from 'app/models/activity-model';
import { ACTIVITY_ICON_BY_VERB, DEFAULT_ACTIVITY_ICON, MANUAL_ASSIGNMENT_BOT_ACTOR_ICON, SYSTEM_ASSIGNED_ACTIVITY_ICON, SYSTEM_EDIT_ACTIVITY_ICON, SYSTEM_UNASSIGNED_ACTIVITY_ICON } from './activity-verbs.constants';
import { renderRequestCloseMessage, resolveClosedByFromLead } from './activity-request-close.util';

function str(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

const ACTOR_ID_LABELS: Record<string, string> = {
  _bot_unresponsive: 'auto closing Bot',
  _trigger: 'Trigger',
  system: 'System',
};

export function formatActorIdLabel(actorId: string): string {
  return ACTOR_ID_LABELS[actorId] || actorId;
}

function normalizeId(id: unknown): string {
  return str(id).includes('%2B') ? str(id).replace(/%2B/g, '+') : str(id);
}

export function actorName(activity: ActivityRecord): string {
  if (activity.actor?.type === 'system') {
    return 'System';
  }
  if (activity.actor?.name) {
    return activity.actor.name;
  }
  if (activity.actor?.id) {
    return formatActorIdLabel(str(activity.actor.id));
  }
  return 'Someone';
}

export function getActivityRequestText(activity: ActivityRecord): string | null {
  const actionObj = activity.actionObj || {};
  const conversation = actionObj['conversation'] as Record<string, unknown> | undefined;
  const firstText = str(activity.target?.object?.['first_text'])
    || str(conversation?.['first_text']);
  if (!firstText) {
    return null;
  }
  return firstText.length >= 30 ? `${firstText.slice(0, 30)}...` : firstText;
}

export function getClosedByLabel(activity: ActivityRecord): string {
  if (activity.closed_by_label) {
    return activity.closed_by_label;
  }
  const fromLead = resolveClosedByFromLead(activity);
  if (fromLead) {
    return fromLead;
  }
  if (activity.actor?.id) {
    return formatActorIdLabel(str(activity.actor.id));
  }
  return actorName(activity);
}

function formatIdUserDisplayName(idUser: Record<string, unknown> | undefined | null): string {
  if (!idUser) {
    return '';
  }

  return [idUser['firstname'], idUser['lastname']]
    .map((part) => str(part).trim())
    .filter(Boolean)
    .join(' ')
    .trim();
}

export function targetUserName(activity: ActivityRecord): string {
  const participant = targetConversationUserParticipant(activity);
  return participant?.name || 'Unknown user';
}

export function targetConversationUserParticipant(activity: ActivityRecord): ActivityParticipantDisplay | null {
  const user = activity.target?.object?.['id_user'] as Record<string, unknown> | undefined;
  if (!user) {
    return null;
  }

  const profileId = str(user['_id']);
  if (!profileId) {
    return null;
  }

  const name = formatIdUserDisplayName(user);
  return {
    name: name || profileId,
    profileId,
  };
}

export interface ProjectUserTargetDisplay {
  label: string;
  profileId: string;
  avatarSource: string;
  useIdUserName: boolean;
}

function actionObjHasUserName(actionObj: Record<string, unknown>): boolean {
  return !!(str(actionObj['name']) || str(actionObj['firstname']));
}

export function resolveProjectUserTargetDisplay(activity: ActivityRecord): ProjectUserTargetDisplay | null {
  const idUser = activity.target?.object?.['id_user'] as Record<string, unknown> | undefined;
  const profileId = str(idUser?.['_id']);
  if (!profileId) {
    return null;
  }

  const actionObj = activity.actionObj || {};
  const actionObjName = actionObjHasUserName(actionObj)
    ? [str(actionObj['firstname']), str(actionObj['lastname'])]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(' ')
      .trim() || str(actionObj['name']).trim()
    : '';

  const idUserName = formatIdUserDisplayName(idUser);
  const firstname = str(idUser?.['firstname']).trim();
  const label = actionObjName || idUserName || profileId;
  const useIdUserName = !actionObjName && !!idUserName;

  return {
    label,
    profileId,
    avatarSource: useIdUserName ? (firstname || idUserName) : profileId,
    useIdUserName,
  };
}

export function conversationLabel(activity: ActivityRecord): string {
  const requestText = getActivityRequestText(activity);
  if (requestText) {
    return requestText;
  }

  const request = activity.target?.object;
  if (!request) {
    return str(activity.target?.id) || 'conversation';
  }
  const requestId = request['request_id'];
  if (requestId) {
    return str(requestId);
  }
  return str(activity.target?.id) || 'conversation';
}

export function chatbotName(activity: ActivityRecord): string {
  const actionObj = activity.actionObj || {};
  const targetObject = activity.target?.object || {};
  return str(actionObj['name'] || targetObject['name']) || 'chatbot';
}

export function faqKbCreateChatbotName(activity: ActivityRecord): string {
  return str(activity.actionObj?.['name']);
}

export function chatbotSubtypeLabel(activity: ActivityRecord): string {
  const actionObj = activity.actionObj || {};
  const targetObject = activity.target?.object || {};
  return str(actionObj['subtype'] || targetObject['subtype']) || 'chatbot';
}

export function chatbotIdFromActivity(activity: ActivityRecord): string {
  const actionObj = activity.actionObj || {};
  const targetObject = activity.target?.object || {};

  return str(
    activity.target?.id ||
    targetObject['_id'] ||
    actionObj['id'] ||
    actionObj['faqKbId']
  );
}

export function systemActorLabel(activity: ActivityRecord): string {
  return str(activity.actor?.name) || 'System';
}

export function shouldLinkParticipant(profileId: string, name?: string): boolean {
  if (!profileId) {
    return false;
  }
  if (profileId.toLowerCase() === 'system') {
    return false;
  }
  if (name?.toLowerCase() === 'system') {
    return false;
  }
  return true;
}

function isMongoId(value: string): boolean {
  return /^[a-f0-9]{24}$/i.test(value);
}

function readNamespaceReference(value: unknown): { id: string; name: string } {
  if (!value) {
    return { id: '', name: '' };
  }

  if (typeof value === 'object') {
    const namespaceObject = value as Record<string, unknown>;
    return {
      id: str(namespaceObject['_id'] || namespaceObject['id']),
      name: str(namespaceObject['name']),
    };
  }

  const asString = str(value);
  return {
    id: isMongoId(asString) ? asString : '',
    name: isMongoId(asString) ? '' : asString,
  };
}

export function namespaceIdFromActivity(activity: ActivityRecord): string {
  const actionObj = activity.actionObj || {};
  const targetObject = activity.target?.object || {};
  const targetType = str(activity.target?.type).toLowerCase();
  const verb = str(activity.verb);

  const actionNamespaceId = str(actionObj['namespaceId']);
  if (isMongoId(actionNamespaceId)) {
    return actionNamespaceId;
  }

  const targetNamespace = readNamespaceReference(targetObject['namespace']);
  if (targetNamespace.id) {
    return targetNamespace.id;
  }

  if (targetType.includes('namespace') || verb.startsWith('KB_NAMESPACE_')) {
    return str(
      activity.target?.id ||
      targetObject['_id'] ||
      actionObj['namespaceId']
    );
  }

  const actionNamespace = str(actionObj['namespace']);
  if (isMongoId(actionNamespace)) {
    return actionNamespace;
  }

  return '';
}

export function namespaceName(activity: ActivityRecord): string {
  const actionObj = activity.actionObj || {};
  const targetObject = activity.target?.object || {};
  const fromAction = str(actionObj['namespaceName']);
  if (fromAction) {
    return fromAction;
  }

  const fromTargetNamespaceName = str(targetObject['namespaceName']);
  if (fromTargetNamespaceName) {
    return fromTargetNamespaceName;
  }

  const targetNamespace = readNamespaceReference(targetObject['namespace']);
  if (targetNamespace.name) {
    return targetNamespace.name;
  }

  const fromTargetName = str(targetObject['name']);
  if (fromTargetName) {
    return fromTargetName;
  }

  const actionNamespace = str(actionObj['namespace']);
  if (actionNamespace && !isMongoId(actionNamespace)) {
    return actionNamespace;
  }

  const namespaceId = namespaceIdFromActivity(activity);
  return namespaceId || 'namespace';
}

export function kbContentDeleteNamespaceName(activity: ActivityRecord): string {
  return str(activity.actionObj?.['namespaceName']);
}

export function decodeActivitySource(value: string): string {
  if (!value) {
    return value;
  }
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
}

/** Last path segment of a file URL/path (e.g. …/mio_file.txt → mio_file.txt). */
export function kbFileSourceDisplayName(source: string): string {
  const decoded = decodeActivitySource(source).trim();
  if (!decoded) {
    return '';
  }

  try {
    const url = new URL(decoded);
    const pathParam = url.searchParams.get('path');
    if (pathParam) {
      const segments = pathParam.split('/').filter(Boolean);
      return segments[segments.length - 1] || decoded;
    }
  } catch {
    // Not an absolute URL — fall through to path-segment logic.
  }

  const withoutQuery = decoded.split('?')[0];
  const segments = withoutQuery.split('/').filter(Boolean);
  return segments[segments.length - 1] || decoded;
}

export function kbActivitySource(activity: ActivityRecord): string {
  const source = decodeActivitySource(str(activity.actionObj?.['source']));
  if (!source) {
    return '';
  }

  const type = str(activity.actionObj?.['type']).trim().toLowerCase();
  if (type === 'pdf' || type === 'txt') {
    return kbFileSourceDisplayName(source);
  }

  return source;
}

export function manualAssignmentAssigneeType(activity: ActivityRecord): 'user' | 'bot' | 'department' {
  const type = str(activity.actionObj?.['assigneeType']);
  if (type === 'bot' || type === 'department') {
    return type;
  }
  return 'user';
}

export function isManualAssignmentBotAssignee(activity: ActivityRecord): boolean {
  return manualAssignmentAssigneeType(activity) === 'bot';
}

export function isManualAssignmentDepartmentAssignee(activity: ActivityRecord): boolean {
  return manualAssignmentAssigneeType(activity) === 'department';
}

export function isManualAssignmentUserAssignee(activity: ActivityRecord): boolean {
  return manualAssignmentAssigneeType(activity) === 'user';
}

export function manualAssignmentAssigneeLabel(activity: ActivityRecord, resolvedName: string): string {
  const name = str(activity.actionObj?.['assigneeName']) || resolvedName;
  const cleanName = name.replace(/\s*\(chatbot\)\s*$/i, '').trim();
  if (manualAssignmentAssigneeType(activity) === 'bot') {
    return `chatbot ${cleanName}`;
  }
  if (manualAssignmentAssigneeType(activity) === 'department') {
    return `department ${cleanName}`;
  }
  return `teammate ${cleanName}`;
}

export function isManualAssignmentReassign(activity: ActivityRecord): boolean {
  const actionObj = activity.actionObj || {};
  return !!actionObj['previousAssigneeId']
    || str(actionObj['assignmentType']) === 'manual_reassign';
}

export function usesActorLedManualAssignmentPhrase(activity: ActivityRecord): boolean {
  return activity.actor?.type !== 'system' && !!str(activity.actor?.name);
}

export function isManualAssignmentBotActor(activity: ActivityRecord): boolean {
  return !!activity.manual_assignment_actor_is_bot || activity.actor?.type === 'bot';
}

export function renderRequestAssignedManualMessage(
  activity: ActivityRecord,
  resolvedAssigneeName: string,
): string {
  const conversation = conversationLabel(activity);
  const assigneeLabel = manualAssignmentAssigneeLabel(activity, resolvedAssigneeName);
  const actor = actorName(activity);

  if (!usesActorLedManualAssignmentPhrase(activity)) {
    if (isManualAssignmentReassign(activity)) {
      return `The conversation ${conversation} was reassigned to ${assigneeLabel} by ${actor}`;
    }
    return `The conversation ${conversation} was assigned to ${assigneeLabel} by ${actor}`;
  }

  if (isManualAssignmentReassign(activity)) {
    if (isManualAssignmentBotActor(activity)) {
      return `${actor} reassigned the conversation '${conversation}' to ${assigneeLabel}.`;
    }
    return `${actor} manually reassigned the conversation '${conversation}' to ${assigneeLabel}.`;
  }

  if (isManualAssignmentBotActor(activity)) {
    return `${actor} assigned the conversation '${conversation}' to ${assigneeLabel}.`;
  }
  return `${actor} manually assigned the conversation '${conversation}' to ${assigneeLabel}.`;
}

export function resolveAgentName(activity: ActivityRecord, userId?: string | null): string {
  if (!userId) {
    return 'unknown agent';
  }

  const normalizedUserId = normalizeId(userId);
  const actionObj = activity.actionObj || {};
  const participatingAgents = actionObj['participatingAgents'] || activity.target?.object?.['participatingAgents'];

  if (Array.isArray(participatingAgents)) {
    for (const agent of participatingAgents) {
      const agentRecord = agent as Record<string, unknown>;
      const user = (agentRecord['id_user'] || agentRecord) as Record<string, unknown>;
      const id = normalizeId(user['_id'] || user['id'] || user);
      if (id === normalizedUserId) {
        const name = str(agentRecord['name'])
          || [user['firstname'], user['lastname']].filter(Boolean).join(' ').trim();
        if (name) {
          return name;
        }
      }
    }
  }

  const assigneeName = str(actionObj['assigneeName']);
  if (assigneeName && normalizeId(actionObj['assigneeId']) === normalizedUserId) {
    return assigneeName;
  }

  if (normalizedUserId === normalizeId(activity.actor?.id)) {
    return str(activity.actor?.name) || str(activity.actor?.id);
  }

  return formatActorIdLabel(normalizedUserId);
}

export function unassignedParticipantId(activity: ActivityRecord): string {
  const actionObj = activity.actionObj || {};
  const assigneeId = str(actionObj['previousAssigneeId']) || str(actionObj['assigneeId']);
  if (assigneeId) {
    return assigneeId;
  }

  const targetUserId = getTargetUserId(activity);
  if (targetUserId) {
    return targetUserId;
  }

  if (activity.actor?.type !== 'system') {
    return str(activity.actor?.id);
  }

  return '';
}

export function unassignedParticipantName(activity: ActivityRecord): string {
  const enriched = activity.unassigned_participant_display;
  if (enriched?.name) {
    return enriched.name;
  }

  const actionObj = activity.actionObj || {};
  const assigneeName = str(
    actionObj['assigneeName'] || actionObj['previousAssigneeName'] || actionObj['participantName'],
  );
  if (assigneeName) {
    return assigneeName;
  }

  const participantId = str(actionObj['previousAssigneeId']) || str(actionObj['assigneeId']);
  if (participantId) {
    const resolvedParticipant = resolveAgentParticipant(activity, participantId);
    if (resolvedParticipant?.name) {
      return resolvedParticipant.name;
    }

    const resolvedName = resolveAgentName(activity, participantId);
    if (resolvedName !== 'unknown agent') {
      return resolvedName;
    }
  }

  const targetParticipant = targetConversationUserParticipant(activity);
  if (targetParticipant) {
    const targetId = normalizeId(targetParticipant.profileId);
    const assigneeId = normalizeId(participantId);
    if (!assigneeId || assigneeId === targetId) {
      return targetParticipant.name;
    }
  }

  if (activity.actor?.type !== 'system') {
    const actorNameValue = str(activity.actor?.name);
    if (actorNameValue) {
      return actorNameValue;
    }
  }

  const fallbackId = participantId || unassignedParticipantId(activity);
  if (!fallbackId) {
    return 'Someone';
  }

  return fallbackId;
}

export function isSystemUnassignActivity(activity: ActivityRecord): boolean {
  return activity.actor?.type === 'system'
    && str(activity.actionObj?.['assignmentType']) === 'unassign';
}

export function renderRequestUnassignedMessage(activity: ActivityRecord): string {
  const conversation = conversationLabel(activity);
  const participant = unassignedParticipantName(activity);
  if (isSystemUnassignActivity(activity)) {
    return `${systemActorLabel(activity)} removed ${participant} from the conversation '${conversation}'.`;
  }
  return `${participant} was unassigned from the conversation '${conversation}'.`;
}

export function autoAssignmentAssigneeName(activity: ActivityRecord): string {
  const actionObj = activity.actionObj || {};
  const assigneeName = str(actionObj['assigneeName']).replace(/\s*\(chatbot\)\s*$/i, '').trim();
  if (assigneeName) {
    return assigneeName;
  }

  const assigneeId = str(actionObj['assigneeId']);
  if (assigneeId) {
    const resolved = resolveAgentName(activity, assigneeId);
    if (resolved !== 'unknown agent') {
      return resolved;
    }
  }

  return targetConversationUserParticipant(activity)?.name || 'unknown agent';
}

export function renderRequestAssignedAutoMessage(activity: ActivityRecord): string {
  const conversation = conversationLabel(activity);
  const assignee = autoAssignmentAssigneeName(activity);
  if (activity.actor?.type === 'system') {
    return `${systemActorLabel(activity)} automatically assigned the conversation '${conversation}' to ${assignee}.`;
  }
  return `The conversation ${conversation} was automatically assigned to ${assignee}`;
}

export interface ActivityParticipantDisplay {
  name: string;
  profileId: string;
}

export function resolveAgentParticipant(
  activity: ActivityRecord,
  userId?: string | null,
): ActivityParticipantDisplay | null {
  if (!userId) {
    return null;
  }

  const normalizedUserId = normalizeId(userId);
  const actionObj = activity.actionObj || {};
  const targetObject = activity.target?.object || {};
  const participatingAgents = actionObj['participatingAgents'] || targetObject['participatingAgents'];

  if (Array.isArray(participatingAgents)) {
    for (const agent of participatingAgents) {
      const agentRecord = agent as Record<string, unknown>;
      const user = (agentRecord['id_user'] || agentRecord) as Record<string, unknown>;
      const id = normalizeId(user['_id'] || user['id'] || user);
      if (id === normalizedUserId) {
        const name = str(agentRecord['name'])
          || [user['firstname'], user['lastname']].filter(Boolean).join(' ').trim();
        if (name) {
          return { name, profileId: id };
        }
      }
    }
  }

  const participatingBots = actionObj['participatingBots'] || targetObject['participatingBots'];
  if (Array.isArray(participatingBots)) {
    for (const bot of participatingBots) {
      const botRecord = bot as Record<string, unknown>;
      const id = normalizeId(botRecord['_id'] || botRecord['id']);
      if (id === normalizedUserId) {
        const name = str(botRecord['name']);
        if (name) {
          return { name, profileId: `bot_${id}` };
        }
      }
    }
  }

  const name = resolveAgentName(activity, userId);
  if (name === 'unknown agent') {
    return null;
  }

  return { name, profileId: normalizedUserId };
}

export function projectUserUpdateRoleLabel(actionObj: Record<string, unknown> = {}): string {
  return str(actionObj['role']);
}

export function isRegisteredProjectUserInvite(activity: ActivityRecord): boolean {
  return str(activity.actionObj?.['inviteType']) === 'registered';
}

export function isSystemAbandonedChatsUpdate(actionObj: Record<string, unknown> = {}): boolean {
  if (str(actionObj['updateType']) !== 'system') {
    return false;
  }
  const attributes = actionObj['attributes'] as Record<string, unknown> | undefined;
  return attributes != null && attributes['abandoned_chats'] !== undefined && attributes['abandoned_chats'] !== null;
}

export function systemAbandonedChatsCount(actionObj: Record<string, unknown> = {}): string {
  const attributes = actionObj['attributes'] as Record<string, unknown> | undefined;
  if (!attributes) {
    return '';
  }
  return str(attributes['abandoned_chats']);
}

export function formatNewStatus(actionObj: Record<string, unknown> = {}): string {
  const newStatus = str(actionObj['newStatus']);
  if (newStatus) {
    return newStatus;
  }
  if (actionObj['profileStatus']) {
    return str(actionObj['profileStatus']);
  }
  if (actionObj['user_available'] === true) {
    return 'available';
  }
  if (actionObj['user_available'] === false) {
    return 'unavailable';
  }
  return 'unknown';
}

export function availabilityStatusLabel(actionObj: Record<string, unknown> = {}): string {
  if (actionObj['user_available'] === true && !actionObj['profileStatus']) {
    return 'Available';
  }
  if (actionObj['user_available'] === false && actionObj['profileStatus'] === 'inactive') {
    return 'Inactive';
  }
  if (actionObj['user_available'] === false) {
    return 'Unavailable';
  }
  const newStatus = str(actionObj['newStatus'] || 'unknown');
  return newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
}

export function formatContentAddType(contentAddType: unknown): string {
  switch (contentAddType) {
    case 'url_list':
      return 'URL list';
    case 'csv':
      return 'CSV';
    case 'sitemap':
      return 'sitemap';
    case 'content':
    default:
      return 'content';
  }
}

/** Format actionObj.type for KB content messages (faq/txt/pdf → FAQ/TXT/PDF). */
export function formatKbContentTypeLabel(type: unknown): string {
  const value = str(type).trim();
  if (!value) {
    return '';
  }

  const lower = value.toLowerCase();
  if (lower === 'faq' || lower === 'txt' || lower === 'pdf') {
    return lower.toUpperCase();
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Parenthetical detail for single KB_CONTENTS_ADD rows:
 * prefer actionObj.type (Faq), else non-generic contentAddType (URL list, CSV, …).
 */
export function kbContentsAddTypeSuffix(actionObj: Record<string, unknown>): string {
  const typeLabel = formatKbContentTypeLabel(actionObj['type']);
  if (typeLabel) {
    return ` (${typeLabel})`;
  }

  const rawContentAddType = str(actionObj['contentAddType']).trim();
  if (!rawContentAddType || rawContentAddType === 'content') {
    return '';
  }

  return ` (${formatContentAddType(rawContentAddType)})`;
}

/** Map legacy/API verb aliases to the verbs handled by the dashboard. */
export function normalizeActivityVerb(verb: string): string {
  switch (verb) {
    case 'CHATBOT_PUBLISH':
      return 'FAQ_KB_PUBLISH';
    case 'CHATBOT_CREATE':
      return 'FAQ_KB_CREATE';
    case 'CHATBOT_DELETE':
      return 'FAQ_KB_DELETE';
    default:
      return verb;
  }
}

/** Reclassify legacy mis-tagged availability activities. */
export function effectiveVerb(activity: ActivityRecord): string {
  const verb = normalizeActivityVerb(str(activity.verb));
  if (verb !== 'PROJECT_USER_AVAILABILITY_SELF') {
    return verb;
  }

  const actorId = normalizeId(activity.actor?.id);
  const targetUserId = normalizeId(
    (activity.target?.object?.['id_user'] as Record<string, unknown> | undefined)?.['_id']
  );

  if (activity.actor?.type === 'system') {
    return 'PROJECT_USER_AVAILABILITY_SYSTEM';
  }

  if (actorId && targetUserId && actorId !== targetUserId) {
    return 'PROJECT_USER_UPDATE';
  }

  return verb;
}

export function getRequestId(activity: ActivityRecord): string | null {
  const requestId = activity.target?.object?.['request_id'];
  return requestId ? str(requestId) : null;
}

export function getTargetUserId(activity: ActivityRecord): string | null {
  const userId = (activity.target?.object?.['id_user'] as Record<string, unknown> | undefined)?.['_id'];
  return userId ? str(userId) : null;
}

function projectUserTargetLabel(activity: ActivityRecord): string {
  return resolveProjectUserInviteTargetLabel(activity);
}

export function isPendingProjectUserInvite(activity: ActivityRecord): boolean {
  return activity.target?.type === 'pendinginvitation';
}

export function projectUserInviteEmail(activity: ActivityRecord): string {
  return str(activity.actionObj?.['email']);
}

export function resolveProjectUserInviteTargetLabel(activity: ActivityRecord): string {
  if (isPendingProjectUserInvite(activity)) {
    return projectUserInviteEmail(activity) || 'invited user';
  }

  return resolveProjectUserTargetDisplay(activity)?.label || targetUserName(activity);
}

export function isProjectUserInviteTargetLinkable(activity: ActivityRecord): boolean {
  if (isPendingProjectUserInvite(activity)) {
    return false;
  }

  return !!(resolveProjectUserTargetDisplay(activity)?.profileId || getTargetUserId(activity));
}

export function renderActivity(activity: ActivityRecord): string {
  if (activity.message && !activity.verb) {
    return activity.message;
  }

  const verb = effectiveVerb(activity);
  const actor = actorName(activity);
  const conversation = conversationLabel(activity);
  const assignee = resolveAgentName(activity, str(activity.actionObj?.['assigneeId']));
  const previous = resolveAgentName(activity, str(activity.actionObj?.['previousAssigneeId']));
  const targetUser = targetUserName(activity);
  const actionObj = activity.actionObj || {};
  const newStatus = formatNewStatus(actionObj);
  const chatbot = chatbotName(activity);
  const chatbotSubtype = chatbotSubtypeLabel(activity);
  const namespace = namespaceName(activity);

  switch (verb) {
    case 'REQUEST_ASSIGNED_SELF':
      return `${actor} joined the conversation: ${conversation}`;

    case 'REQUEST_ASSIGNED_AUTO':
      return renderRequestAssignedAutoMessage(activity);

    case 'REQUEST_ASSIGNED_MANUAL':
      return renderRequestAssignedManualMessage(activity, assignee);

    case 'REQUEST_UNASSIGNED':
      return renderRequestUnassignedMessage(activity);

    case 'REQUEST_CREATE': {
      const conversation = conversationLabel(activity);
      const assigneeName = str(activity.participant_fullname)
        .replace(/\s*\(chatbot\)\s*$/i, '')
        .trim();
      const assigneeId = str(activity.request_create_assignee_id);
      const isBotAssignee = assigneeId.includes('bot_');

      if (activity.target?.object?.['status'] === 100) {
        return `New unserved conversation: ${conversation}`;
      }
      if (assigneeName) {
        const assigneeLabel = isBotAssignee ? `chatbot ${assigneeName}` : assigneeName;
        return `New conversation: ${conversation} assigned to ${assigneeLabel}`;
      }
      return `New conversation: ${conversation}`;
    }

    case 'REQUEST_CLOSE': {
      const conversation = conversationLabel(activity);
      const closedBy = getClosedByLabel(activity);
      return renderRequestCloseMessage(activity, conversation, closedBy);
    }

    case 'PROJECT_USER_AVAILABILITY_SELF':
      return `${actor} has changed their availability status to ${availabilityStatusLabel(actionObj)}`;

    case 'PROJECT_USER_AVAILABILITY_SYSTEM':
      return `${targetUser} availability status was changed to ${newStatus} by the system`;

    case 'FAQ_KB_CREATE': {
      const createdChatbotName = faqKbCreateChatbotName(activity) || chatbot;
      return `${actor} created ${chatbotSubtype} ${createdChatbotName}`;
    }

    case 'FAQ_KB_DELETE':
      return `${actor} deleted chatbot ${chatbot}`;

    case 'FAQ_KB_PUBLISH': {
      const publishedChatbotName = faqKbCreateChatbotName(activity) || chatbot;
      return `${actor} published chatbot ${publishedChatbotName}`;
    }

    case 'KB_NAMESPACE_CREATE':
      return `${actor} created namespace ${namespace}`;

    case 'KB_NAMESPACE_DELETE':
      return `${actor} deleted namespace ${namespace}`;

    case 'KB_CONTENTS_ADD': {
      const count = actionObj['count'];
      const contentAddType = formatContentAddType(actionObj['contentAddType']);
      const typeSuffix = kbContentsAddTypeSuffix(actionObj);
      const source = kbActivitySource(activity);
      if (count && Number(count) > 1) {
        return `${actor} added ${count} items (${contentAddType}) to namespace ${namespace}`;
      }
      if (actionObj['contentAddType'] === 'sitemap' && source) {
        return `${actor} added sitemap ${source} to namespace ${namespace}`;
      }
      if (source) {
        return `${actor} added content${typeSuffix} ${source} to namespace ${namespace}`;
      }
      return `${actor} added content${typeSuffix} to namespace ${namespace}`;
    }

    case 'KB_CONTENTS_DELETE':
      return `${actor} deleted all contents from namespace ${namespace}`;

    case 'KB_CONTENT_DELETE': {
      const source = kbActivitySource(activity);
      const nsName = kbContentDeleteNamespaceName(activity) || 'namespace';
      return `${actor} deleted content ${source} from namespace ${nsName}`;
    }

    case 'PROJECT_USER_INVITE': {
      const email = str(actionObj['email']);
      const role = str(actionObj['role']) || 'teammate';
      const pending = isPendingProjectUserInvite(activity) ? ' (pending invitation)' : '';
      const invitee = projectUserTargetLabel(activity);
      const emailSuffix = !isPendingProjectUserInvite(activity) && email ? ` (${email})` : '';
      if (isRegisteredProjectUserInvite(activity)) {
        return `${actor} invited ${invitee}${emailSuffix} with ${role} role`;
      }
      return `${actor} invited ${invitee}${emailSuffix} to take on the role of ${role}${pending}`;
    }

    case 'PROJECT_USER_DELETE':
      return `${actor} removed ${projectUserTargetLabel(activity)} from the project`;

    case 'PROJECT_USER_UPDATE': {
      const actorId = normalizeId(activity.actor?.id);
      const targetUserId = normalizeId(
        (activity.target?.object?.['id_user'] as Record<string, unknown> | undefined)?.['_id']
      );
      const isSelf = actorId && targetUserId && actorId === targetUserId;
      const roleLabel = projectUserUpdateRoleLabel(actionObj);

      if (isSystemAbandonedChatsUpdate(actionObj)) {
        const count = systemAbandonedChatsCount(actionObj);
        return isSelf
          ? `${actor} has updated their abandoned chats count to ${count}`
          : `${actor} has updated ${targetUser}'s abandoned chats count to ${count}`;
      }

      if (roleLabel) {
        return isSelf
          ? `${actor} changed their role to ${roleLabel}`
          : `${actor} changed the role of ${targetUser} to ${roleLabel}`;
      }
      if (actionObj['user_available'] === true) {
        return isSelf
          ? `${targetUser || actor}'s availability status has been changed to ${availabilityStatusLabel(actionObj)} by themselves`
          : `${actor} changed the availability status of ${targetUser} to available`;
      }
      if (actionObj['user_available'] === false) {
        return isSelf
          ? `${targetUser || actor}'s availability status has been changed to ${availabilityStatusLabel(actionObj)} by themselves`
          : `${actor} changed the availability status of ${targetUser} to ${availabilityStatusLabel(actionObj).toLowerCase()}`;
      }
      break;
    }

    default:
      break;
  }

  if (activity.message) {
    return activity.message;
  }

  return verb || 'Unknown activity';
}

export function isSystemActor(activity: ActivityRecord): boolean {
  if (activity.actor?.type === 'system') {
    return true;
  }
  return str(activity.actor?.name).toLowerCase() === 'system';
}

export function getActivityIcon(verb: string | undefined): string {
  if (!verb) {
    return DEFAULT_ACTIVITY_ICON;
  }
  return ACTIVITY_ICON_BY_VERB[verb] || DEFAULT_ACTIVITY_ICON;
}

export function getActivityIconForActivity(activity: ActivityRecord): string {
  const verb = effectiveVerb(activity);
  if (verb === 'REQUEST_ASSIGNED_MANUAL' && isManualAssignmentBotActor(activity)) {
    return MANUAL_ASSIGNMENT_BOT_ACTOR_ICON;
  }
  if (isSystemActor(activity)) {
    if (verb === 'PROJECT_USER_UPDATE') {
      return SYSTEM_EDIT_ACTIVITY_ICON;
    }
    if (verb === 'REQUEST_UNASSIGNED') {
      return SYSTEM_UNASSIGNED_ACTIVITY_ICON;
    }
    if (verb === 'REQUEST_ASSIGNED_AUTO') {
      return SYSTEM_ASSIGNED_ACTIVITY_ICON;
    }
  }
  return getActivityIcon(verb);
}
