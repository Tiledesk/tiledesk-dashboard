/** Monitor item: the conversations list only. The /monitor/ pages (executions, graph) belong to Flows. */
export function isMonitorRoute(url: string): boolean {
  const path = (url || '').split('?')[0];
  return path.indexOf('/monitor/') === -1 && path.substring(path.lastIndexOf('/') + 1) === 'wsrequests';
}

/** Flows item: /bots URLs and the /monitor/ pages (executions, execution detail, graph). */
export function isFlowsRoute(url: string): boolean {
  const path = (url || '').split('?')[0];
  return path.indexOf('/monitor/') !== -1 || path.indexOf('/bots') !== -1;
}
