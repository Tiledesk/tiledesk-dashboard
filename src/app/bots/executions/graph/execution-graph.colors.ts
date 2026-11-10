/**
 * Colours of the execution graph, copied from the status chip palette
 * (--exec-* in shared/execution-status-chip.component.ts). Cytoscape styles need literal values.
 */
export const EXEC_GRAPH_COLORS = {
  run: '#1b6ef3',
  runBg: '#e8f0fe',
  wait: '#5d6b82',
  waitBg: '#eef1f6',
  warn: '#a15c00',
  warnBg: '#fff3e0',
  bad: '#c62f2f',
  badBg: '#fdecec',
  ok: '#1f7a45',
  okBg: '#e6f4ec',
  dead: '#3b4250',
  deadBg: '#e3e6eb',
} as const;
