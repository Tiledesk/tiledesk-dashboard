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

/**
 * Keeps the `metering` of the project stored in localStorage (key = project id) aligned with the fresh one of the
 * server. It covers the projects stored before the key existed and the ones stored after POST /projects/, which has
 * no `metering`. Only that key of that project is written, and only when the value changed; nothing is stored for a
 * project that is not stored yet. Returns true when the stored project was updated.
 * UI code must not read the metering from here (nor from project_bs): it uses MeteringService or isCreditsMetering
 * with a project of the server.
 */
export function syncStoredProjectMetering(
  projectId: string,
  metering: string | undefined,
  storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage
): boolean {
  const storedJson = storage.getItem(projectId);
  console.log('[METERING-DEBUG] sync stored project', projectId, 'stored present:', !!storedJson, 'fresh metering:', metering);
  if (!storedJson) {
    return false;
  }
  let stored: any;
  try {
    stored = JSON.parse(storedJson);
  } catch (e) {
    console.log('[METERING-DEBUG] sync invalid JSON in storage', projectId);
    return false;
  }
  if (!stored || typeof stored !== 'object' || stored.metering === metering) {
    console.log('[METERING-DEBUG] sync no write', projectId, 'stored metering:', stored && stored.metering);
    return false;
  }
  console.log('[METERING-DEBUG] sync write', projectId, 'stored metering:', stored.metering, '->', metering);
  stored.metering = metering;
  storage.setItem(projectId, JSON.stringify(stored));
  return true;
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
