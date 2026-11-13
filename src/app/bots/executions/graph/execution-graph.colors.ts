/**
 * Colours and icons of the execution graph (style C: badges with icon chips).
 * Cytoscape styles need literal values, so the palette is repeated here.
 */
export const EXEC_GRAPH_COLORS = {
  ink: '#1d2433',
  labelBg: '#fafbfc',
  // agent badges, one per agent colour (execution-graph.model agentColor)
  redBg: '#fde8e6', redBorder: '#f3b8b2', redIcon: '#a1170d',
  blueBg: '#e6f0fc', blueBorder: '#b9d3f5', blueIcon: '#0f4c99',
  amberBg: '#fff4e0', amberBorder: '#f0c36d', amberIcon: '#8a5a00',
  greenBg: '#e6f4ea', greenBorder: '#a8d5b5', greenIcon: '#1e7a3c',
  grayBg: '#f1f3f6', grayBorder: '#d3d8e0', grayIcon: '#5d6b82',
  // execution chips
  run: '#1f6fd6',
  waitBg: '#eef0f3', waitBorder: '#d7dce3', waitIcon: '#4a5361',
  stopBg: '#fff3dc', stopBorder: '#f2d39a', stopIcon: '#7a4b00',
  bad: '#d93025',
  ok: '#1e8e3e',
  dead: '#8b95a5',
  white: '#ffffff',
  // "+N" node and edges
  moreBorder: '#9aa4b2', moreText: '#4a5361',
  edge: '#c9cfd8',
  spoke: '#dfe3e8',
} as const;

const C = EXEC_GRAPH_COLORS;

/** An inline SVG as a data URI; the `id` is a marker the specs look for. */
function svgUri(id: string, size: number, attrs: string, body: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" id="${id}" width="${size}" height="${size}" viewBox="0 0 24 24" ${attrs}>${body}</svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

const STROKE = 'fill="none" stroke-linecap="round" stroke-linejoin="round"';
const bot = (color: string) => svgUri('i-bot', 26, `${STROKE} stroke="${color}" stroke-width="2"`,
  '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/>' +
  '<path d="M15 13v2"/><path d="M9 13v2"/>');

/** Background images, built once. */
export const EXEC_GRAPH_ICONS = {
  agentRed: bot(C.redIcon),
  agentBlue: bot(C.blueIcon),
  agentAmber: bot(C.amberIcon),
  agentGreen: bot(C.greenIcon),
  agentGray: bot(C.grayIcon),
  running: svgUri('i-play', 14, `fill="${C.white}" stroke="${C.white}" stroke-width="2" stroke-linejoin="round"`,
    '<polygon points="7 4 20 12 7 20 7 4"/>'),
  waiting: svgUri('i-clock', 14, `${STROKE} stroke="${C.waitIcon}" stroke-width="2.2"`,
    '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>'),
  stopping: svgUri('i-stop', 12, `fill="${C.stopIcon}"`, '<rect x="5" y="5" width="14" height="14" rx="2"/>'),
  failed: svgUri('i-alert', 14, `${STROKE} stroke="${C.white}" stroke-width="2.4"`,
    '<path d="M12 7v6"/><path d="M12 17h.01"/>'),
  completed: svgUri('i-check', 14, `${STROKE} stroke="${C.white}" stroke-width="2.6"`, '<polyline points="20 6 9 17 4 12"/>'),
  destroyed: svgUri('i-x', 14, `${STROKE} stroke="${C.white}" stroke-width="2.6"`, '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
} as const;
