import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { monitorExecutionsLink } from './execution-links';

/**
 * The old Monitor › Graph page (spec 2026-11-13, addendum 3): the graph is now a view of the executions page.
 * /monitor/graph lands there with view=graph; its query params (range) are kept.
 */
export function monitorGraphRedirect(route: ActivatedRouteSnapshot): UrlTree {
  return inject(Router).createUrlTree(monitorExecutionsLink(route.paramMap.get('projectid')), {
    queryParams: { ...route.queryParams, view: 'graph' },
  });
}
