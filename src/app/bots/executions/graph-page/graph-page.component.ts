import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'app/core/auth.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { RolesService } from 'app/services/roles.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ExecutionsService } from 'app/services/executions.service';
import { canViewExecutions, STATS_RANGES, StatsRange } from '../executions.models';
import { GraphAgent } from '../graph/execution-graph.model';

/** The default view: the not-terminated runs; it has no `range` param in the URL. */
export const DEFAULT_RANGE: StatsRange = 'now';

/** Monitor > Graph: the agents with executions in view, on its own page, with a time range kept in the URL. */
@Component({
  selector: 'graph-page',
  templateUrl: './graph-page.component.html',
  styleUrls: ['./graph-page.component.scss']
})
export class GraphPageComponent implements OnInit, OnDestroy {
  projectId: string;
  projectName = '';
  agents: GraphAgent[] = null;
  permitted: boolean | null = null;
  error = false;
  configured = false;
  readonly ranges = STATS_RANGES;
  range: StatsRange = DEFAULT_RANGE;
  private requested = false;
  private destroy$ = new Subject<void>();

  constructor(
    private auth: AuthService,
    private faqKbService: FaqKbService,
    private rolesService: RolesService,
    private logger: LoggerService,
    private executionsService: ExecutionsService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    // Same check as the executions list: without a base URL the feed would poll the dashboard's own origin.
    this.configured = this.executionsService.isConfigured();
    this.auth.project_bs.pipe(takeUntil(this.destroy$)).subscribe(project => {
      this.projectId = project ? project._id : undefined;
      this.projectName = project && project.name ? project.name : '';
    });
    // the range lives in the URL, like the list's filters; anything unknown falls back to Now
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const v = params.get('range') as StatsRange;
      this.range = this.ranges.includes(v) ? v : DEFAULT_RANGE;
    });
    this.rolesService.listenToProjectUserPermissions(this.destroy$);
    this.rolesService.getUpdateRequestPermission().pipe(takeUntil(this.destroy$)).subscribe(status => {
      // '' is the service's initial value: the role is not known yet (no "unauthorized" flash)
      if (!status || !status.role) { this.permitted = null; return; }
      this.permitted = canViewExecutions(status.role, status.matchedPermissions);
      if (this.permitted && this.configured) this.loadAgents();
    });
  }

  setRange(range: StatsRange) {
    this.router.navigate([], {
      relativeTo: this.route, queryParams: { range: range === DEFAULT_RANGE ? null : range }, queryParamsHandling: 'merge'
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Same call and mapping as the agents page: all the agents of the project, id = root_id || _id.
  private loadAgents() {
    if (this.requested) return;
    this.requested = true;
    this.faqKbService.getFaqKbByProjectId().pipe(takeUntil(this.destroy$)).subscribe({
      next: (bots: any[]) => {
        this.agents = (bots || []).map(bot => ({ id: bot.root_id || bot._id, name: bot.name }));
      },
      error: err => {
        this.logger.error('[GRAPH-PAGE] load agents ERROR ', err);
        this.error = true;
      },
    });
  }
}
