import { toDayKeyInTimeZone } from 'app/utils/project-timezone.util';
import type { EChartsOption } from 'echarts';
import { buildLast10DayKeys } from 'app/home-components/home-flow/home-flow-analytics.util';

export interface KbAnalyticsSeries {
  kbId: string;
  kbName: string;
  totals: number[];
  answered: number[];
  unanswered: number[];
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
    const answered = toNumberArray(row.answered, length);
    const unanswered = toNumberArray(row.unanswered, length);
    let totals = toNumberArray(row.total, length);
    // Some payloads omit `total`; derive it so KPI and chart stay aligned.
    if (!sumArray(totals) && (sumArray(answered) || sumArray(unanswered))) {
      totals = answered.map((value, index) => value + (unanswered[index] || 0));
    }
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
      unanswered,
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
    const unanswered = targetKeys.map((dayKey) => {
      const index = indexByDay.get(dayKey);
      return index == null ? 0 : (item.unanswered?.[index] || 0);
    });
    return {
      ...item,
      totals,
      answered,
      unanswered,
      answeredSum: sumArray(answered),
      unansweredSum: sumArray(unanswered),
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
    .filter((item) => item.totalSum > 0)
    .map((item, index) => ({
      kbId: item.kbId,
      kbName: item.kbName,
      total: item.totalSum,
      color: stackColor(index),
    }));
}

export function buildKbStackedBarChartOption(
  dayKeys: string[],
  series: KbAnalyticsSeries[],
): EChartsOption {
  // Home KB analytics: stacked totals per KB (HTML legend below the chart).
  let querySeries = series.filter((item) => item.totalSum > 0 || item.totals?.some((v) => v > 0));
  const labels = dayKeys.map(formatDayLabel);
  if (!querySeries.length && dayKeys.length) {
    querySeries = [{
      kbId: '',
      kbName: '—',
      totals: dayKeys.map(() => 0),
      answered: dayKeys.map(() => 0),
      unanswered: dayKeys.map(() => 0),
      answeredSum: 0,
      unansweredSum: 0,
      totalSum: 0,
    }];
  }
  const maxStack = dayKeys.reduce((max, _day, dayIndex) => {
    const daySum = querySeries.reduce((sum, item) => sum + (item.totals[dayIndex] || 0), 0);
    return Math.max(max, daySum);
  }, 0);
  const yMax = Math.max(maxStack, 1);
  const numberLocale = 'en-US';
  const formatChartInteger = (value: number): string => {
    if (!Number.isFinite(value)) { return '0'; }
    return Math.round(value).toLocaleString(numberLocale);
  };

  return {
    color: querySeries.map((_, index) => stackColor(index)),
    grid: { left: 4, right: 8, top: 6, bottom: 4, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
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
    series: querySeries.map((item) => ({
      name: item.kbName,
      type: 'bar',
      stack: 'kbQueries',
      barMaxWidth: 18,
      emphasis: { focus: 'series' },
      data: item.totals || [],
    })),
  };
}

/** Overview / Analytics-aligned: grouped bars + day tooltip (all KBs) + clickable legend. */
export function buildKbGroupedBarChartOption(
  dayKeys: string[],
  series: KbAnalyticsSeries[],
  tooltipLabels?: { answered: string; unanswered: string },
): EChartsOption {
  let querySeries = series.filter((item) => item.totalSum > 0 || item.totals?.some((v) => v > 0));
  const labels = dayKeys.map(formatDayLabel);
  if (!querySeries.length && dayKeys.length) {
    querySeries = [{
      kbId: '',
      kbName: '—',
      totals: dayKeys.map(() => 0),
      answered: dayKeys.map(() => 0),
      unanswered: dayKeys.map(() => 0),
      answeredSum: 0,
      unansweredSum: 0,
      totalSum: 0,
    }];
  }
  const maxBar = querySeries.reduce((max, item) => {
    const seriesMax = (item.totals || []).reduce((inner, value) => Math.max(inner, value || 0), 0);
    return Math.max(max, seriesMax);
  }, 0);
  const yMax = Math.max(maxBar, 1);
  const numberLocale = 'en-US';
  const formatChartInteger = (value: number): string => {
    if (!Number.isFinite(value)) { return '0'; }
    return Math.round(value).toLocaleString(numberLocale);
  };
  const answeredLabel = tooltipLabels?.answered || 'answered';
  const unansweredLabel = tooltipLabels?.unanswered || 'unanswered';
  const showLegend = querySeries.some((item) => !!item.kbId);

  // Keep tooltip still while the pointer moves across bars of the same day.
  let stickyDayIndex: number | null = null;
  let stickyPos: [number, number] | null = null;

  const resolveOverviewChartRoot = (viewW: number, viewH: number): HTMLElement | null => {
    if (typeof document === 'undefined') { return null; }
    const nodes = Array.from(
      document.querySelectorAll('.home-overview__chart'),
    ) as HTMLElement[];
    const matches = nodes.filter(
      (node) => Math.abs(node.clientWidth - viewW) <= 2
        && Math.abs(node.clientHeight - viewH) <= 2,
    );
    if (!matches.length) { return null; }
    // Prefer the KB queries chart (right card) when both overview charts match.
    return matches[matches.length - 1];
  };

  return {
    color: querySeries.map((_, index) => stackColor(index)),
    grid: {
      left: 4,
      right: 8,
      top: 6,
      bottom: showLegend ? 28 : 4,
      containLabel: true,
    },
    legend: showLegend
      ? {
          type: 'scroll',
          bottom: 0,
          left: 'center',
          icon: 'roundRect',
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 12,
          selectedMode: true,
          textStyle: {
            color: '#64748b',
            fontSize: 11,
          },
          pageIconColor: '#94a3b8',
          pageTextStyle: { color: '#94a3b8', fontSize: 10 },
        }
      : undefined,
    tooltip: {
      // Analytics: hover on a day → full per-KB legend for that day.
      // No max-height/scroll: tooltip disappears as soon as the pointer leaves the bar.
      trigger: 'axis',
      transitionDuration: 0,
      axisPointer: {
        type: 'shadow',
        shadowStyle: { color: 'rgba(148, 163, 184, 0.12)' },
      },
      appendTo: 'body',
      confine: false,
      extraCssText:
        'max-width: min(520px, 92vw); overflow: visible; white-space: normal; word-break: break-word; line-height: 1.35; pointer-events: none; box-sizing: border-box;',
      position: (point, params, dom, _rect, size) => {
        const gap = 8;
        const viewW = size.viewSize[0];
        const viewH = size.viewSize[1];
        const boxW = size.contentSize[0] || 280;
        const boxH = size.contentSize[1] || 120;
        const rows = (Array.isArray(params) ? params : [params]) as Array<{ dataIndex?: number }>;
        const dayIndex = rows[0]?.dataIndex ?? -1;

        if (dom && (dom as HTMLElement).style) {
          const el = dom as HTMLElement;
          el.style.maxHeight = 'none';
          el.style.overflow = 'visible';
          el.style.whiteSpace = 'normal';
          el.style.wordBreak = 'break-word';
          el.style.pointerEvents = 'none';
        }

        // Same day → keep the same anchor (avoids jump across grouped bars).
        if (stickyDayIndex === dayIndex && stickyPos) {
          return stickyPos;
        }

        const viewportH = typeof window !== 'undefined' ? window.innerHeight : viewH;
        const viewportW = typeof window !== 'undefined' ? window.innerWidth : viewW;
        const chartRoot = resolveOverviewChartRoot(viewW, viewH);
        const chartRect = chartRoot?.getBoundingClientRect();
        const chartLeft = chartRect?.left ?? 0;
        const chartTop = chartRect?.top ?? 0;
        const cursorPageY = chartTop + point[1];

        // Horizontal: beside the cursor, flip if it would overflow the window.
        let pageX = chartLeft + point[0] + gap;
        if (pageX + boxW > viewportW - gap) {
          pageX = Math.max(gap, chartLeft + point[0] - boxW - gap);
        }
        pageX = Math.max(gap, Math.min(pageX, viewportW - boxW - gap));

        // Vertical: prefer above the cursor (near the bar). Fall back below, then
        // viewport-center only when the tooltip is too tall to sit next to the chart.
        let pageY = cursorPageY - boxH - gap;
        if (pageY < gap) {
          pageY = cursorPageY + gap;
        }
        const overflowsViewport = pageY < gap || pageY + boxH > viewportH - gap;
        if (overflowsViewport) {
          const idealPageY = Math.round((viewportH - boxH) / 2);
          pageY = boxH <= viewportH - 2 * gap
            ? Math.max(gap, Math.min(idealPageY, viewportH - boxH - gap))
            : idealPageY;
        } else {
          pageY = Math.max(gap, Math.min(pageY, viewportH - boxH - gap));
        }

        // ECharts moveTo expects chart-local coords (converted to page via appendTo body).
        const x = pageX - chartLeft;
        const y = pageY - chartTop;

        stickyDayIndex = dayIndex;
        stickyPos = [x, y];
        return stickyPos;
      },
      formatter: (params: unknown) => {
        const rows = (Array.isArray(params) ? params : [params]) as Array<{
          seriesIndex?: number;
          dataIndex?: number;
          seriesName?: string;
          marker?: string;
          axisValueLabel?: string;
          axisValue?: string | number;
          value?: number | string;
        }>;
        if (!rows.length) { return ''; }

        const dayIndex = rows[0].dataIndex ?? 0;
        const day = labels[dayIndex]
          ?? String(rows[0].axisValueLabel ?? rows[0].axisValue ?? '');

        const active = rows
          .map((row) => {
            const item = querySeries[row.seriesIndex ?? -1];
            const total = Number(item?.totals?.[dayIndex] ?? row.value) || 0;
            const answered = Number(item?.answered?.[dayIndex]) || 0;
            const unanswered = Number(item?.unanswered?.[dayIndex])
              || Math.max(0, total - answered);
            return {
              marker: row.marker ?? '',
              name: item?.kbName || row.seriesName || '—',
              total,
              answered,
              unanswered,
            };
          })
          .filter((row) => row.total > 0)
          .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

        if (!active.length) {
          return `${day}<br/>—`;
        }

        // One row per KB (compact height): name + total, then answered/unanswered inline.
        const lines = active.map(
          (row) => `<div style="margin:0 0 4px 0;line-height:1.3">`
            + `${row.marker} <b>${row.name}</b>: ${formatChartInteger(row.total)}`
            + ` <span style="color:#94a3b8;font-size:11px">`
            + `(${formatChartInteger(row.answered)} ${answeredLabel}, ${formatChartInteger(row.unanswered)} ${unansweredLabel})`
            + `</span></div>`,
        );
        return `${day}<br/>${lines.join('')}`;
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
    series: querySeries.map((item) => ({
      name: item.kbName,
      type: 'bar',
      barMaxWidth: 18,
      barGap: '20%',
      emphasis: { focus: 'none' },
      data: item.totals || [],
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
