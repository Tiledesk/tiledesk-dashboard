export interface AnalyticsConfigLike {
  analyticsApiBase?: unknown;
  analyticsEmbedBase?: unknown;
}

/**
 * True when value is a usable analytics base:
 * - absolute http(s) URL, or
 * - same-origin relative path starting with `/` (e.g. `/analyticsapi/` from remote config)
 * Rejects empty values and unresolved `${...}` placeholders.
 */
export function isValidAnalyticsBaseUrl(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  if (/\$\{[^}]+\}/.test(trimmed)) {
    return false;
  }
  // Same-origin relative bases (common in dashboard-config.json / reverse-proxy deploys).
  if (trimmed.startsWith('/')) {
    return trimmed.length > 1;
  }
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** New embedded analytics are available only when both bases are valid. */
export function isNewAnalyticsConfigured(config: AnalyticsConfigLike | null | undefined): boolean {
  if (!config) {
    return false;
  }
  return isValidAnalyticsBaseUrl(config.analyticsApiBase)
    && isValidAnalyticsBaseUrl(config.analyticsEmbedBase);
}
