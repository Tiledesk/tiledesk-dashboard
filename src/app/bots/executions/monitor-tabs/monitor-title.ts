/**
 * Navbar title on the Monitor pages.
 * - An execution detail shows Dettaglio esecuzione; the navbar adds the back arrow.
 * - Other /monitor/ pages show Esecuzioni, with or without the tab bar.
 *   /monitor/graph redirects to the executions page (its Graph view).
 * - The conversations list (/wsrequests) always keeps the navbar's own title, Requests.
 * undefined means "not a Monitor page": the navbar's own rules apply.
 */
export function isExecutionDetailPath(url: string): boolean {
  const path = (url || '').split('?')[0];
  return /\/monitor\/[^/]+\/executions\/[^/]+$/.test(path);
}

export function monitorNavbarTitle(url: string, _tabsShown: boolean): string | null | undefined {
  const path = (url || '').split('?')[0];
  if (isExecutionDetailPath(path)) return 'Executions.Detail.PageTitle';
  if (path.indexOf('/monitor/') !== -1) return 'Executions.Executions';
  return undefined;
}
