import type { EChartsOption } from 'echarts';
import moment from 'moment';

import { ActivityRecord } from 'app/models/activity-model';

const TIMELINE_COLOR = '#6b4ce6';
const LINE_CHART_GRID = { left: 0, right: 8, top: 8, bottom: 44, containLabel: true };
const SLIDER_CHART_GRID = { left: 0, right: 8, top: 0, bottom: 0 };
const ONE_HOUR_MS = 60 * 60 * 1000;
const TWO_DAYS_MS = 2 * 24 * ONE_HOUR_MS;
const FOURTEEN_DAYS_MS = 14 * 24 * ONE_HOUR_MS;

export const TIMELINE_MAX_ZOOM_ONE_HOUR_MS = ONE_HOUR_MS;
export const TIMELINE_MAX_ZOOM_HALF_HOUR_MS = 30 * 60 * 1000;
export const DEFAULT_TIMELINE_MAX_ZOOM_SPAN_MS = TIMELINE_MAX_ZOOM_ONE_HOUR_MS;

export interface ActivityTimelinePoint {
  timestamp: string;
  timestampMs: number;
  tooltipText: string;
}

export interface TimelineAxisBounds {
  min: number;
  max: number;
  span: number;
}

export function formatActivityChartTimestamp(activity: ActivityRecord): string {
  return moment(activity.updatedAt || activity.createdAt).format('DD/MM/YYYY - HH:mm:ss');
}

export function activityTimestampMs(activity: ActivityRecord): number {
  return moment(activity.updatedAt || activity.createdAt).valueOf();
}

export function sortActivitiesByTime(activities: ActivityRecord[]): ActivityRecord[] {
  return [...activities].sort((left, right) => activityTimestampMs(left) - activityTimestampMs(right));
}

export function buildActivityTimelinePoints(
  activities: ActivityRecord[],
  getTooltipText: (activity: ActivityRecord) => string,
): ActivityTimelinePoint[] {
  return sortActivitiesByTime(activities).map((activity) => ({
    timestamp: formatActivityChartTimestamp(activity),
    timestampMs: activityTimestampMs(activity),
    tooltipText: getTooltipText(activity),
  }));
}

export function getTimelineAxisBounds(points: ActivityTimelinePoint[]): TimelineAxisBounds {
  const dataMinMs = points[0]?.timestampMs ?? Date.now();
  const dataMaxMs = points[points.length - 1]?.timestampMs ?? dataMinMs;
  const hasRange = points.length > 1 && dataMaxMs > dataMinMs;
  const min = hasRange ? dataMinMs : dataMinMs - ONE_HOUR_MS;
  const max = hasRange ? dataMaxMs : dataMaxMs + ONE_HOUR_MS;

  return {
    min,
    max,
    span: max - min,
  };
}

function timelineSymbolSize(pointCount: number): number {
  if (pointCount > 200) {
    return 3;
  }
  if (pointCount > 50) {
    return 5;
  }
  return 7;
}

function timelineAxisLabelFormat(spanMs: number): string {
  if (spanMs <= TWO_DAYS_MS) {
    return 'HH:mm';
  }

  if (spanMs <= FOURTEEN_DAYS_MS) {
    return 'DD/MM HH:mm';
  }

  return 'DD/MM/YYYY';
}

export function getTimelineAxisLabelFormatter(spanMs: number): (value: number) => string {
  const format = timelineAxisLabelFormat(spanMs);

  return (value) => moment(Number(value)).format(format);
}

function timelineXAxis(
  bounds: TimelineAxisBounds,
  visibleMin?: number,
  visibleMax?: number,
): EChartsOption['xAxis'] {
  const axisMin = visibleMin ?? bounds.min;
  const axisMax = visibleMax ?? bounds.max;
  const spanMs = axisMax - axisMin;

  return {
    type: 'value',
    min: axisMin,
    max: axisMax,
    axisLine: { show: true, lineStyle: { color: '#dce4ea' } },
    axisTick: { show: false },
    splitLine: { show: false },
    axisLabel: {
      show: true,
      hideOverlap: false,
      color: '#7695a5',
      fontSize: 11,
      rotate: 45,
      align: 'right',
      verticalAlign: 'top',
      margin: 6,
      formatter: getTimelineAxisLabelFormatter(spanMs),
    },
  };
}

function timelineInsideDataZoom(minValueSpan = DEFAULT_TIMELINE_MAX_ZOOM_SPAN_MS): EChartsOption['dataZoom'] {
  return [
    {
      type: 'inside',
      xAxisIndex: 0,
      filterMode: 'none',
      minValueSpan,
      zoomOnMouseWheel: false,
      moveOnMouseMove: true,
      moveOnMouseWheel: false,
      zoomLock: true,
    },
  ];
}

function timelineSliderDataZoom(minValueSpan = DEFAULT_TIMELINE_MAX_ZOOM_SPAN_MS): EChartsOption['dataZoom'] {
  return [
    {
      type: 'slider',
      xAxisIndex: 0,
      filterMode: 'none',
      height: 24,
      bottom: 0,
      minValueSpan,
      brushSelect: false,
      showDataShadow: false,
      showDetail: true,
      textStyle: {
        color: '#7695a5',
        fontSize: 11,
      },
      handleStyle: { color: TIMELINE_COLOR },
      borderColor: '#dce4ea',
      fillerColor: 'rgba(107, 76, 230, 0.12)',
      labelFormatter: (value) => moment(Number(value)).format('DD/MM/YYYY HH:mm'),
    },
  ];
}

export function buildTeammateActivitiesTimelineChartOption(
  activities: ActivityRecord[],
  getTooltipText: (activity: ActivityRecord) => string,
  minValueSpan = DEFAULT_TIMELINE_MAX_ZOOM_SPAN_MS,
): EChartsOption {
  const points = buildActivityTimelinePoints(activities, getTooltipText);
  const bounds = getTimelineAxisBounds(points);

  return {
    color: [TIMELINE_COLOR],
    grid: LINE_CHART_GRID,
    tooltip: {
      trigger: 'item',
      confine: true,
      extraCssText: 'max-width: 420px; white-space: normal;',
      formatter: (params) => {
        const data = (params as { data?: { timestamp?: string; tooltipText?: string } }).data;
        if (!data?.tooltipText) {
          return '';
        }

        return `${data.timestamp || ''}<br/>${data.tooltipText}`;
      },
    },
    xAxis: timelineXAxis(bounds),
    dataZoom: timelineInsideDataZoom(minValueSpan),
    yAxis: {
      type: 'value',
      min: 0,
      max: 2,
      show: false,
      splitLine: { show: false },
    },
    series: [
      {
        name: 'Activities',
        type: 'line',
        smooth: false,
        showSymbol: true,
        showAllSymbol: true,
        symbolSize: timelineSymbolSize(points.length),
        clip: false,
        lineStyle: { width: 2 },
        areaStyle: { opacity: 0.08 },
        data: points.map((point) => ({
          value: [point.timestampMs, 1],
          timestamp: point.timestamp,
          tooltipText: point.tooltipText,
        })),
      },
    ],
  };
}

export function buildTeammateActivitiesSliderChartOption(
  bounds: TimelineAxisBounds,
  minValueSpan = DEFAULT_TIMELINE_MAX_ZOOM_SPAN_MS,
): EChartsOption {
  return {
    grid: SLIDER_CHART_GRID,
    xAxis: {
      type: 'value',
      min: bounds.min,
      max: bounds.max,
      show: false,
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 1,
      show: false,
    },
    series: [
      {
        type: 'line',
        data: [],
        silent: true,
      },
    ],
    dataZoom: timelineSliderDataZoom(minValueSpan),
  };
}
