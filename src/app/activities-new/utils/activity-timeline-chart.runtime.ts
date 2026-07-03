import { ChangeDetectorRef } from '@angular/core';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, DataZoomComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import moment from 'moment';

import { ActivityRecord } from 'app/models/activity-model';
import {
  buildActivityTimelinePoints,
  buildTeammateActivitiesSliderChartOption,
  buildTeammateActivitiesTimelineChartOption,
  DEFAULT_TIMELINE_MAX_ZOOM_SPAN_MS,
  getTimelineChartBounds,
  getTimelineAxisLabelFormatter,
  TimelineChartBounds,
} from './activity-timeline-charts.util';

echarts.use([LineChart, GridComponent, TooltipComponent, DataZoomComponent, CanvasRenderer]);

interface DataZoomState {
  start?: number;
  end?: number;
  startValue?: number;
  endValue?: number;
}

export class ActivityTimelineChartRuntime {
  visibleZoomRangeLabel = '';
  maxZoomSpanMs = DEFAULT_TIMELINE_MAX_ZOOM_SPAN_MS;

  private chart?: echarts.ECharts;
  private sliderChart?: echarts.ECharts;
  private axisBounds?: TimelineChartBounds;
  private syncingZoom = false;

  constructor(
    private getActivityMessage: (activity: ActivityRecord) => string,
    private cdr?: ChangeDetectorRef,
  ) {}

  render(
    chartEl: HTMLElement,
    sliderEl: HTMLElement | undefined,
    activities: ActivityRecord[],
  ): void {
    if (!activities.length) {
      this.dispose(chartEl, sliderEl);
      return;
    }

    if (chartEl.offsetWidth === 0) {
      return;
    }

    const points = buildActivityTimelinePoints(activities, (activity) => this.getActivityMessage(activity));
    this.axisBounds = getTimelineChartBounds(points);

    this.chart = this.ensureChart(chartEl);
    this.chart.setOption(
      buildTeammateActivitiesTimelineChartOption(
        activities,
        (activity) => this.getActivityMessage(activity),
        this.maxZoomSpanMs,
      ),
      { notMerge: true },
    );

    this.renderSliderChart(sliderEl);
    this.bindChartHandlers();
    this.applyInitialZoom();
    this.updateVisibleZoomRangeLabel();
  }

  resize(): void {
    this.chart?.resize();
    this.sliderChart?.resize();
  }

  dispose(chartEl?: HTMLElement, sliderEl?: HTMLElement): void {
    if (chartEl) {
      this.disposeChartOnElement(chartEl);
    }

    if (sliderEl) {
      this.disposeChartOnElement(sliderEl);
    }

    this.chart = undefined;
    this.sliderChart = undefined;
    this.axisBounds = undefined;
    this.visibleZoomRangeLabel = '';
  }

  setMaxZoomSpan(spanMs: number): void {
    if (this.maxZoomSpanMs === spanMs) {
      return;
    }

    this.maxZoomSpanMs = spanMs;
    this.applyMaxZoomSpan();
    this.cdr?.detectChanges();
  }

  private applyMaxZoomSpan(): void {
    const dataZoomOption = { dataZoom: [{ minValueSpan: this.maxZoomSpanMs }] };
    this.chart?.setOption(dataZoomOption);
    this.sliderChart?.setOption(dataZoomOption);
    this.updateVisibleZoomRangeLabel();
  }

  private applyInitialZoom(): void {
    if (!this.axisBounds) {
      return;
    }

    const range = {
      start: this.axisBounds.dataMin,
      end: this.axisBounds.dataMax,
    };

    this.syncingZoom = true;
    this.syncChartZoom(this.chart, range);
    this.syncChartZoom(this.sliderChart, range);
    this.updateMainChartAxisLabels(range);
    this.syncingZoom = false;
  }

  private renderSliderChart(sliderEl: HTMLElement | undefined): void {
    if (!sliderEl || !this.axisBounds) {
      return;
    }

    this.sliderChart = this.ensureChart(sliderEl);
    this.sliderChart.setOption(
      buildTeammateActivitiesSliderChartOption(this.axisBounds, this.maxZoomSpanMs),
      { notMerge: true },
    );
  }

  private bindChartHandlers(): void {
    if (!this.sliderChart || !this.chart) {
      return;
    }

    this.sliderChart.off('datazoom');
    this.sliderChart.on('datazoom', (params) => {
      if (this.syncingZoom) {
        return;
      }

      this.syncingZoom = true;
      const range = this.getVisibleRangeFromChart(this.sliderChart, params);

      if (range) {
        this.syncChartZoom(this.chart, range);
        this.updateMainChartAxisLabels(range);
        this.updateVisibleZoomRangeLabel(range);
      }

      this.syncingZoom = false;
    });

    this.chart.off('datazoom');
    this.chart.on('datazoom', (params) => {
      if (this.syncingZoom) {
        return;
      }

      this.syncingZoom = true;
      const range = this.getVisibleRangeFromChart(this.chart, params);

      if (range) {
        this.syncChartZoom(this.sliderChart, range);
        this.updateMainChartAxisLabels(range);
        this.updateVisibleZoomRangeLabel(range);
      }

      this.syncingZoom = false;
    });
  }

  private syncChartZoom(
    targetChart: echarts.ECharts | undefined,
    range: { start: number; end: number },
  ): void {
    if (!targetChart) {
      return;
    }

    targetChart.dispatchAction({
      type: 'dataZoom',
      dataZoomIndex: 0,
      startValue: range.start,
      endValue: range.end,
    });
  }

  private updateMainChartAxisLabels(range: { start: number; end: number }): void {
    if (!this.chart) {
      return;
    }

    const spanMs = Math.abs(range.end - range.start);

    this.chart.setOption({
      xAxis: {
        axisLabel: {
          formatter: getTimelineAxisLabelFormatter(spanMs),
        },
      },
    });
  }

  private updateVisibleZoomRangeLabel(range?: { start: number; end: number } | null): void {
    const visibleRange = range
      ?? this.getVisibleRangeFromChart(this.chart)
      ?? this.getVisibleRangeFromChart(this.sliderChart);

    if (!visibleRange) {
      this.visibleZoomRangeLabel = '';
      return;
    }

    const startLabel = moment(visibleRange.start).format('DD/MM/YYYY HH:mm');
    const endLabel = moment(visibleRange.end).format('DD/MM/YYYY HH:mm');
    this.visibleZoomRangeLabel = `${startLabel} – ${endLabel}`;
    this.cdr?.detectChanges();
  }

  private getDataZoomEventState(params?: unknown): DataZoomState | undefined {
    if (!params || typeof params !== 'object') {
      return undefined;
    }

    const payload = params as { batch?: DataZoomState[] } & DataZoomState;
    if (Array.isArray(payload.batch) && payload.batch.length > 0) {
      return payload.batch[payload.batch.length - 1];
    }

    if (
      payload.start != null
      || payload.end != null
      || payload.startValue != null
      || payload.endValue != null
    ) {
      return payload;
    }

    return undefined;
  }

  private getVisibleRangeFromPercent(
    xAxisMin: number,
    xAxisMax: number,
    startPercent: number,
    endPercent: number,
  ): { start: number; end: number } {
    const fullSpan = xAxisMax - xAxisMin;
    return {
      start: xAxisMin + (startPercent / 100) * fullSpan,
      end: xAxisMin + (endPercent / 100) * fullSpan,
    };
  }

  private getVisibleRangeFromChart(
    chart: echarts.ECharts | undefined,
    params?: unknown,
  ): { start: number; end: number } | null {
    if (!chart) {
      return null;
    }

    const option = chart.getOption() as {
      xAxis?: Array<{ min?: number; max?: number }>;
      dataZoom?: DataZoomState[];
    };
    const xAxis = option.xAxis?.[0];
    const eventZoom = this.getDataZoomEventState(params);

    if (eventZoom?.startValue != null && eventZoom?.endValue != null) {
      return { start: eventZoom.startValue, end: eventZoom.endValue };
    }

    if (
      xAxis?.min != null
      && xAxis?.max != null
      && eventZoom?.start != null
      && eventZoom?.end != null
    ) {
      return this.getVisibleRangeFromPercent(xAxis.min, xAxis.max, eventZoom.start, eventZoom.end);
    }

    const zoomStates = option.dataZoom || [];
    const zoomWithValues = [...zoomStates].reverse().find(
      (zoom) => zoom.startValue != null && zoom.endValue != null,
    );

    if (zoomWithValues?.startValue != null && zoomWithValues?.endValue != null) {
      return { start: zoomWithValues.startValue, end: zoomWithValues.endValue };
    }

    const zoomWithPercent = [...zoomStates].reverse().find(
      (zoom) => zoom.start != null && zoom.end != null,
    );

    if (
      xAxis?.min != null
      && xAxis?.max != null
      && zoomWithPercent?.start != null
      && zoomWithPercent?.end != null
    ) {
      return this.getVisibleRangeFromPercent(
        xAxis.min,
        xAxis.max,
        zoomWithPercent.start,
        zoomWithPercent.end,
      );
    }

    if (xAxis?.min != null && xAxis?.max != null) {
      return { start: xAxis.min, end: xAxis.max };
    }

    return null;
  }

  private ensureChart(el: HTMLElement): echarts.ECharts {
    return echarts.getInstanceByDom(el) ?? echarts.init(el);
  }

  private disposeChartOnElement(el: HTMLElement): void {
    const existing = echarts.getInstanceByDom(el);
    if (existing) {
      existing.dispose();
    }
  }
}
