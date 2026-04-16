import { getPostProjectCreationNavigation, isMinimalDashboard } from './post-project-creation-navigation';

describe('post-project-creation-navigation', () => {
  const makeAppConfigServiceRoot = (dashboardType?: string) =>
    ({
      getConfig: () => ({ dashboardType }),
    }) as any;

  describe('isMinimalDashboard()', () => {
    it('returns true when dashboardType is minimal', () => {
      expect(isMinimalDashboard(makeAppConfigServiceRoot('minimal'))).toBe(true);
    });

    it('returns false when dashboardType is not minimal', () => {
      expect(isMinimalDashboard(makeAppConfigServiceRoot('default'))).toBe(false);
    });

    it('returns false when config is missing', () => {
      const svc = ({ getConfig: () => undefined }) as any;
      expect(isMinimalDashboard(svc)).toBe(false);
    });
  });

  describe('getPostProjectCreationNavigation()', () => {
    it('returns onboarding2 navigation when minimal', () => {
      const nav = getPostProjectCreationNavigation(makeAppConfigServiceRoot('minimal'), 'p1', ['/projects']);
      expect(nav).toEqual(['/project/p1/onboarding2']);
    });

    it('returns fallback when not minimal', () => {
      const nav = getPostProjectCreationNavigation(makeAppConfigServiceRoot('default'), 'p1', ['/projects']);
      expect(nav).toEqual(['/projects']);
    });

    it('returns fallback when projectId is empty', () => {
      const nav = getPostProjectCreationNavigation(makeAppConfigServiceRoot('minimal'), '', ['/projects']);
      expect(nav).toEqual(['/projects']);
    });
  });
});

