import { buildLastNDayKeys, toDayKeyInTimeZone } from 'app/utils/project-timezone.util';

export interface HomeFlowModelUsage {
  model: string;
  value: number;
  percent: number;
}

export interface HomeFlowTimeSeriesPoint {
  dayKey: string;
  value: number;
}

/** Project-TZ day keys for the last 10 calendar days (inclusive). */
export function buildLast10DayKeys(timeZone: string = 'UTC'): string[] {
  return buildLastNDayKeys(10, timeZone);
}

export function alignSeriesToLast10Days(
  points: HomeFlowTimeSeriesPoint[],
  timeZone: string = 'UTC',
): HomeFlowTimeSeriesPoint[] {
  const map = new Map(points.map((point) => [point.dayKey, point.value ?? 0]));
  return buildLast10DayKeys(timeZone).map((dayKey) => ({
    dayKey,
    value: map.get(dayKey) ?? 0,
  }));
}

export function formatChartDayLabel(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number);
  if (!y || !m || !d) { return dayKey; }
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function toDayKey(value: unknown, timeZone: string = 'UTC'): string {
  return toDayKeyInTimeZone(value, timeZone);
}

function readNumber(row: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    if (row[key] != null && row[key] !== '') {
      const n = Number(row[key]);
      if (!Number.isNaN(n)) { return n; }
    }
  }
  return 0;
}

function readString(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    if (row[key] != null && String(row[key]).trim()) {
      return String(row[key]).trim();
    }
  }
  return '';
}

function extractRows(res: unknown): Record<string, unknown>[] {
  if (!res) { return []; }
  if (Array.isArray(res)) { return res as Record<string, unknown>[]; }
  const root = res as Record<string, unknown>;
  if (Array.isArray(root.buckets)) { return root.buckets as Record<string, unknown>[]; }
  if (Array.isArray(root.data)) { return root.data as Record<string, unknown>[]; }
  if (Array.isArray(root.models)) { return root.models as Record<string, unknown>[]; }
  if (Array.isArray(root.items)) { return root.items as Record<string, unknown>[]; }
  if (Array.isArray(root.rows)) { return root.rows as Record<string, unknown>[]; }
  if (Array.isArray(root.series)) { return root.series as Record<string, unknown>[]; }
  return [];
}

function parseTimestampsSeries(
  res: unknown,
  valueKeys: string[],
  timeZone: string = 'UTC',
): HomeFlowTimeSeriesPoint[] {
  if (!res || typeof res !== 'object') { return []; }
  const root = res as Record<string, unknown>;
  const timestamps = root.timestamps;
  const seriesList = root.series;
  if (!Array.isArray(timestamps) || !Array.isArray(seriesList) || !seriesList.length) {
    return [];
  }

  const series = seriesList[0] as Record<string, unknown>;
  let values: unknown[] = [];
  for (const key of valueKeys) {
    if (Array.isArray(series[key])) {
      values = series[key] as unknown[];
      break;
    }
  }
  if (!values.length && Array.isArray(series.values)) {
    values = series.values as unknown[];
  }
  if (!values.length && Array.isArray(series.data)) {
    values = series.data as unknown[];
  }

  return timestamps.map((ts, index) => ({
    dayKey: toDayKey(ts, timeZone),
    value: Number(values[index]) || 0,
  })).filter((point) => point.dayKey);
}

/** Parse AI model KPI payload into ranked model usage rows. */
export function parseAiModelUsageResponse(res: unknown): HomeFlowModelUsage[] {
  if (!res || typeof res !== 'object') { return []; }

  const root = res as Record<string, unknown>;
  const byModel = root.by_model;

  // New analytics shape: { by_model: { "gpt-4.1": { total_tokens, ... }, ... } }
  if (byModel && typeof byModel === 'object' && !Array.isArray(byModel)) {
    const models = Object.entries(byModel as Record<string, unknown>)
      .map(([modelName, stats]) => {
        const row = (stats && typeof stats === 'object')
          ? stats as Record<string, unknown>
          : {};
        return {
          model: modelName,
          value: readNumber(row, ['total_tokens', 'tokens', 'tokenCount', 'count', 'calls', 'total', 'value']),
        };
      })
      .filter((item) => item.model && item.value > 0);

    const total = models.reduce((sum, item) => sum + item.value, 0)
      || Number(root.total_tokens)
      || 0;
    if (!total) { return []; }

    return models
      .sort((a, b) => b.value - a.value)
      .map((item) => ({
        ...item,
        percent: total ? (item.value / total) * 100 : 0,
      }));
  }

  const rows = extractRows(res);
  const models = rows.map((row) => ({
    model: readString(row, ['model', 'name', 'modelName', 'label', 'id']),
    value: readNumber(row, ['totalTokens', 'total_tokens', 'tokens', 'tokenCount', 'count', 'calls', 'total', 'value']),
  })).filter((item) => item.model && item.value > 0);

  if (!models.length) {
    Object.entries(root).forEach(([key, val]) => {
      if (typeof val === 'number' && val > 0 && !['total', 'count', 'total_tokens', 'prompt_tokens', 'completion_tokens', 'thinking_tokens'].includes(key)) {
        models.push({ model: key, value: val });
      }
    });
  }

  const total = models.reduce((sum, item) => sum + item.value, 0);
  if (!total) { return []; }

  return models
    .sort((a, b) => b.value - a.value)
    .map((item) => ({
      ...item,
      percent: (item.value / total) * 100,
    }));
}

export function parseMostEngagedAgentId(res: unknown): string | null {
  if (!res || typeof res !== 'object') { return null; }

  const byAgent = (res as Record<string, unknown>).by_agent;
  if (!byAgent || typeof byAgent !== 'object') { return null; }

  let bestAgentId: string | null = null;
  let bestCompletionCount = 0;

  Object.entries(byAgent as Record<string, unknown>).forEach(([agentId, stats]) => {
    const completionCount = Number((stats as Record<string, unknown>)?.completion_count ?? 0);
    if (completionCount > bestCompletionCount) {
      bestCompletionCount = completionCount;
      bestAgentId = agentId;
    }
  });

  return bestCompletionCount > 0 ? bestAgentId : null;
}

/** Parse time-series chart payloads into daily numeric points. */
export function parseTimeSeriesResponse(
  res: unknown,
  valueKeys: string[],
  timeZone: string = 'UTC',
): HomeFlowTimeSeriesPoint[] {
  const fromSeries = parseTimestampsSeries(res, valueKeys, timeZone);
  if (fromSeries.length) { return fromSeries; }

  const rows = extractRows(res);
  const points = rows.map((row) => ({
    dayKey: toDayKey(row.date ?? row.day ?? row.timestamp ?? row.time ?? row.label, timeZone),
    value: readNumber(row, [...valueKeys, 'value', 'count', 'total', 'tokens', 'ops']),
  })).filter((point) => point.dayKey);

  return points.sort((a, b) => a.dayKey.localeCompare(b.dayKey));
}

export function sumSeriesValues(points: HomeFlowTimeSeriesPoint[]): number {
  return points.reduce((sum, point) => sum + point.value, 0);
}

/** Compact token label: Math.round, k for thousands, M from 1M (matches analytics charts). */
export function formatTokenCountCompact(value: number): string {
  if (!Number.isFinite(value) || value <= 0) { return '0'; }

  const v = Math.round(value);
  if (v < 1_000) {
    return String(v);
  }
  if (v >= 1_000_000) {
    const millions = v / 1_000_000;
    if (millions % 1 === 0) {
      return `${Math.round(millions)}M`;
    }
    return `${millions.toFixed(2).replace(/\.?0+$/, '')}M`;
  }

  return `${Math.round(v / 1_000)}k`;
}

/** Compact number label e.g. 437000 -> "437 K". */
export function formatCompactCount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) { return '0'; }
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${millions >= 10 ? Math.round(millions) : millions.toFixed(1).replace(/\.0$/, '')} M`;
  }
  if (value >= 1_000) {
    const thousands = value / 1_000;
    return `${thousands >= 10 ? Math.round(thousands) : thousands.toFixed(1).replace(/\.0$/, '')} K`;
  }
  return Math.round(value).toLocaleString();
}

/** Percent change of current total vs a prior period total. */
export function computePercentChangeVsPrevious(currentTotal: number, previousTotal: number): number | null {
  if (!Number.isFinite(currentTotal) || !Number.isFinite(previousTotal)) {
    return null;
  }
  if (previousTotal <= 0) {
    return currentTotal > 0 ? 100 : 0;
  }
  const raw = ((currentTotal - previousTotal) / previousTotal) * 100;
  const rounded = Math.round(raw);
  // Sub-0.5% real changes must not collapse to flat "0%" (e.g. 366 vs 367 → -0.3%).
  if (rounded === 0 && currentTotal !== previousTotal) {
    const oneDecimal = Math.round(raw * 10) / 10;
    if (oneDecimal !== 0) { return oneDecimal; }
    return currentTotal > previousTotal ? 0.1 : -0.1;
  }
  return rounded;
}

/** Signed percent label e.g. 121 -> "+121%", -5 -> "-5%", -0.3 -> "-0.3%". */
export function formatSignedPercent(percent: number): string {
  if (!Number.isFinite(percent)) { return '0%'; }
  if (percent === 0) { return '0%'; }
  const value = Number.isInteger(percent) ? String(percent) : percent.toFixed(1);
  if (percent > 0) { return `+${value}%`; }
  return `${value}%`;
}

/** Percent change between first and second half of a series. */
export function percentChangeBetweenHalves(points: HomeFlowTimeSeriesPoint[]): number | null {
  if (points.length < 2) { return null; }
  const mid = Math.floor(points.length / 2);
  const firstHalf = sumSeriesValues(points.slice(0, mid));
  const secondHalf = sumSeriesValues(points.slice(mid));
  if (firstHalf <= 0) {
    return secondHalf > 0 ? 100 : 0;
  }
  const raw = ((secondHalf - firstHalf) / firstHalf) * 100;
  const rounded = Math.round(raw);
  if (rounded === 0 && secondHalf !== firstHalf) {
    const oneDecimal = Math.round(raw * 10) / 10;
    if (oneDecimal !== 0) { return oneDecimal; }
    return secondHalf > firstHalf ? 0.1 : -0.1;
  }
  return rounded;
}
