import { normalizeBuildPrompt } from './pending-website-prompt.util';
import { emailDomainWhiteList } from './util';

/**
 * The prompt the website hands over on `/build?prompt=` (BuildFromWebsiteComponent).
 *
 * Kept in localStorage, not sessionStorage: it has to outlive what can happen between the
 * website and the project Home -- a login, a pick in the project list, another tab. The Home
 * reads it once, puts it in the vibe coder field and removes it. Separate from the onboarding's
 * `tiledesk-pending-build-prompt` on purpose: the onboarding flow stays exactly as it is.
 */
export const PENDING_BUILD_KEY = 'tiledesk-pending-build';

/** Query param names accepted on /build (first match wins). */
export const PENDING_BUILD_QUERY_KEYS = ['prompt', 'buildPrompt'] as const;

/** A prompt nobody collected within a day is not wanted any more: it must not fill a Home later. */
export const PENDING_BUILD_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface PendingBuild {
  prompt: string;
  createdAt: number;
}

/** The prompt in the query params, normalized like every other prompt (trim, length cap); null if none. */
export function readBuildPromptFromQuery(queryParams?: Record<string, any> | null): string | null {
  if (!queryParams) {
    return null;
  }
  for (const key of PENDING_BUILD_QUERY_KEYS) {
    const value = normalizeBuildPrompt(queryParams[key]);
    if (value) {
      return value;
    }
  }
  return null;
}

/** Stores the prompt for the Home. Never throws: storage may be blocked (private window). */
export function savePendingBuild(prompt: string, now: number = Date.now()): boolean {
  const value = normalizeBuildPrompt(prompt);
  if (!value) {
    return false;
  }
  try {
    localStorage.setItem(PENDING_BUILD_KEY, JSON.stringify({ prompt: value, createdAt: now }));
    return true;
  } catch {
    return false;
  }
}

/** The stored prompt if it is still good; an unreadable or stale one is removed and ignored. */
export function readPendingBuild(now: number = Date.now()): PendingBuild | null {
  let pending: PendingBuild | null = null;
  try {
    const raw = localStorage.getItem(PENDING_BUILD_KEY);
    if (!raw) {
      return null;
    }
    pending = JSON.parse(raw);
  } catch {
    clearPendingBuild();
    return null;
  }
  const prompt = normalizeBuildPrompt(pending?.prompt);
  const createdAt = typeof pending?.createdAt === 'number' ? pending.createdAt : NaN;
  if (!prompt || !(now - createdAt < PENDING_BUILD_MAX_AGE_MS)) {
    clearPendingBuild();
    return null;
  }
  return { prompt, createdAt };
}

/** Reads the stored prompt and removes it: used once, by the Home. */
export function consumePendingBuild(now: number = Date.now()): string | null {
  const pending = readPendingBuild(now);
  clearPendingBuild();
  return pending ? pending.prompt : null;
}

export function clearPendingBuild(): void {
  try {
    localStorage.removeItem(PENDING_BUILD_KEY);
  } catch {
    // ignore
  }
}

/** The id of the project in `last_project` (a project_user as the projects list stores it, with
 *  `id_project` populated); null if missing or unreadable. */
export function lastProjectIdFrom(raw: string | null): string | null {
  try {
    const project = raw ? JSON.parse(raw)?.id_project : null;
    return (project && (project._id || project.id)) || null;
  } catch {
    return null;
  }
}

/**
 * Where the website's prompt lands among the user's projects (project_users from GET /projects):
 * the last project used if it is still one of them and enabled, else the only enabled project,
 * else none -- the caller then shows the projects list. Status 0 is a disabled project.
 */
export function chooseProjectForBuild(projectUsers: any[] | null | undefined, lastProjectId: string | null): any | null {
  const usable = (projectUsers || []).filter(pu => pu?.id_project?._id && pu.id_project.status !== 0);
  return usable.find(pu => pu.id_project._id === lastProjectId)
    || (usable.length === 1 ? usable[0] : null);
}

/**
 * The last project each user opened, by user: `last_project` is removed at logout, so after a
 * login from `/build` there would be no last project at all. This one stays, keyed by the user's
 * id so a shared browser never sends one user to another's project; it holds an id, nothing else.
 * Written by the Home when a project opens.
 */
export const LAST_OPENED_PROJECT_KEY_PREFIX = 'tiledesk-last-opened-project:';

export function rememberLastOpenedProject(userId: string | null | undefined, projectId: string | null | undefined): void {
  if (!userId || !projectId) {
    return;
  }
  try {
    localStorage.setItem(LAST_OPENED_PROJECT_KEY_PREFIX + userId, projectId);
  } catch {
    // ignore
  }
}

export function lastOpenedProjectOf(userId: string | null | undefined): string | null {
  if (!userId) {
    return null;
  }
  try {
    return localStorage.getItem(LAST_OPENED_PROJECT_KEY_PREFIX + userId) || null;
  } catch {
    return null;
  }
}

/**
 * The name of the project created for a user who has none (a signup from `/build`): the same
 * rule as the onboarding (OnboardingWelcomeComponent.resolveProjectName), so both flows name a
 * first project alike -- the company from a non-webmail address, else the first name, else the
 * part before the @, else "My project".
 */
export function projectNameForUser(user: any): string {
  const email: string = user?.email || '';
  if (email.includes('@')) {
    const domain = email.split('@')[1];
    if (domain && !emailDomainWhiteList.includes(domain)) {
      return domain.includes('.') ? domain.split('.')[0] : domain;
    }
  }
  const firstName = (user?.firstname || '').trim();
  if (firstName) {
    return firstName;
  }
  const beforeAt = email.split('@')[0];
  return beforeAt || 'My project';
}
