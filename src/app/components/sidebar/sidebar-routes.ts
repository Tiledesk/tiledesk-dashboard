/** Monitor item: conversations plus every /monitor/ page (executions, graph). */
export function isMonitorRoute(url: string): boolean {
  const path = (url || '').split('?')[0];
  return path.substring(path.lastIndexOf('/') + 1) === 'wsrequests' || path.indexOf('/monitor/') !== -1;
}

/** Flows item: /bots URLs, but never the /monitor/ pages. */
export function isFlowsRoute(url: string): boolean {
  const path = (url || '').split('?')[0];
  return path.indexOf('/monitor/') === -1 && path.indexOf('/bots') !== -1;
}
