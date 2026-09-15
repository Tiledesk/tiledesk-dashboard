import { toDayKeyInTimeZone } from 'app/utils/project-timezone.util';
import type { EChartsOption } from 'echarts';
import { buildLast10DayKeys } from 'app/home-components/home-flow/home-flow-analytics.util';

export interface KbAnalyticsSeries {
  kbId: string;
  kbName: string;
  totals: number[];
  answered: number[];
  answeredSum: number;
  unansweredSum: number;
  totalSum: number;
}

export interface KbAnalyticsParsed {
  dayKeys: string[];
  series: KbAnalyticsSeries[];
  answeredByDay: number[];
  unansweredByDay: number[];
  answeredTotal: number;
  unansweredTotal: number;
}

export interface KbLegendItem {
  kbId: string;
  kbName: string;
  total: number;
  color: string;
}

const STACK_COLORS = [
  '#e879a9',
  '#d4a017',
  '#3b82f6',
  '#64748b',
  '#f97316',
  '#8b5cf6',
  '#14b8a6',
  '#ef4444',
  '#0ea5e9',
  '#a855f7',
];

const LINE_RESPONSE_RATE = '#22c55e';

function toDayKey(value: unknown, timeZone: string = 'UTC'): string {
  return toDayKeyInTimeZone(value, timeZone);
}

function formatDayLabel(dayKey: string): string {
  if (!dayKey || dayKey.length < 10) { return dayKey; }
  const [, month, day] = dayKey.split('-');
  return `${day}/${month}`;
}

function sumArray(values: unknown): number {
  if (!Array.isArray(values)) { return 0; }
  return values.reduce((sum: number, value) => sum + (Number(value) || 0), 0);
}

function toNumberArray(values: unknown, length: number): number[] {
  const source = Array.isArray(values) ? values : [];
  return Array.from({ length }, (_, index) => Number(source[index]) || 0);
}

/** Parse kb-per-kb-over-time payload keeping every KB series (totals + answered/unanswered sums). */
export function parseKbPerKbOverTimeResponse(res: unknown, timeZone: string = 'UTC'): KbAnalyticsParsed {
  const empty: KbAnalyticsParsed = {
    dayKeys: [],
    series: [],
    answeredByDay: [],
    unansweredByDay: [],
    answeredTotal: 0,
    unansweredTotal: 0,
  };
  if (!res || typeof res !== 'object') { return empty; }

  const root = res as Record<string, unknown>;
  const timestamps = Array.isArray(root.timestamps) ? root.timestamps : [];
  const seriesList = Array.isArray(root.series) ? root.series : [];
  if (!timestamps.length || !seriesList.length) { return empty; }

  const dayKeys = timestamps.map((ts) => toDayKey(ts, timeZone)).filter(Boolean);
  const length = dayKeys.length;
  if (!length) { return empty; }

  const answeredByDay = Array.from({ length }, () => 0);
  const unansweredByDay = Array.from({ length }, () => 0);
  const series: KbAnalyticsSeries[] = [];

  seriesList.forEach((item) => {
    if (!item || typeof item !== 'object') { return; }
    const row = item as Record<string, unknown>;
    const totals = toNumberArray(row.total, length);
    const answered = toNumberArray(row.answered, length);
    const unanswered = toNumberArray(row.unanswered, length);
    const answeredSum = sumArray(answered);
    const unansweredSum = sumArray(unanswered);
    const totalSum = sumArray(totals);
    answered.forEach((value, index) => { answeredByDay[index] += value; });
    unanswered.forEach((value, index) => { unansweredByDay[index] += value; });
    series.push({
      kbId: String(row.kb_id || ''),
      kbName: String(row.kb_name || row.kb_id || '—'),
      totals,
      answered,
      answeredSum,
      unansweredSum,
      totalSum,
    });
  });

  series.sort((a, b) => b.answeredSum - a.answeredSum || b.totalSum - a.totalSum);

  return {
    dayKeys,
    series,
    answeredByDay,
    unansweredByDay,
    answeredTotal: sumArray(answeredByDay),
    unansweredTotal: sumArray(unansweredByDay),
  };
}

/** Empty KB analytics aligned to the last 10 days (flat zero charts). */
export function buildEmptyKbAnalyticsLast10Days(timeZone: string = 'UTC'): KbAnalyticsParsed {
  const dayKeys = buildLast10DayKeys(timeZone);
  const zeros = Array.from({ length: dayKeys.length }, () => 0);
  return {
    dayKeys,
    series: [],
    answeredByDay: zeros,
    unansweredByDay: [...zeros],
    answeredTotal: 0,
    unansweredTotal: 0,
  };
}

/** Ensure parsed series cover the last 10 days; fill missing days with zeros. */
export function ensureKbAnalyticsLast10Days(parsed: KbAnalyticsParsed | null, timeZone: string = 'UTC'): KbAnalyticsParsed {
  if (!parsed?.dayKeys?.length) {
    return buildEmptyKbAnalyticsLast10Days(timeZone);
  }

  const targetKeys = buildLast10DayKeys(timeZone);
  const indexByDay = new Map(parsed.dayKeys.map((dayKey, index) => [dayKey, index]));

  const answeredByDay = targetKeys.map((dayKey) => {
    const index = indexByDay.get(dayKey);
    return index == null ? 0 : (parsed.answeredByDay[index] || 0);
  });
  const unansweredByDay = targetKeys.map((dayKey) => {
    const index = indexByDay.get(dayKey);
    return index == null ? 0 : (parsed.unansweredByDay[index] || 0);
  });

  const series = parsed.series.map((item) => {
    const totals = targetKeys.map((dayKey) => {
      const index = indexByDay.get(dayKey);
      return index == null ? 0 : (item.totals[index] || 0);
    });
    const answered = targetKeys.map((dayKey) => {
      const index = indexByDay.get(dayKey);
      return index == null ? 0 : (item.answered?.[index] || 0);
    });
    return {
      ...item,
      totals,
      answered,
      answeredSum: sumArray(answered),
      totalSum: sumArray(totals),
    };
  });

  return {
    dayKeys: targetKeys,
    series,
    answeredByDay,
    unansweredByDay,
    answeredTotal: sumArray(answeredByDay),
    unansweredTotal: sumArray(unansweredByDay),
  };
}

export function hasKbUsage(parsed: KbAnalyticsParsed | null): boolean {
  if (!parsed) { return false; }
  if (parsed.answeredTotal > 0 || parsed.unansweredTotal > 0) { return true; }
  return parsed.series.some((item) => item.totalSum > 0);
}

export function computeResponseRatePercent(answered: number, unanswered: number): number | null {
  const total = answered + unanswered;
  if (total <= 0) { return null; }
  return (answered / total) * 100;
}

export function computePercentChange(current: number | null, previous: number | null): number | null {
  if (current == null) { return null; }
  // No prior baseline (null/0): treat any positive current value as a full step up.
  if (previous == null || previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return ((current - previous) / previous) * 100;
}

export function stackColor(index: number): string {
  return STACK_COLORS[index % STACK_COLORS.length];
}

export function buildKbLegend(series: KbAnalyticsSeries[]): KbLegendItem[] {
  return series
    .filter((item) => item.answeredSum > 0)
    .map((item, index) => ({
      kbId: item.kbId,
      kbName: item.kbName,
      total: item.answeredSum,
      color: stackColor(index),
    }));
}

export function buildKbStackedBarChartOption(
  dayKeys: string[],
  series: KbAnalyticsSeries[],
): EChartsOption {
  let answeredSeries = series.filter((item) => item.answeredSum > 0 || item.answered?.some((v) => v > 0));
  const labels = dayKeys.map(formatDayLabel);
  // Empty usage: still render a flat zero series so axes/baseline match other home charts.
  if (!answeredSeries.length && dayKeys.length) {
    answeredSeries = [{
      kbId: '',
      kbName: '—',
      totals: dayKeys.map(() => 0),
      answered: dayKeys.map(() => 0),
      answeredSum: 0,
      unansweredSum: 0,
      totalSum: 0,
    }];
  }
  const maxStack = dayKeys.reduce((max, _day, dayIndex) => {
    const daySum = answeredSeries.reduce((sum, item) => sum + (item.answered[dayIndex] || 0), 0);
    return Math.max(max, daySum);
  }, 0);
  // Tallest bar defines Y max (no +15%/ceil headroom — that turned 1 into 2 and crushed small counts).
  const yMax = Math.max(maxStack, 1);
  const numberLocale = 'en-US';
  const formatChartInteger = (value: number): string => {
    if (!Number.isFinite(value)) { return '0'; }
    return Math.round(value).toLocaleString(numberLocale);
  };

  return {
    color: answeredSeries.map((_, index) => stackColor(index)),
    grid: { left: 4, right: 8, top: 6, bottom: 4, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      // `size.viewSize` is the chart box (~grid height), NOT the page — never derive
      // maxHeight from it or the tooltip collapses to a few lines and "snaps" while moving.
      enterable: true,
      hideDelay: 300,
      appendTo: 'body',
      confine: false,
      extraCssText:
        'max-width: 320px; max-height: min(480px, 70vh); overflow-y: auto; line-height: 1.45; pointer-events: auto; box-sizing: border-box;',
      position: (point, _params, dom, _rect, size) => {
        const gap = 12;
        const mouseX = point[0];
        const mouseY = point[1];
        const viewW = size.viewSize[0];
        const viewportH = typeof window !== 'undefined' ? window.innerHeight : 800;
        // Stable page-based cap (not chart height).
        const maxH = Math.min(480, Math.floor(viewportH * 0.7));

        if (dom && (dom as HTMLElement).style) {
          const el = dom as HTMLElement;
          el.style.maxHeight = `${maxH}px`;
          el.style.overflowY = 'auto';
        }

        const boxW = size.contentSize[0] || 280;
        const boxH = Math.min(size.contentSize[1] || maxH, maxH);

        let x = mouseX + gap;
        if (x + boxW > viewW - gap) {
          x = Math.max(gap, mouseX - boxW - gap);
        }

        // Float above the cursor; allow negative y so the box can leave the short chart band.
        // Do not clamp into viewSize[1] — that was crushing tall tooltips.
        const y = mouseY - boxH - gap;

        return [x, y];
      },
      formatter: (params: unknown) => {
        const rows = (Array.isArray(params) ? params : [params]) as Array<{
          marker?: string;
          seriesName?: string;
          value?: number | string;
          axisValueLabel?: string;
          axisValue?: string | number;
        }>;
        if (!rows.length) { return ''; }

        const day = String(rows[0].axisValueLabel ?? rows[0].axisValue ?? '');
        const active = rows
          .map((row) => ({
            marker: row.marker ?? '',
            name: row.seriesName ?? '',
            value: Number(row.value) || 0,
          }))
          .filter((row) => row.value > 0)
          .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));

        if (!active.length) {
          return `${day}<br/>—`;
        }

        const lines = active.map(
          (row) => `${row.marker} ${row.name}: <b>${formatChartInteger(row.value)}</b>`,
        );
        return `${day}<br/>${lines.join('<br/>')}`;
      },
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: {
        color: '#94a3b8',
        fontSize: 10,
        interval: 'auto',
        hideOverlap: true,
      },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: yMax,
      minInterval: yMax <= 10 ? 1 : undefined,
      splitNumber: 2,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#94a3b8',
        fontSize: 10,
        formatter: (value: number) => formatChartInteger(value),
      },
      splitLine: {
        show: true,
        lineStyle: { type: 'dashed', color: '#e8edf2' },
      },
    },
    series: answeredSeries.map((item) => ({
      name: item.kbName,
      type: 'bar',
      stack: 'kbAnswered',
      barMaxWidth: 18,
      emphasis: { focus: 'series' },
      data: item.answered || [],
    })),
  };
}

/** Daily response-rate % sparkline (answered / answered+unanswered). */
export function buildKbResponseRateLineChartOption(
  dayKeys: string[],
  answeredByDay: number[],
  unansweredByDay: number[],
  seriesName: string,
): EChartsOption {
  const labels = dayKeys.map(formatDayLabel);
  const rates = dayKeys.map((_, index) => {
    const answered = answeredByDay[index] || 0;
    const unanswered = unansweredByDay[index] || 0;
    const total = answered + unanswered;
    if (total <= 0) { return 0; }
    return Math.round((answered / total) * 1000) / 10;
  });

  return {
    color: [LINE_RESPONSE_RATE],
    // Match home-flow conversations sparkline: full plot under the metric (no reserved axis label slots).
    grid: { left: 8, right: 10, top: 4, bottom: 8, containLabel: false },
    tooltip: {
      trigger: 'axis',
      confine: true,
      formatter: (params: unknown) => {
        const item = Array.isArray(params) ? params[0] : params;
        if (!item || typeof item !== 'object') { return ''; }
        const row = item as { dataIndex?: number; marker?: string; seriesName?: string; value?: number };
        const day = labels[row.dataIndex ?? 0] ?? '';
        const value = row.value ?? 0;
        return `${day}<br/>${row.marker ?? ''} ${row.seriesName ?? seriesName}: ${value}%`;
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: labels,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { show: false },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false },
    },
    series: [
      {
        name: seriesName,
        type: 'line',
        smooth: true,
        showSymbol: true,
        showAllSymbol: true,
        symbol: 'circle',
        symbolSize: 6,
        clip: false,
        lineStyle: { width: 2, color: LINE_RESPONSE_RATE },
        itemStyle: {
          color: LINE_RESPONSE_RATE,
          borderColor: '#fff',
          borderWidth: 1.5,
        },
        areaStyle: { color: LINE_RESPONSE_RATE, opacity: 0.1 },
        data: rates,
      },
    ],
  };
}
