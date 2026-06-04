import type { EChartsOption } from 'echarts';

export interface KbOverTimePoint {
  /** UTC day key YYYY-MM-DD */
  dayKey: string;
  answered: number;
  unanswered: number;
}

const ANSWERED_COLOR = '#2e7d32';
const UNANSWERED_COLOR = '#e53935';
const RATE_COLOR = '#6b4ce6';

function toDayKey(value: unknown): string {
  if (value == null || value === '') { return ''; }
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.slice(0, 10);
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) { return ''; }
  return parsed.toISOString().slice(0, 10);
}

function readCount(row: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    if (row[key] != null && row[key] !== '') {
      const n = Number(row[key]);
      if (!Number.isNaN(n)) { return n; }
    }
  }
  return 0;
}

function parseTimestampsSeriesFormat(root: Record<string, unknown>): KbOverTimePoint[] | null {
  const timestamps = root.timestamps;
  const seriesList = root.series;
  if (!Array.isArray(timestamps) || !Array.isArray(seriesList) || !seriesList.length) {
    return null;
  }

  const series = seriesList[0] as Record<string, unknown>;
  const answeredArr = series.answered;
  const unansweredArr = series.unanswered;
  if (!Array.isArray(answeredArr) || !Array.isArray(unansweredArr)) {
    return null;
  }

  const points: KbOverTimePoint[] = [];
  timestamps.forEach((ts, index) => {
    const dayKey = toDayKey(ts);
    if (!dayKey) { return; }
    points.push({
      dayKey,
      answered: Number(answeredArr[index]) || 0,
      unanswered: Number(unansweredArr[index]) || 0,
    });
  });
  return points;
}

function extractPointsArray(res: unknown): Record<string, unknown>[] {
  if (!res) { return []; }
  const root = res as Record<string, unknown>;
  if (Array.isArray(res)) { return res as Record<string, unknown>[]; }
  if (Array.isArray(root.data)) { return root.data as Record<string, unknown>[]; }
  if (Array.isArray(root.points)) { return root.points as Record<string, unknown>[]; }
  if (Array.isArray(root.series) && Array.isArray(root.timestamps)) { return []; }
  if (Array.isArray(root.series)) { return root.series as Record<string, unknown>[]; }
  if (Array.isArray(root.rows)) { return root.rows as Record<string, unknown>[]; }

  const data = root.data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const nested = data as Record<string, unknown>;
    const first = Object.values(nested)[0];
    if (Array.isArray(first)) { return first as Record<string, unknown>[]; }
    if (first && typeof first === 'object') {
      const inner = first as Record<string, unknown>;
      if (Array.isArray(inner.points)) { return inner.points as Record<string, unknown>[]; }
      if (Array.isArray(inner.series)) { return inner.series as Record<string, unknown>[]; }
    }
  }
  return [];
}

/** Normalise analytics API payload into daily answered / unanswered counts. */
export function parseKbOverTimeResponse(res: unknown): KbOverTimePoint[] {
  if (!res || typeof res !== 'object') { return []; }
  const root = res as Record<string, unknown>;

  const fromTimestampsSeries = parseTimestampsSeriesFormat(root);
  if (fromTimestampsSeries) {
    return fromTimestampsSeries;
  }

  const rows = extractPointsArray(res);
  const byDay = new Map<string, KbOverTimePoint>();

  rows.forEach((row) => {
    const dayKey = toDayKey(
      row.date ?? row.day ?? row.t ?? row.timestamp ?? row.bucket ?? row.time ?? row.label,
    );
    if (!dayKey) { return; }
    byDay.set(dayKey, {
      dayKey,
      answered: readCount(row, ['answered', 'answered_count', 'answeredCount', 'a']),
      unanswered: readCount(row, ['unanswered', 'unanswered_count', 'unansweredCount', 'u']),
    });
  });

  return Array.from(byDay.values()).sort((a, b) => a.dayKey.localeCompare(b.dayKey));
}

export function buildDayKeysBetween(startInclusive: Date, endExclusive: Date): string[] {
  const keys: string[] = [];
  const cursor = new Date(startInclusive.getTime());
  cursor.setUTCHours(0, 0, 0, 0);
  const end = new Date(endExclusive.getTime());
  end.setUTCHours(0, 0, 0, 0);

  while (cursor < end) {
    keys.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return keys;
}

export function alignPointsToDayKeys(
  dayKeys: string[],
  points: KbOverTimePoint[],
): KbOverTimePoint[] {
  const map = new Map(points.map((p) => [p.dayKey, p]));
  return dayKeys.map((dayKey) => map.get(dayKey) || { dayKey, answered: 0, unanswered: 0 });
}

export function formatChartDayLabel(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number);
  if (!y || !m || !d) { return dayKey; }
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function computeAnswerRatePercent(answered: number, unanswered: number): number {
  const total = answered + unanswered;
  if (total <= 0) { return 0; }
  return Math.round((answered / total) * 1000) / 10;
}

/** Bar charts: flush left/right so bars align with the KPI count above. */
const BAR_CHART_GRID = { left: 0, right: 0, top: 2, bottom: 6, containLabel: false };
/** Line sparkline: side padding so first/last point markers are not clipped. */
const LINE_CHART_GRID = { left: 8, right: 10, top: 4, bottom: 8, containLabel: false };

function sparklineCountYAxis(maxValue: number): EChartsOption['yAxis'] {
  return {
    type: 'value',
    min: 0,
    max: Math.max(Math.ceil(maxValue * 1.15), 1),
    minInterval: 1,
    splitLine: { show: false },
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
  };
}

function sparklineRateYAxis(maxRate: number): EChartsOption['yAxis'] {
  const max = maxRate <= 0
    ? 100
    : Math.min(100, Math.ceil(Math.max(maxRate, 5) * 1.08));

  return {
    type: 'value',
    min: 0,
    max,
    splitLine: { show: false },
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
  };
}

function sparklineBarXAxis(points: KbOverTimePoint[]): EChartsOption['xAxis'] {
  return {
    type: 'category',
    boundaryGap: false,
    data: points.map((p) => p.dayKey),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
  };
}

function sparklineLineXAxis(points: KbOverTimePoint[]): EChartsOption['xAxis'] {
  return {
    type: 'category',
    boundaryGap: false,
    data: points.map((p) => p.dayKey),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
  };
}

function buildAxisTooltipDayHeader(points: KbOverTimePoint[], dataIndex: number): string {
  return formatChartDayLabel(points[dataIndex]?.dayKey ?? '');
}

export function buildKbCountBarChartOption(
  points: KbOverTimePoint[],
  field: 'answered' | 'unanswered',
  label: string,
  color: string,
): EChartsOption {
  const data = points.map((p) => p[field]);
  const maxCount = data.reduce((max, value) => Math.max(max, value), 0);

  return {
    color: [color],
    grid: BAR_CHART_GRID,
    tooltip: {
      trigger: 'axis',
      confine: true,
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : params;
        if (!item) { return ''; }
        const idx = item.dataIndex ?? 0;
        const day = buildAxisTooltipDayHeader(points, idx);
        return `${day}<br/>${item.marker} ${item.seriesName}: ${item.value}`;
      },
    },
    xAxis: sparklineBarXAxis(points),
    yAxis: sparklineCountYAxis(maxCount),
    series: [
      {
        name: label,
        type: 'bar',
        barWidth: '72%',
        barCategoryGap: '18%',
        barMinHeight: 2,
        itemStyle: { color, borderRadius: [2, 2, 0, 0] },
        data,
      },
    ],
  };
}

export function buildAnsweredBarChartOption(
  points: KbOverTimePoint[],
  label: string,
): EChartsOption {
  return buildKbCountBarChartOption(points, 'answered', label, ANSWERED_COLOR);
}

export function buildUnansweredBarChartOption(
  points: KbOverTimePoint[],
  label: string,
): EChartsOption {
  return buildKbCountBarChartOption(points, 'unanswered', label, UNANSWERED_COLOR);
}

/** Answer rate over time — line sparkline. */
export function buildAnswerRateChartOption(
  points: KbOverTimePoint[],
  label: string,
): EChartsOption {
  const rates = points.map((p) => computeAnswerRatePercent(p.answered, p.unanswered));
  const maxRate = rates.reduce((max, rate) => Math.max(max, rate), 0);

  return {
    color: [RATE_COLOR],
    grid: LINE_CHART_GRID,
    tooltip: {
      trigger: 'axis',
      confine: true,
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : params;
        if (!item) { return ''; }
        const idx = item.dataIndex ?? 0;
        const day = buildAxisTooltipDayHeader(points, idx);
        return `${day}<br/>${item.marker} ${item.seriesName}: ${item.value}%`;
      },
    },
    xAxis: sparklineLineXAxis(points),
    yAxis: sparklineRateYAxis(maxRate),
    series: [
      {
        name: label,
        type: 'line',
        smooth: true,
        showSymbol: true,
        symbolSize: 6,
        clip: false,
        lineStyle: { width: 2 },
        areaStyle: { opacity: 0.08 },
        data: rates,
      },
    ],
  };
}
