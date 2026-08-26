import type { EChartsOption } from 'echarts';
import { formatChartDayLabel, formatTokenCountCompact, HomeFlowTimeSeriesPoint } from './home-flow-analytics.util';

const TOKEN_LINE_COLOR = '#e8a4b8';
const CONVERSATIONS_LINE_COLOR = '#111111';

const LINE_SPARKLINE_SYMBOL_SIZE = 4;
const LINE_SPARKLINE_LINE_WIDTH = 2;
/** Same grid as KB answer-rate line sparkline. */
const LINE_CHART_GRID = { left: 8, right: 10, top: 4, bottom: 8, containLabel: false };
const ALL_ZERO_FALLBACK_SCALE = 10;
const SHARED_AXIS_HEADROOM = 1.15;

function computeAxisMax(points: HomeFlowTimeSeriesPoint[]): number {
  const max = points.reduce((current, point) => Math.max(current, point.value ?? 0), 0);
  const scaleRef = max > 0 ? max : ALL_ZERO_FALLBACK_SCALE;
  return Math.max(Math.ceil(scaleRef * SHARED_AXIS_HEADROOM), 1);
}

function buildAxisTooltipDayHeader(points: HomeFlowTimeSeriesPoint[], dataIndex: number): string {
  return formatChartDayLabel(points[dataIndex]?.dayKey ?? '');
}

function sparklineLineXAxis(points: HomeFlowTimeSeriesPoint[]): EChartsOption['xAxis'] {
  return {
    type: 'category',
    boundaryGap: false,
    data: points.map((point) => point.dayKey),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
  };
}

function buildSparklineTooltip(
  points: HomeFlowTimeSeriesPoint[],
  values: number[],
  formatValue?: (value: number) => string,
): EChartsOption['tooltip'] {
  return {
    trigger: 'axis',
    confine: true,
    formatter: (params) => {
      const item = Array.isArray(params) ? params[0] : params;
      if (!item) { return ''; }
      const idx = item.dataIndex ?? 0;
      const day = buildAxisTooltipDayHeader(points, idx);
      const raw = values[idx] ?? 0;
      const formatted = formatValue ? formatValue(raw) : String(raw);
      return `${day}<br/>${item.marker} ${item.seriesName}: ${formatted}`;
    },
  };
}

function buildLineSparklineChartOption(
  points: HomeFlowTimeSeriesPoint[],
  lineColor: string,
  label: string,
  formatValue?: (value: number) => string,
): EChartsOption {
  const values = points.map((point) => point.value ?? 0);
  const yAxisMax = computeAxisMax(points);

  return {
    color: [lineColor],
    grid: LINE_CHART_GRID,
    tooltip: buildSparklineTooltip(points, values, formatValue),
    xAxis: sparklineLineXAxis(points),
    yAxis: {
      type: 'value',
      min: 0,
      max: yAxisMax,
      splitLine: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
    },
    series: [
      {
        name: label,
        type: 'line',
        smooth: true,
        showSymbol: true,
        symbol: 'circle',
        symbolSize: LINE_SPARKLINE_SYMBOL_SIZE,
        clip: false,
        lineStyle: { width: LINE_SPARKLINE_LINE_WIDTH, color: lineColor },
        itemStyle: {
          color: '#fff',
          borderColor: lineColor,
          borderWidth: 1.5,
        },
        areaStyle: { color: lineColor, opacity: 0.08 },
        data: values,
      },
    ],
  };
}

/** Token usage — pink line sparkline with soft area fill. */
export function buildTokenLineChartOption(
  points: HomeFlowTimeSeriesPoint[],
  label: string,
): EChartsOption {
  return buildLineSparklineChartOption(points, TOKEN_LINE_COLOR, label, formatTokenCountCompact);
}

/** Conversations — line sparkline with soft area fill (same style as token chart). */
export function buildConversationsLineChartOption(
  points: HomeFlowTimeSeriesPoint[],
  label: string,
): EChartsOption {
  return buildLineSparklineChartOption(points, CONVERSATIONS_LINE_COLOR, label);
}

export function sumHomeFlowSeriesValues(points: HomeFlowTimeSeriesPoint[]): number {
  return points.reduce((sum, point) => sum + (point.value ?? 0), 0);
}
