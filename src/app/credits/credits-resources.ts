import { CreditsLlmUsage, CreditsPeriod, CreditsSummary } from 'app/services/credits.service';

/** Resources charged on their tokens, with the usage by model */
export const TOKEN_RESOURCES = ['llm', 'kb_indexing', 'ocr_llm', 'vibe_coder'];

/** monthly: fee of the resources owned; usage: fee for every use; ai: cost of the tokens */
export type CreditsGroup = 'monthly' | 'usage' | 'ai';

export const CREDITS_GROUPS: CreditsGroup[] = ['monthly', 'usage', 'ai'];

const RESOURCE_COLORS: { [resource: string]: string } = {
  project_user: '#5b4bdb',
  chatbot: '#8a7cf0',
  kb_content: '#b9b0f7',
  flow_execution: '#1a73b8',
  conversation: '#1a73b8',
  email: '#3ea9f5',
  namespace: '#7cc4f8',
  ocr: '#00897b',
  whatsapp_message: '#43a047',
  whatsapp_broadcast: '#8bc34a',
  llm: '#ef6c00',
  kb_indexing: '#ffa726',
  ocr_llm: '#ffcc80',
  vibe_coder: '#d84315'
};

const GROUP_COLORS: { [group in CreditsGroup]: string } = {
  monthly: '#5b4bdb',
  usage: '#1a73b8',
  ai: '#ef6c00'
};

export function resourceGroup(resource: string, summary: CreditsSummary | null): CreditsGroup {
  if (TOKEN_RESOURCES.includes(resource)) {
    return 'ai';
  }
  if (summary?.monthlyCosts && summary.monthlyCosts[resource] !== undefined) {
    return 'monthly';
  }
  return 'usage';
}

export function resourceColor(resource: string): string {
  return RESOURCE_COLORS[resource] || '#9aa5b8';
}

export function groupColor(group: CreditsGroup): string {
  return GROUP_COLORS[group];
}

export interface CreditsResourceRow {
  resource: string;
  group: CreditsGroup;
  credits: number;
  units: number;
  tokens?: number;
  /** share of the credits consumed in the period, 0-100 */
  perc: number;
}

/** Credits of the period by resource, highest first */
export function resourceRows(period: CreditsPeriod | null, summary: CreditsSummary | null): CreditsResourceRow[] {
  if (!period) {
    return [];
  }
  const consumed = period.consumed || 0;
  return Object.keys(period.resources)
    .map((resource) => {
      const total = period.resources[resource];
      return {
        resource,
        group: resourceGroup(resource, summary),
        credits: total.credits,
        units: total.units,
        tokens: total.tokens,
        perc: consumed ? (total.credits / consumed) * 100 : 0
      };
    })
    .filter((row) => row.credits > 0 || row.units > 0)
    .sort((a, b) => b.credits - a.credits);
}

/** The usage on tokens of the period; servers without the resource of the rows return only the 'llm' one */
export function tokenUsage(period: CreditsPeriod | null): CreditsLlmUsage[] {
  return (period?.llm || []).map((usage) => usage.resource ? usage : Object.assign({}, usage, { resource: 'llm' }));
}

/** provider/model of a usage on tokens, undefined when the service reported only its cost */
export function modelLabel(usage: CreditsLlmUsage): string | undefined {
  if (!usage.model) {
    return undefined;
  }
  return usage.provider ? usage.provider + '/' + usage.model : usage.model;
}

export function round(value: number, digits = 4): number {
  const scale = Math.pow(10, digits);
  return Math.round(value * scale) / scale;
}
