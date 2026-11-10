import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { appRoutes } from '../../app.routing';
import { AuthGuard } from '../../core/auth.guard';
import { FaqComponent } from '../faq/faq.component';
import { ExecutionsListComponent } from './executions-list/executions-list.component';
import { ExecutionDetailComponent } from './execution-detail/execution-detail.component';

describe('executions routes (real appRoutes)', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(appRoutes)],
      providers: [{ provide: AuthGuard, useValue: { canActivate: () => true } }],
    });
    router = TestBed.inject(Router);
  });

  async function leaf(url: string): Promise<ActivatedRouteSnapshot> {
    await router.navigateByUrl(url);
    let s = router.routerState.snapshot.root;
    while (s.firstChild) s = s.firstChild;
    return s;
  }

  it('route monitor/:botid/executions resolves to the list, not FaqComponent', async () => {
    const s = await leaf('/project/p1/monitor/b1/executions');
    expect(s.component).toBe(ExecutionsListComponent);
    expect(s.component).not.toBe(FaqComponent);
    expect(s.paramMap.get('botid')).toBe('b1');
    expect(s.paramMap.get('projectid')).toBe('p1');
  });

  it('route monitor/executions resolves to the all-agents list', async () => {
    const s = await leaf('/project/p1/monitor/executions');
    expect(s.component).toBe(ExecutionsListComponent);
    expect(s.paramMap.get('botid')).toBeNull();
  });

  it('route monitor/:botid/executions/:executionid resolves to the detail', async () => {
    const s = await leaf('/project/p1/monitor/b1/executions/e1');
    expect(s.component).toBe(ExecutionDetailComponent);
    expect(s.paramMap.get('executionid')).toBe('e1');
  });

  it('old executions addresses redirect to monitor', async () => {
    const redirects = (appRoutes as any[]).filter(r => r.redirectTo && /^project\/:projectid\/bots\/.*executions/.test(r.path));
    const map: any = {};
    redirects.forEach(r => (map[r.path] = r.redirectTo));
    expect(map).toEqual({
      'project/:projectid/bots/executions': 'project/:projectid/monitor/executions',
      'project/:projectid/bots/:botid/executions': 'project/:projectid/monitor/:botid/executions',
      'project/:projectid/bots/:botid/executions/:executionid': 'project/:projectid/monitor/:botid/executions/:executionid',
    });
  });

  it('old addresses land on the new ones and keep query params', async () => {
    await router.navigateByUrl('/project/p1/bots/b1/executions/e1?q=x');
    expect(router.url).toBe('/project/p1/monitor/b1/executions/e1?q=x');
    await router.navigateByUrl('/project/p1/bots/b1/executions');
    expect(router.url).toBe('/project/p1/monitor/b1/executions');
    await router.navigateByUrl('/project/p1/bots/executions?status=failed');
    expect(router.url).toBe('/project/p1/monitor/executions?status=failed');
  });
});
