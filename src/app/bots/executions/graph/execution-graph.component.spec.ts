import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ExecutionRow, ExecutionStats, StatsRange } from '../executions.models';
import { executionLink } from '../execution-links';
import { GraphFeedControls, GraphSnapshot } from './execution-graph.feed';
import { graphOf } from './execution-graph.testing';
import { CYTOSCAPE_LOADER, EXECUTION_GRAPH_FEED, ExecutionGraphComponent, MAX_ZOOM, MIN_ZOOM } from './execution-graph.component';

const E1 = '11111111-1111-1111-1111-111111111111';
const E2 = '22222222-2222-2222-2222-222222222222';
const E3 = '33333333-3333-3333-3333-333333333333';

function row(id: string, status: string, agentId: string, extra: any = {}): ExecutionRow {
  return {
    _id: id, agent_id: agentId, agent_name: null, status: status as any, end_reason: null, trigger: { type: 'chat' },
    started_at: new Date(Date.now() - 60 * 1000).toISOString(), duration_ms: 1000, steps_count: 3,
    failure_conditions: 0, errors: 0, vars_changed: 0, trace_complete: true, test: false, ...extra,
  };
}

const STATS = (over: any = {}, withErrors = 2): ExecutionStats => ({
  range: 'now', from: null, agents: {}, with_errors: withErrors,
  statuses: { running: 1, waiting: 1, stopping: 0, stopped: 0, failed: 1, completed: 0, destroyed: 0, ...over },
});

/** A snapshot of the graph response the server would give for `rows`; `stats` sets the big numbers and exact per-agent counts. */
function snap(rows: ExecutionRow[], stale = false, extra: { stats?: ExecutionStats | null; range?: StatsRange; fetchedAt?: number } = {}): GraphSnapshot {
  const st = extra.stats === undefined ? STATS() : extra.stats;
  const range = extra.range || 'now';
  const graph = st === null ? null : graphOf(rows, {
    range, statuses: st.statuses, with_errors: st.with_errors, counts: Object.keys(st.agents || {}).length ? st.agents : undefined,
  });
  return { graph, range, fetchedAt: extra.fetchedAt === undefined ? Date.now() : extra.fetchedAt, stale };
}

const FIRST_ROWS = () => [row(E1, 'running', 'a1'), row(E2, 'waiting', 'a2'), row(E3, 'failed', 'a2')];
const FIRST = () => snap(FIRST_ROWS());

describe('ExecutionGraphComponent', () => {
  let fixture: ComponentFixture<ExecutionGraphComponent>;
  let component: ExecutionGraphComponent;
  let feed$: Subject<GraphSnapshot>;
  let feedFactory: jasmine.Spy;
  /** What the component handed the feed: its refresh trigger and in-flight callback. */
  let controls: GraphFeedControls;
  let router: { navigate: jasmine.Spy };

  function setup(opts: { loader?: () => Promise<any>; agents?: any[] } = {}) {
    feed$ = new Subject<GraphSnapshot>();
    feedFactory = jasmine.createSpy('feed').and.callFake((pid: string, params: any, c: GraphFeedControls) => {
      controls = c;
      return feed$.asObservable();
    });
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
        Empty: 'Nothing in view',
        Stale: 'Data may be out of date',
        Unavailable: 'The graph could not be loaded',
        Tip: {
          Status: 'State: {{status}}', Started: 'Began: {{time}}', Trigger: 'Source: {{trigger}}', Steps: 'Blocks: {{steps}}',
          More: '{{n}} more not drawn', MoreStatus: '{{status}}: {{n}}', WithErrors: '{{n}} with errors', RunWithErrors: 'With errors',
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
    expect(feedFactory).toHaveBeenCalledWith('p1', { range: 'now' }, jasmine.any(Object));
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

  it('an agent no longer in the list is drawn with its name marked deleted', async () => {
    setup({ agents: [{ id: 'a1', name: 'Nightly' }] });
    await ready();
    feed$.next(FIRST());
    fixture.detectChanges();
    const cy = component.cy;
    expect(cy.getElementById('agent:a1').data('label')).toBe('Nightly');
    const gone = cy.getElementById('agent:a2');
    expect(gone.empty()).toBe(false);
    expect(gone.data('label').endsWith(' · Executions.Graph.Deleted')).toBe(true);
  });

  describe('navigation controls', () => {
    async function drawn() {
      setup();
      await ready();
      feed$.next(FIRST());
      fixture.detectChanges();
      return component.cy;
    }
    const button = (name: string) => (fixture.nativeElement as HTMLElement).querySelector(`.graph-controls [data-control="${name}"]`) as HTMLButtonElement;

    it('shows zoom in, zoom out, fit, centre and fullscreen buttons with labels', async () => {
      await drawn();
      for (const name of ['zoom-in', 'zoom-out', 'fit', 'center', 'fullscreen']) {
        expect(button(name)).not.toBeNull();
        expect(button(name).getAttribute('aria-label')).toContain('Executions.Graph.Controls.');
      }
    });

    it('zoom in and out step around the centre, within the zoom limits', async () => {
      const cy = await drawn();
      cy.zoom(1);
      component.zoomIn(false);
      expect(cy.zoom()).toBeGreaterThan(1);
      cy.zoom(1);
      component.zoomOut(false);
      expect(cy.zoom()).toBeLessThan(1);
      for (let i = 0; i < 40; i++) { component.zoomIn(false); }
      expect(cy.zoom()).toBeCloseTo(MAX_ZOOM, 5);
      for (let i = 0; i < 80; i++) { component.zoomOut(false); }
      expect(cy.zoom()).toBeCloseTo(MIN_ZOOM, 5);
    });

    it('fit shows every node; centre puts the project in the middle without zooming', async () => {
      const cy = await drawn();
      cy.zoom(MAX_ZOOM);
      cy.pan({ x: 5000, y: 5000 });
      component.fit(false);
      const ext = cy.extent();
      cy.nodes().forEach((n: any) => {
        const p = n.position();
        expect(p.x >= ext.x1 && p.x <= ext.x2 && p.y >= ext.y1 && p.y <= ext.y2).toBe(true, n.id());
      });
      cy.zoom(1.2);
      cy.pan({ x: 900, y: -300 });
      component.centerProject(false);
      expect(cy.zoom()).toBeCloseTo(1.2, 5);
      const r = cy.getElementById('project').renderedPosition();
      expect(Math.abs(r.x - cy.width() / 2)).toBeLessThan(1);
      expect(Math.abs(r.y - cy.height() / 2)).toBeLessThan(1);
    });

    it('keyboard on the graph: + and - zoom, 0 fits', async () => {
      const cy = await drawn();
      const stage = (fixture.nativeElement as HTMLElement).querySelector('.graph-stage') as HTMLElement;
      expect(stage.getAttribute('tabindex')).toBe('0');
      spyOn(component, 'zoomIn');
      spyOn(component, 'zoomOut');
      spyOn(component, 'fit');
      stage.dispatchEvent(new KeyboardEvent('keydown', { key: '+' }));
      stage.dispatchEvent(new KeyboardEvent('keydown', { key: '=' }));
      stage.dispatchEvent(new KeyboardEvent('keydown', { key: '-' }));
      stage.dispatchEvent(new KeyboardEvent('keydown', { key: '0' }));
      expect(component.zoomIn).toHaveBeenCalledTimes(2);
      expect(component.zoomOut).toHaveBeenCalledTimes(1);
      expect(component.fit).toHaveBeenCalledTimes(1);
      expect(cy).toBeTruthy();
    });

    it('fullscreen asks the browser for the graph area, and leaves it when already full screen', async () => {
      await drawn();
      const stage = (fixture.nativeElement as HTMLElement).querySelector('.graph-stage') as any;
      stage.requestFullscreen = jasmine.createSpy('requestFullscreen').and.returnValue(Promise.resolve());
      button('fullscreen').click();
      expect(stage.requestFullscreen).toHaveBeenCalled();
      const exit = spyOn(document, 'exitFullscreen').and.returnValue(Promise.resolve());
      spyOnProperty(document, 'fullscreenElement', 'get').and.returnValue(stage);
      button('fullscreen').click();
      expect(exit).toHaveBeenCalled();
    });
  });

  it('a second snapshot keeps existing node positions and removes gone executions', async () => {
    setup();
    await ready();
    feed$.next(FIRST());
    const cy = component.cy;
    const before = ['project', 'agent:a1', 'agent:a2', 'exec:' + E1].map(id => ({ ...cy.getElementById(id).position() }));
    // a2 keeps one execution, so no agent changes footprint bucket and the agents stay put
    const E4 = '44444444-4444-4444-4444-444444444444';
    feed$.next(snap([row(E1, 'running', 'a1'), row(E4, 'waiting', 'a2')]));
    expect(cy.getElementById('exec:' + E2).empty()).toBe(true);
    expect(cy.getElementById('exec:' + E3).empty()).toBe(true);
    expect(cy.getElementById('agent:a2->exec:' + E2).empty()).toBe(true);
    expect(cy.nodes().length).toBe(5);
    const after = ['project', 'agent:a1', 'agent:a2', 'exec:' + E1].map(id => ({ ...cy.getElementById(id).position() }));
    expect(after).toEqual(before);
    // a2 has nothing left in view: it is no longer drawn
    feed$.next(snap([row(E1, 'running', 'a1')]));
    expect(cy.nodes().length).toBe(3);
    expect(cy.getElementById('agent:a2').empty()).toBe(true);
  });

  it('agents get their colour class, executions their status class', async () => {
    setup({ agents: [{ id: 'a1', name: 'Nightly' }, { id: 'a2', name: 'Alpha' }, { id: 'a3', name: 'Done' }, { id: 'a4', name: 'Gone' },
      { id: 'a5', name: 'Paused' }] });
    await ready();
    const E4 = '44444444-4444-4444-4444-444444444444', E5 = '55555555-5555-5555-5555-555555555555', E6 = '66666666-6666-6666-6666-666666666666';
    feed$.next(snap([...FIRST_ROWS(), row(E4, 'completed', 'a3'), row(E5, 'destroyed', 'a4'), row(E6, 'stopped', 'a5')]));
    const cy = component.cy;
    const cls = (id: string) => ['c-red', 'c-blue', 'c-amber', 'c-green', 'c-gray'].filter(c => cy.getElementById(id).hasClass(c));
    expect(cls('agent:a1')).toEqual(['c-blue']);
    expect(cls('agent:a2')).toEqual(['c-red']);
    expect(cls('agent:a3')).toEqual(['c-green']);
    expect(cls('agent:a4')).toEqual(['c-gray']);
    expect(cls('agent:a5')).toEqual(['c-amber']);
    expect(cy.getElementById('exec:' + E3).hasClass('s-failed')).toBe(true);
    expect(cy.getElementById('exec:' + E4).hasClass('s-completed')).toBe(true);
    expect(cy.getElementById('exec:' + E5).hasClass('s-destroyed')).toBe(true);
    expect(cy.getElementById('exec:' + E6).hasClass('s-stopped')).toBe(true);
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
    // the same page for that agent: the view and the filters stay
    expect(router.navigate).toHaveBeenCalledWith(['/project', 'p1', 'monitor', 'a2', 'executions'], { queryParamsHandling: 'preserve' });
    router.navigate.calls.reset();
    component.cy.getElementById('project').emit('tap');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('no cards of its own: each fresh snapshot goes to the host (updated); a stale one only shows the stale note', async () => {
    setup();
    const got: any[] = [];
    component.updated.subscribe((u: any) => got.push(u));
    await ready();
    const text = () => (fixture.nativeElement as HTMLElement).textContent;
    expect((fixture.nativeElement as HTMLElement).querySelector('execution-stat-cards')).toBeNull();
    const first = snap(FIRST_ROWS(), false, { stats: STATS({ running: 7 }), fetchedAt: 1000 });
    feed$.next(first);
    fixture.detectChanges();
    expect(got).toEqual([{ graph: first.graph, fetchedAt: 1000 }]);
    expect(text()).not.toContain('Data may be out of date');
    feed$.next({ ...FIRST(), stale: true });
    fixture.detectChanges();
    expect(got.length).toBe(1);
    expect(text()).toContain('Data may be out of date');
    expect(text()).not.toContain('Some executions are not drawn');
  });

  it('nothing in view: an empty note over the graph', async () => {
    setup();
    await ready();
    feed$.next(snap([], false, { stats: STATS({ running: 0, waiting: 0, failed: 0 }) }));
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.graph-empty').textContent.trim()).toBe('Nothing in view');
    feed$.next(FIRST());
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.graph-empty')).toBeNull();
  });

  it('a new range resubscribes the feed with it', async () => {
    setup();
    await ready();
    feed$.next(FIRST());
    component.range = '24h';
    component.ngOnChanges({ range: new SimpleChange('now', '24h', false) });
    expect(feedFactory).toHaveBeenCalledWith('p1', { range: '24h' }, jasmine.any(Object));
    expect(component.stats).toBeNull();
  });

  it('the filters go to the feed with the range; new filters resubscribe it', async () => {
    setup();
    component.filters = { agent_id: 'a1', status: 'failed', q: 'r1', test: false };
    await ready();
    expect(feedFactory).toHaveBeenCalledWith('p1', { range: 'now', agent_id: 'a1', status: 'failed', q: 'r1', test: false }, jasmine.any(Object));
    const calls = feedFactory.calls.count();
    const next = { trigger: 'unattended', has_errors: true, test: 'all' as const };
    const prev = component.filters;
    component.filters = next;
    component.ngOnChanges({ filters: new SimpleChange(prev, next, false) });
    expect(feedFactory.calls.count()).toBe(calls + 1);
    expect(feedFactory.calls.mostRecent().args[1]).toEqual({ range: 'now', trigger: 'unattended', has_errors: true, test: 'all' });
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
    // server order: the running one first, then the waiting ones; 12 drawn, 3 waiting hidden
    feed$.next(snap([row(E1, 'running', 'a1'), ...many]));
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
    // the runs not drawn: that agent's list, filters kept
    expect(router.navigate).toHaveBeenCalledWith(['/project', 'p1', 'monitor', 'a1', 'executions'],
      { queryParams: { view: null }, queryParamsHandling: 'merge' });
  });

  it('a stale first snapshot (an error before any data) is not handed to the host', async () => {
    setup();
    const got: any[] = [];
    component.updated.subscribe((u: any) => got.push(u));
    await ready();
    feed$.next(snap([], true, { stats: null }));
    fixture.detectChanges();
    expect(got).toEqual([]);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Data may be out of date');
    expect((fixture.nativeElement as HTMLElement).querySelector('.graph-empty')).toBeNull();
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
    expect(cy.nodes().length).toBe(3);
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

  it('agent and execution nodes use style C (shape, size, background image per status, label below the agent)', async () => {
    setup({ agents: [{ id: 'a1', name: 'Nightly' }, { id: 'a2', name: 'Alpha' }, { id: 'a3', name: 'Quiet' }, { id: 'a4', name: 'Done' }] });
    await ready();
    const E4 = '44444444-4444-4444-4444-444444444444';
    const many = Array.from({ length: 14 }, (_, i) => row('w' + String(i).padStart(2, '0') + '-0000-0000', 'waiting', 'a3'));
    feed$.next(snap([row(E1, 'running', 'a1'), row(E2, 'waiting', 'a2'), row(E4, 'stopping', 'a1'), row(E3, 'failed', 'a2')]));
    const cy = component.cy;
    const img = (id: string) => decodeURIComponent(String(cy.getElementById(id).style('background-image')));

    const agent = cy.getElementById('agent:a1');
    expect(agent.style('shape')).toBe('round-rectangle');
    expect(agent.numericStyle('width')).toBe(56);
    expect(agent.numericStyle('height')).toBe(56);
    expect(agent.style('text-valign')).toBe('bottom');
    expect(agent.numericStyle('font-size')).toBe(12);
    expect(img('agent:a1')).toContain('i-bot');
    expect(img('agent:a1')).toContain('#0f4c99');            // blue: running
    expect(img('agent:a2')).toContain('#a1170d');            // red: a failure
    expect(cy.getElementById('agent:a2').numericStyle('underlay-padding')).toBe(7);

    const exec = cy.getElementById('exec:' + E1);
    expect(exec.style('shape')).toBe('round-rectangle');
    expect(exec.numericStyle('width')).toBe(26);
    expect(exec.numericStyle('height')).toBe(26);
    expect(img('exec:' + E1)).toContain('i-play');
    expect(img('exec:' + E2)).toContain('i-clock');
    expect(img('exec:' + E3)).toContain('i-alert');
    expect(img('exec:' + E4)).toContain('i-stop');
    expect(cy.getElementById('exec:' + E2).numericStyle('opacity')).toBe(1);
    expect(cy.getElementById('project').style('shape')).toBe('round-rectangle');
    expect(cy.getElementById('project').numericStyle('width')).toBeGreaterThan(32); // grows with the name

    expect(cy.getElementById('agent:a2->exec:' + E3).hasClass('edge-failed')).toBe(true);
    expect(cy.getElementById('agent:a2->exec:' + E3).numericStyle('width')).toBe(1.5);
    expect(cy.getElementById('agent:a1->exec:' + E1).numericStyle('width')).toBe(1.5);
    expect(cy.getElementById('agent:a2->exec:' + E2).numericStyle('width')).toBe(1);
    const spoke = cy.getElementById('project->agent:a1');
    expect(spoke.hasClass('edge-spoke')).toBe(true);
    expect(spoke.style('line-color')).toBe('rgb(223,227,232)');   // #dfe3e8: structure, lighter than the fan edges
    expect(spoke.numericStyle('width')).toBe(1);

    // amber (waiting), green (completed), gray (destroyed); completed and destroyed chips
    const E5 = '55555555-5555-5555-5555-555555555555';
    feed$.next(snap([...many, row(E2, 'waiting', 'a2'), row(E4, 'completed', 'a1'), row(E5, 'destroyed', 'a1'), row(E1, 'completed', 'a4')]));
    expect(img('agent:a2')).toContain('#8a5a00');
    expect(img('agent:a1')).toContain('#5d6b82');
    expect(img('agent:a4')).toContain('#1e7a3c');
    expect(img('exec:' + E4)).toContain('i-check');
    expect(img('exec:' + E5)).toContain('i-x');
    const more = cy.getElementById('more:a3');
    expect(more.style('border-style')).toBe('dashed');
    expect(more.numericStyle('height')).toBe(22);
    expect(more.numericStyle('font-size')).toBe(11);
    expect(more.numericStyle('width')).toBeGreaterThan(22);   // auto width from '+N'
  });

  it('colour key: one swatch per agent colour, from the palette', async () => {
    setup();
    await ready();
    const swatches = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.graph-key .key-swatch')) as HTMLElement[];
    expect(swatches.map(s => s.getAttribute('data-color'))).toEqual(['red', 'blue', 'amber', 'green', 'gray']);
    const border = (el: HTMLElement) => getComputedStyle(el).borderTopColor;
    expect(border(swatches[0])).toBe('rgb(243, 184, 178)'); // red border #f3b8b2
    expect(border(swatches[1])).toBe('rgb(185, 211, 245)'); // blue border #b9d3f5
  });

  it('an agent with errors is red and its tooltip says how many executions have them', async () => {
    setup();
    await ready();
    feed$.next(snap([row(E1, 'running', 'a1', { errors: 2 }), row(E3, 'failed', 'a2')]));
    const a1 = component.cy.getElementById('agent:a1');
    expect(a1.hasClass('c-red')).toBe(true);
    expect(a1.numericStyle('text-max-width')).toBe(160);
    a1.emit('mouseover');
    fixture.detectChanges();
    const lines = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.graph-tooltip .tip-line')).map(l => l.textContent.trim());
    expect(lines).toEqual(['Nightly', '1 with errors']);
  });

  it('an agent with managed failures only (failure_conditions) is not red, no errors line', async () => {
    setup();
    await ready();
    feed$.next(snap([row(E1, 'running', 'a1', { failure_conditions: 2 })]));
    const a1 = component.cy.getElementById('agent:a1');
    expect(a1.hasClass('c-blue')).toBe(true);
    a1.emit('mouseover');
    fixture.detectChanges();
    const lines = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.graph-tooltip .tip-line')).map(l => l.textContent.trim());
    expect(lines).toEqual(['Nightly']);
  });

  it('the agent tooltip counts the runs with errors from the stats errors', async () => {
    setup();
    await ready();
    const stats = { ...STATS(), agents: { a1: { running: 1, waiting: 0, stopping: 0, stopped: 0, failed: 0, completed: 4, destroyed: 0, failure_conditions: 5, errors: 3 } } };
    feed$.next(snap([row(E1, 'running', 'a1')], false, { stats }));
    const a1 = component.cy.getElementById('agent:a1');
    expect(a1.hasClass('c-red')).toBe(true);
    a1.emit('mouseover');
    fixture.detectChanges();
    const lines = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.graph-tooltip .tip-line')).map(l => l.textContent.trim());
    expect(lines).toEqual(['Nightly', '3 with errors']);
  });

  it('a run with errors gets a red ring on its chip and "with errors" in its tooltip', async () => {
    setup();
    await ready();
    feed$.next(snap([row(E1, 'completed', 'a1', { errors: 1 }), row(E2, 'completed', 'a1')]));
    const marked = component.cy.getElementById('exec:' + E1);
    const plain = component.cy.getElementById('exec:' + E2);
    expect(marked.hasClass('with-errors')).toBe(true);
    expect(plain.hasClass('with-errors')).toBe(false);
    expect(marked.numericStyle('outline-width')).toBe(2);
    expect(marked.style('outline-color')).toBe('rgb(217,48,37)'); // #d93025
    expect(plain.numericStyle('outline-width')).toBe(0);
    marked.emit('mouseover');
    fixture.detectChanges();
    const lines = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.graph-tooltip .tip-line')).map(l => l.textContent.trim());
    expect(lines[lines.length - 1]).toBe('With errors');
    plain.emit('mouseover');
    fixture.detectChanges();
    const plainLines = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.graph-tooltip .tip-line')).map(l => l.textContent.trim());
    expect(plainLines).not.toContain('With errors');
  });

  it('a new projectId resets the graph and subscribes the new feed', async () => {
    setup();
    await ready();
    feed$.next(FIRST());
    expect(component.cy.nodes().length).toBe(6);
    component.projectId = 'p2';
    component.ngOnChanges({ projectId: new SimpleChange('p1', 'p2', false) });
    expect(feedFactory).toHaveBeenCalledWith('p2', { range: 'now' }, jasmine.any(Object));
    expect(component.cy.elements().length).toBe(0);
    expect(component.stats).toBeNull();
  });

  describe('refresh and loading (the host has the button and the note)', () => {
    it('no Refresh button, no updated note, no toolbar of its own (only the navigation controls)', async () => {
      setup();
      await ready();
      const el = fixture.nativeElement as HTMLElement;
      const buttons = Array.from(el.querySelectorAll('button'));
      expect(buttons.every(b => !!b.closest('.graph-controls'))).toBe(true);
      expect(el.querySelector('.graph-updated')).toBeNull();
      expect(el.querySelector('.graph-toolbar')).toBeNull();
    });

    it('refresh() asks the feed for a cycle now, unless a call is in flight', async () => {
      setup();
      await ready();
      const asked = jasmine.createSpy('refresh');
      controls.refresh$.subscribe(asked);
      component.refresh();
      expect(asked).not.toHaveBeenCalled(); // the first cycle is in flight
      controls.loading(false);
      component.refresh();
      expect(asked).toHaveBeenCalledTimes(1);
    });

    it('loadingChange tells the host when a call is in flight, from the first one on', async () => {
      setup();
      const seen: boolean[] = [];
      component.loadingChange.subscribe((b: boolean) => seen.push(b));
      await ready();
      expect(seen).toEqual([true]);
      controls.loading(false);
      controls.loading(true);
      expect(seen).toEqual([true, false, true]);
    });

    it('a new range hands the feed new controls and is in flight again; the old feed\'s late word is ignored', async () => {
      setup();
      await ready();
      controls.loading(false);
      const first = controls;
      component.range = '24h';
      component.ngOnChanges({ range: new SimpleChange('now', '24h', false) });
      expect(controls).not.toBe(first);
      expect(component.loading).toBe(true);
      first.loading(false);
      expect(component.loading).toBe(true);
    });
  });
});
