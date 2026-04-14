import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProjectEntryWorkflowService } from './project-entry-workflow.service';

@Component({
  selector: 'app-project-entry',
  template: `
    <div style="display:flex; align-items:center; justify-content:center; min-height:60vh;">
      <div style="text-align:center;">
        <div class="spinner-border" role="status" aria-label="Loading"></div>
        <div style="margin-top:12px; color:#666;">Loading project…</div>
      </div>
    </div>
  `
})
export class ProjectEntryComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workflow: ProjectEntryWorkflowService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(async (params) => {
      const projectId = params?.projectid as string | undefined;
      const targetUrl = await this.workflow.run(projectId ?? '');
      await this.router.navigateByUrl(targetUrl);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

