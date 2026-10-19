import { MAX_PROMPT_LENGTH } from './agent-from-prompt.util';

/**
 * Prompt typed on the marketing site before signup / onboarding.
 * Survives the auth handoff via sessionStorage; can also arrive as ?prompt= on /onboarding.
 */
export const PENDING_WEBSITE_PROMPT_KEY = 'tiledesk-pending-build-prompt';

/** Query param names accepted on /onboarding (first match wins). */
export const PENDING_WEBSITE_PROMPT_QUERY_KEYS = ['prompt', 'buildPrompt'] as const;

export function normalizeBuildPrompt(raw: string | null | undefined): string {
  return (raw || '').trim().slice(0, MAX_PROMPT_LENGTH);
}

export function savePendingWebsitePrompt(prompt: string): boolean {
  const value = normalizeBuildPrompt(prompt);
  if (!value) {
    return false;
  }
  try {
    sessionStorage.setItem(PENDING_WEBSITE_PROMPT_KEY, value);
    return true;
  } catch {
    return false;
  }
}

export function readPendingWebsitePromptFromStorage(): string | null {
  try {
    return normalizeBuildPrompt(sessionStorage.getItem(PENDING_WEBSITE_PROMPT_KEY)) || null;
  } catch {
    return null;
  }
}

export function clearPendingWebsitePrompt(): void {
  try {
    sessionStorage.removeItem(PENDING_WEBSITE_PROMPT_KEY);
  } catch {
    // ignore
  }
}

/**
 * Prefer query string (fresh deep-link), then sessionStorage.
 * Clears storage and returns a normalized prompt, or null.
 */
export function consumePendingWebsitePrompt(queryParams?: Record<string, any> | null): string | null {
  let fromQuery: string | null = null;
  if (queryParams) {
    for (const key of PENDING_WEBSITE_PROMPT_QUERY_KEYS) {
      const value = normalizeBuildPrompt(queryParams[key]);
      if (value) {
        fromQuery = value;
        break;
      }
    }
  }

  const fromStorage = readPendingWebsitePromptFromStorage();
  clearPendingWebsitePrompt();

  return fromQuery || fromStorage || null;
}
