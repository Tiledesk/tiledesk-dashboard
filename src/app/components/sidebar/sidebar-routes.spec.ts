import { isMonitorRoute, isFlowsRoute } from './sidebar-routes';

describe('sidebar route flags', () => {
  it('sidebar marks Flows active on /monitor/ urls and not Monitor', () => {
    const u = '/project/p1/monitor/a1/executions';
    expect(isFlowsRoute(u)).toBe(true);
    expect(isMonitorRoute(u)).toBe(false);
    expect(isFlowsRoute('/project/p1/monitor/graph')).toBe(true);
    expect(isFlowsRoute('/project/p1/monitor/executions?q=x')).toBe(true);
    expect(isFlowsRoute('/project/p1/monitor/a1/executions/e1')).toBe(true);
    expect(isMonitorRoute('/project/p1/monitor/a1/executions/e1')).toBe(false);
  });
  it('keeps Monitor on wsrequests and Flows on bots urls', () => {
    expect(isMonitorRoute('/project/p1/wsrequests')).toBe(true);
    expect(isFlowsRoute('/project/p1/wsrequests')).toBe(false);
    expect(isFlowsRoute('/project/p1/bots/my-chatbots/all')).toBe(true);
    expect(isMonitorRoute('/project/p1/bots/my-chatbots/all')).toBe(false);
  });
});
