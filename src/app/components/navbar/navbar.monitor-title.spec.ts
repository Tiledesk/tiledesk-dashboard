// app.component and the navbar import each other: load app.component first, as the app does.
import 'app/app.component';
import { NavbarComponent } from './navbar.component';
import { monitorNavbarTitle } from 'app/bots/executions/monitor-tabs/monitor-title';

// Focused spec for the navbar title on the Monitor pages (the generated navbar spec has no providers and cannot run).
describe('NavbarComponent monitor title', () => {
  let configured: boolean;
  let nav: any;

  function navbar(url: string) {
    nav = Object.create(NavbarComponent.prototype);
    nav.logger = { log() {}, debug() {}, warn() {}, error() {} };
    nav.router = { url };
    nav.executionsService = { isConfigured: () => configured };
    nav.sanitizedFamilyHistory = 'family-history';
    nav.sanitizedKeyboardArrowLeft = 'arrow-left';
    nav.sanitizedSettings = 'settings';
    return nav;
  }

  function go(url: string) {
    nav.router.url = url;
    nav.updateTitle(url);
  }

  beforeEach(() => { configured = true; });

  describe('tab bar shown (permission + configured)', () => {
    beforeEach(() => {
      navbar('/project/p1/home');
      nav.applyMonitorTabsPermission({ role: 'owner', matchedPermissions: [] });
    });

    it('no title on conversations', () => {
      go('/project/p1/wsrequests');
      expect(nav.currentTitle).toBeNull();
      go('/project/p1/wsrequests/120');
      expect(nav.currentTitle).toBeNull();
    });

    it('no title on executions list, agent list, detail and graph', () => {
      for (const url of ['/project/p1/monitor/executions', '/project/p1/monitor/b1/executions?status=failed',
        '/project/p1/monitor/b1/executions/e1', '/project/p1/monitor/graph']) {
        go(url);
        expect(nav.currentTitle).toBeNull();
        expect(nav.currentIcon).toBeNull();
      }
    });

    it('coming from the agents page the title is not Flows', () => {
      go('/project/p1/bots/my-chatbots/all');
      expect(nav.currentTitle).toBe('Flows');
      go('/project/p1/monitor/b1/executions');
      expect(nav.currentTitle).toBeNull();
      expect(nav.currentIcon).toBeNull();
    });

    it('other pages are unchanged', () => {
      go('/project/p1/wsrequests-demo');
      expect(nav.currentTitle).toBe('Requests');
      go('/project/p1/wsrequests/logs/request/r1');
      expect(nav.currentTitle).toBe('Requests');
    });
  });

  describe('tab bar not shown', () => {
    it('agent role: conversations keeps its title, monitor URLs get their own', () => {
      navbar('/project/p1/home');
      nav.applyMonitorTabsPermission({ role: 'agent', matchedPermissions: [] });
      go('/project/p1/wsrequests');
      expect(nav.currentTitle).toBe('Requests');
      go('/project/p1/bots/my-chatbots/all');
      go('/project/p1/monitor/executions');
      expect(nav.currentTitle).toBe('Executions.Executions');
      go('/project/p1/monitor/b1/executions/e1');
      expect(nav.currentTitle).toBe('Executions.Executions');
      go('/project/p1/monitor/graph');
      expect(nav.currentTitle).toBe('Executions.Executions'); // it redirects to the executions page
    });

    it('not configured: same as no permission', () => {
      configured = false;
      navbar('/project/p1/home');
      nav.applyMonitorTabsPermission({ role: 'owner', matchedPermissions: [] });
      go('/project/p1/wsrequests');
      expect(nav.currentTitle).toBe('Requests');
      go('/project/p1/monitor/graph');
      expect(nav.currentTitle).toBe('Executions.Executions'); // it redirects to the executions page
    });

    it('role not known yet: titles as without the tab bar', () => {
      navbar('/project/p1/home');
      go('/project/p1/monitor/executions');
      expect(nav.currentTitle).toBe('Executions.Executions');
      go('/project/p1/wsrequests');
      expect(nav.currentTitle).toBe('Requests');
    });
  });

  it('re-evaluates the title when the role arrives late', () => {
    navbar('/project/p1/wsrequests');
    nav.updateTitle('/project/p1/wsrequests');
    expect(nav.currentTitle).toBe('Requests');
    nav.applyMonitorTabsPermission({ role: '', matchedPermissions: [] });
    expect(nav.currentTitle).toBe('Requests');
    nav.applyMonitorTabsPermission({ role: 'supervisor', matchedPermissions: [] });
    expect(nav.currentTitle).toBeNull();
    nav.applyMonitorTabsPermission({ role: 'custom', matchedPermissions: [] });
    expect(nav.currentTitle).toBe('Requests');
    nav.applyMonitorTabsPermission({ role: 'custom', matchedPermissions: ['executions_read'] });
    expect(nav.currentTitle).toBeNull();
  });

  describe('monitorNavbarTitle', () => {
    it('leaves non-monitor URLs to the navbar chain', () => {
      expect(monitorNavbarTitle('/project/p1/home', true)).toBeUndefined();
      expect(monitorNavbarTitle('/project/p1/bots/my-chatbots/all', true)).toBeUndefined();
      expect(monitorNavbarTitle('/project/p1/wsrequests', false)).toBeUndefined();
    });
  });
});
