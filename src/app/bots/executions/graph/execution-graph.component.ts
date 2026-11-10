import {
  Component, ElementRef, EventEmitter, Inject, inject, InjectionToken, Input, NgZone, OnChanges, OnDestroy, OnInit,
  Output, SimpleChanges, ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { ExecutionsService } from 'app/services/executions.service';
import { executionLink } from '../execution-links';
import { buildExecutionGraph, GraphAgent, GraphCounts, GraphModel, GraphNode } from './execution-graph.model';
import { executionGraphFeed, GraphSnapshot } from './execution-graph.feed';
import { EXEC_GRAPH_COLORS as C } from './execution-graph.colors';

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

interface TooltipState { lines: string[]; x: number; y: number; }

const STARTED = 'Started: ';

/** Tooltip lines for display: the raw ISO start time becomes a locale string. */
function displayLines(lines: string[]): string[] {
  return (lines || []).map(l => {
    if (l.indexOf(STARTED) !== 0) { return l; }
    const t = Date.parse(l.substring(STARTED.length));
    return isNaN(t) ? l : STARTED + new Date(t).toLocaleString();
  });
}

function classesFor(n: GraphNode): string {
  const out = [n.kind === 'execution' ? 'exec' : n.kind];
  if (n.status) { out.push('s-' + n.status); }
  if (n.aura) { out.push('aura'); }
  if (n.idle) { out.push('idle'); }
  return out.join(' ');
}

const GRAPH_STYLE: any[] = [
  { selector: 'node', style: {
    'label': 'data(label)', 'font-size': 10, 'color': C.dead, 'text-valign': 'bottom', 'text-margin-y': 4,
    'background-color': C.wait, 'width': 14, 'height': 14,
  } },
  { selector: 'node.project', style: { 'background-color': C.dead, 'width': 56, 'height': 56, 'font-size': 13, 'font-weight': 'bold' } },
  { selector: 'node.agent', style: { 'background-color': C.run, 'width': 32, 'height': 32, 'font-size': 11 } },
  { selector: 'node.agent.idle', style: { 'background-color': C.deadBg, 'width': 18, 'height': 18, 'color': C.wait } },
  { selector: 'node.exec', style: { 'label': '', 'width': 14, 'height': 14 } },
  { selector: 'node.s-running', style: {
    'background-color': C.run, 'underlay-color': C.run, 'underlay-padding': 6, 'underlay-opacity': 0.25, 'underlay-shape': 'ellipse',
  } },
  { selector: 'node.s-waiting', style: { 'background-color': C.wait, 'opacity': 0.55 } },
  { selector: 'node.s-stopping', style: { 'background-color': C.warn } },
  { selector: 'node.s-failed', style: { 'background-color': C.bad } },
  { selector: 'node.aura', style: {
    'underlay-color': C.bad, 'underlay-padding': 8, 'underlay-opacity': 0.35, 'underlay-shape': 'ellipse',
  } },
  { selector: 'edge', style: { 'width': 1, 'line-color': C.deadBg, 'curve-style': 'straight' } },
  { selector: 'edge.edge-animated', style: { 'line-color': C.run, 'line-style': 'dashed', 'line-dash-pattern': [6, 4] } },
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

  readonly colors = C;
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
  private fitted = false;
  private destroyed = false;
  private pulseOn = false;
  private dashOffset = 0;

  constructor(
    private zone: NgZone,
    private router: Router,
    @Inject(EXECUTION_GRAPH_FEED) private feed: ExecutionGraphFeedFactory,
    @Inject(CYTOSCAPE_LOADER) private loader: CytoscapeLoader,
  ) { }

  ngOnInit(): void {
    this.ready = this.init();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.cy) { return; }
    if (changes.projectId && !changes.projectId.firstChange) {
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
          boxSelectionEnabled: false,
          autoungrabify: true,
        });
        this.bindEvents();
        this.startTimers();
      });
    } catch (e) {
      this.failed = true;
      this.unavailable.emit();
      return;
    }
    this.subscribeFeed();
  }

  private subscribeFeed(): void {
    if (this.sub) { this.sub.unsubscribe(); }
    this.zone.runOutsideAngular(() => {
      this.sub = this.feed(this.projectId).subscribe(snap => {
        this.last = snap;
        const model = this.apply(snap);
        this.zone.run(() => { this.counts = model.counts; this.stale = snap.stale; });
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
      for (const e of model.edges) {
        const classes = e.animated ? 'edge-animated' : '';
        const el = cy.getElementById(e.id);
        if (el.empty()) {
          add.push({ group: 'edges', data: { id: e.id, source: e.source, target: e.target }, classes });
        } else {
          el.classes(classes);
        }
      }
      if (add.length) { cy.add(add); }
      if (this.pulseTimer !== null) { this.paintPulse(); }
    });
    if (!this.fitted) {
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
      } else if (d.kind === 'agent' && d.agentId) {
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
      const tip = { lines: displayLines(node.data('tooltip')), x: p.x, y: p.y + node.renderedOuterHeight() / 2 + 6 };
      this.zone.run(() => { this.tooltip = tip; });
    });
    const hide = () => { if (this.tooltip) { this.zone.run(() => { this.tooltip = null; }); } };
    cy.on('mouseout', 'node', hide);
    cy.on('viewport', hide);
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
      this.cy.edges('.edge-animated').style('line-dash-offset', this.dashOffset);
    }, DASH_MS);
  }

  /** Pulse phase as style bypasses; cleared first so a node that changed status falls back to its class style. */
  private paintPulse(): void {
    this.cy.nodes().removeStyle('underlay-opacity opacity');
    this.cy.nodes('.s-running').not('.aura').style('underlay-opacity', this.pulseOn ? 0.45 : 0.1);
    this.cy.nodes('.s-stopping').style('opacity', this.pulseOn ? 0.35 : 1);
  }
}
