import { toDayKeyInTimeZone } from 'app/utils/project-timezone.util';
import type { EChartsOption } from 'echarts';
import {
  alignSeriesToLast10Days,
  buildLast10DayKeys,
  formatChartDayLabel,
  HomeFlowTimeSeriesPoint,
  sumSeriesValues,
} from '../home-flow/home-flow-analytics.util';

export { sumSeriesValues };

/** Same grouping as Angular `| number:'1.0-0'` (app default locale / Current Usage). */
const OVERVIEW_NUMBER_LOCALE = 'en-US';

/** For ECharts formatters (pipe not available in util). Matches `| number:'1.0-0'`. */
export function formatOverviewInteger(value: number): string {
  if (!Number.isFinite(value)) { return '0'; }
  return Math.round(value).toLocaleString(OVERVIEW_NUMBER_LOCALE);
}

export interface OverviewConversationsSeries {
  dayKeys: string[];
  total: number[];
  withAi: number[];
  withoutAi: number[];
  totalSum: number;
}

export interface OverviewTokensParsed {
  /** Aligned to the last 10 project-TZ days (for the current-period chart). */
  points: HomeFlowTimeSeriesPoint[];
  /** Sum of all bucket values in the response (safe for previous-period totals). */
  totalSum: number;
}

const COLOR_CONVERSATIONS = '#3b82f6';
const COLOR_TOKENS = '#22c55e';

/** Fixed grid (no containLabel) so the last point hugs the right like flow/KB sparklines. */
const OVERVIEW_LINE_GRID = { left: 36, right: 10, top: 8, bottom: 22, containLabel: false };
const OVERVIEW_X_AXIS_LABEL = {
  color: '#94a3b8',
  fontSize: 10,
  alignMinLabel: 'left' as const,
  alignMaxLabel: 'right' as const,
};

function toDayKey(value: unknown, timeZone: string = 'UTC'): string {
  return toDayKeyInTimeZone(value, timeZone);
}

function formatDayLabel(dayKey: string): string {
  if (!dayKey || dayKey.length < 10) { return dayKey; }
  const [, month, day] = dayKey.split('-');
  return `${day}/${month}`;
}

function formatAxisValue(value: number): string {
  if (!Number.isFinite(value)) { return ''; }
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    const m = value / 1_000_000;
    if (Number.isInteger(m)) {
      return `${m.toLocaleString(OVERVIEW_NUMBER_LOCALE)}M`;
    }
    return `${m.toLocaleString(OVERVIEW_NUMBER_LOCALE, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    })}M`;
  }
  if (abs >= 1_000) {
    const k = value / 1_000;
    const rounded = Number.isInteger(k) ? k : Math.round(k);
    return `${rounded.toLocaleString(OVERVIEW_NUMBER_LOCALE)}k`;
  }
  return Math.round(value).toLocaleString(OVERVIEW_NUMBER_LOCALE);
}

function toNumberArray(values: unknown, length: number): number[] {
  const source = Array.isArray(values) ? values : [];
  return Array.from({ length }, (_, index) => Number(source[index]) || 0);
}

function alignValuesToDayKeys(dayKeys: string[], points: HomeFlowTimeSeriesPoint[]): number[] {
  const map = new Map(points.map((p) => [p.dayKey, p.value ?? 0]));
  return dayKeys.map((key) => map.get(key) ?? 0);
}

function seriesNameLooksLike(name: string, patterns: string[]): boolean {
  const n = name.toLowerCase().replace(/[_-]+/g, ' ').trim();
  return patterns.some((p) => n.includes(p));
}

/** Unwrap common `{ data: { timestamps, series } }` / `{ result: ... }` envelopes. */
function unwrapChartPayload(res: unknown): Record<string, unknown> {
  if (!res || typeof res !== 'object') { return {}; }
  let root = res as Record<string, unknown>;
  for (let depth = 0; depth < 3; depth++) {
    const nested = root.data ?? root.result ?? root.chart ?? root.payload;
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      const candidate = nested as Record<string, unknown>;
      if (
        Array.isArray(candidate.timestamps)
        || Array.isArray(candidate.categories)
        || Array.isArray(candidate.labels)
        || Array.isArray(candidate.series)
        || Array.isArray(candidate.dates)
        || Array.isArray(candidate.buckets)
      ) {
        root = candidate;
        continue;
      }
    }
    break;
  }
  return root;
}

function extractTimestamps(root: Record<string, unknown>): unknown[] | null {
  for (const key of ['timestamps', 'categories', 'labels', 'dates', 'days', 'x']) {
    const value = root[key];
    if (Array.isArray(value) && value.length) {
      return value;
    }
  }
  const xAxis = root.xAxis;
  if (xAxis && typeof xAxis === 'object' && !Array.isArray(xAxis)) {
    const data = (xAxis as Record<string, unknown>).data;
    if (Array.isArray(data) && data.length) { return data; }
  }
  return null;
}

function coerceValueArray(values: unknown): number[] {
  if (!Array.isArray(values)) { return []; }
  return values.map((entry) => {
    if (entry == null) { return 0; }
    if (typeof entry === 'number') { return entry; }
    if (typeof entry === 'string') { return Number(entry) || 0; }
    if (typeof entry === 'object') {
      const row = entry as Record<string, unknown>;
      const n = Number(row.value ?? row.y ?? row.count ?? row.total ?? row.total_tokens ?? row.ops ?? 0);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  });
}

function extractValuesFromSeriesItem(item: Record<string, unknown>): number[] {
  for (const key of [
    'total', 'total_tokens', 'prompt_tokens', 'completion_tokens',
    'ops', 'conversations', 'count', 'values', 'data', 'value', 'y', 'points',
  ]) {
    if (Array.isArray(item[key])) {
      return coerceValueArray(item[key]);
    }
  }
  return [];
}

function pointsFromTimestamps(
  timestamps: unknown[],
  values: number[],
  timeZone: string = 'UTC',
): HomeFlowTimeSeriesPoint[] {
  return timestamps.map((ts, index) => ({
    dayKey: toDayKey(ts, timeZone),
    value: Number(values[index]) || 0,
  })).filter((p) => p.dayKey);
}

function classifyConversationSeriesName(name: string): 'total' | 'withAi' | 'withoutAi' | null {
  if (seriesNameLooksLike(name, ['without', 'no ai', 'human only', 'no agent', 'senza', 'without_bot', 'without bot'])) {
    return 'withoutAi';
  }
  if (seriesNameLooksLike(name, ['with ai', 'with agent', 'ai agent', 'con ai', 'has bot', 'has_bot', 'with_bot', 'with bot'])) {
    return 'withAi';
  }
  if (seriesNameLooksLike(name, ['total', 'all', 'totale', 'overall'])) {
    return 'total';
  }
  return null;
}

/** Parse conversations chart into Total / With AI / Without AI daily series. */
export function parseConversationsOverviewResponse(res: unknown, timeZone: string = 'UTC'): OverviewConversationsSeries {
  const dayKeys = buildLast10DayKeys(timeZone);
  const empty: OverviewConversationsSeries = {
    dayKeys,
    total: Array.from({ length: dayKeys.length }, () => 0),
    withAi: Array.from({ length: dayKeys.length }, () => 0),
    withoutAi: Array.from({ length: dayKeys.length }, () => 0),
    totalSum: 0,
  };

  if (!res || typeof res !== 'object') { return empty; }
  const root = unwrapChartPayload(res);

  let totalPoints: HomeFlowTimeSeriesPoint[] = [];
  let withAiPoints: HomeFlowTimeSeriesPoint[] = [];
  let withoutAiPoints: HomeFlowTimeSeriesPoint[] = [];

  const timestamps = extractTimestamps(root);
  const seriesList = Array.isArray(root.series) ? root.series : null;

  if (timestamps && seriesList?.length) {
    seriesList.forEach((raw) => {
      if (!raw || typeof raw !== 'object') { return; }
      const item = raw as Record<string, unknown>;
      const name = String(item.name ?? item.label ?? item.id ?? item.key ?? item.metric ?? '');
      const values = extractValuesFromSeriesItem(item);
      if (!values.length) { return; }
      const points = pointsFromTimestamps(timestamps, values, timeZone);
      const kind = classifyConversationSeriesName(name);
      if (kind === 'withoutAi') { withoutAiPoints = points; }
      else if (kind === 'withAi') { withAiPoints = points; }
      else if (kind === 'total') { totalPoints = points; }
    });

    // Fallback by position if names did not match: [total, with, without]
    if (!totalPoints.length && !withAiPoints.length && !withoutAiPoints.length) {
      const mapped = seriesList.map((raw) => {
        const item = (raw && typeof raw === 'object') ? raw as Record<string, unknown> : {};
        return pointsFromTimestamps(timestamps, extractValuesFromSeriesItem(item), timeZone);
      });
      totalPoints = mapped[0] || [];
      withAiPoints = mapped[1] || [];
      withoutAiPoints = mapped[2] || [];
    }
  }

  if (timestamps) {
    for (const key of ['total', 'totals', 'count', 'conversations']) {
      if (Array.isArray(root[key]) && !totalPoints.length) {
        totalPoints = pointsFromTimestamps(timestamps, coerceValueArray(root[key]), timeZone);
      }
    }
    for (const key of [
      'with_ai', 'withAi', 'with_ai_agent', 'withAiAgent',
      'with_agent', 'withAgent', 'ai', 'bot', 'has_bot',
    ]) {
      if (Array.isArray(root[key]) && !withAiPoints.length) {
        withAiPoints = pointsFromTimestamps(timestamps, coerceValueArray(root[key]), timeZone);
      }
    }
    for (const key of [
      'without_ai', 'withoutAi', 'without_ai_agent', 'withoutAiAgent',
      'without_agent', 'withoutAgent', 'human', 'no_bot',
    ]) {
      if (Array.isArray(root[key]) && !withoutAiPoints.length) {
        withoutAiPoints = pointsFromTimestamps(timestamps, coerceValueArray(root[key]), timeZone);
      }
    }
  }

  // Buckets format (analytics API):
  // { buckets: [{ timestamp, total, with_bot, without_bot }, ...] }
  if (Array.isArray(root.buckets) && root.buckets.length) {
    (root.buckets as Record<string, unknown>[]).forEach((row) => {
      if (!row || typeof row !== 'object') { return; }
      const dayKey = toDayKey(row.timestamp ?? row.date ?? row.day ?? row.time, timeZone);
      if (!dayKey) { return; }
      const withAi = Number(row.with_bot ?? row.with_ai ?? row.withAi ?? row.with_agent ?? 0) || 0;
      const withoutAi = Number(row.without_bot ?? row.without_ai ?? row.withoutAi ?? row.without_agent ?? 0) || 0;
      const totalRaw = Number(row.total ?? row.count ?? row.conversations ?? 0) || 0;
      totalPoints.push({ dayKey, value: totalRaw || (withAi + withoutAi) });
      withAiPoints.push({ dayKey, value: withAi });
      withoutAiPoints.push({ dayKey, value: withoutAi });
    });
  }

  // Row-based: [{ date, total, with_ai, without_ai }, ...]
  const hasSeriesData = totalPoints.length || withAiPoints.length || withoutAiPoints.length;
  const rowsCandidate = root.data ?? root.rows ?? root.items;
  const rows = Array.isArray(rowsCandidate)
    ? rowsCandidate
    : Array.isArray(res)
      ? res
      : [];
  if (!hasSeriesData && Array.isArray(rows) && rows.length && rows.every((r) => r && typeof r === 'object')) {
    (rows as Record<string, unknown>[]).forEach((row) => {
      const dayKey = toDayKey(row.date ?? row.day ?? row.timestamp ?? row.time ?? row.label, timeZone);
      if (!dayKey) { return; }
      const withAi = Number(row.with_ai ?? row.withAi ?? row.with_bot ?? row.with_ai_agent ?? row.with_agent ?? row.ai ?? 0) || 0;
      const withoutAi = Number(row.without_ai ?? row.withoutAi ?? row.without_bot ?? row.without_ai_agent ?? row.without_agent ?? row.human ?? 0) || 0;
      const totalRaw = Number(row.total ?? row.count ?? row.conversations ?? 0) || 0;
      totalPoints.push({ dayKey, value: totalRaw || (withAi + withoutAi) });
      withAiPoints.push({ dayKey, value: withAi });
      withoutAiPoints.push({ dayKey, value: withoutAi });
    });
  }

  let total = alignValuesToDayKeys(dayKeys, alignSeriesToLast10Days(totalPoints, timeZone));
  let withAi = alignValuesToDayKeys(dayKeys, alignSeriesToLast10Days(withAiPoints, timeZone));
  let withoutAi = alignValuesToDayKeys(dayKeys, alignSeriesToLast10Days(withoutAiPoints, timeZone));

  const hasParts = withAi.some((v) => v > 0) || withoutAi.some((v) => v > 0);
  const hasTotal = total.some((v) => v > 0);
  if (hasParts && !hasTotal) {
    total = dayKeys.map((_, i) => (withAi[i] || 0) + (withoutAi[i] || 0));
  }

  // Sum from raw points (not last-10 aligned), so previous-period buckets are not dropped.
  const totalSum = totalPoints.reduce((sum, point) => sum + (Number(point.value) || 0), 0);

  return {
    dayKeys,
    total,
    withAi,
    withoutAi,
    totalSum,
  };
}

/** Parse tokens chart into a daily series + raw period total. */
export function parseTokensOverviewResponse(res: unknown, timeZone: string = 'UTC'): OverviewTokensParsed {
  const empty: OverviewTokensParsed = {
    points: alignSeriesToLast10Days([], timeZone),
    totalSum: 0,
  };

  if (!res || typeof res !== 'object') {
    return empty;
  }
  const root = unwrapChartPayload(res);
  const timestamps = extractTimestamps(root);
  const seriesList = Array.isArray(root.series) ? root.series : null;
  let rawPoints: HomeFlowTimeSeriesPoint[] = [];

  if (timestamps && seriesList?.length) {
    let chosen: number[] | null = null;
    const perDaySums = Array.from({ length: timestamps.length }, () => 0);

    seriesList.forEach((raw) => {
      if (!raw || typeof raw !== 'object') { return; }
      const item = raw as Record<string, unknown>;
      const name = String(item.name ?? item.label ?? item.id ?? item.key ?? '');
      const values = extractValuesFromSeriesItem(item);
      if (!values.length) { return; }
      if (seriesNameLooksLike(name, ['total', 'all', 'token'])) {
        if (seriesNameLooksLike(name, ['total_tokens', 'total tokens', 'total']) && !seriesNameLooksLike(name, ['prompt', 'completion', 'thinking'])) {
          chosen = values;
        } else if (!chosen) {
          chosen = values;
        }
      }
      values.forEach((v, i) => {
        perDaySums[i] = (perDaySums[i] || 0) + (Number(v) || 0);
      });
    });

    const values = chosen ?? perDaySums;
    rawPoints = pointsFromTimestamps(timestamps, values, timeZone);
  } else if (timestamps) {
    for (const key of ['total_tokens', 'totalTokens', 'tokens', 'total']) {
      if (Array.isArray(root[key])) {
        rawPoints = pointsFromTimestamps(timestamps, coerceValueArray(root[key]), timeZone);
        break;
      }
    }
  }

  // Buckets format (analytics API):
  // { buckets: [{ timestamp, total_tokens, ... }, ...] }
  if (!rawPoints.length && Array.isArray(root.buckets) && root.buckets.length) {
    rawPoints = (root.buckets as Record<string, unknown>[])
      .filter((row) => row && typeof row === 'object')
      .map((row) => ({
        dayKey: toDayKey(row.timestamp ?? row.date ?? row.day ?? row.time, timeZone),
        value: Number(row.total_tokens ?? row.totalTokens ?? row.tokens ?? row.total ?? row.value ?? 0) || 0,
      }))
      .filter((p) => p.dayKey);
  }

  if (!rawPoints.length) {
    const rowsCandidate = root.data ?? root.rows ?? root.items;
    const rows = Array.isArray(rowsCandidate)
      ? rowsCandidate
      : Array.isArray(res)
        ? res
        : [];
    if (Array.isArray(rows) && rows.length && rows.every((r) => r && typeof r === 'object')) {
      rawPoints = (rows as Record<string, unknown>[])
        .map((row) => ({
          dayKey: toDayKey(row.date ?? row.day ?? row.timestamp ?? row.time ?? row.label, timeZone),
          value: Number(row.total_tokens ?? row.totalTokens ?? row.tokens ?? row.total ?? row.value ?? 0) || 0,
        }))
        .filter((p) => p.dayKey);
    }
  }

  return {
    points: alignSeriesToLast10Days(rawPoints, timeZone),
    totalSum: rawPoints.reduce((sum, point) => sum + (Number(point.value) || 0), 0),
  };
}

function buildLabeledLineYAxis(maxValue: number): EChartsOption['yAxis'] {
  const scaleRef = maxValue > 0 ? maxValue : 10;
  const yMax = Math.max(Math.ceil(scaleRef * 1.15), 1);
  const splitCount = 4;
  const niceMax = Math.ceil(yMax / splitCount) * splitCount;
  const interval = niceMax / splitCount;

  return {
    type: 'value',
    min: 0,
    max: niceMax,
    interval,
    splitNumber: splitCount,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: '#94a3b8',
      fontSize: 10,
      formatter: (value: number) => formatAxisValue(value),
    },
    splitLine: {
      show: true,
      lineStyle: { color: '#eef2f6', width: 1 },
    },
  };
}

function areaLineSeries(
  name: string,
  color: string,
  data: number[],
): Record<string, unknown> {
  return {
    name,
    type: 'line',
    smooth: true,
    showSymbol: true,
    showAllSymbol: true,
    symbol: 'circle',
    symbolSize: 6,
    clip: false,
    lineStyle: { width: 2, color },
    itemStyle: {
      color,
      borderColor: '#fff',
      borderWidth: 1.5,
    },
    areaStyle: { color, opacity: 0.12 },
    data,
  };
}

export function buildConversationsOverviewChartOption(
  parsed: OverviewConversationsSeries,
  labels: { total: string; withAi: string; withoutAi: string },
): EChartsOption {
  const xLabels = parsed.dayKeys.map(formatDayLabel);
  const maxValue = Math.max(...parsed.total, 0);

  return {
    color: [COLOR_CONVERSATIONS],
    grid: OVERVIEW_LINE_GRID,
    tooltip: {
      trigger: 'axis',
      confine: true,
      formatter: (params: unknown) => {
        const item = Array.isArray(params) ? params[0] : params;
        if (!item || typeof item !== 'object') { return ''; }
        const row = item as { dataIndex?: number; marker?: string; seriesName?: string; value?: number };
        const idx = row.dataIndex ?? 0;
        const day = xLabels[idx] ?? '';
        const raw = Number(row.value ?? parsed.total[idx] ?? 0);
        return `${day}<br/>${row.marker ?? ''} ${row.seriesName ?? labels.total}: ${formatOverviewInteger(raw)}`;
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xLabels,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: OVERVIEW_X_AXIS_LABEL,
    },
    yAxis: buildLabeledLineYAxis(maxValue),
    series: [
      areaLineSeries(labels.total, COLOR_CONVERSATIONS, parsed.total),
    ],
  };
}

export function buildTokensOverviewChartOption(
  points: HomeFlowTimeSeriesPoint[],
  seriesName: string,
  timeZone: string = 'UTC',
): EChartsOption {
  const aligned = points.length ? points : alignSeriesToLast10Days([], timeZone);
  const values = aligned.map((p) => p.value ?? 0);
  const xLabels = aligned.map((p) => formatDayLabel(p.dayKey));
  const maxValue = Math.max(...values, 0);

  return {
    color: [COLOR_TOKENS],
    grid: OVERVIEW_LINE_GRID,
    tooltip: {
      trigger: 'axis',
      confine: true,
      formatter: (params: unknown) => {
        const item = Array.isArray(params) ? params[0] : params;
        if (!item || typeof item !== 'object') { return ''; }
        const row = item as { dataIndex?: number; marker?: string; seriesName?: string };
        const idx = row.dataIndex ?? 0;
        const day = formatChartDayLabel(aligned[idx]?.dayKey ?? '');
        const raw = values[idx] ?? 0;
        return `${day}<br/>${row.marker ?? ''} ${row.seriesName ?? seriesName}: ${formatOverviewInteger(raw)}`;
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xLabels,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: OVERVIEW_X_AXIS_LABEL,
    },
    yAxis: buildLabeledLineYAxis(maxValue),
    series: [
      areaLineSeries(seriesName, COLOR_TOKENS, values),
    ],
  };
}

export function computeOverviewPercentChange(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) { return null; }
  if (previous <= 0) {
    return current > 0 ? 100 : 0;
  }
  const raw = ((current - previous) / previous) * 100;
  // Match home-kb-analytics: keep one decimal of precision.
  const oneDecimal = Math.round(raw * 10) / 10;
  if (oneDecimal === 0 && current !== previous) {
    return current > previous ? 0.1 : -0.1;
  }
  return oneDecimal;
}

export function formatOverviewSignedPercent(percent: number): string {
  if (!Number.isFinite(percent)) { return '0%'; }
  if (percent === 0) { return '0%'; }
  const abs = Math.abs(percent).toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  if (percent > 0) { return `+${abs}%`; }
  return `−${abs}%`;
}
