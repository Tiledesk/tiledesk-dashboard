/**
 * Run controls of the agents list: a Webhook agent is run once (POST /webhook/:webhook_id with a payload),
 * a Scheduled agent has its published schedule started or stopped (server PUT
 * /webhooks/:chatbot_id/start_points/scheduled/running). Both read the agent's webhook record (GET /webhooks/).
 */

/** none: no scheduled start; unpublished: never published (nothing to start); error: last sync failed. */
export type ScheduleState = 'none' | 'unpublished' | 'running' | 'stopped' | 'error';

export interface AgentRunInfo {
  /** The webhook to call for a run; null when the agent cannot be run from the list. */
  webhookId: string | null;
  schedule: ScheduleState;
}

const NO_RUN: AgentRunInfo = { webhookId: null, schedule: 'none' };

function startPoint(webhook: any, type: string): any {
  const list = webhook && webhook.start_points;
  return Array.isArray(list) ? list.find((sp: any) => sp && sp.type === type) : undefined;
}

/**
 * Runnable as a webhook: a Webhook agent (subtype webhook) or an agent with a webhook start point, whose
 * webhook is switched on. Scheduled: from the published snapshot (scheduled_live), never from the draft.
 */
export function agentRunInfo(bot: any, webhook: any): AgentRunInfo {
  if (!bot || !webhook) return NO_RUN;
  const isWebhook = bot.subtype === 'webhook' || !!startPoint(webhook, 'webhook');
  const webhookId = isWebhook && webhook.enabled !== false && webhook.webhook_id ? String(webhook.webhook_id) : null;

  const live = webhook.scheduled_live;
  let schedule: ScheduleState = 'none';
  if (startPoint(webhook, 'scheduled') || live) {
    if (live && live.error) schedule = 'error';
    else if (!live || !live.schedule || !live.published_bot_id) schedule = 'unpublished';
    else schedule = live.enabled === true && !live.stopped ? 'running' : 'stopped';
  }
  return { webhookId, schedule };
}

/** Webhook records by agent: the draft id is the record's chatbot_id. */
export function webhooksByAgent(webhooks: any[]): { [chatbotId: string]: any } {
  const map: { [chatbotId: string]: any } = {};
  (Array.isArray(webhooks) ? webhooks : []).forEach(w => {
    if (w && w.chatbot_id) map[String(w.chatbot_id)] = w;
  });
  return map;
}

/** The payload typed in the run dialog: '' is {}, anything else must be a JSON object. */
export function parseRunPayload(text: string): { ok: true; payload: { [k: string]: any } } | { ok: false; error: 'invalid_json' | 'not_object' } {
  const t = (text || '').trim();
  if (!t) return { ok: true, payload: {} };
  let v: any;
  try {
    v = JSON.parse(t);
  } catch (e) {
    return { ok: false, error: 'invalid_json' };
  }
  if (!v || typeof v !== 'object' || Array.isArray(v)) return { ok: false, error: 'not_object' };
  return { ok: true, payload: v };
}
