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

  it('route bots/:botid/executions resolves to the list, not FaqComponent', async () => {
    const s = await leaf('/project/p1/bots/b1/executions');
    expect(s.component).toBe(ExecutionsListComponent);
    expect(s.component).not.toBe(FaqComponent);
    expect(s.paramMap.get('botid')).toBe('b1');
    expect(s.paramMap.get('projectid')).toBe('p1');
  });

  it('route bots/executions resolves to the all-agents list', async () => {
    const s = await leaf('/project/p1/bots/executions');
    expect(s.component).toBe(ExecutionsListComponent);
    expect(s.paramMap.get('botid')).toBeNull();
  });

  it('route bots/:botid/executions/:executionid resolves to the detail', async () => {
    const s = await leaf('/project/p1/bots/b1/executions/e1');
    expect(s.component).toBe(ExecutionDetailComponent);
    expect(s.paramMap.get('executionid')).toBe('e1');
  });
});
