import { CreditsSummary } from 'app/services/credits.service';

export type ProjectMetering = 'credits' | 'quotes';

/** Billing states in which the credits are finished (decision C) */
const EXHAUSTED_BILLING_STATUSES = ['suspended', 'canceled', 'trial_ended'];

/** error_code of the server (403) when a credits project cannot pay for an operation */
export const CREDITS_ERROR_CODES = {
  INSUFFICIENT_CREDITS: 13010,
  UNPRICED_MODEL: 13011,
  TRIAL_ENDED: 13012,
  DAILY_LIMIT: 13013,
};

const CREDITS_CODES: number[] = Object.values(CREDITS_ERROR_CODES);

/** i18n keys of the title and of the text for each refusal code (alert of the interceptor, preview areas) */
export const CREDITS_REFUSAL_TEXTS: { [code: number]: { title: string; text: string } } = {
  [CREDITS_ERROR_CODES.INSUFFICIENT_CREDITS]: { title: 'Credits.RefusedTitle', text: 'Credits.RefusedText' },
  [CREDITS_ERROR_CODES.UNPRICED_MODEL]: { title: 'Credits.UnpricedRefusedTitle', text: 'Credits.UnpricedRefusedText' },
  [CREDITS_ERROR_CODES.TRIAL_ENDED]: { title: 'Credits.TrialEndedTitle', text: 'Credits.TrialEndedText' },
  [CREDITS_ERROR_CODES.DAILY_LIMIT]: { title: 'Credits.DailyLimitTitle', text: 'Credits.DailyLimitText' },
};

/** Anything but 'credits' (also the projects stored before the key existed) keeps the plan quotas */
export function getProjectMetering(project: any): ProjectMetering {
  return project?.metering === 'credits' ? 'credits' : 'quotes';
}

export function isCreditsMetering(project: any): boolean {
  return getProjectMetering(project) === 'credits';
}

/** Credits finished (decision C). Unknown while the summary is loading. UI only: the server refuses the operations */
export function areCreditsExhausted(summary: CreditsSummary | null): boolean {
  if (!summary) {
    return false;
  }
  if (summary.billing && EXHAUSTED_BILLING_STATUSES.includes(summary.billing.status)) {
    return true;
  }
  return (summary.balance?.available ?? 1) <= 0;
}

export function getCreditsErrorCode(error: any): number | null {
  const code = error?.status === 403 ? error.error?.error_code : null;
  return CREDITS_CODES.includes(code) ? code : null;
}

export function isCreditsRefusal(error: any): boolean {
  return getCreditsErrorCode(error) !== null;
}
