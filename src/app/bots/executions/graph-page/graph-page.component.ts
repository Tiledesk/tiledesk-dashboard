import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'app/core/auth.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { RolesService } from 'app/services/roles.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ExecutionsService } from 'app/services/executions.service';
import { canViewExecutions } from '../executions.models';
import { GraphAgent } from '../graph/execution-graph.model';

/** Monitor > Graph: the execution graph of every agent of the project, on its own page. */
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
  private requested = false;
  private destroy$ = new Subject<void>();

  constructor(
    private auth: AuthService,
    private faqKbService: FaqKbService,
    private rolesService: RolesService,
    private logger: LoggerService,
    private executionsService: ExecutionsService,
  ) { }

  ngOnInit() {
    // Same check as the executions list: without a base URL the feed would poll the dashboard's own origin.
    this.configured = this.executionsService.isConfigured();
    this.auth.project_bs.pipe(takeUntil(this.destroy$)).subscribe(project => {
      this.projectId = project ? project._id : undefined;
      this.projectName = project && project.name ? project.name : '';
    });
    this.rolesService.listenToProjectUserPermissions(this.destroy$);
    this.rolesService.getUpdateRequestPermission().pipe(takeUntil(this.destroy$)).subscribe(status => {
      // '' is the service's initial value: the role is not known yet (no "unauthorized" flash)
      if (!status || !status.role) { this.permitted = null; return; }
      this.permitted = canViewExecutions(status.role, status.matchedPermissions);
      if (this.permitted && this.configured) this.loadAgents();
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
