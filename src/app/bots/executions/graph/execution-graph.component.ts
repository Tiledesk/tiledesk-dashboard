import {
  Component, ElementRef, EventEmitter, HostListener, Inject, inject, InjectionToken, Input, NgZone, OnChanges, OnDestroy, OnInit,
  Output, SimpleChanges, ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ExecutionsService } from 'app/services/executions.service';
import { executionLink, monitorExecutionsLink } from '../execution-links';
import { ExecutionGraph, GraphParams, StatsRange, ViewFilters } from '../executions.models';
import { AGENT_COLORS, AgentColor, buildExecutionGraph, GraphAgent, GraphModel, GraphNode, GraphTooltip, ShownStatus } from './execution-graph.model';
import { executionGraphFeed, GraphFeedControls, GraphSnapshot } from './execution-graph.feed';
import { EXEC_GRAPH_COLORS as C, EXEC_GRAPH_ICONS as I } from './execution-graph.colors';

export type ExecutionGraphFeedFactory = (projectId: string, params: GraphParams, controls: GraphFeedControls) => Observable<GraphSnapshot>;

/** A fresh answer, for the host's cards and its "updated … ago" note. */
export interface GraphUpdate { graph: ExecutionGraph | null; fetchedAt: number; }
export type CytoscapeLoader = () => Promise<any>;

/** Snapshot source of the graph; replaced in tests by a Subject. */
export const EXECUTION_GRAPH_FEED = new InjectionToken<ExecutionGraphFeedFactory>('EXECUTION_GRAPH_FEED', {
  providedIn: 'root',
  factory: () => {
    const service = inject(ExecutionsService);
    return (projectId: string, params: GraphParams, controls: GraphFeedControls) =>
      executionGraphFeed(service, projectId, params, { refresh$: controls.refresh$, loading: controls.loading });
  }
});

/** Loads Cytoscape lazily, so the library lands in its own chunk. */
export const CYTOSCAPE_LOADER = new InjectionToken<CytoscapeLoader>('CYTOSCAPE_LOADER', {
  providedIn: 'root',
  factory: () => () => import('cytoscape')
});

export const PULSE_MS = 1200;
export const DASH_MS = 100;
export const MAX_ZOOM = 1.75;
/** Furthest the graph zooms out (a big project still fits; further out, nothing is readable). */
export const MIN_ZOOM = 0.2;
/** One zoom step of the + / - buttons and keys. */
export const ZOOM_STEP = 1.25;
const NAV_ANIMATION_MS = 180;
const FIT_PADDING = 40;

interface TooltipState { lines: string[]; x: number; y: number; }

function classesFor(n: GraphNode): string {
  const out = [n.kind === 'execution' ? 'exec' : n.kind];
  if (n.color) { out.push('c-' + n.color); }
  if (n.status) { out.push('s-' + n.status); }
  if (n.withErrors) { out.push('with-errors'); }
  return out.join(' ');
}

/** Badge colours of an agent colour. */
const AGENT_STYLE: { [K in AgentColor]: { bg: string; border: string; icon: string } } = {
  red: { bg: C.redBg, border: C.redBorder, icon: I.agentRed },
  blue: { bg: C.blueBg, border: C.blueBorder, icon: I.agentBlue },
  amber: { bg: C.amberBg, border: C.amberBorder, icon: I.agentAmber },
  green: { bg: C.greenBg, border: C.greenBorder, icon: I.agentGreen },
  gray: { bg: C.grayBg, border: C.grayBorder, icon: I.agentGray },
};

const FONT = 'Inter, system-ui, sans-serif';
let measureCtx: CanvasRenderingContext2D | null | undefined;

/** Width of a label in px (canvas metrics, or an estimate when there is no canvas). */
function textWidth(text: string, font: string, size: number): number {
  if (measureCtx === undefined) {
    try { measureCtx = document.createElement('canvas').getContext('2d'); } catch (e) { measureCtx = null; }
  }
  if (measureCtx) {
    measureCtx.font = font;
    return Math.ceil(measureCtx.measureText(text).width);
  }
  return Math.ceil(text.length * size * 0.6);
}

/** Measured widths get a little slack, so a web font that loads after the measure does not clip the label. */
const LABEL_SLACK = 6;

/** Auto width from the label (Cytoscape's `width: label` is deprecated). */
const projectWidth = (ele: any) => textWidth(ele.data('label') || '', '600 13px ' + FONT, 13) + 32 + LABEL_SLACK;
const moreWidth = (ele: any) => textWidth(ele.data('label') || '', '500 11px ' + FONT, 11) + 16 + LABEL_SLACK;

const GRAPH_STYLE: any[] = [
  { selector: 'node', style: {
    'label': 'data(label)', 'font-family': FONT, 'font-size': 11, 'color': C.ink,
    'shape': 'round-rectangle', 'background-color': C.waitBg, 'width': 26, 'height': 26,
  } },
  { selector: 'node.project', style: {
    'background-color': C.ink, 'color': C.white, 'font-size': 13, 'font-weight': 600,
    'text-valign': 'center', 'text-halign': 'center', 'width': projectWidth, 'height': 38, 'corner-radius': 14,
  } },
  // agents: a 56px badge with a bot icon, the name below it
  { selector: 'node.agent', style: {
    'width': 56, 'height': 56, 'corner-radius': 16, 'border-width': 1,
    'background-color': C.grayBg, 'border-color': C.grayBorder, 'background-image': I.agentGray,
    'background-width': 26, 'background-height': 26,
    'font-size': 12, 'font-weight': 600, 'text-valign': 'bottom', 'text-halign': 'center', 'text-margin-y': 6,
    'text-wrap': 'ellipsis', 'text-max-width': 160,
    'text-background-color': C.labelBg, 'text-background-opacity': 0.9, 'text-background-padding': 2,
    'text-background-shape': 'round-rectangle',
  } },
  ...AGENT_COLORS.map(c => ({ selector: 'node.agent.c-' + c, style: {
    'background-color': AGENT_STYLE[c].bg, 'border-color': AGENT_STYLE[c].border, 'background-image': AGENT_STYLE[c].icon,
  } })),
  // red: a halo too, the one colour that asks for attention
  { selector: 'node.agent.c-red', style: {
    'underlay-color': C.bad, 'underlay-padding': 7, 'underlay-opacity': 0.16, 'underlay-shape': 'round-rectangle',
    'underlay-corner-radius': 23,
  } },
  // executions: a 26px chip with a status icon
  { selector: 'node.exec', style: {
    'label': '', 'width': 26, 'height': 26, 'corner-radius': 7, 'border-width': 0,
    'background-width': 14, 'background-height': 14,
  } },
  { selector: 'node.s-running', style: {
    'background-color': C.run, 'background-image': I.running,
    'underlay-color': C.run, 'underlay-padding': 5, 'underlay-opacity': 0.25, 'underlay-shape': 'round-rectangle',
    'underlay-corner-radius': 12,
  } },
  { selector: 'node.s-waiting', style: {
    'background-color': C.waitBg, 'border-width': 1, 'border-color': C.waitBorder, 'background-image': I.waiting,
  } },
  { selector: 'node.s-stopping', style: {
    'background-color': C.stopBg, 'border-width': 1, 'border-color': C.stopBorder, 'background-image': I.stopping,
    'background-width': 12, 'background-height': 12,
  } },
  // stopped: the stopping chip, without the pulse
  { selector: 'node.s-stopped', style: {
    'background-color': C.stopBg, 'border-width': 1, 'border-color': C.stopBorder, 'background-image': I.stopping,
    'background-width': 12, 'background-height': 12,
  } },
  { selector: 'node.s-failed', style: {
    'background-color': C.bad, 'background-image': I.failed,
    'underlay-color': C.bad, 'underlay-padding': 5, 'underlay-opacity': 0.2, 'underlay-shape': 'round-rectangle',
    'underlay-corner-radius': 12,
  } },
  { selector: 'node.s-completed', style: { 'background-color': C.ok, 'background-image': I.completed } },
  { selector: 'node.s-destroyed', style: { 'background-color': C.dead, 'background-image': I.destroyed } },
  // a run with errors (an unhandled action): a red ring around its chip, whatever the status colour
  { selector: 'node.exec.with-errors', style: {
    'outline-width': 2, 'outline-color': C.bad, 'outline-offset': 2, 'outline-opacity': 1,
  } },
  // "+N": an auto-width dashed pill
  { selector: 'node.more', style: {
    'width': moreWidth, 'height': 22, 'corner-radius': 11, 'background-color': C.white,
    'border-width': 1, 'border-style': 'dashed', 'border-color': C.moreBorder,
    'font-size': 11, 'font-weight': 500, 'color': C.moreText, 'text-valign': 'center', 'text-halign': 'center',
  } },
  { selector: 'edge', style: { 'width': 1, 'line-color': C.edge, 'curve-style': 'straight' } },
  // project -> agent: short structural spokes, lighter than the fan edges
  { selector: 'edge.edge-spoke', style: { 'width': 1, 'line-color': C.spoke } },
  { selector: 'edge.edge-animated', style: { 'width': 1.5, 'line-color': C.run, 'line-style': 'dashed', 'line-dash-pattern': [5, 4] } },
  { selector: 'edge.edge-failed', style: { 'width': 1.5, 'line-color': C.bad } },
];

@Component({
  selector: 'execution-graph',
  templateUrl: './execution-graph.component.html',
  styleUrls: ['./execution-graph.component.scss']
})
export class ExecutionGraphComponent implements OnInit, OnChanges, OnDestroy {
  @Input() projectId: string;
  @Input() projectName = '';
  @Input() agents: GraphAgent[] = [];
  /** The view: Now (the not-terminated runs) or a range on top of it. */
  @Input() range: StatsRange = 'now';
  /** The executions page's filters (agent, trigger, status, failure conditions, errors, test runs, search), on top of the view. */
  @Input() filters: ViewFilters = {};
  /** Emitted when Cytoscape cannot be loaded or created; the graph shows its own Unavailable message. */
  @Output() unavailable = new EventEmitter<void>();
  /** Each fresh answer (not a stale one): the host shows its numbers and when it was asked. */
  @Output() updated = new EventEmitter<GraphUpdate>();
  /** Whether a call is in flight (the host disables its Refresh button). */
  @Output() loadingChange = new EventEmitter<boolean>();

  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLElement>;
  /** The canvas and its overlays: what fullscreen shows, and what takes the navigation keys. */
  @ViewChild('stage', { static: true }) stage: ElementRef<HTMLElement>;

  /** The colour key uses the graph's own palette. */
  readonly keyColors = AGENT_COLORS.map(c => ({ color: c, bg: AGENT_STYLE[c].bg, border: AGENT_STYLE[c].border }));

  cy: any = null;
  /** The last fresh graph response of the current view; null until there is one. */
  stats: ExecutionGraph | null = null;
  /** A call is in flight: refresh() does nothing. */
  loading = false;
  /** Nothing in view (after a successful snapshot). */
  empty = false;
  stale = false;
  failed = false;
  tooltip: TooltipState | null = null;
  pulseTimer: any = null;
  dashTimer: any = null;
  /** Resolves when init is over (Cytoscape created and the feed subscribed, or failed). */
  ready: Promise<void> = Promise.resolve();

  private sub: Subscription | null = null;
  /** The current feed's manual refresh trigger (a new one per subscription). */
  private refresh$: Subject<void> | null = null;
  private last: GraphSnapshot | null = null;
  private fitted = false;
  private destroyed = false;
  private pulseOn = false;
  private dashOffset = 0;
  /** Edges with marching dashes, refreshed on each apply. */
  private animatedEdges: any = null;
  /** Nodes that carry pulse bypasses from the last paint. */
  private pulsed: any = null;

  constructor(
    private zone: NgZone,
    private router: Router,
    private translate: TranslateService,
    @Inject(EXECUTION_GRAPH_FEED) private feed: ExecutionGraphFeedFactory,
    @Inject(CYTOSCAPE_LOADER) private loader: CytoscapeLoader,
  ) { }

  ngOnInit(): void {
    this.ready = this.init();
  }

  /** The host's Refresh button: a cycle now, unless one is in flight (the feed checks too). */
  refresh(): void {
    if (this.loading || !this.refresh$) { return; }
    this.refresh$.next();
  }

  private setLoading(inFlight: boolean): void {
    if (this.loading === inFlight) { return; }
    this.loading = inFlight;
    this.loadingChange.emit(inFlight);
  }

  /** The feed's query: the range and the filters that are set. */
  private params(): GraphParams {
    const p: GraphParams = { range: this.range || 'now' };
    const f = this.filters || {};
    Object.keys(f).forEach(k => {
      const v = (f as any)[k];
      if (v !== undefined && v !== null && v !== '') { (p as any)[k] = v; }
    });
    return p;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.cy) { return; }
    if (changes.projectId && !changes.projectId.firstChange) {
      this.resetGraph();
      this.subscribeFeed();
    } else if ((changes.range && !changes.range.firstChange) || (changes.filters && !changes.filters.firstChange)) {
      // same graph, new view: the old view's answer is not kept for the new one
      this.last = null;
      this.stats = null;
      this.empty = false;
      this.subscribeFeed();
    } else if ((changes.agents || changes.projectName) && this.last) {
      this.zone.runOutsideAngular(() => this.apply(this.last));
    }
  }

  // ---- navigation: zoom, fit, centre, fullscreen (buttons over the canvas, and keys while it has focus) ----

  /** Zooms by `factor` around the centre of the view, within MIN_ZOOM..MAX_ZOOM. */
  private zoomAround(factor: number, animate: boolean): void {
    const cy = this.cy;
    if (!cy) { return; }
    const level = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, cy.zoom() * factor));
    const at = { x: cy.width() / 2, y: cy.height() / 2 };
    if (animate) { cy.stop(); cy.animate({ zoom: { level, renderedPosition: at }, duration: NAV_ANIMATION_MS }); }
    else { cy.zoom({ level, renderedPosition: at }); }
  }

  zoomIn(animate = true): void { this.zoomAround(ZOOM_STEP, animate); }

  zoomOut(animate = true): void { this.zoomAround(1 / ZOOM_STEP, animate); }

  /** Zooms and pans so every node is in view (what the first draw does). */
  fit(animate = true): void {
    const cy = this.cy;
    if (!cy || cy.nodes().empty()) { return; }
    if (animate) { cy.stop(); cy.animate({ fit: { eles: cy.elements(), padding: FIT_PADDING }, duration: NAV_ANIMATION_MS }); }
    else { cy.fit(undefined, FIT_PADDING); }
  }

  /** Brings the project node to the middle of the view, at the current zoom. */
  centerProject(animate = true): void {
    const cy = this.cy;
    const project = cy && cy.getElementById('project');
    if (!project || project.empty()) { return; }
    if (animate) { cy.stop(); cy.animate({ center: { eles: project }, duration: NAV_ANIMATION_MS }); }
    else { cy.center(project); }
  }

  get fullscreen(): boolean {
    return !!this.stage && document.fullscreenElement === this.stage.nativeElement;
  }

  /** The graph area fills the screen (Esc, or the button again, leaves it). */
  toggleFullscreen(): void {
    const el = this.stage && this.stage.nativeElement;
    if (!el) { return; }
    if (document.fullscreenElement === el) {
      if (document.exitFullscreen) { document.exitFullscreen().catch(() => undefined); }
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => undefined);
    }
  }

  /** The canvas changed size (fullscreen in or out): Cytoscape re-measures, then everything is fitted again. */
  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    if (!this.cy) { return; }
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        if (this.destroyed || !this.cy) { return; }
        this.cy.resize();
        this.fit(false);
      }, 0);
    });
  }

  /** Keys while the graph area has focus: + (or =) zooms in, - zooms out, 0 fits. */
  onKey(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) { return; }
    const k = event.key;
    if (k === '+' || k === '=') { this.zoomIn(); event.preventDefault(); }
    else if (k === '-' || k === '_') { this.zoomOut(); event.preventDefault(); }
    else if (k === '0') { this.fit(); event.preventDefault(); }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.fullscreen && document.exitFullscreen) { document.exitFullscreen().catch(() => undefined); }
    if (this.sub) { this.sub.unsubscribe(); this.sub = null; }
    if (this.pulseTimer !== null) { clearInterval(this.pulseTimer); this.pulseTimer = null; }
    if (this.dashTimer !== null) { clearInterval(this.dashTimer); this.dashTimer = null; }
    if (this.cy) { this.cy.destroy(); }
  }

  private async init(): Promise<void> {
    try {
      const mod = await this.loader();
      if (this.destroyed) { return; }
      const cytoscape = (mod && mod.default) || mod;
      this.zone.runOutsideAngular(() => {
        this.cy = cytoscape({
          container: this.canvas.nativeElement,
          elements: [],
          style: GRAPH_STYLE,
          layout: { name: 'preset' },
          userZoomingEnabled: true,
          maxZoom: MAX_ZOOM,
          minZoom: MIN_ZOOM,
          boxSelectionEnabled: false,
          autoungrabify: true,
        });
        this.bindEvents();
        this.startTimers();
      });
    } catch (e) {
      if (this.destroyed) { return; }
      this.failed = true;
      this.unavailable.emit();
      return;
    }
    this.subscribeFeed();
  }

  /** Drops the previous project's graph state, so the next snapshot starts from scratch. */
  private resetGraph(): void {
    if (this.sub) { this.sub.unsubscribe(); this.sub = null; }
    this.last = null;
    this.fitted = false;
    this.cy.elements().remove();
    this.animatedEdges = this.cy.collection();
    this.pulsed = this.cy.collection();
    this.stats = null;
    this.empty = false;
    this.stale = false;
    this.tooltip = null;
  }

  private subscribeFeed(): void {
    if (this.sub) { this.sub.unsubscribe(); }
    // subscribing starts a cycle: in flight until the feed says it answered
    this.setLoading(true);
    const refresh$ = this.refresh$ = new Subject<void>();
    const loading = (inFlight: boolean) => {
      if (refresh$ !== this.refresh$) { return; } // a previous feed's late word
      if (NgZone.isInAngularZone()) { this.setLoading(inFlight); } else { this.zone.run(() => this.setLoading(inFlight)); }
    };
    this.zone.runOutsideAngular(() => {
      this.sub = this.feed(this.projectId, this.params(), { refresh$: refresh$.asObservable(), loading }).subscribe(snap => {
        let model: GraphModel;
        try {
          model = this.apply(snap);
        } catch (e) {
          // a bad snapshot must not end the feed (rxjs 6 would unsubscribe): keep the previous render
          console.error('[execution-graph] could not apply a snapshot', e);
          this.zone.run(() => { this.stale = true; });
          return;
        }
        this.last = snap;
        this.zone.run(() => {
          // a stale snapshot is the last good one again (or an empty first one): only a fresh one changes the numbers
          if (!snap.stale) {
            this.stats = snap.graph;
            this.empty = model.nodes.length <= 1;
            this.updated.emit({ graph: snap.graph, fetchedAt: snap.fetchedAt });
          }
          this.stale = snap.stale;
        });
      });
    });
  }

  /** Rebuilds the model and diffs it into Cytoscape. Positions always come from the model. */
  private apply(snap: GraphSnapshot): GraphModel {
    const model = buildExecutionGraph({ projectName: this.projectName || '', agents: this.agents || [], graph: snap.graph });
    const cy = this.cy;
    const wanted = new Set<string>();
    model.nodes.forEach(n => wanted.add(n.id));
    model.edges.forEach(e => wanted.add(e.id));
    cy.batch(() => {
      cy.elements().filter((el: any) => !wanted.has(el.id())).remove();
      const add: any[] = [];
      for (const n of model.nodes) {
        const data = {
          // a deleted agent: its name, marked (its runs are still in view)
          id: n.id, kind: n.kind, status: n.status || null, agentId: n.agentId || null,
          label: n.deleted ? n.label + ' · ' + this.translate.instant('Executions.Graph.Deleted') : n.label,
          executionId: n.executionId || null, tooltip: n.tooltip
        };
        const classes = classesFor(n);
        const el = cy.getElementById(n.id);
        if (el.empty()) {
          add.push({ group: 'nodes', data, classes, position: { x: n.position.x, y: n.position.y } });
        } else {
          el.data(data);
          el.classes(classes);
          el.position({ x: n.position.x, y: n.position.y });
        }
      }
      const failedIds = new Set(model.nodes.filter(n => n.status === 'failed').map(n => n.id));
      for (const e of model.edges) {
        const classes = e.animated ? 'edge-animated' : failedIds.has(e.target) ? 'edge-failed' : e.source === 'project' ? 'edge-spoke' : '';
        const el = cy.getElementById(e.id);
        if (el.empty()) {
          add.push({ group: 'edges', data: { id: e.id, source: e.source, target: e.target }, classes });
        } else {
          el.classes(classes);
        }
      }
      if (add.length) { cy.add(add); }
      this.animatedEdges = cy.edges('.edge-animated');
      if (this.pulseTimer !== null) { this.paintPulse(); }
    });
    // fit once there is more than the project node (agents may still be loading on the first snapshot)
    if (!this.fitted && model.nodes.length > 1) {
      this.fitted = true;
      cy.fit(undefined, FIT_PADDING);
    }
    return model;
  }

  private bindEvents(): void {
    const cy = this.cy;
    cy.on('tap', 'node', (evt: any) => {
      const d = evt.target.data();
      let commands: any[] | null = null;
      let extras: any;
      if (d.kind === 'execution') {
        const link = executionLink(this.projectId, d.agentId, d.executionId);
        if (link) {
          commands = link.commands;
          extras = link.queryParams ? { queryParams: link.queryParams } : undefined;
        }
      } else if (d.kind === 'agent' && d.agentId) {
        // the same page for that agent: the view and the filters stay
        commands = monitorExecutionsLink(this.projectId, d.agentId);
        extras = { queryParamsHandling: 'preserve' };
      } else if (d.kind === 'more' && d.agentId) {
        // the runs not drawn: that agent's list, the filters kept
        commands = monitorExecutionsLink(this.projectId, d.agentId);
        extras = { queryParams: { view: null }, queryParamsHandling: 'merge' };
      }
      if (commands) {
        const c = commands;
        this.zone.run(() => extras ? this.router.navigate(c, extras) : this.router.navigate(c));
      }
    });
    // Cytoscape draws on a canvas: the pointer cursor over the nodes a tap opens is set on its container.
    const container = cy.container() as HTMLElement;
    const clickable = (d: any) => (d.kind === 'execution' && !!executionLink(this.projectId, d.agentId, d.executionId))
      || ((d.kind === 'agent' || d.kind === 'more') && !!d.agentId);
    cy.on('mouseover', 'node', (evt: any) => { container.style.cursor = clickable(evt.target.data()) ? 'pointer' : ''; });
    cy.on('mouseout', 'node', () => { container.style.cursor = ''; });
    cy.on('mouseover', 'node', (evt: any) => {
      const node = evt.target;
      const p = node.renderedPosition();
      const tip = { lines: this.tooltipLines(node.data('tooltip')), x: p.x, y: p.y + node.renderedOuterHeight() / 2 + 6 };
      this.zone.run(() => { this.tooltip = tip; });
    });
    const hide = () => { if (this.tooltip) { this.zone.run(() => { this.tooltip = null; }); } };
    cy.on('mouseout', 'node', hide);
    cy.on('viewport', hide);
  }

  /** Tooltip lines in the current language; the start time in the browser's locale. */
  private tooltipLines(tip: GraphTooltip): string[] {
    if (!tip) { return []; }
    const t = (key: string, params?: any) => this.translate.instant('Executions.Graph.Tip.' + key, params);
    const status = (st: ShownStatus) => this.translate.instant('Executions.Status.' + st);
    if (tip.kind === 'text') {
      return tip.withErrors > 0 ? [tip.text, t('WithErrors', { n: tip.withErrors })] : [tip.text];
    }
    if (tip.kind === 'more') {
      const order: ShownStatus[] = ['failed', 'stopping', 'running', 'waiting', 'stopped', 'completed', 'destroyed'];
      const total = order.reduce((acc, st) => acc + tip.hidden[st], 0);
      return [t('More', { n: total })].concat(
        order.filter(st => tip.hidden[st] > 0).map(st => t('MoreStatus', { status: status(st), n: tip.hidden[st] })));
    }
    const started = tip.startedAt ? Date.parse(tip.startedAt) : NaN;
    return [
      t('Status', { status: status(tip.status) }),
      t('Started', { time: isNaN(started) ? (tip.startedAt || '-') : new Date(started).toLocaleString() }),
      t('Trigger', { trigger: tip.trigger || '-' }),
      t('Steps', { steps: tip.steps }),
    ].concat(tip.withErrors ? [t('RunWithErrors')] : []);
  }

  private startTimers(): void {
    const reduced = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { return; }
    this.pulseTimer = setInterval(() => {
      this.pulseOn = !this.pulseOn;
      this.cy.batch(() => this.paintPulse());
    }, PULSE_MS);
    this.dashTimer = setInterval(() => {
      this.dashOffset = (this.dashOffset - 2) % 1000;
      const edges = this.animatedEdges;
      if (edges && edges.length) { this.cy.batch(() => edges.style('line-dash-offset', this.dashOffset)); }
    }, DASH_MS);
  }

  /**
   * Pulse phase as style bypasses. Only the nodes painted last time are cleared, so a node that left
   * running/stopping falls back to its class style.
   */
  private paintPulse(): void {
    const running = this.cy.nodes('.s-running');
    const stopping = this.cy.nodes('.s-stopping');
    if (this.pulsed) { this.pulsed.filter((n: any) => !n.removed()).removeStyle('underlay-opacity opacity'); }
    running.style('underlay-opacity', this.pulseOn ? 0.45 : 0.1);
    stopping.style('opacity', this.pulseOn ? 0.35 : 1);
    this.pulsed = running.union(stopping);
  }
}
