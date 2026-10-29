/**
 * Whether a websocket request is visible to a logged-in agent (user id, not project_user id).
 * Owner/admin bypass this helper at the call site.
 *
 * Visibility rules (in order):
 * 1. participants contains userId
 * 2. snapshot.visibility === "agents" → agentIds (fallback snapshot.agents[].id_user)
 * 3. snapshot.visibility === "project" → visibilitySince >= projectUserCreatedAt
 * 4. no visibility (legacy) → snapshot.agents[].id_user contains userId
 */

function asId(value: any): string {
  return value == null ? '' : String(value);
}

function participantsInclude(request: any, userId: string): boolean {
  const participants = request?.participants;
  if (!Array.isArray(participants) || !userId) {
    return false;
  }
  return participants.some((p) => asId(p) === userId);
}

function agentsIncludeUser(agents: any[] | null | undefined, userId: string): boolean {
  if (!Array.isArray(agents) || agents.length === 0 || !userId) {
    return false;
  }
  return agents.some((a) => a && asId(a.id_user) === userId);
}

function agentIdsIncludeUser(agentIds: any[] | null | undefined, userId: string): boolean {
  if (!Array.isArray(agentIds) || agentIds.length === 0 || !userId) {
    return false;
  }
  return agentIds.some((id) => asId(id) === userId);
}

/**
 * visibilitySince is equal to or later than projectUserCreatedAt
 * (agent was already in the project when the request became project-visible).
 */
function isVisibilitySinceOnOrAfterCreatedAt(
  visibilitySince: any,
  projectUserCreatedAt: string | Date | null | undefined,
): boolean {
  if (projectUserCreatedAt == null || projectUserCreatedAt === '') {
    return false;
  }
  if (visibilitySince == null || visibilitySince === '') {
    return false;
  }
  const sinceMs = new Date(visibilitySince).getTime();
  const createdMs = new Date(projectUserCreatedAt).getTime();
  if (isNaN(sinceMs) || isNaN(createdMs)) {
    return false;
  }
  return sinceMs >= createdMs;
}

/**
 * @param request websocket request (may use snapshot.visibility / agentIds / agents)
 * @param userId logged-in user._id (string comparison)
 * @param projectUserCreatedAt project_user.createdAt of the logged-in agent
 */
export function isRequestVisibleToAgent(
  request: any,
  userId: string | null | undefined,
  projectUserCreatedAt: string | Date | null | undefined,
): boolean {
  const uid = asId(userId);
  if (!uid || !request) {
    return false;
  }

  if (participantsInclude(request, uid)) {
    return true;
  }

  const snapshot = request.snapshot || {};
  const visibility = snapshot.visibility;

  if (visibility === 'agents') {
    if (Array.isArray(snapshot.agentIds)) {
      return agentIdsIncludeUser(snapshot.agentIds, uid);
    }
    return agentsIncludeUser(snapshot.agents, uid);
  }

  if (visibility === 'project') {
    if (projectUserCreatedAt == null || projectUserCreatedAt === '') {
      return false;
    }
    return isVisibilitySinceOnOrAfterCreatedAt(snapshot.visibilitySince, projectUserCreatedAt);
  }

  // Legacy: no visibility field
  return agentsIncludeUser(snapshot.agents, uid);
}
