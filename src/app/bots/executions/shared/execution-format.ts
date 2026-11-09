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
