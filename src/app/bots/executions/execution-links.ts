/** Shape of an execution id (uuid); anything else is never rendered as a link. */
const EXECUTION_ID_RE = /^[0-9a-f-]{36}$/i;

export function validExecutionId(value: any): string | null {
  return typeof value === 'string' && EXECUTION_ID_RE.test(value) ? value : null;
}

export interface ExecutionLink {
  commands: string[];
  queryParams?: { q: string };
}

/**
 * Link into the executions pages for one execution. With an agent id it goes straight to the detail;
 * without it falls back to the all-agents list filtered by the execution id.
 */
export function executionLink(projectId: string, agentId: string | null | undefined, executionId: any): ExecutionLink | null {
  const id = validExecutionId(executionId);
  if (!projectId || !id) return null;
  if (agentId) return { commands: ['/project', projectId, 'bots', agentId, 'executions', id] };
  return { commands: ['/project', projectId, 'bots', 'executions'], queryParams: { q: id } };
}

/** Agent id of an execution: root id when the bot has one, else the bot's own id. */
export function executionAgentId(bot: any): string | null {
  return bot ? (bot.root_id || bot._id || null) : null;
}
