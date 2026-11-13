import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'app/core/auth.service';
import { ExecutionsService } from 'app/services/executions.service';
import { RolesService } from 'app/services/roles.service';
import { canViewExecutions } from '../executions.models';
import { monitorExecutionsLink } from '../execution-links';

export type MonitorTab = 'conversations' | 'executions';

/** Tab row of the Monitor area: Conversations / Executions (the graph is a view of Executions). Hidden unless executions are available. */
@Component({
  selector: 'monitor-tabs',
  templateUrl: './monitor-tabs.component.html',
  styleUrls: ['./monitor-tabs.component.scss']
})
export class MonitorTabsComponent implements OnInit, OnDestroy {
  @Input() active: MonitorTab = 'conversations';

  projectId: string;
  permitted = false;
  private destroy$ = new Subject<void>();

  constructor(
    private auth: AuthService,
    private rolesService: RolesService,
    private executionsService: ExecutionsService,
  ) { }

  ngOnInit() {
    this.auth.project_bs.pipe(takeUntil(this.destroy$)).subscribe(project => {
      this.projectId = project ? project._id : undefined;
    });
    this.rolesService.listenToProjectUserPermissions(this.destroy$);
    this.rolesService.getUpdateRequestPermission().pipe(takeUntil(this.destroy$)).subscribe(status => {
      this.permitted = !!status && !!status.role && canViewExecutions(status.role, status.matchedPermissions);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get visible(): boolean {
    return this.permitted && !!this.projectId && this.executionsService.isConfigured();
  }

  get conversationsLink(): string[] { return ['/project', this.projectId, 'wsrequests']; }
  get executionsLink(): string[] { return monitorExecutionsLink(this.projectId); }
}
