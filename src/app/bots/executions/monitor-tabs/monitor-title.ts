/** The conversations list pages that carry the Monitor tab bar: /wsrequests and /wsrequests/:scrollposition. */
const CONVERSATIONS_TAB_PAGE = /\/project\/[^\/]+\/wsrequests(\/[^\/]+)?$/;

/**
 * Navbar title on the Monitor pages.
 * - With the tab bar shown the tabs are the title: null on the conversations list and on every /monitor/ page.
 * - Without it, /monitor/ pages (direct links only) get their own title; the conversations list keeps the
 *   navbar's usual one.
 * undefined means "not a Monitor page": the navbar's own rules apply.
 */
export function monitorNavbarTitle(url: string, tabsShown: boolean): string | null | undefined {
  const path = (url || '').split('?')[0];
  if (path.indexOf('/monitor/') !== -1) {
    if (tabsShown) return null;
    // /monitor/graph redirects to the executions page (its Graph view)
    return 'Executions.Executions';
  }
  if (tabsShown && CONVERSATIONS_TAB_PAGE.test(path)) return null;
  return undefined;
}
