import { isMonitorRoute, isFlowsRoute } from './sidebar-routes';

describe('sidebar route flags', () => {
  it('sidebar marks Monitor active on /monitor/ urls and not Flows', () => {
    const u = '/project/p1/monitor/a1/executions';
    expect(isMonitorRoute(u)).toBe(true);
    expect(isFlowsRoute(u)).toBe(false);
    expect(isMonitorRoute('/project/p1/monitor/graph')).toBe(true);
    expect(isMonitorRoute('/project/p1/monitor/executions?q=x')).toBe(true);
  });
  it('keeps Monitor on wsrequests and Flows on bots urls', () => {
    expect(isMonitorRoute('/project/p1/wsrequests')).toBe(true);
    expect(isFlowsRoute('/project/p1/bots/my-chatbots/all')).toBe(true);
    expect(isMonitorRoute('/project/p1/bots/my-chatbots/all')).toBe(false);
  });
});
