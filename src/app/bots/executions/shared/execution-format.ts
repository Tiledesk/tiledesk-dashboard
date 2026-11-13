/** Human-readable duration: 400 ms, 2.1 s, 12 min, 3.5 h. */
export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || isNaN(ms) || ms < 0) return '—';
  if (ms < 1000) return Math.round(ms) + ' ms';
  if (ms < 60000) return (ms / 1000).toFixed(1) + ' s';
  if (ms < 3600000) return Math.round(ms / 60000) + ' min';
  return (ms / 3600000).toFixed(1) + ' h';
}

export const PERIOD_MS: { [period: string]: number } = {
  '24h': 24 * 3600 * 1000,
  '7d': 7 * 24 * 3600 * 1000,
  '30d': 30 * 24 * 3600 * 1000,
};

/** Human-readable size: 3 B, 2.0 KB, 3.0 MB. Empty for unknown. */
export function formatSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || isNaN(bytes) || bytes < 0) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Label of an action, as the timeline names it everywhere outside its own row (flow state
 * panel, interrupted header, stop dialog): the title, else the type, else the id.
 * The timeline has no friendlier name per type than the raw type.
 */
export function actionLabel(a: { title?: string | null; type?: string | null; action_id?: string | null } | null | undefined): string | null {
  if (!a) return null;
  return a.title || a.type || a.action_id || null;
}
