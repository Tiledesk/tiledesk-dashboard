/** Usage of the Design Studio AI agent (flow builder) token budget. */
export interface AgentTokensUsage {
  count: number;
  limit: number;
  perc: number;
  runnedOut: boolean;
}

/**
 * Progress % for quota UI (0–100).
 * If usage is > 0 but < 1% of the limit, returns 1 so the bar is visible
 * (Math.floor alone would show 0% for e.g. 2/400).
 */
export function calcQuotaUsagePercent(used: number, limit: number): number {
  if (!Number.isFinite(limit) || limit <= 0) {
    return 0;
  }
  const usedSafe = Number(used) || 0;
  if (usedSafe <= 0) {
    return 0;
  }
  const perc = Math.floor((usedSafe / limit) * 100);
  return Math.min(100, Math.max(1, perc));
}

/**
 * AI agent (Design Studio flow builder) token usage, separate from the chatbot AI tokens.
 * Returns null when the server does not return `agent_tokens` (older server): the UI hides the indicator.
 * Limit: `agent_tokens` from the plan limits (project.profile.quotes override already merged by
 * QuotesService.getQuoteLimits), falling back to `tokens` (the server uses the same value for every plan).
 */
export function computeAgentTokensUsage(allQuotes: any, limits: any): AgentTokensUsage | null {
  const agentTokens = allQuotes?.agent_tokens;
  if (!agentTokens || typeof agentTokens !== 'object') {
    return null;
  }
  const count = Number(agentTokens.quote) || 0;
  const limit = Number(limits?.agent_tokens ?? limits?.tokens) || 0;
  return {
    count,
    limit,
    perc: calcQuotaUsagePercent(count, limit),
    // Same rule as the tokens quota (quote >= limit): an explicit 0 override means used up.
    runnedOut: count >= limit,
  };
}
