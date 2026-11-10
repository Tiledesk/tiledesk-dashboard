import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ExecutionRow } from '../executions.models';
import { executionLink } from '../execution-links';
import { GraphSnapshot } from './execution-graph.feed';
import { CYTOSCAPE_LOADER, EXECUTION_GRAPH_FEED, ExecutionGraphComponent } from './execution-graph.component';

const E1 = '11111111-1111-1111-1111-111111111111';
const E2 = '22222222-2222-2222-2222-222222222222';
const E3 = '33333333-3333-3333-3333-333333333333';

function row(id: string, status: string, agentId: string, extra: any = {}): ExecutionRow {
  return {
    _id: id, agent_id: agentId, agent_name: null, status: status as any, end_reason: null, trigger: { type: 'chat' },
    started_at: new Date(Date.now() - 60 * 1000).toISOString(), duration_ms: 1000, steps_count: 3,
    failure_conditions: 0, vars_changed: 0, trace_complete: true, test: false, ...extra,
  };
}

function snap(live: ExecutionRow[], failed: ExecutionRow[] = [], stale = false): GraphSnapshot {
  return { live, failed, fetchedAt: Date.now(), stale };
}

const FIRST = () => snap([row(E1, 'running', 'a1'), row(E2, 'waiting', 'a2')], [row(E3, 'failed', 'a2')]);

describe('ExecutionGraphComponent', () => {
  let fixture: ComponentFixture<ExecutionGraphComponent>;
  let component: ExecutionGraphComponent;
  let feed$: Subject<GraphSnapshot>;
  let feedFactory: jasmine.Spy;
  let router: { navigate: jasmine.Spy };

  function setup(opts: { loader?: () => Promise<any>; agents?: any[] } = {}) {
    feed$ = new Subject<GraphSnapshot>();
    feedFactory = jasmine.createSpy('feed').and.returnValue(feed$.asObservable());
    router = { navigate: jasmine.createSpy('navigate') };
    const providers: any[] = [
      { provide: EXECUTION_GRAPH_FEED, useValue: feedFactory },
      { provide: Router, useValue: router },
    ];
    if (opts.loader) { providers.push({ provide: CYTOSCAPE_LOADER, useValue: opts.loader }); }
    TestBed.configureTestingModule({
      declarations: [ExecutionGraphComponent],
      imports: [TranslateModule.forRoot()],
      providers,
    });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      Executions: { Graph: {
        Counts: '{{running}} running · {{waiting}} waiting · {{failed}} failed in the last 15 min',
        Truncated: 'Showing the first 300 live executions',
        Stale: 'Data may be out of date',
        Unavailable: 'The graph could not be loaded',
        Tip: {
          Status: 'State: {{status}}', Started: 'Began: {{time}}', Trigger: 'Source: {{trigger}}', Steps: 'Blocks: {{steps}}',
          More: '{{n}} more not drawn', MoreStatus: '{{status}}: {{n}}',
        },
      },
      Status: { running: 'RUN', waiting: 'WAIT', stopping: 'STOP', failed: 'FAIL' } }
    });
    translate.use('en');
    fixture = TestBed.createComponent(ExecutionGraphComponent);
    component = fixture.componentInstance;
    component.projectId = 'p1';
    component.projectName = 'Acme';
    component.agents = opts.agents || [{ id: 'a1', name: 'Nightly' }, { id: 'a2', name: 'Alpha' }];
    fixture.nativeElement.style.display = 'block';
    fixture.nativeElement.style.width = '800px';
    fixture.detectChanges();
  }

  async function ready() {
    await component.ready;
    fixture.detectChanges();
  }

  afterEach(() => { if (fixture) { fixture.destroy(); } });

  it('renders project, agents and executions from a snapshot', async () => {
    setup();
    await ready();
    expect(feedFactory).toHaveBeenCalledWith('p1');
    feed$.next(FIRST());
    fixture.detectChanges();
    const cy = component.cy;
    expect(cy.nodes().length).toBe(6);
    expect(cy.getElementById('project').hasClass('project')).toBe(true);
    expect(cy.getElementById('agent:a1').hasClass('agent')).toBe(true);
    const e1 = cy.getElementById('exec:' + E1);
    expect(e1.hasClass('exec')).toBe(true);
    expect(e1.hasClass('s-running')).toBe(true);
    expect(cy.getElementById('exec:' + E2).hasClass('s-waiting')).toBe(true);
    expect(cy.getElementById('agent:a1->exec:' + E1).hasClass('edge-animated')).toBe(true);
    expect(cy.getElementById('agent:a2->exec:' + E2).hasClass('edge-animated')).toBe(false);
  });

  it('a second snapshot keeps existing node positions and removes gone executions', async () => {
    setup();
    await ready();
    feed$.next(FIRST());
    const cy = component.cy;
    const before = ['project', 'agent:a1', 'agent:a2', 'exec:' + E1].map(id => ({ ...cy.getElementById(id).position() }));
    feed$.next(snap([row(E1, 'running', 'a1')]));
    expect(cy.getElementById('exec:' + E2).empty()).toBe(true);
    expect(cy.getElementById('exec:' + E3).empty()).toBe(true);
    expect(cy.getElementById('agent:a2->exec:' + E2).empty()).toBe(true);
    expect(cy.nodes().length).toBe(4);
    const after = ['project', 'agent:a1', 'agent:a2', 'exec:' + E1].map(id => ({ ...cy.getElementById(id).position() }));
    expect(after).toEqual(before);
    expect(cy.getElementById('agent:a2').hasClass('idle')).toBe(true);
  });

  it('failed execution and its agent get the aura class', async () => {
    setup();
    await ready();
    feed$.next(FIRST());
    const cy = component.cy;
    expect(cy.getElementById('exec:' + E3).hasClass('s-failed')).toBe(true);
    expect(cy.getElementById('exec:' + E3).hasClass('aura')).toBe(true);
    expect(cy.getElementById('agent:a2').hasClass('aura')).toBe(true);
    expect(cy.getElementById('agent:a1').hasClass('aura')).toBe(false);
    expect(cy.getElementById('exec:' + E1).hasClass('aura')).toBe(false);
  });

  it('tap on an execution navigates to its detail', async () => {
    setup();
    await ready();
    feed$.next(FIRST());
    component.cy.getElementById('exec:' + E1).emit('tap');
    expect(router.navigate).toHaveBeenCalledTimes(1);
    expect(router.navigate.calls.mostRecent().args[0]).toEqual(executionLink('p1', 'a1', E1).commands);
  });

  it('tap on an agent navigates to its executions list', async () => {
    setup();
    await ready();
    feed$.next(FIRST());
    component.cy.getElementById('agent:a2').emit('tap');
    expect(router.navigate).toHaveBeenCalledWith(['/project', 'p1', 'bots', 'a2', 'executions']);
    router.navigate.calls.reset();
    component.cy.getElementById('project').emit('tap');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('counts line and stale note', async () => {
    setup();
    await ready();
    feed$.next(FIRST());
    fixture.detectChanges();
    const text = () => (fixture.nativeElement as HTMLElement).textContent;
    expect(text()).toContain('1 running · 1 waiting · 1 failed in the last 15 min');
    expect(text()).not.toContain('Data may be out of date');
    expect(text()).not.toContain('Showing the first 300 live executions');
    feed$.next({ ...FIRST(), stale: true });
    fixture.detectChanges();
    expect(text()).toContain('Data may be out of date');
  });

  it('hover on an execution shows a translated tooltip with a formatted start time', async () => {
    setup();
    await ready();
    const started = new Date(Date.now() - 90 * 1000).toISOString();
    feed$.next(snap([row(E2, 'waiting', 'a2', { started_at: started })]));
    component.cy.getElementById('exec:' + E2).emit('mouseover');
    fixture.detectChanges();
    const lines = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.graph-tooltip .tip-line')).map(l => l.textContent.trim());
    expect(lines).toEqual(['State: WAIT', 'Began: ' + new Date(started).toLocaleString(), 'Source: chat', 'Blocks: 3']);
  });

  it('an agent over the cap gets a +N node: hidden counts on hover, tap opens the agent executions', async () => {
    setup();
    await ready();
    const many = Array.from({ length: 14 }, (_, i) => row('w' + String(i).padStart(2, '0') + '-0000-0000', 'waiting', 'a1'));
    feed$.next(snap([...many, row(E1, 'running', 'a1')]));
    const more = component.cy.getElementById('more:a1');
    expect(more.empty()).toBe(false);
    expect(more.hasClass('more')).toBe(true);
    expect(more.data('label')).toBe('+3');
    expect(component.cy.nodes('.exec').length).toBe(12);
    more.emit('mouseover');
    fixture.detectChanges();
    const lines = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.graph-tooltip .tip-line')).map(l => l.textContent.trim());
    expect(lines).toEqual(['3 more not drawn', 'WAIT: 3']);
    more.emit('tap');
    expect(router.navigate).toHaveBeenCalledWith(['/project', 'p1', 'bots', 'a1', 'executions']);
  });

  it('agents get the active class only when something runs or stops', async () => {
    setup();
    await ready();
    feed$.next(FIRST());
    expect(component.cy.getElementById('agent:a1').hasClass('active')).toBe(true);
    expect(component.cy.getElementById('agent:a2').hasClass('active')).toBe(false);
    expect(component.cy.getElementById('agent:a2').hasClass('idle')).toBe(false);
  });

  it('no counts line until the first successful snapshot', async () => {
    setup();
    await ready();
    const el = fixture.nativeElement as HTMLElement;
    feed$.next(snap([], [], true));
    fixture.detectChanges();
    expect(el.querySelector('.graph-counts')).toBeNull();
    expect(el.textContent).toContain('Data may be out of date');
    feed$.next(FIRST());
    fixture.detectChanges();
    expect(el.querySelector('.graph-counts')).not.toBeNull();
    feed$.next({ ...FIRST(), stale: true });
    fixture.detectChanges();
    expect(el.querySelector('.graph-counts').textContent).toContain('1 running');
    expect(el.textContent).toContain('Data may be out of date');
  });

  it('a snapshot that breaks apply is logged, keeps the previous render and the feed', async () => {
    setup();
    await ready();
    feed$.next(FIRST());
    const cy = component.cy;
    expect(cy.nodes().length).toBe(6);
    const log = spyOn(console, 'error');
    expect(() => feed$.next(snap([row(null, 'running', 'a1')]))).not.toThrow();
    fixture.detectChanges();
    expect(log).toHaveBeenCalled();
    expect(cy.nodes().length).toBe(6);
    expect(cy.getElementById('exec:' + E1).empty()).toBe(false);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Data may be out of date');
    expect(feed$.observers.length).toBe(1);
    feed$.next(snap([row(E1, 'running', 'a1')]));
    fixture.detectChanges();
    expect(cy.nodes().length).toBe(4);
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Data may be out of date');
  });

  it('hover shows the node tooltip lines as text', async () => {
    setup();
    await ready();
    feed$.next(FIRST());
    component.cy.getElementById('agent:a1').emit('mouseover');
    fixture.detectChanges();
    const tip = (fixture.nativeElement as HTMLElement).querySelector('.graph-tooltip');
    expect(tip).not.toBeNull();
    expect(tip.textContent).toContain('Nightly');
    component.cy.getElementById('agent:a1').emit('mouseout');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.graph-tooltip')).toBeNull();
  });

  it('destroy stops polling and destroys cytoscape', async () => {
    setup();
    await ready();
    feed$.next(FIRST());
    const cy = component.cy;
    const timers = [component.pulseTimer, component.dashTimer];
    expect(timers[0]).not.toBeNull();
    expect(timers[1]).not.toBeNull();
    expect(feed$.observers.length).toBe(1);
    spyOn(window, 'clearInterval').and.callThrough();
    fixture.destroy();
    fixture = null;
    expect(feed$.observers.length).toBe(0);
    expect(window.clearInterval).toHaveBeenCalledWith(timers[0]);
    expect(window.clearInterval).toHaveBeenCalledWith(timers[1]);
    expect(cy.destroyed()).toBe(true);
  });

  it('reduced motion starts no timers', async () => {
    spyOn(window, 'matchMedia').and.callFake((q: string) => ({
      matches: q.indexOf('prefers-reduced-motion: reduce') >= 0, media: q,
      addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, onchange: null, dispatchEvent: () => false,
    } as any));
    spyOn(window, 'setInterval').and.callThrough();
    setup();
    await ready();
    feed$.next(FIRST());
    expect(component.pulseTimer).toBeNull();
    expect(component.dashTimer).toBeNull();
    const ours = (window.setInterval as any as jasmine.Spy).calls.allArgs().filter(a => a[1] === 1200 || a[1] === 100);
    expect(ours.length).toBe(0);
  });

  it('import failure shows Unavailable and emits unavailable', async () => {
    setup({ loader: () => Promise.reject(new Error('chunk load failed')) });
    const emitted = jasmine.createSpy('unavailable');
    component.unavailable.subscribe(emitted);
    await ready();
    expect(emitted).toHaveBeenCalledTimes(1);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('The graph could not be loaded');
    expect(feedFactory).not.toHaveBeenCalled();
  });
  it('fits once the graph has more than the project node, within maxZoom', async () => {
    setup({ agents: [] });
    await ready();
    feed$.next(snap([]));
    const cy = component.cy;
    expect(cy.nodes().length).toBe(1);
    feed$.next(FIRST());
    expect(cy.nodes().length).toBe(6);
    expect(cy.zoom()).toBeLessThanOrEqual(1.75);
    const ext = cy.extent();
    cy.nodes().forEach((n: any) => {
      const p = n.position();
      expect(p.x >= ext.x1 && p.x <= ext.x2 && p.y >= ext.y1 && p.y <= ext.y2).toBe(true, n.id());
    });
  });

  it('destroyed before the loader resolves: no cytoscape, no feed subscription', async () => {
    let resolve: (m: any) => void;
    const real = await import('cytoscape');
    setup({ loader: () => new Promise(r => { resolve = r; }) });
    fixture.destroy();
    fixture = null;
    resolve(real);
    await component.ready;
    expect(component.cy).toBeNull();
    expect(feedFactory).not.toHaveBeenCalled();
  });

  it('destroyed before the loader rejects: unavailable is not emitted', async () => {
    let reject: (e: any) => void;
    setup({ loader: () => new Promise((_, r) => { reject = r; }) });
    const emitted = jasmine.createSpy('unavailable');
    component.unavailable.subscribe(emitted);
    fixture.destroy();
    fixture = null;
    reject(new Error('chunk load failed'));
    await component.ready;
    expect(emitted).not.toHaveBeenCalled();
    expect(component.failed).toBe(false);
  });

  it('a new projectId resets the graph and subscribes the new feed', async () => {
    setup();
    await ready();
    feed$.next(FIRST());
    expect(component.cy.nodes().length).toBe(6);
    component.projectId = 'p2';
    component.ngOnChanges({ projectId: new SimpleChange('p1', 'p2', false) });
    expect(feedFactory).toHaveBeenCalledWith('p2');
    expect(component.cy.elements().length).toBe(0);
    expect(component.counts).toBeNull();
  });
});
