import {
  Component, ElementRef, EventEmitter, Inject, inject, InjectionToken, Input, NgZone, OnChanges, OnDestroy, OnInit,
  Output, SimpleChanges, ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ExecutionsService } from 'app/services/executions.service';
import { executionLink } from '../execution-links';
import { buildExecutionGraph, GraphAgent, GraphCounts, GraphModel, GraphNode, GraphTooltip, ShownStatus } from './execution-graph.model';
import { executionGraphFeed, GraphSnapshot } from './execution-graph.feed';
import { EXEC_GRAPH_COLORS as C, EXEC_GRAPH_ICONS as I } from './execution-graph.colors';

export type ExecutionGraphFeedFactory = (projectId: string) => Observable<GraphSnapshot>;
export type CytoscapeLoader = () => Promise<any>;

/** Snapshot source of the graph; replaced in tests by a Subject. */
export const EXECUTION_GRAPH_FEED = new InjectionToken<ExecutionGraphFeedFactory>('EXECUTION_GRAPH_FEED', {
  providedIn: 'root',
  factory: () => {
    const service = inject(ExecutionsService);
    return (projectId: string) => executionGraphFeed(service, projectId);
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

interface TooltipState { lines: string[]; x: number; y: number; }

function classesFor(n: GraphNode): string {
  const out = [n.kind === 'execution' ? 'exec' : n.kind];
  if (n.active) { out.push('active'); }
  if (n.status) { out.push('s-' + n.status); }
  if (n.aura) { out.push('aura'); }
  if (n.idle) { out.push('idle'); }
  return out.join(' ');
}

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

/** Auto width from the label (Cytoscape's `width: label` is deprecated). */
const projectWidth = (ele: any) => textWidth(ele.data('label') || '', '600 13px ' + FONT, 13) + 32;
const moreWidth = (ele: any) => textWidth(ele.data('label') || '', '500 11px ' + FONT, 11) + 16;

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
    'background-color': C.agentBg, 'border-color': C.agentBorder, 'background-image': I.agent,
    'background-width': 26, 'background-height': 26,
    'font-size': 12, 'font-weight': 600, 'text-valign': 'bottom', 'text-halign': 'center', 'text-margin-y': 6,
    'text-wrap': 'ellipsis', 'text-max-width': 140,
    'text-background-color': C.labelBg, 'text-background-opacity': 0.9, 'text-background-padding': 2,
    'text-background-shape': 'round-rectangle',
  } },
  { selector: 'node.agent.active', style: { 'background-color': C.activeBg, 'border-color': C.activeBorder, 'background-image': I.agentActive } },
  { selector: 'node.agent.idle', style: { 'background-color': C.idleBg, 'border-color': C.idleBorder, 'background-image': I.agentIdle } },
  { selector: 'node.agent.aura', style: {
    'background-color': C.auraBg, 'border-color': C.auraBorder, 'background-image': I.agentAura,
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
  { selector: 'node.s-failed', style: { 'background-color': C.bad, 'background-image': I.failed } },
  { selector: 'node.exec.aura', style: {
    'underlay-color': C.bad, 'underlay-padding': 5, 'underlay-opacity': 0.2, 'underlay-shape': 'round-rectangle',
    'underlay-corner-radius': 12,
  } },
  // "+N": an auto-width dashed pill
  { selector: 'node.more', style: {
    'width': moreWidth, 'height': 22, 'corner-radius': 11, 'background-color': C.white,
    'border-width': 1, 'border-style': 'dashed', 'border-color': C.moreBorder,
    'font-size': 11, 'font-weight': 500, 'color': C.moreText, 'text-valign': 'center', 'text-halign': 'center',
  } },
  { selector: 'edge', style: { 'width': 1, 'line-color': C.edge, 'curve-style': 'straight' } },
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
  /** Emitted when Cytoscape cannot be loaded or created, so the host can switch back to List. */
  @Output() unavailable = new EventEmitter<void>();

  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLElement>;

  cy: any = null;
  counts: GraphCounts | null = null;
  stale = false;
  failed = false;
  tooltip: TooltipState | null = null;
  pulseTimer: any = null;
  dashTimer: any = null;
  /** Resolves when init is over (Cytoscape created and the feed subscribed, or failed). */
  ready: Promise<void> = Promise.resolve();

  private sub: Subscription | null = null;
  private last: GraphSnapshot | null = null;
  /** A successful snapshot was seen: until then the counts line stays hidden (unknown, not zero). */
  private loaded = false;
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

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.cy) { return; }
    if (changes.projectId && !changes.projectId.firstChange) {
      this.resetGraph();
      this.subscribeFeed();
    } else if ((changes.agents || changes.projectName) && this.last) {
      this.zone.runOutsideAngular(() => this.apply(this.last));
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
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
    this.loaded = false;
    this.fitted = false;
    this.cy.elements().remove();
    this.animatedEdges = this.cy.collection();
    this.pulsed = this.cy.collection();
    this.counts = null;
    this.stale = false;
    this.tooltip = null;
  }

  private subscribeFeed(): void {
    if (this.sub) { this.sub.unsubscribe(); }
    this.zone.runOutsideAngular(() => {
      this.sub = this.feed(this.projectId).subscribe(snap => {
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
        if (!snap.stale) { this.loaded = true; }
        this.zone.run(() => { this.counts = this.loaded ? model.counts : null; this.stale = snap.stale; });
      });
    });
  }

  /** Rebuilds the model and diffs it into Cytoscape. Positions always come from the model. */
  private apply(snap: GraphSnapshot): GraphModel {
    const model = buildExecutionGraph({
      projectName: this.projectName || '', agents: this.agents || [], live: snap.live, failed: snap.failed, now: Date.now()
    });
    const cy = this.cy;
    const wanted = new Set<string>();
    model.nodes.forEach(n => wanted.add(n.id));
    model.edges.forEach(e => wanted.add(e.id));
    cy.batch(() => {
      cy.elements().filter((el: any) => !wanted.has(el.id())).remove();
      const add: any[] = [];
      for (const n of model.nodes) {
        const data = {
          id: n.id, kind: n.kind, label: n.label, status: n.status || null, agentId: n.agentId || null,
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
        const classes = e.animated ? 'edge-animated' : failedIds.has(e.target) ? 'edge-failed' : '';
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
      cy.fit(undefined, 40);
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
      } else if ((d.kind === 'agent' || d.kind === 'more') && d.agentId) {
        commands = ['/project', this.projectId, 'bots', d.agentId, 'executions'];
      }
      if (commands) {
        const c = commands;
        this.zone.run(() => extras ? this.router.navigate(c, extras) : this.router.navigate(c));
      }
    });
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
    if (tip.kind === 'text') { return [tip.text]; }
    if (tip.kind === 'more') {
      const order: ShownStatus[] = ['failed', 'stopping', 'running', 'waiting'];
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
    ];
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
    const running = this.cy.nodes('.s-running').not('.aura');
    const stopping = this.cy.nodes('.s-stopping');
    if (this.pulsed) { this.pulsed.filter((n: any) => !n.removed()).removeStyle('underlay-opacity opacity'); }
    running.style('underlay-opacity', this.pulseOn ? 0.45 : 0.1);
    stopping.style('opacity', this.pulseOn ? 0.35 : 1);
    this.pulsed = running.union(stopping);
  }
}
