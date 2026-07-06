import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { DateFilterFn } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import moment from 'moment';

import { ActivityRecord } from 'app/models/activity-model';
import { ActivitiesService } from 'app/activities-new/activities-service/activities.service';
import { ActivityTimelineChartRuntime } from 'app/activities-new/utils/activity-timeline-chart.runtime';
import {
  TIMELINE_MAX_ZOOM_HALF_HOUR_MS,
  TIMELINE_MAX_ZOOM_ONE_HOUR_MS,
} from 'app/activities-new/utils/activity-timeline-charts.util';

export interface ActivitiesListChartDialogData {
  queryString: string;
  pageNo: number;
  startDate?: Date | null;
  endDate?: Date | null;
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

  startDate: Date | null = null;
  endDate: Date | null = null;
  readonly maxSelectableRangeDays = 30;
  readonly chartListPageLimit = 40;
  readonly chartDateRangeLimit = 1000;
  readonly timelineMaxZoomOneHourMs = TIMELINE_MAX_ZOOM_ONE_HOUR_MS;
  readonly timelineMaxZoomHalfHourMs = TIMELINE_MAX_ZOOM_HALF_HOUR_MS;
  private startDateTemp: string | null = null;
  private endDateTemp: string | null = null;
  private rangeSelectionStart: Date | null = null;
  private pickerOpen = false;
  private readonly agentId: string;
  private readonly activitiesFilter: string;
  private readonly direction: number;

  private chartRuntime: ActivityTimelineChartRuntime;
  private viewReady = false;
  private dataReady = false;
  private dialogOpened = false;
  private renderRetryTimer?: ReturnType<typeof setTimeout>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ActivitiesListChartDialogData,
    private dialogRef: MatDialogRef<ActivitiesListChartModalComponent>,
    private activitiesService: ActivitiesService,
    private cdr: ChangeDetectorRef,
  ) {
    this.agentId = this.parseQueryParam('agent_id');
    this.activitiesFilter = this.parseQueryParam('activities');
    this.direction = Number(this.parseQueryParam('direction') || '-1');

    this.chartRuntime = new ActivityTimelineChartRuntime(
      (activity) => this.data.getActivityMessage(activity),
      this.cdr,
    );
    this.initializeDateRangeFromQuery();
    this.dialogRef.afterOpened().subscribe(() => {
      this.dialogOpened = true;
      this.scheduleChartRender();
    });
    this.loadActivities(this.data.queryString, this.data.pageNo);
  }

  get visibleZoomRangeLabel(): string {
    return this.chartRuntime.visibleZoomRangeLabel;
  }

  get maxZoomSpanMs(): number {
    return this.chartRuntime.maxZoomSpanMs;
  }

  setMaxZoomSpan(spanMs: number): void {
    this.chartRuntime.setMaxZoomSpan(spanMs);
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.cdr.detectChanges();
    this.scheduleChartRender();
  }

  ngOnDestroy(): void {
    if (this.renderRetryTimer) {
      clearTimeout(this.renderRetryTimer);
    }
    this.disposeChart();
  }

  close(): void {
    this.dialogRef.close();
  }

  onStartDateInput(value: Date | null): void {
    if (!this.pickerOpen || !value) {
      return;
    }

    this.rangeSelectionStart = value;
    this.endDate = null;
    this.endDateTemp = null;
    this.cdr.detectChanges();
  }

  onStartDateChange(value: Date | null): void {
    this.startDate = value;
    this.startDateTemp = value ? moment(value).format('DD/MM/YYYY') : null;
    this.rangeSelectionStart = value;

    if (this.pickerOpen) {
      this.endDate = null;
      this.endDateTemp = null;
    } else if (this.startDate && this.endDate) {
      this.clampEndDateToRangeLimit();
      this.syncDateTemps();
    }

    this.cdr.detectChanges();
  }

  onEndDateChange(value: Date | null): void {
    this.endDate = value;
    this.endDateTemp = value ? moment(value).format('DD/MM/YYYY') : null;

    if (this.startDate && this.endDate) {
      this.clampEndDateToRangeLimit();
      this.syncDateTemps();
    }
  }

  onPickerOpened(): void {
    this.rangeSelectionStart = null;
    this.pickerOpen = true;
  }

  onPickerClosed(): void {
    this.rangeSelectionStart = null;
    this.pickerOpen = false;

    if (this.startDate && !this.endDate) {
      this.endDate = new Date(this.startDate);
    }

    this.enforceDateRangeLimit();
  }

  chartDateFilter: DateFilterFn<Date> = (date: Date | null): boolean => {
    if (!date || !this.rangeSelectionStart) {
      return true;
    }

    const day = moment(date).startOf('day');
    const maxEnd = moment(this.rangeSelectionStart)
      .add(this.maxSelectableRangeDays, 'days')
      .startOf('day');

    return !day.isAfter(maxEnd);
  };

  clearDateRange(): void {
    this.startDate = null;
    this.endDate = null;
    this.startDateTemp = null;
    this.endDateTemp = null;
    this.loadListPageActivities();
  }

  get maxEndDate(): Date | null {
    if (!this.startDate) {
      return null;
    }

    return moment(this.startDate).add(this.maxSelectableRangeDays, 'days').toDate();
  }

  get minStartDate(): Date | null {
    if (!this.endDate) {
      return null;
    }

    return moment(this.endDate).subtract(this.maxSelectableRangeDays, 'days').toDate();
  }

  isDateRangeValid(): boolean {
    if (!this.startDate && !this.endDate) {
      return true;
    }

    if (!this.startDate || !this.endDate) {
      return false;
    }

    if (moment(this.endDate).isBefore(this.startDate, 'day')) {
      return false;
    }

    return moment(this.endDate).diff(moment(this.startDate), 'days') <= this.maxSelectableRangeDays;
  }

  applyDateFilter(): void {
    this.syncDateTemps();
    this.enforceDateRangeLimit();

    if (!this.isDateRangeValid()) {
      return;
    }

    if (this.startDate && this.endDate) {
      this.disposeChart();
      this.dataReady = false;
      this.activities = [];
      this.loadActivities(this.buildApiQueryString(this.chartDateRangeLimit), 0);
      return;
    }

    this.loadListPageActivities();
  }

  private initializeDateRangeFromQuery(): void {
    if (this.data.startDate || this.data.endDate) {
      this.startDate = this.data.startDate ?? null;
      this.endDate = this.data.endDate ?? null;
    } else {
      this.startDate = this.parseDdMmYyyy(this.parseQueryParam('start_date'));
      this.endDate = this.parseDdMmYyyy(this.parseQueryParam('end_date'));
    }

    this.syncDateTemps();
  }

  private parseQueryParam(key: string): string {
    const query = (this.data.queryString || '').replace(/^&+/, '');
    const match = query.match(new RegExp(`(?:^|&)${key}=([^&]*)`));
    return match ? decodeURIComponent(match[1]) : '';
  }

  private parseDdMmYyyy(value: string): Date | null {
    if (!value) {
      return null;
    }

    const parsed = moment(value, 'DD/MM/YYYY', true);
    return parsed.isValid() ? parsed.toDate() : null;
  }

  private loadListPageActivities(): void {
    this.disposeChart();
    this.dataReady = false;
    this.activities = [];
    this.loadActivities(this.buildApiQueryString(this.chartListPageLimit), this.data.pageNo);
  }

  private loadActivities(queryString: string, pageNo: number): void {
    this.showSpinner = true;
    this.loadError = false;

    this.activitiesService.getUsersActivities(queryString, pageNo).subscribe({
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

  private syncDateTemps(): void {
    this.startDateTemp = this.startDate ? moment(this.startDate).format('DD/MM/YYYY') : null;
    this.endDateTemp = this.endDate ? moment(this.endDate).format('DD/MM/YYYY') : null;
  }

  private clampEndDateToRangeLimit(): void {
    if (!this.startDate || !this.endDate) {
      return;
    }

    if (moment(this.endDate).isBefore(this.startDate, 'day')) {
      this.endDate = new Date(this.startDate);
    }

    const maxEnd = moment(this.startDate).add(this.maxSelectableRangeDays, 'days');
    if (moment(this.endDate).isAfter(maxEnd, 'day')) {
      this.endDate = maxEnd.toDate();
    }
  }

  private enforceDateRangeLimit(): void {
    if (!this.startDate || !this.endDate) {
      return;
    }

    this.clampEndDateToRangeLimit();
    this.syncDateTemps();
  }

  private buildApiQueryString(limit: number): string {
    const startDateValue = this.startDate ? (this.startDateTemp || '') : '';
    const endDateValue = this.endDate ? (this.endDateTemp || '') : '';

    return [
      `start_date=${startDateValue}`,
      `end_date=${endDateValue}`,
      `agent_id=${this.agentId}`,
      `activities=${this.activitiesFilter}`,
      `direction=${this.direction}`,
      'chart=true',
      `limit=${limit}`,
    ].join('&');
  }

  private scheduleChartRender(): void {
    if (!this.viewReady || !this.dataReady || !this.dialogOpened) {
      return;
    }

    if (this.renderRetryTimer) {
      clearTimeout(this.renderRetryTimer);
    }

    this.renderRetryTimer = setTimeout(() => {
      this.renderRetryTimer = undefined;
      this.cdr.detectChanges();
      this.tryRenderChart();
    }, 0);
  }

  private tryRenderChart(): void {
    if (!this.viewReady || !this.dataReady || !this.dialogOpened || !this.timelineChartRef?.nativeElement) {
      return;
    }

    if (!this.activities.length) {
      this.disposeChart();
      return;
    }

    const chartEl = this.timelineChartRef.nativeElement;
    if (chartEl.offsetWidth === 0) {
      this.renderRetryTimer = setTimeout(() => this.tryRenderChart(), 50);
      return;
    }

    const sliderEl = this.timelineSliderRef?.nativeElement;
    if (sliderEl && sliderEl.offsetWidth === 0) {
      this.renderRetryTimer = setTimeout(() => this.tryRenderChart(), 50);
      return;
    }

    this.showSpinner = false;
    this.cdr.detectChanges();

    this.chartRuntime.render(
      chartEl,
      sliderEl,
      this.activities,
    );

    requestAnimationFrame(() => {
      this.chartRuntime.resize();
      requestAnimationFrame(() => this.chartRuntime.resize());
    });
  }

  private disposeChart(): void {
    this.chartRuntime.dispose(
      this.timelineChartRef?.nativeElement,
      this.timelineSliderRef?.nativeElement,
    );
  }
}
