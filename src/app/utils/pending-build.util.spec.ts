import {
  PENDING_BUILD_KEY, PENDING_BUILD_MAX_AGE_MS, BUILD_WANNAGO_ROUTE,
  chooseProjectForBuild, clearPendingBuild, consumePendingBuild, lastOpenedProjectOf, lastProjectIdFrom,
  rememberLastOpenedProject, LAST_OPENED_PROJECT_KEY_PREFIX, projectNameForUser,
  readBuildOrigin, readBuildPromptFromQuery, readPendingBuild, savePendingBuild, normalizeOriginUrl, ORIGIN_URL_MAX_LENGTH,
  isBuildWannagoRoute, shouldHonorBuildWannago
} from './pending-build.util';

describe('pending-build.util (prompt from the website for the Home)', () => {
  beforeEach(() => localStorage.removeItem(PENDING_BUILD_KEY));
  afterEach(() => localStorage.removeItem(PENDING_BUILD_KEY));

  it('reads the prompt from ?prompt= or ?buildPrompt=, trimmed; blank is none', () => {
    expect(readBuildPromptFromQuery({ prompt: '  Un agente per le email  ' })).toBe('Un agente per le email');
    expect(readBuildPromptFromQuery({ buildPrompt: 'Prenota appuntamenti' })).toBe('Prenota appuntamenti');
    expect(readBuildPromptFromQuery({ prompt: '   ' })).toBeNull();
    expect(readBuildPromptFromQuery({})).toBeNull();
    expect(readBuildPromptFromQuery(null)).toBeNull();
  });

  it('keeps a prompt with special characters and the word JWT intact', () => {
    const text = 'Agente JWT & co: "prezzi" #1 ? sì, àèìòù 🚀\nseconda riga';
    expect(savePendingBuild(text)).toBe(true);
    expect(readPendingBuild()?.prompt).toBe(text);
  });

  it('caps the prompt like the other prompts (2000 characters)', () => {
    savePendingBuild('x'.repeat(2500));
    expect(readPendingBuild()?.prompt.length).toBe(2000);
  });

  it('is used once: consume returns it and removes it', () => {
    savePendingBuild('Un agente');
    expect(consumePendingBuild()?.prompt).toBe('Un agente');
    expect(localStorage.getItem(PENDING_BUILD_KEY)).toBeNull();
    expect(consumePendingBuild()).toBeNull();
  });

  it('drops a prompt older than a day, and an unreadable one', () => {
    const now = 1_000_000_000_000;
    savePendingBuild('Vecchio', now - PENDING_BUILD_MAX_AGE_MS - 1);
    expect(readPendingBuild(now)).toBeNull();
    expect(localStorage.getItem(PENDING_BUILD_KEY)).toBeNull();

    localStorage.setItem(PENDING_BUILD_KEY, '{not json');
    expect(readPendingBuild()).toBeNull();
    expect(localStorage.getItem(PENDING_BUILD_KEY)).toBeNull();
  });

  it('keeps the page the prompt was written on, with the prompt', () => {
    savePendingBuild('Un agente', Date.now(), 'https://tiledesk.com/ai-agents?utm_source=hero#form');
    expect(consumePendingBuild()?.originUrl).toBe('https://tiledesk.com/ai-agents?utm_source=hero');
    savePendingBuild('Un agente');
    expect(consumePendingBuild()?.originUrl).toBeNull();
  });

  it('accepts only http(s) addresses as origin; a too long one keeps site and path', () => {
    expect(normalizeOriginUrl('javascript:alert(1)')).toBeNull();
    expect(normalizeOriginUrl('not a url')).toBeNull();
    expect(normalizeOriginUrl('')).toBeNull();
    expect(normalizeOriginUrl(42)).toBeNull();
    expect(normalizeOriginUrl('https://site.test/page?q=' + 'x'.repeat(ORIGIN_URL_MAX_LENGTH))).toBe('https://site.test/page');
  });

  it('takes the origin from ?origin=, otherwise from a referrer that is not the dashboard', () => {
    const own = 'https://panel.tiledesk.com';
    expect(readBuildOrigin({ origin: 'https://tiledesk.com/pricing' }, 'https://google.com/', own)).toBe('https://tiledesk.com/pricing');
    expect(readBuildOrigin({}, 'https://tiledesk.com/', own)).toBe('https://tiledesk.com/');
    expect(readBuildOrigin({}, own + '/dashboard/', own)).toBeNull();
    expect(readBuildOrigin({ origin: 'ftp://x' }, '', own)).toBeNull();
    expect(readBuildOrigin(null, null, own)).toBeNull();
  });

  it('saves nothing for a blank prompt; clear is safe on an empty storage', () => {
    expect(savePendingBuild('   ')).toBe(false);
    expect(localStorage.getItem(PENDING_BUILD_KEY)).toBeNull();
    expect(() => clearPendingBuild()).not.toThrow();
  });

  describe('which project the prompt lands in', () => {
    const pu = (id: string, status = 100) => ({ role: 'owner', id_project: { _id: id, status } });

    it('reads the last project id from the stored project_user, null when unreadable', () => {
      expect(lastProjectIdFrom(JSON.stringify(pu('p2')))).toBe('p2');
      expect(lastProjectIdFrom(null)).toBeNull();
      expect(lastProjectIdFrom('{bad')).toBeNull();
    });

    it('the last project used, when it is still one of the user\'s', () => {
      expect(chooseProjectForBuild([pu('p1'), pu('p2')], 'p2').id_project._id).toBe('p2');
    });

    it('otherwise the only project there is', () => {
      expect(chooseProjectForBuild([pu('p1')], null).id_project._id).toBe('p1');
      expect(chooseProjectForBuild([pu('p1')], 'gone').id_project._id).toBe('p1');
    });

    it('none with several projects and no usable last one, or a disabled last one', () => {
      expect(chooseProjectForBuild([pu('p1'), pu('p2')], 'gone')).toBeNull();
      expect(chooseProjectForBuild([pu('p1', 0), pu('p2'), pu('p3')], 'p1')).toBeNull();
      expect(chooseProjectForBuild([], null)).toBeNull();
      expect(chooseProjectForBuild(null, 'p1')).toBeNull();
    });
  });

  describe('last project opened, kept by user across a logout', () => {
    afterEach(() => {
      localStorage.removeItem(LAST_OPENED_PROJECT_KEY_PREFIX + 'u1');
      localStorage.removeItem(LAST_OPENED_PROJECT_KEY_PREFIX + 'u2');
    });

    it('is remembered per user, and one user never gets another\'s', () => {
      rememberLastOpenedProject('u1', 'p1');
      rememberLastOpenedProject('u2', 'p9');
      expect(lastOpenedProjectOf('u1')).toBe('p1');
      expect(lastOpenedProjectOf('u2')).toBe('p9');
      rememberLastOpenedProject('u1', 'p2');
      expect(lastOpenedProjectOf('u1')).toBe('p2');
    });

    it('needs both a user and a project', () => {
      rememberLastOpenedProject(null, 'p1');
      rememberLastOpenedProject('u1', null);
      expect(lastOpenedProjectOf('u1')).toBeNull();
      expect(lastOpenedProjectOf(null)).toBeNull();
    });
  });

  it('names the first project like the onboarding', () => {
    expect(projectNameForUser({ email: 'dario@acme.com' })).toBe('acme');
    expect(projectNameForUser({ email: 'dario@gmail.com', firstname: 'Dario' })).toBe('Dario');
    expect(projectNameForUser({ email: 'dario@gmail.com' })).toBe('dario');
    expect(projectNameForUser(null)).toBe('My project');
  });

  it('honors wannago=/build only while a pending prompt is valid', () => {
    expect(isBuildWannagoRoute(BUILD_WANNAGO_ROUTE)).toBe(true);
    expect(isBuildWannagoRoute('/build?x=1')).toBe(true);
    expect(isBuildWannagoRoute('/projects')).toBe(false);
    expect(shouldHonorBuildWannago(BUILD_WANNAGO_ROUTE)).toBe(false);
    savePendingBuild('Un agente');
    expect(shouldHonorBuildWannago(BUILD_WANNAGO_ROUTE)).toBe(true);
    expect(shouldHonorBuildWannago('/projects')).toBe(false);
  });
});
