import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ActivityRecord } from 'app/models/activity-model';
import { ActivitiesService } from 'app/activities/activities-service/activities.service';
import { ActivityTimelineChartRuntime } from 'app/activities/utils/activity-timeline-chart.runtime';

export interface ActivitiesListChartDialogData {
  queryString: string;
  pageNo: number;
  enrichActivity: (activity: ActivityRecord) => ActivityRecord;
  getActivityMessage: (activity: ActivityRecord) => string;
}

@Component({
  selector: 'appdashboard-activities-list-chart-modal',
  templateUrl: './activities-list-chart-modal.component.html',
  styleUrls: ['./activities-list-chart-modal.component.scss'],
})
export class ActivitiesListChartModalComponent implements AfterViewInit, OnDestroy {
  @ViewChild('timelineChart') timelineChartRef?: ElementRef<HTMLDivElement>;
  @ViewChild('timelineSlider') timelineSliderRef?: ElementRef<HTMLDivElement>;

  showSpinner = true;
  loadError = false;
  activities: ActivityRecord[] = [];

  private chartRuntime: ActivityTimelineChartRuntime;
  private viewReady = false;
  private dataReady = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ActivitiesListChartDialogData,
    private dialogRef: MatDialogRef<ActivitiesListChartModalComponent>,
    private activitiesService: ActivitiesService,
    private cdr: ChangeDetectorRef,
  ) {
    this.chartRuntime = new ActivityTimelineChartRuntime(
      (activity) => this.data.getActivityMessage(activity),
      this.cdr,
    );
    this.loadActivities();
  }

  get visibleZoomRangeLabel(): string {
    return this.chartRuntime.visibleZoomRangeLabel;
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.scheduleChartRender();
  }

  ngOnDestroy(): void {
    this.disposeChart();
  }

  close(): void {
    this.dialogRef.close();
  }

  private loadActivities(): void {
    this.showSpinner = true;
    this.loadError = false;

    this.activitiesService.getUsersActivities(this.data.queryString, this.data.pageNo).subscribe({
      next: (response) => {
        this.activities = (response.activities || []).map((activity) => this.data.enrichActivity(activity));
        this.dataReady = true;

        if (!this.activities.length) {
          this.showSpinner = false;
        }

        this.cdr.detectChanges();
        this.scheduleChartRender();
      },
      error: (error) => {
        console.error('[ActivitiesNew][ListChart] load error:', error);
        this.showSpinner = false;
        this.loadError = true;
      },
    });
  }

  private scheduleChartRender(): void {
    if (!this.viewReady || !this.dataReady) {
      return;
    }

    this.cdr.detectChanges();
    this.tryRenderChart();

    if (this.activities.length > 0) {
      setTimeout(() => this.tryRenderChart());
    }
  }

  private tryRenderChart(): void {
    if (!this.viewReady || !this.dataReady || !this.timelineChartRef?.nativeElement) {
      return;
    }

    if (!this.activities.length) {
      this.disposeChart();
      return;
    }

    const chartEl = this.timelineChartRef.nativeElement;
    if (chartEl.offsetWidth === 0) {
      setTimeout(() => this.tryRenderChart());
      return;
    }

    this.chartRuntime.render(
      chartEl,
      this.timelineSliderRef?.nativeElement,
      this.activities,
    );

    requestAnimationFrame(() => {
      this.chartRuntime.resize();
      setTimeout(() => {
        this.chartRuntime.resize();
        this.showSpinner = false;
        this.cdr.detectChanges();
      }, 150);
    });
  }

  private disposeChart(): void {
    this.chartRuntime.dispose(
      this.timelineChartRef?.nativeElement,
      this.timelineSliderRef?.nativeElement,
    );
  }
}
